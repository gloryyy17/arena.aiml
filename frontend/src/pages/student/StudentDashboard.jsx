import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Compass, Search, Filter, CheckCircle2, ArrowRight } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import EventCard from '../../components/EventCard';
import api from '../../api/axios';

const navItems = [
  { label: 'Browse Events', to: '/dashboard' },
  { label: '🎯 AI Recommendations', to: '/ai-hub/recommendations' },
  { label: '🤖 AI Concierge Chat', to: '/ai-hub/chat' },
  { label: '⭐ Feedback & Reviews', to: '/ai-hub/feedback' },
];

const categories = ['All', 'Technical', 'Workshop', 'Cultural', 'Sports', 'Seminar'];

const StudentDashboard = () => {
  const [events, setEvents] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eventsRes, recsRes] = await Promise.all([
        api.get('/events'),
        api.get('/ai/recommendations?limit=3').catch(() => ({ data: { recommendations: [] } })),
      ]);
      setEvents(eventsRes.data.events || []);
      setRecommendations(recsRes.data.recommendations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter((ev) => {
    const matchesCat = selectedCategory === 'All' || ev.category === selectedCategory;
    const matchesSearch =
      ev.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <DashboardLayout navItems={navItems}>
      {/* AI Recommendation Spotlight Banner */}
      {recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 p-6 md:p-8 rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 via-accent/5 to-transparent flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-cyan-500 bg-cyan-500/10 px-3 py-1 rounded-full">
              <Compass size={13} /> Recommended for you by AI
            </div>
            <h2 className="font-display text-xl md:text-2xl font-semibold">
              Top match: {recommendations[0]?.event?.title}
            </h2>
            <p className="text-xs md:text-sm opacity-75 max-w-xl">
              {recommendations[0]?.reason}
            </p>
          </div>

          <Link
            to="/ai-hub/recommendations"
            className="px-5 py-2.5 rounded-full bg-accent text-white font-medium text-xs hover:opacity-90 transition-all flex items-center gap-1.5 shadow-md self-start md:self-auto shrink-0"
          >
            <span>View All ({recommendations.length})</span>
            <ArrowRight size={14} />
          </Link>
        </motion.div>
      )}

      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold">Browse Events</h1>
          <p className="text-xs opacity-60">Explore verified college events, hackathons, and workshops.</p>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-full border border-border-light dark:border-border-dark bg-white dark:bg-[#1A1A1E] outline-none focus:border-accent transition-colors"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all ${
              selectedCategory === cat
                ? 'bg-ink-light text-bg-light dark:bg-ink-dark dark:text-bg-dark font-medium shadow-sm'
                : 'border border-border-light dark:border-border-dark hover:border-accent/40 opacity-70 hover:opacity-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="py-20 text-center opacity-60 text-xs font-mono">Loading events from Arena board...</div>
      ) : filteredEvents.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-[#1A1A1E] space-y-2">
          <p className="font-display text-lg font-semibold">No events found</p>
          <p className="text-xs opacity-60">Try searching for a different keyword or category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event, i) => (
            <EventCard key={event._id || i} event={event} index={i} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentDashboard;