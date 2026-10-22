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
    <div className="min-h-screen pb-24 bg-[#0F0F12] text-white">
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
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#1C1C22] border border-white/10 text-xs text-white placeholder-zinc-500 outline-none focus:border-[#5B47FB] transition-colors"
          />
        </div>

        {/* AI Recommendations Callout Card */}
        <div
          onClick={() => navigate('/recommendations')}
          className="p-4 rounded-3xl bg-gradient-to-r from-[#5B47FB]/20 via-[#06B6D4]/10 to-transparent border border-[#5B47FB]/30 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform"
        >
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#A5B4FC]">
              <Sparkles size={11} /> AI Match Engine
            </span>
            <p className="font-display text-sm font-semibold text-white">
              Personalized Event Picks
            </p>
            <p className="text-[11px] text-zinc-400">
              Curated based on your department & skills
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#5B47FB] flex items-center justify-center text-white shrink-0 shadow-md">
            <ArrowRight size={14} />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                category === cat
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'bg-[#1C1C22] text-zinc-400 border border-white/5 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Notification Toast */}
        {message && (
          <div className="p-3 rounded-2xl bg-[#5B47FB]/20 border border-[#5B47FB]/40 text-xs text-[#A5B4FC] font-mono text-center">
            {message}
          </div>
        )}

        {/* Events Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-white">
              Upcoming Events ({filteredEvents.length})
            </h2>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-zinc-500 font-mono text-xs">
              <Loader2 size={24} className="animate-spin text-[#5B47FB]" />
              <span>Loading campus events...</span>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 font-mono text-xs">
              No events found in this category.
            </div>
          ) : (
            filteredEvents.map((ev) => (
              <div
                key={ev._id}
                className="p-4 rounded-3xl bg-[#18181D] border border-white/10 hover:border-white/20 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#A5B4FC] bg-[#5B47FB]/15 px-2 py-0.5 rounded-full">
                      {ev.category || 'Event'}
                    </span>
                    <h3 className="font-display text-base font-bold text-white mt-1.5 leading-snug">
                      {ev.title}
                    </h3>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full shrink-0">
                    {ev.fee === 0 || !ev.fee ? 'FREE' : `₹${ev.fee}`}
                  </span>
                </div>

                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  {ev.description}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-zinc-400">
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
                    <MapPin size={13} className="text-pink-400 shrink-0" />
                    <span className="truncate">{ev.venue || 'Campus'}</span>
                  </div>

                  <button
                    onClick={(e) => handleRegister(ev._id, e)}
                    disabled={registeringId === ev._id}
                    className="px-3.5 py-1.5 rounded-full bg-[#5B47FB] text-white font-semibold text-xs active:scale-95 transition-all shadow-sm flex items-center gap-1 disabled:opacity-50"
                  >
                    {registeringId === ev._id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Check size={12} />
                    )}
                    <span>Register</span>
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
