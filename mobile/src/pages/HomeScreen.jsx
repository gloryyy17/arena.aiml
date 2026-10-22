import { useState, useEffect } from 'react';
import { Search, Calendar, MapPin, Sparkles, ArrowRight, Check, Loader2 } from 'lucide-react';
import MobileHeader from '../components/MobileHeader';
import api, { getErrorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const categories = ['All', 'Technical', 'Workshop', 'Cultural', 'Sports'];

const HomeScreen = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [registeringId, setRegisteringId] = useState(null);
  const [message, setMessage] = useState('');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/events');
      setEvents(res.data.events || []);
    } catch (err) {
      console.warn('Error loading events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleRegister = async (eventId, e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }

    setRegisteringId(eventId);
    setMessage('');
    try {
      await api.post(`/registrations/${eventId}`);
      setMessage('Successfully registered! View your pass in Tickets.');
      setTimeout(() => setMessage(''), 3500);
    } catch (err) {
      setMessage(getErrorMessage(err, 'Registration failed.'));
      setTimeout(() => setMessage(''), 3500);
    } finally {
      setRegisteringId(null);
    }
  };

  const filteredEvents = events.filter((ev) => {
    const matchesCategory = category === 'All' || ev.category?.toLowerCase() === category.toLowerCase();
    const matchesSearch =
      ev.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.venue?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen pb-24 theme-bg theme-text transition-colors">
      <MobileHeader title="Arena AIML" subtitle="Campus Event Hub" />

      <main className="max-w-md mx-auto px-5 pt-4 space-y-5">
        {/* Search Bar */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search hackathons, fests, workshops..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl theme-input text-xs outline-none focus:border-[#5B47FB] transition-colors shadow-sm"
          />
        </div>

        {/* AI Recommendations Callout Card */}
        <div
          onClick={() => navigate('/recommendations')}
          className="p-4 rounded-3xl bg-gradient-to-r from-[#5B47FB]/15 via-[#06B6D4]/10 to-transparent border border-[#5B47FB]/30 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform shadow-sm"
        >
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#5B47FB] dark:text-[#A5B4FC]">
              <Sparkles size={11} /> AI Match Engine
            </span>
            <p className="font-display text-sm font-semibold theme-text">
              Personalized Event Picks
            </p>
            <p className="text-[11px] theme-text-secondary">
              Curated based on your department & skills
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#5B47FB] flex items-center justify-center text-white shrink-0 shadow-md">
            <ArrowRight size={14} />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono whitespace-nowrap transition-all shadow-sm ${
                category === cat
                  ? 'bg-[#5B47FB] text-white font-semibold shadow-md shadow-[#5B47FB]/25'
                  : 'theme-card theme-text-secondary hover:theme-text'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Toast / Notification banner */}
        {message && (
          <div className="p-3 rounded-2xl bg-[#5B47FB]/15 border border-[#5B47FB]/30 text-xs text-[#5B47FB] dark:text-[#A5B4FC] font-mono flex items-center gap-2">
            <Sparkles size={14} className="shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Events Feed */}
        <div className="space-y-4 pt-1">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-bold theme-text uppercase tracking-wider">
              Upcoming Events ({filteredEvents.length})
            </h2>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 theme-text-muted">
              <Loader2 size={24} className="animate-spin text-[#5B47FB]" />
              <p className="font-mono text-xs">Loading campus events...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="p-8 rounded-3xl theme-card text-center space-y-2">
              <p className="font-display text-sm font-bold theme-text">No Events Found</p>
              <p className="text-xs theme-text-secondary">
                Try selecting another category or adjusting your search term.
              </p>
            </div>
          ) : (
            filteredEvents.map((ev) => (
              <div
                key={ev._id}
                className="p-5 rounded-3xl theme-card space-y-3.5 transition-all hover:border-[#5B47FB]/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#5B47FB] bg-[#5B47FB]/10 px-2 py-0.5 rounded-full inline-block">
                      {ev.category || 'Event'}
                    </span>
                    <h3 className="font-display text-base font-bold theme-text leading-snug">
                      {ev.title}
                    </h3>
                  </div>
                  <span className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Free Pass
                  </span>
                </div>

                <p className="text-xs theme-text-secondary line-clamp-2 leading-relaxed">
                  {ev.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-[11px] theme-text-secondary font-mono pt-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-[#5B47FB]" />
                    <span>{new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-[#06B6D4]" />
                    <span className="truncate max-w-[140px]">{ev.venue || 'Campus Main Audi'}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t theme-border">
                  <div className="text-[11px] font-mono theme-text-muted">
                    Capacity: <span className="font-bold theme-text">{ev.registeredCount || 0}</span> / {ev.capacity || 100}
                  </div>

                  <button
                    onClick={(e) => handleRegister(ev._id, e)}
                    disabled={registeringId === ev._id}
                    className="px-4 py-2 rounded-full bg-[#5B47FB] hover:bg-[#4F3DDB] text-white text-xs font-semibold shadow-md shadow-[#5B47FB]/20 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {registeringId === ev._id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Check size={12} />
                    )}
                    Register Pass
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default HomeScreen;
