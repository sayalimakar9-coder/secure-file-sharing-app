const { Resend } = require('resend');

/**
 * Send share OTP email to recipient.
 * Tries Resend API. If it fails, returns gracefully so the OTP
 * can be shown to the sharer for manual delivery.
 *
 * @param {string} email - Recipient email
 * @param {string} otp - One-time password
 * @param {Object} fileInfo - Information about the shared file
 * @param {string} shareLink - Link to access the shared file
 * @returns {Promise<{success: boolean, error?: string}>}
 */
module.exports = async (email, otp, fileInfo, shareLink) => {
  const resendApiKey = process.env.RESEND_API_KEY;

  const htmlBody = `
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
  `;

  // Try Resend API
  if (resendApiKey && resendApiKey !== 're_your_api_key_here') {
    const resend = new Resend(resendApiKey.trim());
    console.log(`📧 Attempting to send share OTP email via Resend...`);
    console.log('To:', email);

    try {
      const { data, error } = await resend.emails.send({
        from: 'Secure Share <onboarding@resend.dev>',
        to: email.trim(),
        subject: 'File Shared With You - Access Verification',
        html: htmlBody,
      });

      if (error) {
        console.error('❌ Resend API error:', error.message);
        return { success: false, error: error.message };
      }

      console.log('✅ Share OTP email sent via Resend! ID:', data.id);
      return { success: true, info: data };
    } catch (err) {
      console.error('❌ Resend failed:', err.message);
      return { success: false, error: err.message };
    }
  }

  console.warn('⚠️ Resend API key not configured or using placeholder.');
  return { success: false, error: 'No email service configured' };
};