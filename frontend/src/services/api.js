import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const API_SECRET = process.env.REACT_APP_API_SECRET || 'furns-admin-secret-2024';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_SECRET}`,
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error.response?.data || error.message);
  }
);

export default api;