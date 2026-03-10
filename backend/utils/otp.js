const { Resend } = require('resend');

/**
 * Send OTP verification email for signup.
 * Tries Resend API. If it fails, returns gracefully.
 *
 * @param {string} email - Recipient email
 * @param {string} otp - One-time password
 * @returns {Promise<{success: boolean, error?: string}>}
 */
module.exports = async (email, otp) => {
  const resendApiKey = process.env.RESEND_API_KEY;

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

  // Try Resend API
  if (resendApiKey && resendApiKey !== 're_your_api_key_here') {
    const resend = new Resend(resendApiKey.trim());
    console.log(`📧 Attempting to send OTP email via Resend...`);

    try {
      const { data, error } = await resend.emails.send({
        from: 'Secure Share <onboarding@resend.dev>',
        to: email.trim(),
        subject: 'Verify Your Account - Secure File Sharing',
        html: htmlBody,
      });

      if (error) {
        console.error('❌ Resend API error:', error.message);
        return { success: false, error: error.message };
      }

      console.log('✅ OTP email sent via Resend! ID:', data.id);
      return { success: true, info: data };
    } catch (err) {
      console.error('❌ Resend failed:', err.message);
      return { success: false, error: err.message };
    }
  }

  console.warn('⚠️ Resend API key not configured or using placeholder.');
  return { success: false, error: 'No email service configured' };
};
