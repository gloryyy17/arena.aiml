import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/axios';
import { Sparkles, ArrowLeft, RefreshCw, KeyRound, Mail } from 'lucide-react';

const LoginScreen = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err, 'Invalid credentials.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoStudent = () => {
    setEmail('student@arena.aiml');
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-[#0F0F12] text-white p-6 flex flex-col justify-between">
      <div>
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 active:scale-95 transition-all mb-8"
        >
          <ArrowLeft size={16} />
        </button>

        <div className="space-y-2 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5B47FB]/15 border border-[#5B47FB]/30 text-[#A5B4FC] text-xs font-mono font-bold">
            <Sparkles size={12} /> Student Access
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Sign In to Arena
          </h1>
          <p className="text-xs text-zinc-400">
            Access your personalized event passes, AI recommendations, and AI concierge assistant.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-mono mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
              Student Email
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@arena.aiml"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#1C1C22] border border-white/10 text-xs text-white placeholder-zinc-600 outline-none focus:border-[#5B47FB] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#1C1C22] border border-white/10 text-xs text-white placeholder-zinc-600 outline-none focus:border-[#5B47FB] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-full bg-[#5B47FB] hover:bg-[#4F3DDB] text-white font-semibold text-xs shadow-lg shadow-[#5B47FB]/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
          >
            {submitting && <RefreshCw size={14} className="animate-spin" />}
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Fast Sign-in helper */}
        <div className="mt-6 pt-6 border-t border-white/5 text-center">
          <button
            type="button"
            onClick={handleDemoStudent}
            className="text-xs font-mono text-[#A5B4FC] hover:underline"
          >
            Fill Demo Student Account
          </button>
        </div>
      </div>

      <p className="text-[11px] text-center text-zinc-600 font-mono py-4">
        Arena AIML Mobile • Capacitor Shell
      </p>
    </div>
  );
};

export default LoginScreen;
