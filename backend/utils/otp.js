const sgMail = require('@sendgrid/mail');

/**
 * Send OTP verification email using SendGrid
 * @param {string} email - Recipient email
 * @param {string} otp - One-time password
 * @returns {Promise} - Result of sending the email
 */
module.exports = async (email, otp) => {
  // Use environment variable (required on Render)
  const sendGridApiKey = process.env.SENDGRID_API_KEY;
  
  if (!sendGridApiKey) {
    console.error('❌ SendGrid API key not configured!');
    console.error('Please set SENDGRID_API_KEY environment variable in Render');
    throw new Error('SendGrid API key not configured. Please set SENDGRID_API_KEY in Render Environment Variables');
  }
  
  const fromEmail = 'sayalimakar9@gmail.com';

  console.log('📧 Attempting to send OTP verification email via SendGrid...');
  console.log('From:', fromEmail);
  console.log('To:', email);

  try {
    // Set the API key
    sgMail.setApiKey(sendGridApiKey);

    const msg = {
      to: email,
      from: fromEmail,
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

    console.log('🔄 Sending OTP via SendGrid API...');
    const info = await sgMail.send(msg);
    console.log('✅ OTP email sent successfully via SendGrid!');
    console.log('Response:', info[0].statusCode);
    return info;
  } catch (error) {
    console.error('❌ Error sending OTP email via SendGrid:');
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code);
    
    if (error.response) {
      console.error('SendGrid Response:', error.response.body);
    }
    
    throw error;
  }
};
