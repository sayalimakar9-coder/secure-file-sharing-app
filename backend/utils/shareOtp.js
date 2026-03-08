const nodemailer = require('nodemailer');

/**
 * Send share OTP email to recipient using Nodemailer + Gmail SMTP
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

  // Create Gmail SMTP transporter with explicit settings to avoid connection timeouts on cloud hosts
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use STARTTLS (port 587), NOT SSL (port 465)
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    tls: {
      rejectUnauthorized: false // Allow self-signed certs (needed on some cloud hosts)
    },
    connectionTimeout: 30000, // 30 seconds
    greetingTimeout: 20000,   // 20 seconds
    socketTimeout: 30000,     // 30 seconds
  });

  const mailOptions = {
    from: `"Secure File Sharing" <${emailUser}>`,
    to: email,
    subject: 'File Shared With You - Access Verification',
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
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; background-color: #f0f0f0; padding: 15px 20px; border-radius: 8px; display: inline-block; color: #333;">${otp}</div>
        </div>
        
        <p>Please click the link below to access the file and enter this verification code:</p>
        <div style="text-align: center; margin: 25px 0;">
          <a href="${shareLink}" style="background-color: #3f51b5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Access Shared File</a>
        </div>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          &bull; This verification code is valid for one-time use only.<br>
          &bull; If you didn't request this file, you can safely ignore this email.<br>
          &bull; For security reasons, the link and code will expire after a certain period.
        </p>
      </div>
    `,
  };

  console.log('📧 Attempting to send share OTP email via Gmail SMTP...');
  console.log('From:', emailUser);
  console.log('To:', email);
  console.log('Share link:', shareLink);

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Share OTP email sent successfully via Gmail SMTP!');
    console.log('Message ID:', info.messageId);
    return { success: true, info };
  } catch (error) {
    console.error('❌ Error sending share OTP email via Gmail SMTP:');
    console.error('Error details:', error.message);

    return {
      success: false,
      error: error.message || 'Unknown error',
      details: 'Check backend logs for detailed error information'
    };
  }
};