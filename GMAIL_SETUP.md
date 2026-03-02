# Gmail Setup for OTP Email Sending

## Issue
OTP emails are not being sent because Gmail requires an "App Password" for third-party applications instead of your regular account password.

## Solution

### Step 1: Enable 2-Step Verification
1. Go to [Google Account Security Settings](https://myaccount.google.com/security)
2. Click on "2-Step Verification" in the left menu
3. Follow the prompts to enable 2-Step Verification
4. You'll need to verify with your phone

### Step 2: Generate an App Password
1. Go back to [Google Account Security Settings](https://myaccount.google.com/security)
2. Look for "App passwords" (only appears if 2-Step Verification is enabled)
3. Select "Mail" and "Windows Computer" (or your device)
4. Google will generate a 16-character password (example: `xxxx xxxx xxxx xxxx`)
5. **Copy this password exactly as shown**

### Step 3: Update Your .env File
Replace the `EMAIL_PASS` with the App Password you generated:

```env
EMAIL_USER=sayalimakar9@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
```

**Important:** Include the spaces in the password exactly as Google shows them. The code will automatically remove spaces when connecting.

### Step 4: Test Email Sending
1. Restart your backend server
2. Try creating a new file share
3. Check if you receive the OTP email
4. If not, check the backend console for specific error messages

## Troubleshooting

### If you still don't receive emails:
1. **Check Spam Folder** - The email might be marked as spam
2. **Verify Credentials** - Confirm you copied the App Password correctly (with spaces)
3. **Check Backend Logs** - Look for specific error messages in the console when creating a share
4. **Gmail Activity** - Check if Gmail received the connection attempt at [Google Account Activity](https://myaccount.google.com/device-activity)

### Alternative: Use a Different Gmail Account
If the current account has issues, you can:
1. Use a different Gmail account that you have access to
2. Update `EMAIL_USER` and `EMAIL_PASS` with the new credentials
3. Make sure 2-Step Verification and App Password are set up on the new account

### Manual OTP Display
If email continues to fail:
- When creating a file share, the OTP code will be displayed on screen
- You can copy and share this code manually with the recipient
- The recipient can then enter it to access the file
