# 🔧 Quick Troubleshooting - Blank Page Fix

## ⚡ What to Do RIGHT NOW

### **Test 1: Is Backend Awake?**
Open this in your browser address bar (just copy-paste):
```
https://secure-file-backend-98yd.onrender.com/api/files
```

**Expected result:** You should see an error like:
```json
{
  "message": "Authentication token required"
}
```

**If you see:**
- `502 Bad Gateway` or blank page → Backend is sleeping/down
- JSON error about auth → ✅ Backend is working
- `Cannot GET` or error → Backend might have issues

**If Backend is Sleeping (Render.com free tier):**
1. Visit the URL above to wake it up
2. Wait 30-60 seconds
3. Try again
4. It will work after that for the next 15 minutes

---

### **Test 2: Create a Test Share**
1. Log into your app at: `https://secure-file-sharing-app-tor7.vercel.app`
2. Upload any test file (small image or doc)
3. Click **Share** button
4. Enter email: `youremail@gmail.com`
5. Leave everything else as default
6. Click **"Create Share"**
7. **COPY the share link** (it will be shown)

---

### **Test 3: Test the Share Link**
1. **Open new incognito window** (Ctrl+Shift+N or Cmd+Shift+N)
2. **Paste the share link**
3. **Open DevTools** (F12 → Console tab)
4. **Take a screenshot of any error**

---

### **Test 4: Check Console for Errors**

Open DevTools with F12, go to **Console** tab, look for:

#### ❌ **CORS Error:**
```
Access to XMLHttpRequest at 'https://secure-file-backend-98yd.onrender.com...'
from origin 'https://secure-file-sharing-app-tor7.vercel.app' 
has been blocked by CORS policy
```
**Fix:** Backend CORS config needs updating (I can fix this)

#### ❌ **404 Not Found:**
```
GET https://secure-file-backend-98yd.onrender.com/api/shares/verify/abc123... 404
```
**Cause:** Share ID doesn't exist in database
**Fix:** The share wasn't created properly

#### ❌ **Cannot Connect:**
```
Failed to fetch
Network.Timeout
```
**Cause:** Backend is down or blocked
**Fix:** Wake up backend (Test 1 above)

#### ✅ **Success:**
```
Share verification successful
📦 Response data: {fileName: "...", fileSize: 123456, ...}
```
**Then you should see the OTP form**

---

## 🎯 The OTP Form (What You Should See)

When share link is working correctly, you'll see:

```
═════════════════════════════════════════
      SECURE FILE ACCESS
═════════════════════════════════════════

📋 Step 2 of 3: Enter OTP

📄 MyDocument.pdf
   Size: 2.5 MB

⚠️ Email Delivery Issue:
   The verification code could not be sent
   to your email. Ask the share creator 
   for the 6-digit code.

✓ Verification Code:
┌──────────────┐
│   123456     │  ← Shows if email fails
└──────────────┘
   [Copy Code]

────────────────────

[Input: Enter 6-digit OTP] 

[INPUT FIELD LABELED: One-Time Password (OTP)]
[PLACEHOLDER TEXT: Enter 6-digit OTP]

[VERIFY AND ACCESS FILE BUTTON]

═════════════════════════════════════════
```

**If you see this form, OTP feature is working!** ✅

---

## 🔍 Advanced Debugging

### **Check Network Tab**
1. Open DevTools (F12)
2. Go to **Network** tab
3. Refresh share page
4. Look for request: `verify/abc123xyz...`
5. Click on it, check:
   - **Status:** Should be 200
   - **Response:** Should show JSON with file info
   - **If red/404:** Share doesn't exist
   - **If pending:** Backend is slow

### **Check Local Storage**
1. DevTools → **Application** tab
2. **Local Storage** → Select your domain
3. Look for `authToken` - should be empty (share pages don't need login)

### **Check Console Warnings**
1. DevTools → **Console** tab
2. Look for messages like:
   - `🔍 Verifying share with ID: abc123xyz...`
   - `📍 API_BASE_URL: https://secure-file-backend-98yd.onrender.com/api`
   - `🌐 Fetching from URL: https://...`

These debug messages show the app is working!

---

## 🐛 Common Issues & Fixes

### **Issue: "Cannot connect to server"**
```
Error: Cannot connect to server - please check your internet connection
```

**Causes:**
1. Backend is sleeping (Render.com free tier)
2. Wrong backend URL in frontend
3. No internet connection

**Fix:**
```bash
# Option 1: Wake backend
Visit: https://secure-file-backend-98yd.onrender.com/api/files
Wait 60 seconds

# Option 2: Check backend URL
Check: frontend/.env.production
Should show:
REACT_APP_API_URL=https://secure-file-backend-98yd.onrender.com/api

# Option 3: Check internet
Try: https://google.com
```

---

### **Issue: "This share link does not exist"**
```
Error: "This share link does not exist or has been deleted"
```

**Causes:**
1. Share ID is wrong (typo in URL)
2. Share never created in database
3. Share was deleted

**Fix:**
```bash
# 1. Check the share link is correct
# Should be: /share/a1b2c3d4e5f6789...
# NOT: /share/12345

# 2. Create new share and test immediately
# Follow Test 2 above

# 3. Share might be in wrong database
# Check: MongoDB Atlas
# Database: otpAuthApp
# Collection: shares
# Find document with this shareId
```

---

### **Issue: "This share link has expired"**
```
Error: "This share link has expired"
```

**Causes:**
1. Share was created with short expiry
2. Time on backend/frontend is different
3. Share was created hours ago (if set to expire fast)

**Fix:**
```bash
# 1. Create new share with longer expiry
# Set to: 24 hours or more

# 2. Test immediately after creating
# Don't wait hours between create and test
```

---

## ✅ Step-by-Step Fix Checklist

- [ ] **Backend Test**
  - [ ] Visit: `https://secure-file-backend-98yd.onrender.com/api/files`
  - [ ] Should see JSON, not error
  - [ ] If timeout, wait 60 seconds

- [ ] **Create Test Share**
  - [ ] Log in to app
  - [ ] Share a file
  - [ ] Copy the link
  - [ ] Link should look like: `/share/abc123xyz...`

- [ ] **Test Share Link**
  - [ ] Open in incognito window
  - [ ] Check DevTools console
  - [ ] Look for errors (CORS, 404, timeout)

- [ ] **View OTP Form**
  - [ ] Should see OTP input field
  - [ ] Should see manual OTP code (if displayed)
  - [ ] Should see file name and size

- [ ] **Verify OTP Works**
  - [ ] Enter the 6-digit code shown
  - [ ] Click "Verify and Access File"
  - [ ] Should show download button

- [ ] **Download File**
  - [ ] Click "Download File"
  - [ ] File should download

---

## 📢 Report These Details

If still not working, tell me:

1. **What do you see?**
   - Blank white page?
   - Loading spinner forever?
   - Error message (what does it say)?
   - OTP form appears?

2. **What's in console (F12)?**
   - Screenshot of error
   - Full error message

3. **Backend status?**
   - Did this work: `https://secure-file-backend-98yd.onrender.com/api/files`?

4. **Share creation?**
   - Did share create successfully?
   - Did you copy the link?
   - Did backend send the email?

5. **Share link format?**
   - Should be: `https://secure-file-sharing-app-tor7.vercel.app/share/{id}`
   - What's your actual link?

---

## 💡 Pro Tips

1. **For Testing on Phone**
   - Create share from desktop first
   - Send link via WhatsApp to yourself
   - Click from phone browser
   - Should work exactly same as desktop

2. **Email Not Working?**
   - Check spam folder
   - OTP should display in green box anyway
   - Can manually share OTP with recipient

3. **Password Protected Share?**
   - OTP form will show 2 fields:
   - 1. OTP input (6 digits)
   - 2. Password input
   - Both required to access

4. **Expiry Not Working?**
   - If share shows "expired" immediately
   - Check both backend and frontend time
   - Set longer expiry (24 hrs instead of 1 hr)

---

## 🎓 Understanding the Flow

```
User clicks share link
        ↓
[Frontend loads]
        ↓
Get shareId from URL: /share/{shareId}
        ↓
Call: GET /api/shares/verify/{shareId}
        ↓
Backend checks:
  ✓ Share exists?
  ✓ Not expired?
  ✓ Not revoked?
        ↓
[Show OTP Form] ← YOU SEE THIS
        ↓
User enters 6-digit OTP
        ↓
Call: POST /api/shares/access/{shareId}
        ↓
Backend checks:
  ✓ OTP correct?
  ✓ Password correct (if needed)?
        ↓
[Show Download Button] ← AFTER OTP VERIFIED
        ↓
User downloads file
```

**If blank page, it stops at [Show OTP Form]**

---

## 🚀 Tests to Run Right Now

### **Test A: Backend Accessibility**
```javascript
// In browser console
fetch('https://secure-file-backend-98yd.onrender.com/api/files')
  .then(r => r.json())
  .then(d => console.log(d))
  .catch(e => console.error(e))
```

Expected: Shows JSON response

### **Test B: Verify Share Endpoint**
Replace `{shareId}` with actual ID from your share link:
```javascript
fetch('https://secure-file-backend-98yd.onrender.com/api/shares/verify/{shareId}')
  .then(r => r.json())
  .then(d => console.log(d))
  .catch(e => console.error(e))
```

Expected: Shows file info

### **Test C: Check Frontend Config**
```javascript
// Run in browser console from app
fetch('/__/firebase/config').catch(e => {
  console.log('API_BASE_URL should be: https://secure-file-backend-98yd.onrender.com/api')
})
```

---

**Need more help? Tell me the error message from your console!** 📋
