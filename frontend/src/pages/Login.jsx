import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/axios';
import Navbar from '../components/Navbar';
import { RefreshCw } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err, 'Invalid credentials. Please verify your email and password.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-ink-light dark:text-ink-dark">
      <Navbar />
      <div className="flex items-center justify-center px-6 pt-16 pb-20">
        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="w-full max-w-sm bg-bg-light dark:bg-[#1A1A1E] border border-border-light dark:border-border-dark rounded-2xl p-8 shadow-md"
        >
          <h1 className="font-display text-3xl font-semibold mb-1">Welcome back</h1>
          <p className="text-sm opacity-60 mb-6">Sign in to your board</p>

          {error && (
            <p className="text-xs text-red-500 bg-red-500/10 rounded-lg px-3.5 py-2.5 mb-4 leading-relaxed font-medium">
              {error}
            </p>
          )}

          <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={submitting}
            placeholder="your.name@campus.edu"
            className="w-full mb-4 px-4 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-transparent outline-none focus:border-accent transition-colors disabled:opacity-50 text-sm"
          />

          <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={submitting}
            placeholder="••••••••"
            className="w-full mb-6 px-4 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-transparent outline-none focus:border-accent transition-colors disabled:opacity-50 text-sm"
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-full bg-accent text-white font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-md disabled:opacity-50 text-sm"
          >
            {submitting && <RefreshCw size={14} className="animate-spin" />}
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="text-sm text-center opacity-60 mt-6">
            New here? <Link to="/register" className="text-accent font-medium hover:underline">Create an account</Link>
          </p>
        </motion.form>
      </div>
    </div>
  );
};

export default Login;