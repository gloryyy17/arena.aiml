import { useState, useEffect } from 'react';
import { Compass, Sparkles, Calendar, MapPin, Check, Loader2 } from 'lucide-react';
import MobileHeader from '../components/MobileHeader';
import api, { getErrorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const RecommendationsScreen = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState(null);
  const [message, setMessage] = useState('');

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/ai/recommendations');
      setRecommendations(res.data.recommendations || []);
    } catch (err) {
      console.warn('Failed to load recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleRegister = async (eventId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setRegisteringId(eventId);
    setMessage('');
    try {
      await api.post(`/registrations/${eventId}`);
      setMessage('Registered! Your pass is available under Tickets.');
      fetchRecommendations();
      setTimeout(() => setMessage(''), 3500);
    } catch (err) {
      setMessage(getErrorMessage(err, 'Registration failed.'));
      setTimeout(() => setMessage(''), 3500);
    } finally {
      setRegisteringId(null);
    }
  };

  return (
    <div className="min-h-screen pb-24 theme-bg theme-text transition-colors">
      <MobileHeader title="For You" subtitle="AI Personalization Engine" />

      <main className="max-w-md mx-auto px-5 pt-4 space-y-4">
        {/* Engine Banner */}
        <div className="p-4 rounded-3xl bg-gradient-to-br from-[#06B6D4]/15 via-[#5B47FB]/10 to-transparent border border-[#06B6D4]/25 space-y-2 shadow-sm">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider text-[#06B6D4] bg-[#06B6D4]/15">
            <Compass size={12} /> Multi-Signal Heuristic Matching
          </div>
          <p className="font-display text-sm font-semibold theme-text">
            Tailored for {user?.name || 'Students'}
          </p>
          <p className="text-[11px] theme-text-secondary leading-relaxed">
            Events matched using your profile department ({user?.department || 'AI & Data Science'}) and interests.
          </p>
        </div>

        {message && (
          <div className="p-3 rounded-2xl bg-[#5B47FB]/15 border border-[#5B47FB]/30 text-xs text-[#5B47FB] dark:text-[#A5B4FC] font-mono text-center">
            {message}
          </div>
        )}

        <div className="space-y-4">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 theme-text-muted font-mono text-xs">
              <Loader2 size={24} className="animate-spin text-[#06B6D4]" />
              <span>Analyzing recommendations...</span>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="p-8 rounded-3xl theme-card text-center space-y-2">
              <p className="font-display text-sm font-bold theme-text">No Recommendations Found</p>
              <p className="text-xs theme-text-secondary">
                Check back as new hackathons and workshops are published.
              </p>
            </div>
          ) : (
            recommendations.map((rec) => {
              const ev = rec.event || {};
              const matchScore = Math.round((rec.score || 0.85) * 100);

              return (
                <div
                  key={ev._id || rec.id}
                  className="p-4 rounded-3xl theme-card hover:border-[#06B6D4]/40 transition-all space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#06B6D4] bg-[#06B6D4]/10 px-2 py-0.5 rounded-full">
                        {matchScore}% Match
                      </span>
                      <h3 className="font-display text-base font-bold theme-text mt-1.5 leading-snug">
                        {ev.title}
                      </h3>
                    </div>
                    <span className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full shrink-0">
                      {ev.fee === 0 || !ev.fee ? 'FREE' : `₹${ev.fee}`}
                    </span>
                  </div>

                  {/* AI Reason Badge */}
                  <div className="p-2.5 rounded-2xl theme-card-subtle text-[11px] theme-text-secondary flex items-start gap-2">
                    <Sparkles size={13} className="text-[#06B6D4] shrink-0 mt-0.5" />
                    <span className="leading-snug">{rec.reason || 'Strong topical match for your skills.'}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t theme-border text-[11px] theme-text-secondary">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-[#5B47FB]" />
                      <span>
                        {ev.startDate
                          ? new Date(ev.startDate).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                            })
                          : 'TBD'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 truncate max-w-[140px]">
                      <MapPin size={13} className="text-pink-500 shrink-0" />
                      <span className="truncate">{ev.venue || 'Campus'}</span>
                    </div>

                    <button
                      onClick={() => handleRegister(ev._id)}
                      disabled={registeringId === ev._id}
                      className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#5B47FB] to-[#06B6D4] text-white font-semibold text-xs active:scale-95 transition-all shadow-sm flex items-center gap-1 disabled:opacity-50"
                    >
                      {registeringId === ev._id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Check size={12} />
                      )}
                      <span>Join</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

export default RecommendationsScreen;
