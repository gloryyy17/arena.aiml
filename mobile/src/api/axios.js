import axios from 'axios';

// On mobile emulators:
// Android Emulator uses 10.0.2.2 to reach host localhost:5000
// iOS Simulator uses localhost:5000
// Physical phones use your local LAN IP (e.g. http://192.168.1.X:5000/api)
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : '/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const getErrorMessage = (err, defaultMsg = 'An error occurred.') => {
  return err.response?.data?.message || err.message || defaultMsg;
};

export default api;
