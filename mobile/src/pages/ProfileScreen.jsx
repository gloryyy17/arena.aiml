import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, ShieldCheck, Mail, BookOpen, Smartphone } from 'lucide-react';
import MobileHeader from '../components/MobileHeader';

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen pb-24 bg-[#0F0F12] text-white">
        <MobileHeader title="Profile" subtitle="Student Account" />
        <div className="max-w-md mx-auto px-6 py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-white/5 text-zinc-500 flex items-center justify-center mx-auto">
            <User size={28} />
          </div>
          <h2 className="font-display text-lg font-bold">No Profile Active</h2>
          <p className="text-xs text-zinc-400">
            Sign in with your student credentials to view your profile and event passes.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2.5 rounded-full bg-[#5B47FB] text-white text-xs font-semibold shadow-md"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 bg-[#0F0F12] text-white">
      <MobileHeader title="Profile" subtitle="Student Account" />

      <main className="max-w-md mx-auto px-5 pt-4 space-y-5">
        {/* Student ID Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#1E1E26] via-[#141419] to-[#121217] border border-white/10 shadow-xl space-y-4 relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#5B47FB] to-[#06B6D4] text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-[#5B47FB]/30 border border-white/20">
              {user.name?.[0]?.toUpperCase() || 'S'}
            </div>

            <div className="space-y-0.5 overflow-hidden">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#A5B4FC] bg-[#5B47FB]/15 px-2 py-0.5 rounded-full inline-block">
                STUDENT
              </span>
              <h2 className="font-display text-lg font-bold text-white truncate">
                {user.name}
              </h2>
              <p className="text-xs text-zinc-400 truncate">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5 text-xs font-mono">
            <div>
              <p className="text-[10px] uppercase text-zinc-500">Department</p>
              <p className="font-semibold text-zinc-200 mt-0.5 truncate">
                {user.department || 'AI & Data Science'}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-zinc-500">Student ID</p>
              <p className="font-semibold text-zinc-200 mt-0.5">
                {user.studentId || 'AIML-2026'}
              </p>
            </div>
          </div>
        </div>

        {/* Menu Options */}
        <div className="p-2 rounded-3xl bg-[#18181D] border border-white/5 space-y-1">
          <div className="p-3.5 flex items-center gap-3 text-xs text-zinc-300">
            <Mail size={16} className="text-[#5B47FB]" />
            <div>
              <p className="text-zinc-200 font-medium">Campus Email</p>
              <p className="text-[11px] text-zinc-500">{user.email}</p>
            </div>
          </div>

          <div className="p-3.5 flex items-center gap-3 text-xs text-zinc-300 border-t border-white/5">
            <BookOpen size={16} className="text-cyan-400" />
            <div>
              <p className="text-zinc-200 font-medium">Academic Department</p>
              <p className="text-[11px] text-zinc-500">{user.department || 'General AI-ML'}</p>
            </div>
          </div>

          <div className="p-3.5 flex items-center gap-3 text-xs text-zinc-300 border-t border-white/5">
            <Smartphone size={16} className="text-pink-400" />
            <div>
              <p className="text-zinc-200 font-medium">App Version</p>
              <p className="text-[11px] text-zinc-500">v1.0.0 (Capacitor Student Shell)</p>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="w-full py-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold flex items-center justify-center gap-2 border border-red-500/20 active:scale-95 transition-all"
        >
          <LogOut size={14} /> Sign Out of Account
        </button>
      </main>
    </div>
  );
};

export default ProfileScreen;
