const nodemailer = require('nodemailer');

/**
 * Send OTP verification email using Nodemailer (Gmail)
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

  // Create Nodemailer transporter with Gmail
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  console.log('📧 Attempting to send OTP verification email via Gmail...');
  console.log('From:', emailUser);
  console.log('To:', email);

  try {
    const mailOptions = {
      from: `"Secure File Sharing" <${emailUser}>`,
      to: email,
      subject: 'Verify Your Account',
      text: `Your verification code is: ${otp}. This code will expire in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #3f51b5; margin-bottom: 20px; text-align: center;">Verify Your Account</h2>
          
          <p>Thank you for registering. To complete your registration, please enter the following verification code:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="font-size: 24px; font-weight: bold; letter-spacing: 5px; background-color: #f0f0f0; padding: 10px; border-radius: 5px; display: inline-block;">${otp}</div>
          </div>
          
          <p>This code will expire in 10 minutes. If you did not request this verification, please ignore this email.</p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #777; font-size: 12px;">
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      `,
    };

    console.log('🔄 Sending OTP via Gmail...');
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent successfully via Gmail!');
    console.log('Message ID:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error sending OTP email via Gmail:');
    console.error('Error Message:', error.message);
    throw error;
  }
};
