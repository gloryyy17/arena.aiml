import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

const DEMO_STUDENT = {
  _id: 'mock-user-student-1',
  name: 'Aarav Sharma',
  email: 'student@arena.aiml',
  role: 'student',
  department: 'AI & Data Science',
  studentId: 'AIML-2026-042',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const cachedUser = localStorage.getItem('arena_cached_user');

    if (!token) {
      setLoading(false);
      return;
    }

    if (token === 'offline-demo-token' && cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch {
        setUser(DEMO_STUDENT);
      }
      setLoading(false);
      return;
    }

    api.get('/auth/me')
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem('arena_cached_user', JSON.stringify(res.data.user));
      })
      .catch(() => {
        // If network error, preserve cached user so student is not locked out
        if (cachedUser) {
          try {
            setUser(JSON.parse(cachedUser));
          } catch {
            localStorage.removeItem('token');
          }
        } else {
          localStorage.removeItem('token');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('arena_cached_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      return res.data.user;
    } catch (err) {
      // If server is unreachable (e.g. mobile on 5G / client-isolated Wi-Fi) and demo student:
      const isNetError = !err.response || err.message?.toLowerCase().includes('network') || err.code === 'ECONNABORTED';
      if (isNetError && (email.toLowerCase().includes('student') || email === 'student@arena.aiml')) {
        const studentUser = {
          ...DEMO_STUDENT,
          email: email.trim(),
        };
        localStorage.setItem('token', 'offline-demo-token');
        localStorage.setItem('arena_cached_user', JSON.stringify(studentUser));
        setUser(studentUser);
        return studentUser;
      }
      throw err;
    }
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', { ...formData, role: 'student' });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('arena_cached_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('arena_cached_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
