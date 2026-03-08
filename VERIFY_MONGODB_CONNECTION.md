# ✅ How to Verify MongoDB is Connected

## **Quick Verification Checklist**

- [ ] MONGO_URI is set on Render.com
- [ ] Database is 'otpAuthApp'
- [ ] Collections exist (users, files, shares)
- [ ] Share documents are in database
- [ ] Render logs show "Connected to MongoDB"

---

## **Method 1: MongoDB Atlas Dashboard (Best Visual)**

### **Step 1: Login to MongoDB Atlas**
```
https://cloud.mongodb.com
```

### **Step 2: Click Your Project**
- Usually named "Project 0" or your project name
- Click to open

### **Step 3: Click "Browse Collections"**
- Top right button
- Shows all databases and collections

### **Step 4: Expand Your Database**
- Look for: **otpAuthApp**
- Click to expand
- You should see:
  ```
  otpAuthApp
  ├─ users
  ├─ files
  ├─ shares    ← Click this
  ├─ sessions
  ```

### **Step 5: Click "shares" Collection**
- See all share documents
- Each document shows:
  ```json
  {
    "_id": "Object ID",
    "shareId": "363df0fe615dce...",
    "otp": "123456",
    "file": "Object ID",
    "owner": "Object ID",
    "recipientEmail": "email@gmail.com",
    "permission": "download",
    "expiresAt": "2024-03-09...",
    "emailDelivered": false,
    "isOtpVerified": false,
    "createdAt": "2024-03-08..."
  }
  ```

### **✅ SUCCESS Signs:**
- Database **otpAuthApp** exists
- Collections are listed
- **shares** collection has documents
- Documents have shareId field

### **❌ PROBLEM Signs:**
- Database doesn't exist
- Collections are empty
- No documents in shares
- Error message shown

---

## **Method 2: Render Environment Variables**

### **Step 1: Open Render Dashboard**
```
https://dashboard.render.com/d/new
```
(or go to your services list)

### **Step 2: Click Backend Service**
- **secure-file-backend**

### **Step 3: Go to Settings**
- Left sidebar → **Settings**

### **Step 4: Scroll to Environment**
- Look for **Environment** section
- See all variables:
  ```
  MONGO_URI = mongodb+srv://username:password@cluster0...
  JWT_SECRET = your-secret
  EMAIL_USER = your-email@gmail.com
  EMAIL_PASS = xxxx xxxx xxxx xxxx
  FRONTEND_URL = https://secure-file-sharing-app-tor7.vercel.app
  ```

### **✅ SUCCESS Signs:**
- MONGO_URI exists
- Contains: **otpAuthApp**
- Contains: **mongodb+srv://**
- Not empty

### **❌ PROBLEM Signs:**
- MONGO_URI is missing
- Says "undefined"
- Empty value
- Wrong database name

---

## **Method 3: Render Service Logs**

### **Step 1: Open Render Dashboard**
```
https://dashboard.render.com
```

### **Step 2: Go to Backend Service**
- Click: **secure-file-backend**

### **Step 3: View Logs**
- Click: **Logs** tab (top)
- Shows all backend messages

### **Step 4: Look for MongoDB Message**
Scroll through logs and find:

**✅ SUCCESS Message:**
```
Connected to MongoDB
```

**❌ FAILURE Message:**
```
Failed to connect to MongoDB: ...
```

### **Other Useful Messages:**
```
✅ Server started on port 5000
✅ Connected to MongoDB
✅ Share OTP email sent successfully
❌ Error sending share OTP email
❌ Failed to create share
```

---

## **Method 4: Check Active Shares**

### **In MongoDB Atlas:**

1. Go to **otpAuthApp** database
2. Click **shares** collection
3. You should see documents like:

```
Document 1:
{
  shareId: "363df0fe615dce4bf5653263072d448",
  otp: "123456",
  permission: "download"
}

Document 2:
{
  shareId: "5b89c60f82c62020ea43244bc8949a79a",
  otp: "654321",
  permission: "view"
}
```

**Each document = one shared file**

---

## **📱 What Each Field Means**

```
shareId:           The ID used in share URL (/share/{shareId})
otp:               6-digit code for verification
file:              Reference to file document
owner:             Reference to user who shared
recipientEmail:    Email of recipient
permission:        "view" or "download"
isPasswordProtected: true/false
password:          Hashed password (if protected)
isOtpVerified:     Has OTP been verified?
emailDelivered:    Was email sent successfully?
expiresAt:         When does share expire?
accessCount:       How many times downloaded?
lastAccessed:      When was it last used?
isRevoked:         Has owner deleted share?
accessToken:       Token for downloading
createdAt:         When was share created?
updatedAt:         When was last change?
```

---

## **🧪 Complete Verification Steps**

### **Do This Now:**

1. **[  ] Open MongoDB Atlas**
   - https://cloud.mongodb.com
   - Sign in

2. **[ ] Click Your Project**
   - Find your cluster

3. **[ ] Click "Browse Collections"**
   - See databases

4. **[ ] Expand "otpAuthApp"**
   - See collections

5. **[ ] Click "shares"**
   - See documents

6. **[ ] Check Render Environment**
   - https://dashboard.render.com
   - secure-file-backend → Settings
   - Look for MONGO_URI

7. **[ ] Check Render Logs**
   - secure-file-backend → Logs
   - Search for "Connected to MongoDB"

8. **[ ] Create New Share**
   - Make sure document appears in MongoDB
   - Refresh MongoDB Atlas
   - See new share document

---

## **✅ Everything Connected When You See:**

1. ✅ MongoDB Atlas shows **otpAuthApp** database
2. ✅ Database has **shares** collection
3. ✅ Shares collection has **documents** (one per share)
4. ✅ Each document has **shareId** field
5. ✅ Render shows **MONGO_URI** environment variable
6. ✅ Render logs show: **"Connected to MongoDB"**
7. ✅ New shares appear in MongoDB within seconds of creation
8. ✅ Share link works and shows OTP form

---

## **If MongoDB NOT Connected**

### **Signs:**
- No documents in "shares" collection
- Database doesn't exist
- MONGO_URI missing from Render
- Render logs show error message

### **Fix:**
1. **Check MONGO_URI**
   - Get connection string from MongoDB Atlas
   - Add to Render environment variables
   - Include database name: **otpAuthApp**

2. **Check Network Access**
   - MongoDB Atlas → Network Access
   - Make sure **0.0.0.0/0** is added
   - Allows Render.com to connect

3. **Check IP Whitelist**
   - Render's IP might not be whitelisted
   - Add 0.0.0.0/0 to allow all

4. **Restart Backend**
   - Render dashboard
   - Click "Pull & Deploy"
   - Forces new connection

---

## **Test by Creating Share**

### **Real-Time Test:**

1. Create share in your app
2. Immediately check MongoDB Atlas
3. Refresh: **shares** collection
4. **New document should appear!**

If it appears → **MongoDB is connected!** ✅

If it doesn't → **Something is broken** ❌

---

## **Screenshot Guide**

### **What to Screenshot for Help:**

1. **MongoDB Collections:**
   - Opens "shares" collection
   - Shows documents (or empty)
   - Shows shareId values

2. **Render Environment:**
   - Settings tab
   - Environment variables
   - MONGO_URI value

3. **Render Logs:**
   - Recent logs
   - "Connected to MongoDB" message
   - Any error messages

---

## **Quick Commands to Check**

### **In Backend Code:**
File: `backend/server.js`

```javascript
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/otpAuthApp')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });
```

This tries to connect using:
1. **MONGO_URI** environment variable (from Render)
2. If not found, uses local: `mongodb://localhost:27017/otpAuthApp`

---

## **Summary**

**To verify MongoDB is connected:**

| Check | Where | What to Look For |
|-------|-------|-----------------|
| **Database** | MongoDB Atlas | "otpAuthApp" exists |
| **Collections** | MongoDB Atlas | "shares" collection visible |
| **Documents** | MongoDB shares | See share records |
| **Environment** | Render Settings | MONGO_URI variable set |
| **Logs** | Render Logs | "Connected to MongoDB" |
| **Real-time** | Create share | New doc appears in MongoDB |

**All 6 checks pass → MongoDB fully connected!** ✅

---

**Do this now and tell me:**
1. Does "otpAuthApp" database exist in MongoDB Atlas?
2. Does "shares" collection have documents?
3. What's your MONGO_URI on Render? (can hide password)
4. Do Render logs show "Connected to MongoDB"?

**With these answers, I'll know if MongoDB is properly set up!** 🔍
