// Load environment variables from .env file
// On Render: environment variables set via dashboard take precedence
try {
  require('dotenv').config();
} catch (e) {
  // Ignore if dotenv not available or .env file missing
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const authRoutes = require('./routes/auth');
const fileRoutes = require('./routes/files');
const shareRoutes = require('./routes/shares');

const app = express();

// Configure CORS to allow requests from the frontend
const allowedOrigins = [
  'https://secure-file-sharing-app-tor7.vercel.app',              // Main production frontend URL
  'https://secure-file-sharing-app-tor7-9k3qcqmas.vercel.app',    // Preview deployment
  'https://secure-file-sharing-app-tor7-4o7rptkj4.vercel.app',    // Preview deployment
  'http://localhost:3000',  // For local development
  'http://localhost:5000'   // For local testing
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    // Allow if in the explicit list
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow any Vercel preview deployment for this app
    if (origin.match(/^https:\/\/secure-file-sharing-app-tor7.*\.vercel\.app$/)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
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