# 🔍 DIAGNOSTIC SCRIPT - Copy & Paste in Browser Console

## 📋 How to Use

1. **Open your app** or **share link URL**
2. **Press F12** (or Right-Click → Inspect)
3. **Go to Console tab**
4. **Copy & Paste Each Test Below**
5. **Watch for success/failure messages**

---

## ✅ Test 1: Backend is Reachable

```javascript
console.log('🔧 TEST 1: Backend Connectivity');
fetch('https://secure-file-backend-98yd.onrender.com/api/files')
  .then(response => {
    console.log('✅ Backend responded with status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('✅ Backend is reachable!');
    console.log('📦 Response:', JSON.stringify(data, null, 2));
  })
  .catch(error => {
    console.error('❌ Backend test failed!');
    console.error('Error:', error.message);
    console.log('⚙️ Troubleshooting:');
    console.log('   - Is backend URL correct?');
    console.log('   - Is backend service running?');
    console.log('   - Wait 60 sec if 502 error (Render sleep)');
  });
```

---

## ✅ Test 2: API Configuration

```javascript
console.log('🔧 TEST 2: API Configuration');
console.log('Current Hostname:', window.location.hostname);
console.log('Current Origin:', window.location.origin);

// Check what API URL the app is using
const apiBaseUrl = localStorage.getItem('apiBaseUrl') || 'https://secure-file-backend-98yd.onrender.com/api';
console.log('📍 API_BASE_URL:', apiBaseUrl);

// The app should be using:
console.log('✅ Expected API URL: https://secure-file-backend-98yd.onrender.com/api');
```

---

## ✅ Test 3: Check Share URL Format

```javascript
console.log('🔧 TEST 3: Share URL Format');
const url = window.location.href;
const shareIdMatch = url.match(/\/share\/([a-f0-9]+)/);

if (shareIdMatch) {
  const shareId = shareIdMatch[1];
  console.log('✅ Share URL is valid');
  console.log('📍 Share ID found:', shareId);
  console.log('Full URL:', url);
} else {
  console.warn('⚠️ Not a share URL');
  console.log('Current URL:', url);
  console.log('Expected format: https://app.com/share/{shareId}');
}
```

---

## ✅ Test 4: Network Connection

```javascript
console.log('🔧 TEST 4: Network Connection');

// Test multiple endpoints
const tests = [
  {
    name: 'Backend Status',
    url: 'https://secure-file-backend-98yd.onrender.com/api/files'
  },
  {
    name: 'Current Domain',
    url: window.location.origin
  }
];

tests.forEach(test => {
  fetch(test.url, { method: 'HEAD' })
    .then(() => console.log('✅', test.name, '- Connected'))
    .catch(err => console.error('❌', test.name, '- Failed:', err.message));
});
```

---

## ✅ Test 5: Verify Share Endpoint

Use this ONLY on a share URL page (after clicking share link)

```javascript
console.log('🔧 TEST 5: Verify Share Endpoint');
const url = window.location.href;
const shareIdMatch = url.match(/\/share\/([a-f0-9]+)/);

if (!shareIdMatch) {
  console.error('❌ Not on a share page. Use this test only after clicking share link.');
} else {
  const shareId = shareIdMatch[1];
  const verifyUrl = `https://secure-file-backend-98yd.onrender.com/api/shares/verify/${shareId}`;
  
  console.log('📍 Testing endpoint:', verifyUrl);
  
  fetch(verifyUrl)
    .then(response => {
      console.log('Status:', response.status);
      return response.json();
    })
    .then(data => {
      console.log('✅ Share verification successful!');
      console.log('📦 File Info:', {
        name: data.fileName,
        size: data.fileSize,
        passwordProtected: data.isPasswordProtected,
        expiresAt: data.expiresAt,
        emailDelivered: data.emailDelivered
      });
    })
    .catch(error => {
      console.error('❌ Share verification failed!');
      console.error('Error:', error.message);
      if (error.message === 'Failed to fetch') {
        console.log('⚙️ Possible CORS issue - Check DevTools Network tab');
      }
    });
}
```

---

## ✅ Test 6: Check LocalStorage

```javascript
console.log('🔧 TEST 6: LocalStorage & Session Data');
const stored = localStorage.getItem('authToken');
console.log('Auth Token exists:', !!stored);
console.log('Auth Token length:', stored ? stored.length : 0);

const sessionData = sessionStorage.getItem('shareVerification');
console.log('Share Verification data:', sessionData || 'None');

// List all localStorage items
console.log('All stored items:');
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  const value = localStorage.getItem(key);
  console.log(`- ${key}: ${value.substring(0, 50)}...`);
}
```

---

## ✅ Test 7: Browser Compatibility

```javascript
console.log('🔧 TEST 7: Browser Compatibility');
console.log('Browser:', navigator.userAgent);
console.log('Fetch API:', 'fetch' in window ? '✅ Available' : '❌ Not available');
console.log('LocalStorage:', 'localStorage' in window ? '✅ Available' : '❌ Not available');
console.log('SessionStorage:', 'sessionStorage' in window ? '✅ Available' : '❌ Not available');
console.log('Crypto:', 'crypto' in window ? '✅ Available' : '❌ Not available');
console.log('Blob:', 'Blob' in window ? '✅ Available' : '❌ Not available');
```

---

## ✅ Test 8: CORS Configuration

```javascript
console.log('🔧 TEST 8: CORS Headers');
fetch('https://secure-file-backend-98yd.onrender.com/api/files', {
  method: 'OPTIONS'
})
  .then(response => {
    console.log('CORS Headers:');
    console.log('- Access-Control-Allow-Origin:', response.headers.get('access-control-allow-origin'));
    console.log('- Access-Control-Allow-Methods:', response.headers.get('access-control-allow-methods'));
    console.log('- Access-Control-Allow-Headers:', response.headers.get('access-control-allow-headers'));
    
    if (response.headers.get('access-control-allow-origin')) {
      console.log('✅ CORS appears to be configured');
    } else {
      console.warn('⚠️ CORS headers might be missing');
    }
  })
  .catch(err => console.error('❌ CORS check failed:', err.message));
```

---

## ✅ Test 9: Full Share Flow Test

```javascript
console.log('🔧 TEST 9: Complete Share Flow (Testing step by step)');

const url = window.location.href;
const shareIdMatch = url.match(/\/share\/([a-f0-9]+)/);

if (!shareIdMatch) {
  console.error('❌ Not on a share page');
} else {
  const shareId = shareIdMatch[1];
  const apiBase = 'https://secure-file-backend-98yd.onrender.com/api';
  
  console.log('📍 Share ID:', shareId);
  console.log('\n------- Step 1: Verify Share -------');
  
  fetch(`${apiBase}/shares/verify/${shareId}`)
    .then(r => r.json())
    .then(data => {
      console.log('✅ Step 1: Share verified');
      console.log('   File:', data.fileName);
      console.log('   Size:', data.fileSize, 'bytes');
      
      console.log('\n------- Step 2: Would need OTP -------');
      console.log('   OTP provides access token');
      console.log('   Access token enables download');
      console.log('   Without OTP: Cannot download');
      
      return data;
    })
    .catch(err => {
      console.error('❌ Step 1 failed:', err.message);
      console.log('Possible issues:');
      console.log('- Share ID not in database');
      console.log('- Share has expired');
      console.log('- Backend not reachable');
    });
}
```

---

## ✅ Test 10: Simulated OTP Submission

```javascript
console.log('🔧 TEST 10: Test OTP Submission (Dry Run)');

const url = window.location.href;
const shareIdMatch = url.match(/\/share\/([a-f0-9]+)/);

if (!shareIdMatch) {
  console.error('❌ Not on a share page');
} else {
  const shareId = shareIdMatch[1];
  const testOtp = '123456'; // Test OTP (change to real one to actually submit)
  const apiBase = 'https://secure-file-backend-98yd.onrender.com/api';
  
  console.log('📋 Preparing OTP submission:');
  console.log('   Share ID:', shareId);
  console.log('   OTP: [HIDDEN for security]');
  console.log('   Endpoint:', `${apiBase}/shares/access/${shareId}`);
  
  if (testOtp === '123456') {
    console.log('\n⚠️  TEST OTP "123456" detected - Running in dry-run mode');
    console.log('✅ Dry run complete. To test with real OTP:');
    console.log('   1. Get OTP from email or green box');
    console.log('   2. Replace "123456" variable');
    console.log('   3. Run this test again');
  } else {
    console.log('\n🚀 Submitting OTP...');
    
    fetch(`${apiBase}/shares/access/${shareId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp: testOtp })
    })
      .then(r => r.json())
      .then(data => {
        if (data.accessToken) {
          console.log('✅ OTP verified successfully!');
          console.log('Token received:', data.accessToken.substring(0, 20) + '...');
          console.log('Permission:', data.permission);
        } else {
          console.error('❌ OTP incorrect');
          console.error('Error:', data.message);
        }
      })
      .catch(err => {
        console.error('❌ OTP submission failed:', err.message);
      });
  }
}
```

---

## 📊 Quick Diagnostic Report

```javascript
console.log('🔧 GENERATE DIAGNOSTIC REPORT');
console.log('════════════════════════════════════════\n');

const report = {
  'URL': window.location.href,
  'Domain': window.location.hostname,
  'API Endpoint': 'https://secure-file-backend-98yd.onrender.com/api',
  'Fetch Available': 'fetch' in window,
  'LocalStorage Available': 'localStorage' in window,
  'Browser': navigator.userAgent.split('(')[1],
  'Online Status': navigator.onLine
};

Object.entries(report).forEach(([key, value]) => {
  console.log(`${key}: ${value}`);
});

console.log('\n════════════════════════════════════════');
console.log('Copy this report if reporting issues!');
```

---

## 🚨 Error Message Decoder

```javascript
console.log('🔧 ERROR MESSAGE DECODER\n');

// Common errors and what they mean
const errors = {
  'Failed to fetch': 'Backend not reachable - might be sleeping on Render',
  '404 Not Found': 'Share ID not in database - share wasn\'t created',
  '403 Forbidden': 'CORS blocked - backend doesn\'t trust frontend',
  '500 Server Error': 'Backend crashed - check server logs',
  'Connection timeout': 'Backend taking too long - might be waking up',
  'SyntaxError': 'Invalid JSON response - backend returned bad data'
};

console.log('When you see an error, it probably means:\n');
Object.entries(errors).forEach(([error, meaning]) => {
  console.log(`❌ "${error}"\n   → ${meaning}\n`);
});
```

---

## 🎯 What Each Test Checks

| Test | Checks | Success Sign | Failure Sign |
|------|--------|---|---|
| 1 | Backend reachable | `status: 200` | `502` or timeout |
| 2 | API configuration | Shows correct URL | Wrong URL shown |
| 3 | Share URL format | Share ID extracted | No match found |
| 4 | Network connection | Connected message | Failed message |
| 5 | Share verification | File info returns | 404 error |
| 6 | LocalStorage | Data stored properly | Empty or errors |
| 7 | Browser features | All available | Missing features |
| 8 | CORS config | Headers present | Headers missing |
| 9 | Full flow | Each step succeeds | Step fails at point |
| 10 | OTP submission | Access token returned | Invalid OTP error |

---

## 🔧 Running All Tests

Copy and paste this to run multiple tests in sequence:

```javascript
console.clear();
console.log('🚀 RUNNING ALL DIAGNOSTIC TESTS\n');

const tests = [
  () => fetch('https://secure-file-backend-98yd.onrender.com/api/files').then(r => console.log('✅ Test 1: Backend')).catch(e => console.error('❌ Test 1:', e.message)),
  () => console.log('✅ Test 2: API =', 'https://secure-file-backend-98yd.onrender.com/api'),
  () => console.log('✅ Test 3: URL =', window.location.href)
];

Promise.all(tests.map(t => Promise.resolve().then(t)))
  .then(() => console.log('\n✅ All tests completed'))
  .catch(e => console.error('\n❌ Some tests failed:', e.message));
```

---

## 💾 How to Save DiagnosticOutput

```javascript
// Copy all console output to clipboard
console.log('📋 Copying diagnostic data...');

const timestamp = new Date().toISOString();
const diagnosticData = `
DIAGNOSTIC REPORT - ${timestamp}
====================================
URL: ${window.location.href}
Domain: ${window.location.hostname}
Browser: ${navigator.userAgent}
Online: ${navigator.onLine}
Backend: https://secure-file-backend-98yd.onrender.com/api
====================================
`;

// Copy to clipboard (requires https)
if (navigator.clipboard) {
  navigator.clipboard.writeText(diagnosticData).then(() =>
    console.log('✅ Diagnostic data copied to clipboard')
  );
} else {
  console.log('📋 Diagnostic data:');
  console.log(diagnosticData);
}
```

---

## 📝 Instructions for Reporting Issues

When reporting issues, please include:

1. **Copy this entire console output:**
   - Screenshot or text
   - Include all error messages

2. **Answer these questions:**
   - What step fails? (link won't load, OTP won't verify, download fails)
   - What error message? (specific text from console)
   - Can you reach backend? (Test 1)
   - When was share created? (minutes/hours ago)
   - Is share URL correct? (Test 3)

3. **Send me:**
   - Console output (screenshot or text)
   - Error message (exact text)
   - Answers above
   - Your share URL (sanitized, no real OTPs)

**With this info, I can fix the issue immediately!** ✨

---

## 🎓 Learning the Debug Process

1. **See blank page?** → Run Test 1-5
2. **OTP form missing?** → Run Test 5 (share verify)
3. **OTP won't verify?** → Run Test 9-10
4. **File won't download?** → Check Network tab (DevTools)
5. **Any error?** → Copy entire console, send it

The console tells you EXACTLY what's wrong. Just need to read the error messages! 🔍
