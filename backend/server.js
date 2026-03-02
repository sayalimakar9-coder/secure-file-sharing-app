// Load environment variables from .env file (development only)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// DEBUG: Log environment variables on startup
console.log('\n=== ENVIRONMENT VARIABLES CHECK ===');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? `✓ Set (${process.env.EMAIL_USER})` : '❌ Missing');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✓ Set' : '❌ Missing');
if (process.env.EMAIL_PASS) {
  console.log('EMAIL_PASS length:', process.env.EMAIL_PASS.length);
  console.log('EMAIL_PASS value:', process.env.EMAIL_PASS);
}
console.log('MONGO_URI:', process.env.MONGO_URI ? '✓ Set' : '❌ Missing');
console.log('=== END ENVIRONMENT CHECK ===\n');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const authRoutes = require('./routes/auth');
const fileRoutes = require('./routes/files');
const shareRoutes = require('./routes/shares');

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'https://secure-file-frontend-asme.onrender.com',
    'https://secure-file-asme.onrender.com',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token', 'x-access-token']
}));

app.use(express.json());

// Add security headers to all responses
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('X-Frame-Options', 'DENY');
  res.header('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  next();
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Database connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/otpAuthApp')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/shares', shareRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    message: 'An unexpected error occurred'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));