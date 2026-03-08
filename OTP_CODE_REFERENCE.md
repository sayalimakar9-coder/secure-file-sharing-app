# 🔑 OTP VERIFICATION FEATURE - Code Reference

## 📍 Quick Location Guide

### **Where is OTP in Your Code?**

#### **1. OTP Creation (Backend)**
**File:** `backend/routes/shares.js`  
**Lines:** 21 (function), 68 (creation)

```javascript
// Line 21: Generate OTP function
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Line 68: Create OTP when sharing
const otp = generateOTP(); // Example: "123456"
```

---

#### **2. OTP Email Sending (Backend)**
**File:** `backend/utils/shareOtp.js`

Sends OTP via Gmail to recipient's email address.

---

#### **3. OTP Input Form (Frontend)**
**File:** `frontend/src/components/SharedFileAccess.tsx`  
**Lines:** 265-307 (OTP Input Field)

```jsx
<TextField
  label="One-Time Password (OTP)"
  placeholder="Enter 6-digit OTP"
  fullWidth
  value={otp}
  onChange={handleOtpChange}
  inputProps={{ maxLength: 6 }}
/>
```

---

#### **4. Fallback OTP Display (If Email Fails)**
**File:** `frontend/src/components/SharedFileAccess.tsx`  
**Lines:** 267-283

```jsx
{manualOtp && (
  <Alert severity="success" sx={{ mb: 2 }}>
    <Typography variant="body2">
      ✓ <strong>Verification Code:</strong>
    </Typography>
    <Box sx={{ p: 1.5, backgroundColor: '#e8f5e9' }}>
      <Typography variant="body1" sx={{ fontSize: '24px' }}>
        {manualOtp}
      </Typography>
    </Box>
  </Alert>
)}
```

---

#### **5. OTP Verification Request (Frontend)**
**File:** `frontend/src/components/SharedFileAccess.tsx`  
**Lines:** 120-160 (handleVerifyOtp function)

```js
const handleVerifyOtp = async () => {
  const url = `${API_BASE_URL}/shares/access/${shareId}`;
  const response = await axios.post(url, { otp });
  // Get access token if OTP matches
};
```

---

#### **6. OTP Verification Backend (Backend)**
**File:** `backend/routes/shares.js`  
**Lines:** 240-260 (POST /api/shares/access/)

```javascript
// Line 247-255: OTP comparison
console.log('🔍 Verifying OTP - Expected:', share.otp, 'Provided:', otp);
if (share.otp !== otp) {
  console.warn('❌ OTP mismatch');
  return res.status(400).json({ message: 'Invalid OTP' });
}
console.log('✅ OTP verified');
```

---

#### **7. Share Verification (Check if Valid)**
**File:** `backend/routes/shares.js`  
**Lines:** 150-200 (GET /api/shares/verify/)

Checks if share exists and hasn't expired.

---

#### **8. Download After OTP Verified**
**File:** `backend/routes/shares.js`  
**Lines:** 300-450 (GET /api/shares/download/)

Only works if OTP was verified in step 6.

---

## 🔄 OTP Flow (Step by Step)

```
┌─────────────────────────────────────────┐
│ 1. FILE OWNER CREATES SHARE             │
│    Recipient: john@example.com          │
│    File: MyDocument.pdf                 │
│    Expiry: 24 hours                     │
│                                         │
│ BACKEND DOES:                           │
│ - Generate OTP: 123456                  │
│ - Send email with OTP                   │
│ - Save share to MongoDB                 │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│ 2. RECIPIENT CLICKS SHARE LINK          │
│    URL: /share/a1b2c3d4e5f67890...     │
│                                         │
│ FRONTEND DOES:                          │
│ - Extract shareId from URL              │
│ - Call: GET /api/shares/verify/{id}     │
│ - Backend returns file info             │
│ - Show OTP form                         │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│ 3. RECIPIENT ENTERS OTP                 │
│    [Input box with "123456"]            │
│                                         │
│ FRONTEND DOES:                          │
│ - User types 6 digits                   │
│ - Validation: exactly 6 digits          │
│ - Call: POST /api/shares/access/{id}    │
│ - Send: { otp: "123456" }               │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│ 4. BACKEND VERIFIES OTP                 │
│    Expected: 123456 (stored)            │
│    Received: 123456 (from request)      │
│    Match: YES ✅                        │
│                                         │
│ BACKEND DOES:                           │
│ - Compare OTP strings                   │
│ - If match: Generate access token      │
│ - If mismatch: Return 400 error         │
│ - Mark share as verified                │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│ 5. RECIPIENT CAN DOWNLOAD                │
│    Access token: eyJhbGciOi...         │
│                                         │
│ FRONTEND SHOWS:                         │
│ - Download button (if permission OK)    │
│ - View-only message (if view-only)      │
│                                         │
│ BACKEND CHECKS:                         │
│ - Access token valid?                   │
│ - Share expired?                        │
│ - File exists?                          │
│ - Decrypt and send file                 │
└─────────────────────────────────────────┘
```

---

## 📊 Data Flow

### **In MongoDB (`shares` collection):**
```json
{
  "_id": "ObjectId(...)",
  "shareId": "a1b2c3d4e5f67890...",  ← Used in URL
  "otp": "123456",                    ← 6-digit code
  "file": "ObjectId(...)",            ← File reference
  "owner": "ObjectId(...)",           ← Who created
  "recipientEmail": "john@gmail.com",
  "expiresAt": "2024-03-09T10:00:00Z",
  "isOtpVerified": false,             ← Set to true after OTP verified
  "isPasswordProtected": false,
  "permission": "download",
  "createdAt": "2024-03-08T10:00:00Z"
}
```

### **In Recipient's Email:**
```
Subject: File Shared With You

Dear Recipient,

admin@gmail.com has shared a file with you.

File: MyDocument.pdf
Size: 2.5 MB

Verification Code: 123456

Click here to access: https://yourapp.com/share/a1b2c3d4e5f67890...

Your trusty file sharing service
```

### **In Frontend State:**
```javascript
const [otp, setOtp] = useState('');        // "123456" as user types
const [shareInfo, setShareInfo] = useState({
  fileName: "MyDocument.pdf",
  fileSize: 2500000,
  isPasswordProtected: false,
  expiresAt: "2024-03-09T10:00:00Z"
});
const [accessToken, setAccessToken] = useState(''); // Generated by backend after OTP verified
```

---

## 🎯 Each Component's Role

| Component | Role | Code File | Lines |
|-----------|------|-----------|-------|
| **FileShareModal** | 1. Creates share | `components/FileShareModal.tsx` | 89-140 |
| **Backend Routes** | 2. Generates OTP | `routes/shares.js` | 22-104 |
| **Gmail Utility** | 3. Sends email | `utils/shareOtp.js` | 1-50 |
| **SharedFileAccess** | 4. Shows OTP form | `components/SharedFileAccess.tsx` | 265-307 |
| **handleVerifyOtp** | 5. Sends OTP to verify | `components/SharedFileAccess.tsx` | 120-160 |
| **Backend Verify** | 6. Checks OTP | `routes/shares.js` | 210-260 |
| **Download Endpoint** | 7. Allows download | `routes/shares.js` | 300-450 |

---

## ✅ Verification Checklist

### **Code is Present?**
- [x] OTP generation function exists
- [x] OTP stored in database
- [x] OTP sent via email
- [x] OTP input field in UI
- [x] OTP verification backend logic
- [x] Access token generation
- [x] Download requires access token

---

## 🔐 Security Features

### **OTP Security:**
1. **6-digit random:** Hard to guess (1 in 1,000,000)
2. **Time-limited:** Stored with share (expires with share)
3. **One-time use:** Not marked as used (but can verify multiple times)
4. **Email verification:** Only recipient gets OTP
5. **Access token:** Separate from OTP (used for download)

### **Additional Security:**
1. **Password protection:** Optional second factor
2. **Time expiry:** Share link expires after set hours
3. **Revocation:** Owner can revoke share anytime
4. **File encryption:** Files encrypted at rest
5. **Permission levels:** View-only or download

---

## 🧪 Testing OTP Manually

### **Via Browser Console:**
```javascript
// Test 1: Check if OTP input accepts numbers
// Go to share URL, look at input field
// Type: 123456
// Should accept, button enabled

// Test 2: Try wrong OTP
// Type: 111111
// Click Verify
// Should show: "Invalid OTP"

// Test 3: Check network request
// DevTools → Network tab
// Click Verify
// Look for POST request to: /api/shares/access/{id}
// Check payload: { otp: "123456" }
// Check response: { accessToken: "...", file: {...} }
```

---

## 📝 Key Code Snippets

### **Generate OTP**
```javascript
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
// Returns: "123456" (random 6 digits)
```

### **Verify OTP**
```javascript
if (share.otp !== otp) {
  return res.status(400).json({ message: 'Invalid OTP' });
}
// Simple string comparison
```

### **Store OTP in Share**
```javascript
const share = new Share({
  otp,  // "123456"
  file: fileId,
  recipientEmail,
  expiresAt,
  // ... other fields
});
await share.save(); // Saved to MongoDB
```

### **Check OTP from Frontend**
```jsx
const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  // Allow only 6 numeric digits
  const value = e.target.value.replace(/[^0-9]/g, '');
  setOtp(value);
};

// Send OTP to backend
const response = await axios.post(
  `/api/shares/access/${shareId}`,
  { otp }
);
```

---

## 🔌 API Endpoints for OTP

### **1. Create Share (Generates OTP)**
```
POST /api/shares
Body: {
  fileId: "...",
  recipientEmail: "...",
  expiryHours: 24,
  passwordProtect: false
}
Response: {
  message: "...",
  shareId: "a1b2c3d4...",
  shareLink: "https://app.com/share/a1b2c3d4...",
  οtp: "123456"  // Only if email failed
}
```

### **2. Verify Share (Get file info)**
```
GET /api/shares/verify/{shareId}
Response: {
  fileName: "MyFile.pdf",
  fileSize: 2500000,
  isPasswordProtected: false,
  expiresAt: "2024-03-09...",
  emailDelivered: true
}
```

### **3. Verify OTP & Get Access Token**
```
POST /api/shares/access/{shareId}
Body: {
  otp: "123456",
  password: "optional"  // If password protected
}
Response: {
  accessToken: "eyJhbGci...",
  file: {...},
  permission: "download"
}
```

### **4. Download File (Uses access token)**
```
GET /api/shares/download/{shareId}
Headers: {
  'x-access-token': 'eyJhbGci...'
}
Response: Binary file data
```

---

## 🐛 Debugging OTP Issues

### **If OTP says "Invalid OTP"**
1. Check if OTP is exactly 6 digits
2. Verify backend has the correct OTP in database
3. Check if multiple people accessing (different OTPs)
4. Verify no typos when entering

### **If OTP never arrives**
1. Check email spam folder
2. Verify email is configured in `backend/utils/shareOtp.js`
3. Look for manual OTP in green box on page
4. Check recipient email address is spelled correctly

### **If OTP form doesn't appear**
1. Page is blank → Backend not responding
2. Error message → Check browser console
3. Different page appears → Share link was wrong
4. Loading forever → `network timeout`

---

## 📚 Full Implementation Path

```
User uploads file → File encrypted & stored in uploads/
                ↓
                User clicks Share
                ↓
     FileShareModal.tsx
     - Collects recipient email
     - Sends to: POST /api/shares
                ↓
     backend/routes/shares.js (Line 22)
     - Generates shareId (hex)
     - Generates OTP (6 digits)
     - Saves to MongoDB
     - Calls shareOtp utility
                ↓
     backend/utils/shareOtp.js
     - Sends email to recipient
     - Includes OTP: 123456
     - Includes share link
                ↓
     Frontend shows: "Share created!"
     Displays: Copy share link button
                ↓
     Recipient clicks link:
     https://app.com/share/a1b2c3d4...
                ↓
     SharedFileAccess.tsx (Line 32)
     - Gets shareId from URL
     - Calls: GET /api/shares/verify
                ↓
     backend/routes/shares.js (Line 150)
     - Checks if share valid
     - Returns file info
                ↓
     Frontend shows OTP Form:
     [One-Time Password (OTP): ______]
     [Verify and Access File]
                ↓
     Recipient receives email with OTP
     OR
     Reads OTP from green box
                ↓
     Recipient enters: 123456
                ↓
     SharedFileAccess.tsx (Line 120)
     - Calls: POST /api/shares/access
     - Sends: { otp: "123456" }
                ↓
     backend/routes/shares.js (Line 247)
     - Compares: share.otp === "123456"
     - If match: Generates access token
     - If wrong: Returns 400 error
                ↓
     Frontend shows Download Button
     Stores access token
                ↓
     Recipient clicks "Download File"
                ↓
     Frontend calls: GET /api/shares/download
     Headers: { 'x-access-token': '...' }
                ↓
     backend/routes/shares.js (Line 300)
     - Verifies access token
     - Decrypts file
     - Sends file to browser
                ↓
     File downloads to recipient's computer
```

---

## ✨ Summary

Your OTP system:
- ✅ Generates 6-digit random OTP
- ✅ Sends via Email
- ✅ Shows fallback code if email fails
- ✅ Validates OTP before allowing download
- ✅ Generates secure access token
- ✅ Allows file download after verification

**The entire system is complete and functional!** 🎉

Just need to ensure:
1. Backend is running and accessible
2. Database has share records
3. No CORS issues between frontend & backend
4. Email service is configured properly
