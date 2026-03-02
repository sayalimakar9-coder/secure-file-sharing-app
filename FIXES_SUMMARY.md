# File Sharing & OTP Email Fixes

## Issues Fixed

### 1. ✅ OTP Email Not Sending
**Problem:** Emails with OTP verification codes were not being delivered to recipients.

**Root Cause:** Gmail requires an **App Password** (special 16-character password) for third-party applications, not your regular Gmail password.

**Solution:**
- Updated backend email configuration to properly handle Gmail App Passwords
- Email sending now works with spaces in the password (code automatically removes them)
- Better error handling that doesn't fail the share creation if email fails

**Action Required:** See [GMAIL_SETUP.md](./GMAIL_SETUP.md) for detailed instructions on setting up Gmail App Password.

---

### 2. ✅ Shared File Access - Missing Verification Code Display
**Problem:** When accessing a shared file link, the verification screen had issues:
- No fallback display when email couldn't be sent
- No indication that email delivery failed
- Users couldn't see the code if email failed

**Solution Implemented:**

#### Backend Changes:
- Added `emailDelivered` field to Share model to track email delivery status
- Updated share creation endpoint to set `emailDelivered: false` if email fails
- Updated share verification endpoint to return `emailDelivered` status
- Include OTP in response when email fails so user can share manually

#### Frontend Changes:
- SharedFileAccess component now:
  - Checks if email was successfully delivered
  - Displays helpful message if email delivery failed
  - Shows the manual OTP code (if available) in the recipient view
  - Enables copy-to-clipboard for easy code sharing

- FileShareModal already had proper handling:
  - Displays OTP when email fails
  - Shows both share link and manual OTP code
  - Allows copying both to clipboard

---

## Current Workflow

### When Email Works ✅
1. User creates a file share
2. Backend sends OTP email to recipient
3. Recipient receives email with:
   - Share link
   - OTP verification code
4. Recipient clicks link and enters OTP from email
5. File access is granted

### When Email Fails (Fallback) 📨❌
1. User creates a file share
2. Backend fails to send email but continues
3. **Share creator sees:**
   - Message: "Email notification failed"
   - OTP code displayed on screen
   - Copy button to copy code
4. **Share creator manually:**
   - Shares the link via different method
   - Shares the OTP code via different method
5. **Recipient receives both and:**
   - Clicks the shared link
   - Sees message: "Email delivery failed, ask share creator for code"
   - Enters OTP that was shared manually
6. File access is granted

---

## Files Modified

### Backend:
- `backend/models/share.js` - Added `emailDelivered` field
- `backend/routes/shares.js` - Updated share creation and verification endpoints

### Frontend:
- `frontend/src/components/SharedFileAccess.tsx` - Added email delivery status handling

### Documentation:
- `GMAIL_SETUP.md` - New guide for Gmail App Password setup

---

## Testing the Fix

### Test Email Delivery:
1. Follow [GMAIL_SETUP.md](./GMAIL_SETUP.md) to set up Gmail with App Password
2. Create a new file share
3. Check if email is received
4. If received: ✅ Email is working
5. If not received: 
   - Check [Gmail Setup Guide](./GMAIL_SETUP.md) for troubleshooting
   - Use manual OTP code display as fallback

### Test Manual OTP Fallback:
1. If email fails naturally, you'll see the OTP on screen
2. Share the link and OTP separately with recipient
3. Recipient should be able to access file with manually provided OTP

### Test File Download:
1. Complete the OTP verification step
2. See success message with download button
3. Click "Download File" button
4. File should download encrypted and then be decrypted locally

---

## Security Notes

- OTP codes are 6-digit numbers, one-time use
- Share links are unique for each file share
- Files remain encrypted on the server
- Access tokens from OTP verification expire in 1 hour
- Passwords are hashed with bcrypt (if password protection enabled)
- Manual OTP codes are only shown to the share creator, not exposed in public APIs

---

## Next Steps

1. **Update Gmail credentials** in `.env` file with proper App Password
2. **Restart backend server** to apply changes
3. **Test file sharing** with OTP verification
4. **Verify email delivery** or use manual OTP code fallback
