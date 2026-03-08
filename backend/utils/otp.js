const nodemailer = require('nodemailer');

/**
 * Send OTP verification email using Nodemailer + Gmail SMTP
 * @param {string} email - Recipient email
 * @param {string} otp - One-time password
 * @returns {Promise} - Result of sending the email
 */
module.exports = async (email, otp) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    console.error('❌ Email credentials not configured!');
    console.error('Please set EMAIL_USER and EMAIL_PASS environment variables');
    throw new Error('Email credentials not configured. Please set EMAIL_USER and EMAIL_PASS');
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
    subject: 'Verify Your Account - Secure File Sharing',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #3f51b5; margin-bottom: 20px; text-align: center;">Verify Your Account</h2>
        
        <p>Thank you for registering. To complete your registration, please enter the following verification code:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; background-color: #f0f0f0; padding: 15px 20px; border-radius: 8px; display: inline-block; color: #333;">${otp}</div>
        </div>
        
        <p>This code will expire in 10 minutes. If you did not request this verification, please ignore this email.</p>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #777; font-size: 12px;">
          <p>This is an automated message from Secure File Sharing App.</p>
        </div>
      </div>
    `,
  };

  console.log('📧 Attempting to send OTP verification email via Gmail SMTP...');
  console.log('From:', emailUser);
  console.log('To:', email);

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent successfully via Gmail SMTP!');
    console.log('Message ID:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error sending OTP email via Gmail SMTP:');
    console.error('Error details:', error.message);
    throw error;
  }
};
