import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Compass,
  Sparkles,
  Calendar,
  MapPin,
  CheckCircle2,
  RefreshCw,
  Zap,
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { label: '← AI Hub', to: '/ai-hub' },
  { label: 'Recommendations', to: '/ai-hub/recommendations' },
  { label: 'Event Copy', to: '/ai-hub/description' },
  { label: 'Email Studio', to: '/ai-hub/email' },
  { label: 'Feedback', to: '/ai-hub/feedback' },
  { label: 'Poster Studio', to: '/ai-hub/poster' },
];

const RecommendationsView = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState(null);
  const [regMessage, setRegMessage] = useState('');

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setRegMessage('');
    try {
      const res = await api.get('/ai/recommendations');
      setRecommendations(res.data.recommendations || []);
    } catch (err) {
      console.warn('Failed to load recommendations', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const handleRegister = async (eventId) => {
    setRegisteringId(eventId);
    setRegMessage('');
    try {
      await api.post(`/registrations/${eventId}`);
      setRegMessage(`Successfully registered for event!`);
      fetchRecommendations();
    } catch (err) {
      setRegMessage(err.response?.data?.message || 'Registration failed.');
    } finally {
      setRegisteringId(null);
    }
  };

  return (
    <DashboardLayout navItems={navItems}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-500 bg-cyan-500/10 px-3 py-1 rounded-full mb-2">
            <Compass size={14} /> Multi-Signal Recommendation Engine
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold">Personalized Recommendations</h1>
          <p className="text-sm opacity-60">
            Tailored specifically for {user?.name} based on your interests ({user?.interests?.join(', ') || 'AI, Tech'}) and past events.
          </p>
        </div>

        <button
          onClick={fetchRecommendations}
          disabled={loading}
          className="px-4 py-2 rounded-full border border-border-light dark:border-border-dark bg-white dark:bg-[#1A1A1E] text-xs font-mono hover:border-accent hover:text-accent transition-colors flex items-center gap-2 self-start md:self-auto disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> REFRESH SIGNALS
        </button>
      </div>

      {regMessage && (
        <div className="p-4 rounded-2xl bg-accent/10 border border-accent/20 text-accent text-xs mb-6 flex items-center gap-2">
          <CheckCircle2 size={16} /> {regMessage}
        </div>
      )}

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="font-display text-base font-semibold">Calculating Multi-Signal Affinity...</p>
          <p className="text-xs opacity-60">Evaluating interest match, department relevance, recency, and tag overlap</p>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-[#1A1A1E] space-y-3">
          <Compass size={40} className="mx-auto opacity-40 text-accent" />
          <h3 className="font-display text-lg font-semibold">No New Recommendations Right Now</h3>
          <p className="text-xs opacity-60 max-w-sm mx-auto">
            You are either registered for all upcoming events or there are no new events matching your schedule.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((item, index) => {
            const ev = item.event;
            return (
              <motion.div
                key={ev._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.3 }}
                className="p-6 rounded-3xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-[#1A1A1E] shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-4 relative overflow-hidden"
              >
                {/* Match Percentage Badge */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-wider bg-sticker text-ink-light px-2.5 py-1 rounded-full font-bold">
                    {ev.category}
                  </span>
                  <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-accent text-white flex items-center gap-1 shadow-sm">
                    <Zap size={12} fill="currentColor" /> {item.matchPercentage}% MATCH
                  </span>
                </div>

                <div>
                  <h3 className="font-display text-xl font-semibold mb-2">{ev.title}</h3>
                  <p className="text-xs md:text-sm opacity-70 line-clamp-2 mb-3">{ev.description}</p>

                  <div className="space-y-1 text-xs opacity-60 font-mono">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} /> {new Date(ev.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={13} /> {ev.venue}
                    </div>
                  </div>
                </div>

                {/* Explainable AI Recommendation Box */}
                <div className="p-3.5 rounded-2xl bg-accent/5 dark:bg-accent/10 border border-accent/15 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-accent">
                    <Sparkles size={13} /> Why Recommended:
                  </div>
                  <p className="text-xs leading-relaxed opacity-85">
                    {item.reason}
                  </p>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-2 border-t border-border-light dark:border-border-dark flex items-center justify-between">
                  <span className="font-mono text-sm font-bold">
                    {ev.fee === 0 ? 'Free' : `₹${ev.fee}`}
                  </span>

                  <button
                    onClick={() => handleRegister(ev._id)}
                    disabled={registeringId === ev._id}
                    className="py-2 px-5 rounded-full bg-accent text-white font-medium text-xs hover:opacity-90 transition-all flex items-center gap-1.5 shadow-md disabled:opacity-50"
                  >
                    {registeringId === ev._id ? <RefreshCw size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                    Join Event
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default RecommendationsView;
