import axios from 'axios';

// Default host for local network / mobile devices
// 10.18.157.15 is the current local machine Wi-Fi IP
export const DEFAULT_SERVER_URL = 'http://10.18.157.15:5000/api';

export const getServerUrl = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('arena_server_url');
    if (saved) return saved;
  }
  return DEFAULT_SERVER_URL;
};

export const setServerUrl = (url) => {
  if (!url) return;
  let formatted = url.trim();
  // Strip trailing slash
  if (formatted.endsWith('/')) {
    formatted = formatted.slice(0, -1);
  }
  // Append /api if not present
  if (!formatted.endsWith('/api')) {
    formatted = `${formatted}/api`;
  }
  localStorage.setItem('arena_server_url', formatted);
  api.defaults.baseURL = formatted;
  return formatted;
};

export const testServerConnection = async (targetUrl) => {
  let url = (targetUrl || getServerUrl()).trim();
  if (url.endsWith('/')) url = url.slice(0, -1);
  if (!url.endsWith('/api')) url = `${url}/api`;

  try {
    const res = await axios.get(`${url}/events`, { timeout: 5000 });
    return {
      success: true,
      message: `Connected! (${res.data?.events?.length || 0} events available)`,
    };
  } catch (err) {
    let msg = err.message;
    if (err.code === 'ECONNABORTED') {
      msg = 'Connection timed out. Check if server is running and on same Wi-Fi.';
    } else if (err.response?.status) {
      msg = `Server replied with status ${err.response.status}`;
    } else if (msg.includes('Network Error')) {
      msg = 'Network Error. Check Wi-Fi, IP address, and firewall port 5000.';
    }
    return { success: false, message: msg };
  }
};

const api = axios.create({
  baseURL: getServerUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    config.baseURL = getServerUrl();
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
