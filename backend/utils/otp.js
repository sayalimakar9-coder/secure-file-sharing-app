const { Resend } = require('resend');

/**
 * Send OTP verification email using Resend API
 * Falls back gracefully if API key is not configured
 * @param {string} email - Recipient email
 * @param {string} otp - One-time password
 * @returns {Promise} - Result of sending the email
 */
module.exports = async (email, otp) => {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.warn('⚠️ RESEND_API_KEY not configured - OTP email not sent');
    console.log('📋 Signup OTP (manual delivery needed):', otp);
    console.log('📬 Would have sent to:', email);
    throw new Error('Email service not configured. Please set RESEND_API_KEY in environment variables.');
  }

  const resend = new Resend(resendApiKey);

  const htmlBody = `
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
  `;

  console.log('📧 Attempting to send OTP verification email via Resend API...');
  console.log('To:', email);

  try {
    const data = await resend.emails.send({
      from: 'Secure File Sharing <onboarding@resend.dev>',
      to: [email],
      subject: 'Verify Your Account - Secure File Sharing',
      html: htmlBody,
    });

    console.log('✅ OTP email sent successfully via Resend!');
    console.log('Email ID:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Error sending OTP email via Resend:');
    console.error('Error details:', error.message);
    throw error;
  }
};
