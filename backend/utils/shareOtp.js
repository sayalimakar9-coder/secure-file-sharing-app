const nodemailer = require('nodemailer');

/**
 * Send share OTP email to recipient using Nodemailer (Gmail)
 * @param {string} email - Recipient email
 * @param {string} otp - One-time password
 * @param {Object} fileInfo - Information about the shared file
 * @param {string} shareLink - Link to access the shared file
 * @returns {Promise} - Result of sending the email
 */
module.exports = async (email, otp, fileInfo, shareLink) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    console.error('❌ Email credentials not configured!');
    console.error('Please set EMAIL_USER and EMAIL_PASS environment variables');
    return {
      success: false,
      error: 'Email credentials not configured',
      details: 'Set EMAIL_USER and EMAIL_PASS in Environment Variables'
    };
  }

  // Create Nodemailer transporter with Gmail
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  console.log('📧 Attempting to send share OTP email via Gmail...');
  console.log('From:', emailUser);
  console.log('To:', email);
  console.log('Share link:', shareLink);

  try {
    const mailOptions = {
      from: `"Secure File Sharing" <${emailUser}>`,
      to: email,
      subject: 'File Shared With You - Access Verification',
      text: `A file has been shared with you. Your verification code is: ${otp}. Use this code to access the file at: ${shareLink}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; font-size: 16px; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #3f51b5; margin-bottom: 20px; text-align: center;">Secure File Share</h2>
          
          <p>A file has been shared with you:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <p style="margin: 0;"><strong>File name:</strong> ${fileInfo.fileName}</p>
            <p style="margin: 8px 0 0;"><strong>Shared by:</strong> ${fileInfo.ownerName}</p>
            ${fileInfo.fileSize ? `<p style="margin: 8px 0 0;"><strong>Size:</strong> ${fileInfo.fileSize}</p>` : ''}
          </div>
          
          <p>To access this file, you'll need to verify with the following code:</p>
          <div style="text-align: center; margin: 20px 0;">
            <div style="font-size: 24px; font-weight: bold; letter-spacing: 5px; background-color: #f0f0f0; padding: 10px; border-radius: 5px; display: inline-block;">${otp}</div>
          </div>
          
          <p>Please click the link below to access the file and enter this verification code:</p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${shareLink}" style="background-color: #3f51b5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Access Shared File</a>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            • This verification code is valid for one-time use only.<br>
            • If you didn't request this file, you can safely ignore this email.<br>
            • For security reasons, the link and code will expire after a certain period.
          </p>
        </div>
      `,
    };

    console.log('🔄 Sending share OTP via Gmail...');
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Share OTP email sent successfully via Gmail!');
    console.log('Message ID:', info.messageId);
    return { success: true, info };
  } catch (error) {
    console.error('❌ Error sending share OTP email via Gmail:');
    console.error('Error Message:', error.message);

    return {
      success: false,
      error: error.message,
      details: 'Check backend logs for detailed error information'
    };
  }
};