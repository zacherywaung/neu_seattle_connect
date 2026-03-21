import axios from 'axios';

// All API calls go through this instance
// The base URL comes from the .env file (REACT_APP_API_URL)
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
});

// Automatically attach the token to every request if it exists
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the server returns 401 (not authorized), clear login state and redirect to login
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;