import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/axios';
import Navbar from '../components/Navbar';
import { RefreshCw, ShieldCheck, User } from 'lucide-react';

const Login = () => {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState(searchParams.get('portal') === 'admin' ? 'admin' : 'campus');
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

    if (mode === 'admin' && !email.toLowerCase().includes('@admin')) {
      setError('Admin portal requires an authorized email containing @admin (e.g. admin@admin.arena.aiml).');
      return;
    }

    setSubmitting(true);
    try {
      const loggedUser = await login(email, password);
      if (mode === 'admin' && loggedUser?.role !== 'admin') {
        setError('This account does not have administrative privileges.');
        return;
      }
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
      <div className="flex items-center justify-center px-6 pt-12 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm bg-bg-light dark:bg-[#1A1A1E] border border-border-light dark:border-border-dark rounded-2xl p-8 shadow-md"
        >
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-black/5 dark:bg-white/5 border border-border-light dark:border-border-dark mb-6 text-xs font-mono">
            <button
              type="button"
              onClick={() => {
                setMode('campus');
                setError('');
              }}
              className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                mode === 'campus' ? 'bg-accent text-white font-bold shadow-xs' : 'opacity-60 hover:opacity-100'
              }`}
            >
              <User size={13} /> Campus User
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('admin');
                setError('');
              }}
              className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                mode === 'admin' ? 'bg-accent text-white font-bold shadow-xs' : 'opacity-60 hover:opacity-100'
              }`}
            >
              <ShieldCheck size={13} /> Admin Portal
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <h1 className="font-display text-3xl font-semibold mb-1">
              {mode === 'admin' ? 'Admin Portal' : 'Welcome back'}
            </h1>
            <p className="text-sm opacity-60 mb-6">
              {mode === 'admin' ? 'Sign in with your @admin institutional ID' : 'Sign in to your board'}
            </p>

            {error && (
              <p className="text-xs text-red-500 bg-red-500/10 rounded-lg px-3.5 py-2.5 mb-4 leading-relaxed font-medium">
                {error}
              </p>
            )}

            <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1">
              {mode === 'admin' ? 'Admin ID (@admin required)' : 'Email'}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={submitting}
              placeholder={mode === 'admin' ? 'admin@admin.arena.aiml' : 'your.name@campus.edu'}
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
              {submitting ? 'Authenticating...' : mode === 'admin' ? 'Sign In as Admin' : 'Sign In'}
            </button>

            {mode === 'campus' && (
              <p className="text-sm text-center opacity-60 mt-6">
                New here? <Link to="/register" className="text-accent font-medium hover:underline">Create an account</Link>
              </p>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;