import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Check,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Filter,
  Calendar,
  MapPin,
  Users,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
  Award,
  Palette,
  AlertTriangle,
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import api, { getErrorMessage } from '../../api/axios';

const navItems = [
  { label: 'Event Approvals', to: '/dashboard' },
  { label: '✨ AI Hub Center', to: '/ai-hub' },
  { label: '📜 Certificate Studio', to: '/ai-hub/certificate' },
  { label: '🎨 Poster Studio', to: '/ai-hub/poster' },
  { label: '⭐ Feedback Analytics', to: '/ai-hub/feedback' },
  { label: '📧 Email Studio', to: '/ai-hub/email' },
];

const rejectionPresets = [
  'Schedule conflict with major department symposium',
  'Venue unavailable or already booked for campus activities',
  'Incomplete event itinerary, rules, or coordinator contact details',
  'Budget allocation or participant fee requires committee review',
  'Poster or event copy does not conform to institution branding guidelines',
];

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('pending'); // 'pending' | 'approved' | 'rejected' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedEventId, setExpandedEventId] = useState(null);

  // Rejection Modal State
  const [rejectModal, setRejectModal] = useState({
    open: false,
    event: null,
    reason: '',
    submitting: false,
  });

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/events/admin/all');
      setEvents(res.data.events || []);
    } catch (err) {
      console.warn('Failed to load admin events', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Approve Event Handler
  const handleApprove = async (id) => {
    try {
      await api.patch(`/events/${id}/approve`);
      setMessage('Event approved and published to the live student board!');
      fetchEvents();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setMessage(getErrorMessage(err, 'Approval failed.'));
    }
  };

  // Open Rejection Modal
  const openRejectModal = (ev) => {
    setRejectModal({
      open: true,
      event: ev,
      reason: ev.rejectionReason || '',
      submitting: false,
    });
  };

  // Confirm Rejection with Detailed Reason
  const handleConfirmReject = async () => {
    const { event, reason } = rejectModal;
    if (!event?._id) return;

    if (!reason.trim()) {
      alert('Please provide a feedback reason for rejection.');
      return;
    }

    setRejectModal((prev) => ({ ...prev, submitting: true }));
    try {
      await api.patch(`/events/${event._id}/reject`, { reason: reason.trim() });
      setMessage(`Event "${event.title}" has been rejected with feedback returned to faculty.`);
      setRejectModal({ open: false, event: null, reason: '', submitting: false });
      fetchEvents();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      alert(getErrorMessage(err, 'Rejection failed.'));
      setRejectModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  // Filtered & Searched Events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // Status filter
      if (filter === 'pending' && ev.status !== 'pending') return false;
      if (filter === 'approved' && ev.status !== 'approved') return false;
      if (filter === 'rejected' && ev.status !== 'rejected') return false;

      // Category filter
      if (selectedCategory !== 'All' && ev.category?.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = ev.title?.toLowerCase().includes(query);
        const organizerMatch = ev.createdBy?.name?.toLowerCase().includes(query);
        const deptMatch = ev.createdBy?.department?.toLowerCase().includes(query);
        const venueMatch = ev.venue?.toLowerCase().includes(query);
        return titleMatch || organizerMatch || deptMatch || venueMatch;
      }

      return true;
    });
  }, [events, filter, selectedCategory, searchQuery]);

  // Metric counts
  const pendingCount = events.filter((e) => e.status === 'pending').length;
  const approvedCount = events.filter((e) => e.status === 'approved').length;
  const rejectedCount = events.filter((e) => e.status === 'rejected').length;
  const totalCount = events.length;

  return (
    <DashboardLayout navItems={navItems}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-accent bg-accent/10 px-3 py-1 rounded-full mb-2">
            <ShieldCheck size={14} /> Administrative Moderation Center
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold">Event Approval & Governance</h1>
          <p className="text-sm opacity-60">
            Review, evaluate, and moderate college events submitted by department faculty coordinators.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/ai-hub/certificate"
            className="px-4 py-2 rounded-full border border-border-light dark:border-border-dark text-xs font-mono hover:border-accent transition-colors flex items-center gap-1.5"
          >
            <Award size={14} className="text-indigo-500" /> Issue Certificates
          </Link>
          <Link
            to="/ai-hub/poster"
            className="px-4 py-2 rounded-full bg-accent text-white text-xs font-mono font-medium hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-md"
          >
            <Palette size={14} /> Poster Studio
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div
          onClick={() => setFilter('pending')}
          className={`cursor-pointer p-5 rounded-2xl border transition-all ${
            filter === 'pending'
              ? 'border-amber-500 bg-amber-500/10 shadow-md'
              : 'border-border-light dark:border-border-dark bg-bg-light dark:bg-[#1A1A1E] hover:border-amber-500/40'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase tracking-wider opacity-60">Pending Review</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-amber-500">{pendingCount}</p>
          <p className="text-[11px] opacity-60 mt-1">Awaiting moderation action</p>
        </div>

        <div
          onClick={() => setFilter('approved')}
          className={`cursor-pointer p-5 rounded-2xl border transition-all ${
            filter === 'approved'
              ? 'border-emerald-500 bg-emerald-500/10 shadow-md'
              : 'border-border-light dark:border-border-dark bg-bg-light dark:bg-[#1A1A1E] hover:border-emerald-500/40'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase tracking-wider opacity-60">Approved & Live</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-500">{approvedCount}</p>
          <p className="text-[11px] opacity-60 mt-1">Published to student boards</p>
        </div>

        <div
          onClick={() => setFilter('rejected')}
          className={`cursor-pointer p-5 rounded-2xl border transition-all ${
            filter === 'rejected'
              ? 'border-rose-500 bg-rose-500/10 shadow-md'
              : 'border-border-light dark:border-border-dark bg-bg-light dark:bg-[#1A1A1E] hover:border-rose-500/40'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase tracking-wider opacity-60">Rejected / Returned</span>
            <X size={16} className="text-rose-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-rose-500">{rejectedCount}</p>
          <p className="text-[11px] opacity-60 mt-1">Returned with feedback</p>
        </div>

        <div
          onClick={() => setFilter('all')}
          className={`cursor-pointer p-5 rounded-2xl border transition-all ${
            filter === 'all'
              ? 'border-accent bg-accent/10 shadow-md'
              : 'border-border-light dark:border-border-dark bg-bg-light dark:bg-[#1A1A1E] hover:border-accent/40'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase tracking-wider opacity-60">All Department Events</span>
            <ShieldCheck size={16} className="text-accent" />
          </div>
          <p className="text-2xl font-bold font-mono text-accent">{totalCount}</p>
          <p className="text-[11px] opacity-60 mt-1">Total catalog events</p>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-accent/10 border border-accent/20 text-accent text-xs mb-6 flex items-center gap-2 font-mono">
          <CheckCircle2 size={16} /> {message}
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="p-4 rounded-2xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-[#1A1A1E] mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { id: 'pending', label: `Pending (${pendingCount})` },
            { id: 'approved', label: `Approved (${approvedCount})` },
            { id: 'rejected', label: `Rejected (${rejectedCount})` },
            { id: 'all', label: `All Events (${totalCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all ${
                filter === tab.id
                  ? 'bg-accent text-white font-bold shadow-sm'
                  : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] text-xs font-mono outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Technical">Technical</option>
            <option value="Cultural">Cultural</option>
            <option value="Sports">Sports</option>
            <option value="Workshop">Workshop</option>
            <option value="Seminar">Seminar</option>
            <option value="Other">Other</option>
          </select>

          {/* Search Input */}
          <div className="relative flex-1 md:w-56">
            <Search size={14} className="absolute left-3 top-2.5 opacity-40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, faculty..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] text-xs outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Moderation List */}
      {loading ? (
        <div className="py-20 text-center opacity-60 text-xs font-mono flex items-center justify-center gap-2">
          <RefreshCw size={14} className="animate-spin" /> Loading event moderation queue...
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-[#1A1A1E] space-y-3">
          <ShieldCheck size={40} className="mx-auto opacity-40 text-accent" />
          <h3 className="font-display text-lg font-semibold">No Events Found</h3>
          <p className="text-xs opacity-60">
            {filter === 'pending'
              ? 'All submitted department events have been reviewed. No pending approvals.'
              : 'No events match the selected filters or search query.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((ev) => {
            const isExpanded = expandedEventId === ev._id;
            return (
              <div
                key={ev._id}
                className="p-6 rounded-3xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-[#1A1A1E] shadow-sm space-y-4 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Event Info */}
                  <div className="space-y-2 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs uppercase bg-sticker text-ink-light px-2.5 py-0.5 rounded-full font-bold">
                        {ev.category}
                      </span>
                      <span className="text-xs font-mono opacity-60">
                        Organizer: {ev.createdBy?.name || 'Faculty'} ({ev.createdBy?.department || 'Department'})
                      </span>
                      <span
                        className={`font-mono text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          ev.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : ev.status === 'rejected'
                            ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                            : ev.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            : 'bg-black/5 dark:bg-white/5 opacity-60'
                        }`}
                      >
                        {ev.status === 'pending' ? 'Pending Moderation' : ev.status}
                      </span>
                    </div>

                    <h3 className="font-display text-xl font-semibold">{ev.title}</h3>
                    <p className="text-xs md:text-sm opacity-75 line-clamp-2">{ev.description}</p>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono opacity-60 pt-1">
                      <span className="flex items-center gap-1"><MapPin size={12} /> {ev.venue}</span>
                      <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(ev.startDate).toDateString()}</span>
                      <span className="flex items-center gap-1"><Users size={12} /> Capacity: {ev.maxParticipants}</span>
                      <span className="font-bold">{ev.fee === 0 ? 'Free Entry' : `₹${ev.fee}`}</span>
                    </div>
                  </div>

                  {/* Moderation Actions Toolbar */}
                  <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-center">
                    {/* View Details Link */}
                    <Link
                      to={`/events/${ev._id}`}
                      className="p-2.5 rounded-xl border border-border-light dark:border-border-dark opacity-70 hover:opacity-100 hover:text-accent transition-colors"
                      title="View Event Details"
                    >
                      <ExternalLink size={16} />
                    </Link>

                    {/* Pending Action Buttons */}
                    {ev.status === 'pending' && (
                      <>
                        <button
                          onClick={() => openRejectModal(ev)}
                          className="py-2.5 px-4 rounded-xl border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 transition-colors text-xs font-mono font-medium flex items-center gap-1.5"
                        >
                          <X size={14} /> Reject Event
                        </button>
                        <button
                          onClick={() => handleApprove(ev._id)}
                          className="py-2.5 px-6 rounded-xl bg-accent text-white hover:opacity-90 transition-opacity text-xs font-mono font-semibold flex items-center gap-1.5 shadow-md"
                        >
                          <Check size={14} /> Approve & Publish
                        </button>
                      </>
                    )}

                    {/* If Already Approved: Option to revoke */}
                    {ev.status === 'approved' && (
                      <button
                        onClick={() => openRejectModal(ev)}
                        className="py-2 px-3 rounded-xl border border-border-light dark:border-border-dark opacity-60 hover:opacity-100 hover:text-rose-500 text-xs font-mono transition-colors flex items-center gap-1"
                      >
                        <X size={13} /> Revoke / Return
                      </button>
                    )}

                    {/* If Already Rejected: Option to re-approve */}
                    {ev.status === 'rejected' && (
                      <button
                        onClick={() => handleApprove(ev._id)}
                        className="py-2 px-4 rounded-xl bg-accent text-white text-xs font-mono font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm"
                      >
                        <Check size={13} /> Re-evaluate & Approve
                      </button>
                    )}

                    {/* Toggle details accordion */}
                    <button
                      onClick={() => setExpandedEventId(isExpanded ? null : ev._id)}
                      className="p-2.5 rounded-xl border border-border-light dark:border-border-dark opacity-60 hover:opacity-100 transition-opacity"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Rejection Feedback Banner if Rejected */}
                {ev.status === 'rejected' && (
                  <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 font-mono space-y-1">
                    <p className="font-bold flex items-center gap-1.5 text-rose-500">
                      <AlertTriangle size={14} /> Reason for Rejection:
                    </p>
                    <p className="font-sans leading-relaxed pl-5">
                      "{ev.rejectionReason || 'No specific reason provided by administration.'}"
                    </p>
                  </div>
                )}

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-4 border-t border-border-light dark:border-border-dark space-y-3 text-xs"
                  >
                    <div>
                      <p className="font-mono uppercase text-[10px] opacity-50 mb-1">Full Description</p>
                      <p className="opacity-80 leading-relaxed font-sans">{ev.description}</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-[11px] pt-1">
                      <div>
                        <span className="opacity-50 block">Registration Deadline:</span>
                        <span>{new Date(ev.registrationDeadline).toDateString()}</span>
                      </div>
                      <div>
                        <span className="opacity-50 block">End Date:</span>
                        <span>{new Date(ev.endDate).toDateString()}</span>
                      </div>
                      <div>
                        <span className="opacity-50 block">Organizer Email:</span>
                        <span>{ev.createdBy?.email || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="opacity-50 block">Tags:</span>
                        <span>{Array.isArray(ev.tags) ? ev.tags.join(', ') : (ev.tags || 'None')}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* REJECTION MODAL WITH PRESET REASONS AND DETAILED FEEDBACK */}
      <AnimatePresence>
        {rejectModal.open && rejectModal.event && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-bg-light dark:bg-[#1A1A1E] border border-border-light dark:border-border-dark rounded-3xl p-6 md:p-8 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark pb-3">
                <div className="flex items-center gap-2 text-rose-500 font-display font-semibold text-lg">
                  <AlertCircle size={20} /> Reject Event Proposal
                </div>
                <button
                  onClick={() => setRejectModal({ open: false, event: null, reason: '', submitting: false })}
                  className="p-1 opacity-60 hover:opacity-100 transition-opacity"
                >
                  <X size={18} />
                </button>
              </div>

              <div>
                <p className="text-xs opacity-75">
                  You are returning <span className="font-semibold text-ink-light dark:text-ink-dark">"{rejectModal.event.title}"</span> back to faculty coordinator{' '}
                  <span className="font-semibold">{rejectModal.event.createdBy?.name || 'Faculty'}</span>.
                </p>
                <p className="text-[11px] opacity-60 mt-1">
                  Please provide clear rejection feedback so the faculty can correct and resubmit the proposal.
                </p>
              </div>

              {/* Quick Preset Reason Chips */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-2">
                  Select Common Feedback Preset:
                </label>
                <div className="space-y-1.5">
                  {rejectionPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setRejectModal((prev) => ({ ...prev, reason: preset }))}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs font-mono transition-all flex items-center justify-between ${
                        rejectModal.reason === preset
                          ? 'border-rose-500 bg-rose-500/10 text-rose-500 font-bold'
                          : 'border-border-light dark:border-border-dark hover:border-rose-500/40 opacity-75 hover:opacity-100'
                      }`}
                    >
                      <span>• {preset}</span>
                      {rejectModal.reason === preset && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Detailed Reason Textarea */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1.5">
                  Rejection Reason & Specific Instructions *
                </label>
                <textarea
                  rows={3}
                  value={rejectModal.reason}
                  onChange={(e) => setRejectModal((prev) => ({ ...prev, reason: e.target.value }))}
                  placeholder="Explain why this event cannot be approved in its current form..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] text-xs outline-none focus:border-rose-500 transition-colors"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModal({ open: false, event: null, reason: '', submitting: false })}
                  className="flex-1 py-2.5 rounded-xl border border-border-light dark:border-border-dark font-mono text-xs opacity-75 hover:opacity-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={rejectModal.submitting || !rejectModal.reason.trim()}
                  onClick={handleConfirmReject}
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white font-mono text-xs font-semibold hover:opacity-90 flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50 transition-opacity"
                >
                  {rejectModal.submitting ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <X size={14} />
                  )}
                  {rejectModal.submitting ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default AdminDashboard;