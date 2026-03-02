const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/user');
const File = require('../models/file');
const Share = require('../models/share');
const { decryptToTemporary } = require('../utils/fileEncryption');
const sendShareOtp = require('../utils/shareOtp');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const util = require('util');

// Convert fs.unlink to promise-based
const unlinkAsync = util.promisify(fs.unlink);

// Generate a random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @route   POST api/shares
// @desc    Create a new file share
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { fileId, recipientEmail, permission, expiryHours, passwordProtect, password } = req.body;
    
    // Validate inputs
    if (!fileId || !recipientEmail || !permission || !expiryHours) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Check if file exists and user owns it
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    if (file.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You do not own this file' });
    }
    
    // Generate unique share ID
    const shareId = crypto.randomBytes(16).toString('hex');
    
    // Generate OTP for verification
    const otp = generateOTP();
    
    // Set expiry date
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + parseInt(expiryHours));
    
    // Hash password if password protection is enabled
    let hashedPassword = null;
    if (passwordProtect && password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }
    
    // Create share record
    const share = new Share({
      file: fileId,
      owner: req.user.id,
      recipientEmail,
      shareId,
      otp,
      permission,
      isPasswordProtected: passwordProtect && !!password,
      password: hashedPassword,
      expiresAt,
      emailDelivered: true // Will be set to false if email fails
    });
    
    await share.save();
    
    // Get owner's name for the email
    const owner = await User.findById(req.user.id);
    
    // Create environment variable for frontend URL or use a default
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    // Generate share link pointing to the frontend app instead of the backend
    const shareLink = `${frontendUrl}/share/${shareId}`;
    
    // Send OTP email to recipient - but continue even if email fails
    let emailResult;
    try {
      console.log('Attempting to send email to:', recipientEmail);
      console.log('Share link:', shareLink);
      emailResult = await sendShareOtp(recipientEmail, otp, {
        fileName: file.originalName,
        ownerName: owner.username || owner.email,
        fileSize: file.size
      }, shareLink);
      console.log('Email result:', emailResult);
    } catch (emailError) {
      // Log error but don't fail the share creation
      console.error('Error in email sending attempt:', emailError);
      console.error('Email error details:', emailError.message || 'Unknown email error');
      emailResult = { 
        success: false, 
        error: emailError.message || 'Unknown email error'
      };
    }
    
    // Update share record with email delivery status
    share.emailDelivered = emailResult && emailResult.success;
    await share.save();
    
    // Return response with share information and email status
    const responseData = {
      message: emailResult && emailResult.success 
        ? 'File shared successfully and notification sent' 
        : 'File shared successfully but email notification failed',
      shareId,
      shareLink,
      emailSent: emailResult && emailResult.success,
      emailDelivered: share.emailDelivered,
      emailError: emailResult && !emailResult.success ? emailResult.error : null,
      otp: emailResult && !emailResult.success ? otp : undefined // Include OTP in response if email failed
    };
    
    console.log('Share creation response:', responseData);
    res.json(responseData);
  } catch (error) {
    console.error('Error creating share:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/shares
// @desc    Get user's shared files
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Find all shares where user is the owner
    const shares = await Share.find({ owner: req.user.id })
      .populate('file', 'originalName size mimetype')
      .sort({ createdAt: -1 });
    
    res.json(shares);
  } catch (error) {
    console.error('Error getting shares:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/shares/verify/:shareId
// @desc    Verify a share link (public route)
// @access  Public
router.get('/verify/:shareId', async (req, res) => {
  try {
    const { shareId } = req.params;
    
    console.log('📋 Share verification request for:', shareId);
    
    if (!shareId || shareId.length === 0) {
      console.error('❌ Invalid shareId provided');
      return res.status(400).json({ message: 'Invalid share ID' });
    }
    
    // Find the share
    const share = await Share.findOne({ shareId })
      .populate('file', 'originalName size');
    
    console.log('🔍 Share found:', share ? 'YES' : 'NO');
    
    if (!share) {
      console.error('❌ Share not found for ID:', shareId);
      return res.status(404).json({ message: 'Share not found' });
    }
    
    if (!share.file) {
      console.error('❌ File associated with share not found');
      return res.status(404).json({ message: 'Associated file not found' });
    }
    
    // Check if share is expired
    const now = new Date();
    console.log('⏰ Checking expiration - Now:', now, 'Expires:', share.expiresAt);
    
    if (now > share.expiresAt) {
      console.warn('⏰ Share has expired');
      return res.status(400).json({ message: 'This share link has expired' });
    }
    
    // Check if share is revoked
    if (share.isRevoked) {
      console.warn('🚫 Share has been revoked');
      return res.status(400).json({ message: 'This share has been revoked' });
    }
    
    // Return basic info about the share
    const responseData = {
      fileName: share.file.originalName,
      fileSize: share.file.size,
      isPasswordProtected: share.isPasswordProtected,
      expiresAt: share.expiresAt,
      emailDelivered: share.emailDelivered // Include email delivery status
    };
    
    console.log('✅ Share verification successful');
    console.log('📦 Response:', JSON.stringify(responseData, null, 2));
    
    res.json(responseData);
  } catch (error) {
    console.error('❌ Error verifying share:');
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @route   POST api/shares/access/:shareId
// @desc    Access a shared file with OTP
// @access  Public
router.post('/access/:shareId', async (req, res) => {
  try {
    const { shareId } = req.params;
    const { otp, password } = req.body;
    
    console.log('🔑 Access request for share:', shareId);
    console.log('📝 OTP provided:', otp ? otp.length + ' digits' : 'NONE');
    console.log('🔐 Password provided:', password ? 'YES' : 'NO');
    
    // Find the share with complete file information
    const share = await Share.findOne({ shareId })
      .populate('file', 'originalName size mimetype path encryptionKey encryptionIV storedName');
    
    if (!share) {
      console.error('❌ Share not found:', shareId);
      return res.status(404).json({ message: 'Share not found' });
    }
    
    console.log('✓ Share found');
    
    // Check if share is expired
    const now = new Date();
    if (now > share.expiresAt) {
      console.warn('⏰ Share expired at:', share.expiresAt);
      return res.status(400).json({ message: 'This share link has expired' });
    }
    
    // Check if share is revoked
    if (share.isRevoked) {
      console.warn('🚫 Share is revoked');
      return res.status(400).json({ message: 'This share has been revoked' });
    }
    
    // Verify OTP
    console.log('🔍 Verifying OTP - Expected:', share.otp, 'Provided:', otp);
    if (share.otp !== otp) {
      console.warn('❌ OTP mismatch');
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    
    console.log('✅ OTP verified');
    
    // Verify password if required
    if (share.isPasswordProtected) {
      if (!password) {
        console.warn('❌ Password required but not provided');
        return res.status(400).json({ message: 'Password is required' });
      }
      
      const isPasswordValid = await bcrypt.compare(password, share.password);
      if (!isPasswordValid) {
        console.warn('❌ Password invalid');
        return res.status(400).json({ message: 'Invalid password' });
      }
      
      console.log('✅ Password verified');
    }
    
    // Generate access token
    const accessToken = jwt.sign(
      { shareId: share.shareId },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );
    
    console.log('🎫 Access token generated');
    
    // Update share record
    share.isOtpVerified = true;
    share.accessToken = accessToken;
    share.accessCount += 1;
    share.lastAccessed = new Date();
    await share.save();
    
    console.log('💾 Share record updated');
    
    // Return access token and file info
    const responseData = {
      accessToken,
      file: {
        id: share.file._id,
        originalName: share.file.originalName,
        size: share.file.size,
        mimetype: share.file.mimetype,
        path: share.file.path,
        encryptionKey: share.file.encryptionKey,
        encryptionIV: share.file.encryptionIV,
        storedName: share.file.storedName
      },
      permission: share.permission
    };
    
    console.log('✅ Access granted successfully');
    console.log('📦 Response:', JSON.stringify({ 
      accessToken: accessToken.substring(0, 20) + '...', 
      permission: responseData.permission,
      fileName: responseData.file.originalName
    }, null, 2));
    
    res.json(responseData);
  } catch (error) {
    console.error('❌ Error accessing shared file:');
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @route   GET api/shares/download/:shareId
// @desc    Download a shared file
// @access  Public (with access token)
router.get('/download/:shareId', async (req, res) => {
  try {
    const { shareId } = req.params;
    const accessToken = req.header('x-access-token');
    
    console.log(`Download request for share ${shareId} with token: ${accessToken ? 'provided' : 'missing'}`);
    
    if (!accessToken) {
      return res.status(401).json({ message: 'Access token is required' });
    }
    
    // Verify access token - try both secrets to handle tokens already issued
    let decoded;
    try {
      // First try the environment variable JWT secret
      try {
        decoded = jwt.verify(accessToken, process.env.JWT_SECRET || 'your_jwt_secret');
      } catch (envErr) {
        console.log('Failed to verify with environment JWT secret, trying hardcoded secret...');
        // If that fails, try the hardcoded secret for backward compatibility
        decoded = jwt.verify(accessToken, 'your_jwt_secret');
      }
    } catch (err) {
      console.error('JWT verification error:', err.message);
      return res.status(401).json({ message: 'Invalid or expired access token' });
    }
    
    console.log('Token verified successfully, decoded payload:', decoded);
    
    // Check if token belongs to this share
    if (decoded.shareId !== shareId) {
      return res.status(401).json({ message: 'Invalid access token for this share' });
    }
    
    // First get the share id
    const share = await Share.findOne({ shareId });
    
    if (!share) {
      return res.status(404).json({ message: 'Share not found' });
    }
    
    // Then get the file separately with a direct query
    const file = await File.findById(share.file);
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    console.log('Share found:', {
      id: share._id,
      fileId: share.file,
      permission: share.permission,
      expiresAt: share.expiresAt
    });
    
    console.log('File details from direct query:', {
      id: file._id,
      path: file.path,
      storedName: file.storedName,
      originalName: file.originalName,
      exists: file.path ? fs.existsSync(file.path) : false
    });
    
    // Check if share is expired
    if (new Date() > share.expiresAt) {
      return res.status(400).json({ message: 'This share link has expired' });
    }
    
    // Check if share is revoked
    if (share.isRevoked) {
      return res.status(400).json({ message: 'This share has been revoked' });
    }
    
    // Check permission level
    if (share.permission === 'view') {
      return res.status(403).json({ message: 'Download permission not granted' });
    }
    
    // If file path doesn't exist, reconstruct it
    let filePath = file.path;
    if (!filePath || !fs.existsSync(filePath)) {
      // Explicitly construct the path using the uploads directory and stored filename
      filePath = path.join(__dirname, '..', 'uploads', file.storedName);
      console.log(`Reconstructed file path: ${filePath}`);
    }
    
    // Final check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`File not found on disk: ${filePath}`);
      return res.status(404).json({ message: 'File not found on server' });
    }
    
    console.log(`File found, decrypting: ${filePath}`);
    
    try {
      // Decrypt the file
      const tempFilePath = await decryptToTemporary(
        filePath,
        file.encryptionKey,
        file.encryptionIV,
        file.originalName
      );
      
      console.log(`File decrypted successfully to: ${tempFilePath}`);
      
      // Make sure the temp file exists
      if (!fs.existsSync(tempFilePath)) {
        console.error(`Temp file not found: ${tempFilePath}`);
        return res.status(500).json({ message: 'Error preparing file for download' });
      }
      
      // Set appropriate headers
      res.setHeader('Content-Type', file.mimetype || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalName)}"`);
      
      // Stream the file instead of using res.download for better error handling
      const fileStream = fs.createReadStream(tempFilePath);
      
      // Handle stream errors
      fileStream.on('error', (err) => {
        console.error('Error streaming file:', err);
        if (!res.headersSent) {
          res.status(500).json({ message: 'Error streaming file' });
        }
      });
      
      // When the download is complete, clean up the temp file
      fileStream.on('close', async () => {
        try {
          if (fs.existsSync(tempFilePath)) {
            await unlinkAsync(tempFilePath);
            console.log(`Temp file deleted: ${tempFilePath}`);
          }
        } catch (err) {
          console.error('Error deleting temp file:', err);
        }
      });
      
      // Pipe the file to the response
      fileStream.pipe(res);
    } catch (decryptionError) {
      console.error('Decryption error:', decryptionError);
      return res.status(500).json({ message: 'Error decrypting file' });
    }
  } catch (error) {
    console.error('Error downloading shared file:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/shares/received
// @desc    Get files shared with the logged-in user
// @access  Private
router.get('/received', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find all shares where recipient email matches the logged-in user's email
    const receivedShares = await Share.find({ 
      recipientEmail: user.email,
      isRevoked: false,
      expiresAt: { $gt: new Date() } // Only active shares
    })
      .populate('file', 'originalName size mimetype')
      .populate('owner', 'username email')
      .sort({ createdAt: -1 });
    
    res.json(receivedShares);
  } catch (error) {
    console.error('Error fetching received shares:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/shares/:id
// @desc    Revoke a share
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const share = await Share.findById(req.params.id);
    
    if (!share) {
      return res.status(404).json({ message: 'Share not found' });
    }
    
    // Check if user owns the share
    if (share.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You do not own this share' });
    }
    
    // Revoke the share
    share.isRevoked = true;
    await share.save();
    
    res.json({ message: 'Share revoked successfully' });
  } catch (error) {
    console.error('Error revoking share:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;