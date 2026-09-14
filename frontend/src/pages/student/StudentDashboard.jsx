import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Search,
  ArrowRight,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  XCircle,
  Ticket,
  ExternalLink,
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import EventCard from '../../components/EventCard';
import api, { getErrorMessage } from '../../api/axios';

const navItems = [
  { label: 'Browse Events', to: '/dashboard' },
  { label: '🎯 AI Recommendations', to: '/ai-hub/recommendations' },
  { label: '🤖 AI Concierge Chat', to: '/ai-hub/chat' },
  { label: '⭐ Feedback & Reviews', to: '/ai-hub/feedback' },
];

const categories = ['All', 'Technical', 'Workshop', 'Cultural', 'Sports', 'Seminar'];

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('events'); // 'events' | 'registrations'
  const [events, setEvents] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Registrations state
  const [registrations, setRegistrations] = useState([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [confirmCancelModal, setConfirmCancelModal] = useState({ show: false, reg: null });
  const [cancelling, setCancelling] = useState(false);

  const fetchRegistrations = async () => {
    setLoadingRegistrations(true);
    setRegError('');
    try {
      const res = await api.get('/registrations/my-registrations');
      setRegistrations(res.data.registrations || []);
    } catch (err) {
      setRegError(getErrorMessage(err, 'Failed to load your event registrations.'));
    } finally {
      setLoadingRegistrations(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      api.get('/events'),
      api.get('/ai/recommendations?limit=3').catch(() => ({ data: { recommendations: [] } })),
      api.get('/registrations/my-registrations').catch(() => ({ data: { registrations: [] } })),
    ])
      .then(([eventsRes, recsRes, regRes]) => {
        if (isMounted) {
          setEvents(eventsRes.data.events || []);
          setRecommendations(recsRes.data.recommendations || []);
          setRegistrations(regRes.data.registrations || []);
        }
      })
      .catch((err) => {
        console.warn('Failed to load student dashboard data', err);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
          setLoadingRegistrations(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);


  const handleCancelClick = (reg) => {
    setConfirmCancelModal({ show: true, reg });
  };

  const handleConfirmCancel = async () => {
    const reg = confirmCancelModal.reg;
    if (!reg) return;

    setCancelling(true);
    setRegError('');
    setRegSuccess('');

    try {
      await api.patch(`/registrations/${reg._id}/cancel`);
      setRegSuccess(`Registration for "${reg.event?.title || 'Event'}" cancelled successfully.`);
      // Update local state without full reload
      setRegistrations((prev) =>
        prev.map((item) =>
          item._id === reg._id ? { ...item, registrationStatus: 'cancelled' } : item
        )
      );
      setConfirmCancelModal({ show: false, reg: null });
    } catch (err) {
      setRegError(getErrorMessage(err, 'Failed to cancel registration.'));
    } finally {
      setCancelling(false);
    }
  };

  const filteredEvents = events.filter((ev) => {
    const matchesCat = selectedCategory === 'All' || ev.category === selectedCategory;
    const matchesSearch =
      ev.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const confirmedCount = registrations.filter((r) => r.registrationStatus === 'confirmed').length;

  return (
    <DashboardLayout navItems={navItems}>
      {/* Top Navigation Tabs */}
      <div className="flex items-center gap-3 mb-8 border-b border-border-light dark:border-border-dark pb-4">
        <button
          onClick={() => setActiveTab('events')}
          className={`px-5 py-2 rounded-full text-xs font-mono font-medium transition-all ${
            activeTab === 'events'
              ? 'bg-accent text-white shadow-sm'
              : 'border border-border-light dark:border-border-dark hover:border-accent/40 opacity-75'
          }`}
        >
          Browse Events
        </button>

        <button
          onClick={() => setActiveTab('registrations')}
          className={`px-5 py-2 rounded-full text-xs font-mono font-medium transition-all flex items-center gap-2 ${
            activeTab === 'registrations'
              ? 'bg-accent text-white shadow-sm'
              : 'border border-border-light dark:border-border-dark hover:border-accent/40 opacity-75'
          }`}
        >
          <Ticket size={14} />
          <span>My Registrations</span>
          {confirmedCount > 0 && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'registrations'
                  ? 'bg-white text-accent'
                  : 'bg-accent/20 text-accent'
              }`}
            >
              {confirmedCount}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'events' ? (
        <>
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
        </>
      ) : (
        /* My Registrations View */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-semibold">My Event Registrations</h1>
              <p className="text-xs opacity-60">View, manage, or cancel your enrolled events and check admission status.</p>
            </div>

            <button
              onClick={fetchRegistrations}
              disabled={loadingRegistrations}
              className="px-4 py-2 rounded-full border border-border-light dark:border-border-dark bg-white dark:bg-[#1A1A1E] text-xs font-mono hover:border-accent hover:text-accent transition-colors flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
            >
              <RefreshCw size={13} className={loadingRegistrations ? 'animate-spin' : ''} />
              REFRESH
            </button>
          </div>

          {regSuccess && (
            <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-500 text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 size={16} /> {regSuccess}
            </div>
          )}

          {regError && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2 font-medium">
              <AlertCircle size={16} /> {regError}
            </div>
          )}

          {loadingRegistrations ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="font-mono text-xs opacity-60">Retrieving your registrations...</p>
            </div>
          ) : registrations.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-[#1A1A1E] space-y-3">
              <Ticket size={40} className="mx-auto opacity-40 text-accent" />
              <h3 className="font-display text-lg font-semibold">No Registrations Yet</h3>
              <p className="text-xs opacity-60 max-w-sm mx-auto">
                You haven't registered for any events yet. Explore upcoming hackathons, workshops, and fests!
              </p>
              <button
                onClick={() => setActiveTab('events')}
                className="mt-2 px-5 py-2.5 rounded-full bg-accent text-white text-xs font-medium hover:opacity-90 transition-opacity"
              >
                Browse Events →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {registrations.map((reg) => {
                const ev = reg.event || {};
                const isConfirmed = reg.registrationStatus === 'confirmed';

                return (
                  <div
                    key={reg._id}
                    className="p-6 rounded-3xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-[#1A1A1E] shadow-sm flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="font-mono text-xs uppercase bg-sticker text-ink-light px-2.5 py-0.5 rounded-full font-bold">
                          {ev.category || 'Event'}
                        </span>
                        <span
                          className={`font-mono text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                            isConfirmed
                              ? 'bg-green-500/10 text-green-500'
                              : 'bg-neutral-500/10 text-neutral-400'
                          }`}
                        >
                          {reg.registrationStatus}
                        </span>
                      </div>

                      <h3 className="font-display text-lg font-semibold mb-1">
                        {ev.title || 'Untitled Event'}
                      </h3>
                      <p className="text-xs opacity-70 line-clamp-2 mb-3">
                        {ev.description || 'No description available.'}
                      </p>

                      <div className="space-y-1.5 text-xs opacity-75 font-mono">
                        {ev.startDate && (
                          <div className="flex items-center gap-1.5">
                            <Calendar size={13} className="text-accent" />
                            <span>
                              {new Date(ev.startDate).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        )}
                        {ev.venue && (
                          <div className="flex items-center gap-1.5">
                            <MapPin size={13} className="text-accent" />
                            <span>{ev.venue}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border-light dark:border-border-dark flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold">
                        {ev.fee === 0 ? 'Free' : `₹${ev.fee || 0}`}
                      </span>

                      <div className="flex items-center gap-2">
                        {ev._id && (
                          <Link
                            to={`/events/${ev._id}`}
                            className="text-xs font-mono px-3 py-1.5 rounded-full border border-border-light dark:border-border-dark hover:border-accent hover:text-accent transition-colors flex items-center gap-1"
                          >
                            Details <ExternalLink size={12} />
                          </Link>
                        )}

                        {isConfirmed && (
                          <button
                            onClick={() => handleCancelClick(reg)}
                            className="text-xs font-mono px-3 py-1.5 rounded-full border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      <AnimatePresence>
        {confirmCancelModal.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-bg-light dark:bg-[#1A1A1E] border border-border-light dark:border-border-dark rounded-3xl p-6 md:p-8 shadow-2xl space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <XCircle size={26} />
              </div>

              <div>
                <h3 className="font-display text-xl font-semibold mb-1">Cancel Registration</h3>
                <p className="text-xs opacity-75 leading-relaxed">
                  Are you sure you want to cancel your registration for{' '}
                  <strong className="text-accent">{confirmCancelModal.reg?.event?.title}</strong>?
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setConfirmCancelModal({ show: false, reg: null })}
                  disabled={cancelling}
                  className="flex-1 py-2.5 rounded-full border border-border-light dark:border-border-dark text-xs font-mono hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  KEEP REGISTRATION
                </button>
                <button
                  onClick={handleConfirmCancel}
                  disabled={cancelling}
                  className="flex-1 py-2.5 rounded-full bg-rose-500 text-white text-xs font-mono font-medium hover:bg-rose-600 transition-colors flex items-center justify-center gap-1.5"
                >
                  {cancelling ? <RefreshCw size={13} className="animate-spin" /> : null}
                  CONFIRM CANCEL
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default StudentDashboard;