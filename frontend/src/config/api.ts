// API Configuration
// Determine the API base URL based on environment
const getApiBaseUrl = (): string => {
  // Use environment variable if available
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Development: use localhost
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:5000/api';
  }
  
  // Production: use deployed backend URL (replace with your actual Render backend URL)
  // Example: https://your-backend-app.onrender.com/api
  return 'https://your-backend-app.onrender.com/api';
};

export const API_BASE_URL = getApiBaseUrl();
export const API_URL = API_BASE_URL.replace('/api', ''); // For non-API routes if needed
