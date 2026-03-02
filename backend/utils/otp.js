const nodemailer = require('nodemailer');

/**
 * Send OTP verification email
 * @param {string} email - Recipient email
 * @param {string} otp - One-time password
 * @returns {Promise} - Result of sending the email
 */
module.exports = async (email, otp) => {
  // Use hardcoded credentials as fallback if env vars not available
  const emailUser = process.env.EMAIL_USER || 'sayalimakar9@gmail.com';
  const emailPassRaw = process.env.EMAIL_PASS || 'vumk jflf gxfu heip';
  const emailPass = emailPassRaw.trim().replace(/\s/g, '');

  console.log('📧 Attempting to send OTP verification email...');
  console.log('From:', emailUser);
  console.log('To:', email);

  const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: emailUser,
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

  try {
    console.log('🔄 Sending OTP via Gmail...');
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent successfully!');
    console.log('Message ID:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error sending OTP email:');
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code);
    
    // Provide specific error guidance
    if (error.code === 'EAUTH') {
      console.error('⚠️  AUTHENTICATION FAILED - Check your EMAIL_USER and EMAIL_PASS');
      console.error('Make sure you are using a Gmail App Password, not your regular password');
      console.error('https://myaccount.google.com/apppasswords');
    } else if (error.message.includes('Invalid login')) {
      console.error('⚠️  INVALID CREDENTIALS - Gmail rejected the login attempt');
    }
    
    throw error;
  }
};
