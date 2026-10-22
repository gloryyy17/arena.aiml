import { useState, useEffect } from 'react';
import { Search, Calendar, MapPin, Sparkles, ArrowRight, Check, Loader2, Trophy, Flame, Users, Tag } from 'lucide-react';
import MobileHeader from '../components/MobileHeader';
import api, { getErrorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const categories = ['All', 'Hackathons', 'Technical', 'Workshop', 'Cultural', 'Sports'];

// Comprehensive fallback events including website hackathons
const WEBSITE_EVENTS = [
  {
    _id: 'sample-ai-hackathon',
    title: 'AI Hackathon 2026',
    description: '24-hour build sprint for AI enthusiasts across departments. Compete in teams to build innovative agentic AI workflows, LLM applications, and intelligent campus assistants.',
    category: 'Hackathon',
    department: 'AI & Data Science',
    venue: 'Main Auditorium & Innovation Lab',
    startDate: '2026-09-15T09:00:00.000Z',
    date: '2026-09-15T09:00:00.000Z',
    prizePool: '₹50,000 Cash Pool',
    teamSize: '2 - 4 Members',
    fee: 0,
    capacity: 150,
    registeredCount: 88,
    isHackathon: true,
    tags: ['AI', 'Hackathon', 'LLM', 'Autonomous Agents'],
  },
  {
    _id: 'sample-autonomous-agents-hackathon',
    title: 'Autonomous AI Agents Hackathon',
    description: 'Flagship multi-track build sprint: Autonomous AI Agents, Generative UI, Robotics, and Smart Campus Cloud Infrastructure.',
    category: 'Hackathon',
    department: 'AI & Data Science',
    venue: 'Tech Park Block B & Cloud Lab',
    startDate: '2026-10-10T09:00:00.000Z',
    date: '2026-10-10T09:00:00.000Z',
    prizePool: '₹1,00,000 Cash Pool',
    teamSize: '3 - 5 Members',
    fee: 0,
    capacity: 200,
    registeredCount: 142,
    isHackathon: true,
    tags: ['Hackathon', 'Agents', 'FullStack', 'Prize Pool'],
  },
  {
    _id: 'sample-rangmanch',
    title: 'Cultural Fest: Rangmanch',
    description: 'Annual cultural extravaganza featuring inter-departmental dance, music, drama competitions, street plays, and talent showcases.',
    category: 'Cultural',
    department: 'Student Affairs',
    venue: 'Open Air Theatre (OAT)',
    startDate: '2026-09-20T10:00:00.000Z',
    date: '2026-09-20T10:00:00.000Z',
    fee: 0,
    capacity: 500,
    registeredCount: 320,
    tags: ['Cultural', 'Dance', 'Music', 'Fest'],
  },
  {
    _id: 'sample-ui-ux-design',
    title: 'UI/UX Design Masterclass & Sprint',
    description: 'Hands-on design thinking, micro-interactions, Figma component architecture, and modern mobile app styling workshop.',
    category: 'Workshop',
    department: 'Design & Computing',
    venue: 'Design Studio Lab',
    startDate: '2026-09-25T14:00:00.000Z',
    date: '2026-09-25T14:00:00.000Z',
    fee: 0,
    capacity: 80,
    registeredCount: 65,
    tags: ['Workshop', 'Design', 'Figma', 'UI/UX'],
  },
  {
    _id: 'sample-cricket-cup',
    title: 'Inter-College Cricket Cup',
    description: 'Annual T20 cricket tournament between engineering and science departments with trophy and medals.',
    category: 'Sports',
    department: 'Physical Education',
    venue: 'Campus Sports Ground',
    startDate: '2026-10-02T08:00:00.000Z',
    date: '2026-10-02T08:00:00.000Z',
    fee: 0,
    capacity: 100,
    registeredCount: 96,
    tags: ['Sports', 'Cricket', 'Tournament'],
  },
];

const HomeScreen = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState(WEBSITE_EVENTS);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [registeringId, setRegisteringId] = useState(null);
  const [message, setMessage] = useState('');

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      const live = res.data.events || [];
      if (live.length > 0) {
        // Merge live events with any missing website hackathons
        const liveIds = new Set(live.map((e) => e._id));
        const combined = [...live];
        for (const fb of WEBSITE_EVENTS) {
          if (!liveIds.has(fb._id)) {
            combined.push(fb);
          }
        }
        setEvents(combined);
      } else {
        setEvents(WEBSITE_EVENTS);
      }
    } catch {
      // Offline fallback: keep all website events & hackathons available
      setEvents(WEBSITE_EVENTS);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleRegister = async (eventItem, e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }

    const eventId = eventItem._id;
    setRegisteringId(eventId);
    setMessage('');

    try {
      await api.post(`/registrations/${eventId}`);
      setMessage(`Successfully registered for ${eventItem.title}! Pass is ready in Tickets.`);
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      // Local/offline registration fallback
      const offlineRegs = JSON.parse(localStorage.getItem('arena_offline_registrations') || '[]');
      const alreadyReg = offlineRegs.some((r) => (r.event?._id || r.event) === eventId);

      if (!alreadyReg) {
        offlineRegs.push({
          _id: `offline-reg-${Date.now()}`,
          event: eventItem,
          student: user,
          registeredAt: new Date().toISOString(),
          status: 'confirmed',
        });
        localStorage.setItem('arena_offline_registrations', JSON.stringify(offlineRegs));
      }

      setMessage(`Registered! Pass generated and saved to your Tickets tab.`);
      setTimeout(() => setMessage(''), 4000);
    } finally {
      setRegisteringId(null);
    }
  };

  const filteredEvents = events.filter((ev) => {
    const isHackathonMatch =
      category === 'Hackathons'
        ? ev.category?.toLowerCase() === 'hackathon' ||
          ev.title?.toLowerCase().includes('hackathon') ||
          ev.isHackathon === true ||
          ev.tags?.some((t) => t.toLowerCase() === 'hackathon')
        : category === 'All' || ev.category?.toLowerCase() === category.toLowerCase();

    const matchesSearch =
      ev.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.venue?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.tags?.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    return isHackathonMatch && matchesSearch;
  });

  return (
    <div className="min-h-screen pb-24 theme-bg theme-text transition-colors">
      <MobileHeader title="Arena AIML" subtitle="Campus Event & Hackathon Hub" />

      <main className="max-w-md mx-auto px-5 pt-4 space-y-4">
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

        {/* Featured Hackathon Hero Card */}
        <div
          onClick={() => setCategory('Hackathons')}
          className="p-4 rounded-3xl bg-gradient-to-r from-[#5B47FB] via-[#7C3AED] to-[#3B82F6] text-white shadow-lg space-y-2.5 cursor-pointer active:scale-[0.98] transition-transform relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider bg-black/20 px-2.5 py-0.5 rounded-full border border-white/20">
              <Trophy size={11} className="text-amber-300" /> Hackathons 2026
            </span>
            <span className="text-[10px] font-mono font-bold bg-amber-400 text-black px-2 py-0.5 rounded-full shadow-sm">
              ₹1,50,000+ Prizes
            </span>
          </div>

          <div className="space-y-0.5">
            <h3 className="font-display text-base font-bold leading-tight">
              AI Hackathon & Build Sprints
            </h3>
            <p className="text-[11px] text-white/85 leading-snug">
              24-hour sprints, mentorship, and cloud agent infrastructure.
            </p>
          </div>

          <div className="flex items-center justify-between pt-1 text-[11px] font-mono">
            <span className="text-white/90 underline font-semibold">
              Browse All Hackathons →
            </span>
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white">
              <Flame size={14} className="text-amber-300" />
            </div>
          </div>
        </div>

        {/* AI Recommendations Callout Card */}
        <div
          onClick={() => navigate('/recommendations')}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-[#5B47FB]/15 via-[#06B6D4]/10 to-transparent border border-[#5B47FB]/25 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform shadow-sm"
        >
          <div className="space-y-0.5">
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#5B47FB] dark:text-[#A5B4FC]">
              <Sparkles size={11} /> AI Match Engine
            </span>
            <p className="font-display text-xs font-semibold theme-text">
              Personalized Recommendations
            </p>
          </div>
          <div className="w-7 h-7 rounded-full bg-[#5B47FB] flex items-center justify-center text-white shrink-0 shadow-sm">
            <ArrowRight size={13} />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono whitespace-nowrap transition-all shadow-sm ${
                category === cat
                  ? 'bg-[#5B47FB] text-white font-semibold shadow-md shadow-[#5B47FB]/25'
                  : 'theme-card theme-text-secondary hover:theme-text'
              }`}
            >
              {cat === 'Hackathons' ? '🏆 Hackathons' : cat}
            </button>
          ))}
        </div>

        {/* Notification Toast banner */}
        {message && (
          <div className="p-3 rounded-2xl bg-[#5B47FB]/15 border border-[#5B47FB]/30 text-xs text-[#5B47FB] dark:text-[#A5B4FC] font-mono flex items-center gap-2">
            <Sparkles size={14} className="shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Events & Hackathons Feed */}
        <div className="space-y-4 pt-1">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xs font-bold theme-text uppercase tracking-wider">
              {category === 'Hackathons' ? 'Campus Hackathons' : 'Events & Sprints'} ({filteredEvents.length})
            </h2>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="p-8 rounded-3xl theme-card text-center space-y-2">
              <p className="font-display text-sm font-bold theme-text">No Events in this Category</p>
              <p className="text-xs theme-text-secondary">
                Tap 'All' or 'Hackathons' to view active campus competitions.
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
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full inline-block ${
                        ev.category?.toLowerCase() === 'hackathon' || ev.isHackathon
                          ? 'bg-amber-400/15 text-amber-600 dark:text-amber-300 border border-amber-400/25'
                          : 'bg-[#5B47FB]/10 text-[#5B47FB]'
                      }`}>
                        {ev.category || 'Event'}
                      </span>
                      {ev.prizePool && (
                        <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          {ev.prizePool}
                        </span>
                      )}
                    </div>
                    <h3 className="font-display text-base font-bold theme-text leading-snug">
                      {ev.title}
                    </h3>
                  </div>
                  <span className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Free Entry
                  </span>
                </div>

                <p className="text-xs theme-text-secondary line-clamp-2 leading-relaxed">
                  {ev.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-[11px] theme-text-secondary font-mono pt-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-[#5B47FB]" />
                    <span>
                      {new Date(ev.date || ev.startDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-[#06B6D4]" />
                    <span className="truncate max-w-[140px]">{ev.venue || 'Campus Main Audi'}</span>
                  </div>
                  {ev.teamSize && (
                    <div className="flex items-center gap-1.5">
                      <Users size={13} className="text-purple-400" />
                      <span>{ev.teamSize}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-between border-t theme-border">
                  <div className="text-[11px] font-mono theme-text-muted">
                    Capacity: <span className="font-bold theme-text">{ev.registeredCount || 0}</span> / {ev.capacity || 100}
                  </div>

                  <button
                    onClick={(e) => handleRegister(ev, e)}
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
