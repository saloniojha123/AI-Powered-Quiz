// import axios from 'axios';

// const API = axios.create({
//     baseURL: 'https://ai-powered-quiz-o6jz.onrender.com/api'
// }); 

// API.interceptors.request.use((config) => {
//     const token = localStorage.getItem('token');
//     if (token) config.headers.Authorization = `Bearer ${token}`;
//     return config;
// });

// export default API;

import axios from 'axios';

const API = axios.create({
  // Update this to match your ACTIVE Render service URL from the screenshot
  baseURL: process.env.REACT_APP_API_URL || 'https://ai-powered-quiz-1.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token interceptor if you have one
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['x-auth-token'] = token; // or Authorization: Bearer token
  }
  return config;
});

export default API;