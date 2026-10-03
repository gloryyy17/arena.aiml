import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/axios';
import Navbar from '../components/Navbar';
import { RefreshCw } from 'lucide-react';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', department: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user, register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to create account. Please check your details.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-ink-light dark:text-ink-dark">
      <Navbar />
      <div className="flex items-center justify-center px-6 pt-12 pb-16">
        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="w-full max-w-sm bg-bg-light dark:bg-[#1A1A1E] border border-border-light dark:border-border-dark rounded-2xl p-8 shadow-md"
        >
          <h1 className="font-display text-3xl font-semibold mb-1">Join the board</h1>
          <p className="text-sm opacity-60 mb-6">Create your AIML Arena account</p>

          {error && (
            <p className="text-xs text-red-500 bg-red-500/10 rounded-lg px-3.5 py-2.5 mb-4 leading-relaxed font-medium">
              {error}
            </p>
          )}

          <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1">Full Name *</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            disabled={submitting}
            placeholder="Ada Lovelace"
            className="w-full mb-4 px-4 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-transparent outline-none focus:border-accent transition-colors disabled:opacity-50 text-sm"
          />

          <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1">Email *</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            disabled={submitting}
            placeholder="ada@campus.edu"
            className="w-full mb-4 px-4 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-transparent outline-none focus:border-accent transition-colors disabled:opacity-50 text-sm"
          />

          <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1">Password *</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
            disabled={submitting}
            placeholder="Min 6 characters"
            className="w-full mb-4 px-4 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-transparent outline-none focus:border-accent transition-colors disabled:opacity-50 text-sm"
          />

          <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1">Department</label>
          <input
            name="department"
            value={form.department}
            onChange={handleChange}
            disabled={submitting}
            placeholder="e.g. AI & Data Science"
            className="w-full mb-4 px-4 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-transparent outline-none focus:border-accent transition-colors disabled:opacity-50 text-sm"
          />

          <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1">I am a</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            disabled={submitting}
            className="w-full mb-6 px-4 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-transparent outline-none focus:border-accent transition-colors disabled:opacity-50 text-sm"
          >
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
          </select>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-full bg-accent text-white font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-md disabled:opacity-50 text-sm"
          >
            {submitting && <RefreshCw size={14} className="animate-spin" />}
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-sm text-center opacity-60 mt-6">
            Already have an account? <Link to="/login" className="text-accent font-medium hover:underline">Sign in</Link>
          </p>
        </motion.form>
      </div>
    </div>
  );
};

export default Register;