import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  PlusCircle,
  Calendar,
  MapPin,
  Palette,
  FileText,
  Mail,
  BarChart3,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';

const navItems = [
  { label: 'My Events', to: '/dashboard' },
  { label: '✨ Launch AI Hub', to: '/ai-hub' },
  { label: '🎨 Poster Studio', to: '/ai-hub/poster' },
  { label: '📝 Event Copy', to: '/ai-hub/description' },
  { label: '📧 Email Studio', to: '/ai-hub/email' },
  { label: '⭐ Feedback Analysis', to: '/ai-hub/feedback' },
];

const FacultyDashboard = () => {
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    category: 'Technical',
    description: '',
    venue: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    maxParticipants: 100,
    fee: 0,
    tags: '',
  });
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/events/my-events');
      setMyEvents(res.data.events || []);
    } catch (err) {
      console.warn('Failed to load faculty events', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setCreating(true);
    setMessage('');
    try {
      const payload = {
        ...newEvent,
        tags: newEvent.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };
      await api.post('/events', payload);
      setMessage('Event draft created successfully! Submit it for admin approval whenever ready.');
      setShowCreateModal(false);
      fetchMyEvents();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to create event.');
    } finally {
      setCreating(false);
    }
  };

  const handleSubmitForApproval = async (id) => {
    try {
      await api.patch(`/events/${id}/submit`);
      setMessage('Event submitted for admin approval!');
      fetchMyEvents();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to submit event.');
    }
  };

  return (
    <DashboardLayout navItems={navItems}>
      {/* AI Hub Quick Tools Spotlight */}
      <div className="mb-10 p-6 md:p-8 rounded-3xl border border-accent/20 bg-gradient-to-r from-accent/15 via-pink-500/5 to-transparent space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-3 py-1 rounded-full mb-2">
              <Sparkles size={13} /> AI Automation Tools for Organizers
            </div>
            <h2 className="font-display text-2xl font-semibold">Organize smarter with AI</h2>
            <p className="text-xs md:text-sm opacity-75">
              Draft event copy, generate posters, dispatch email campaigns, and analyze feedback.
            </p>
          </div>

          <Link
            to="/ai-hub"
            className="px-5 py-2.5 rounded-full bg-accent text-white text-xs font-mono font-medium hover:opacity-90 transition-opacity self-start sm:self-auto shadow-md"
          >
            Open All AI Studios →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <Link
            to="/ai-hub/poster"
            className="p-3.5 rounded-2xl bg-white dark:bg-[#1A1A1E] border border-border-light dark:border-border-dark hover:border-accent transition-colors flex items-center gap-2.5 text-xs font-medium"
          >
            <Palette size={16} className="text-pink-500" />
            <span>AI Poster Studio</span>
          </Link>
          <Link
            to="/ai-hub/description"
            className="p-3.5 rounded-2xl bg-white dark:bg-[#1A1A1E] border border-border-light dark:border-border-dark hover:border-accent transition-colors flex items-center gap-2.5 text-xs font-medium"
          >
            <FileText size={16} className="text-amber-500" />
            <span>AI Copywriting</span>
          </Link>
          <Link
            to="/ai-hub/email"
            className="p-3.5 rounded-2xl bg-white dark:bg-[#1A1A1E] border border-border-light dark:border-border-dark hover:border-accent transition-colors flex items-center gap-2.5 text-xs font-medium"
          >
            <Mail size={16} className="text-blue-500" />
            <span>AI Email Studio</span>
          </Link>
          <Link
            to="/ai-hub/feedback"
            className="p-3.5 rounded-2xl bg-white dark:bg-[#1A1A1E] border border-border-light dark:border-border-dark hover:border-accent transition-colors flex items-center gap-2.5 text-xs font-medium"
          >
            <BarChart3 size={16} className="text-emerald-500" />
            <span>AI Feedback Insights</span>
          </Link>
        </div>
      </div>

      {/* Header & Create Event Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold">Faculty Event Dashboard</h1>
          <p className="text-xs opacity-60">Manage your created events, track approvals, and view attendee responses.</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 rounded-full bg-ink-light text-bg-light dark:bg-ink-dark dark:text-bg-dark font-medium text-xs hover:opacity-90 transition-all flex items-center gap-2 shadow-sm self-start sm:self-auto"
        >
          <PlusCircle size={16} /> Create Event
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-accent/10 border border-accent/20 text-accent text-xs mb-6 flex items-center gap-2">
          <CheckCircle size={16} /> {message}
        </div>
      )}

      {/* Events Table / List */}
      {loading ? (
        <div className="py-20 text-center opacity-60 text-xs font-mono">Loading your events...</div>
      ) : myEvents.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-[#1A1A1E] space-y-3">
          <Calendar size={40} className="mx-auto opacity-40 text-accent" />
          <h3 className="font-display text-lg font-semibold">No Events Created Yet</h3>
          <p className="text-xs opacity-60 max-w-sm mx-auto">
            Click "Create Event" or use our AI Copy & Poster generators to prepare an event.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myEvents.map((ev) => (
            <div
              key={ev._id}
              className="p-6 rounded-3xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-[#1A1A1E] shadow-sm flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs uppercase bg-sticker text-ink-light px-2 py-0.5 rounded-full font-semibold">
                    {ev.category}
                  </span>
                  <span
                    className={`font-mono text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                      ev.status === 'approved'
                        ? 'bg-green-500/10 text-green-500'
                        : ev.status === 'rejected'
                        ? 'bg-rose-500/10 text-rose-500'
                        : 'bg-amber-500/10 text-amber-500'
                    }`}
                  >
                    {ev.status}
                  </span>
                </div>
                <h3 className="font-display text-lg font-semibold">{ev.title}</h3>
                <p className="text-xs opacity-70 line-clamp-2 mt-1">{ev.description}</p>
                <div className="mt-3 space-y-1 text-xs opacity-60 font-mono">
                  <p>Venue: {ev.venue}</p>
                  <p>Date: {new Date(ev.startDate).toLocaleDateString()}</p>
                  <p>Capacity: {ev.maxParticipants}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-border-light dark:border-border-dark flex items-center justify-between">
                <span className="font-mono text-xs font-bold">{ev.fee === 0 ? 'Free' : `₹${ev.fee}`}</span>
                {ev.status === 'pending' && !ev.isPublished && (
                  <button
                    onClick={() => handleSubmitForApproval(ev._id)}
                    className="text-xs font-mono px-3 py-1 rounded-full bg-accent text-white hover:opacity-90 transition-opacity"
                  >
                    Submit for Approval
                  </button>
                )}
                {ev.status === 'approved' && (
                  <Link
                    to="/ai-hub/feedback"
                    className="text-xs font-mono text-accent hover:underline"
                  >
                    View Feedback →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl bg-bg-light dark:bg-[#1A1A1E] border border-border-light dark:border-border-dark rounded-3xl p-6 md:p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark pb-3">
              <h3 className="font-display text-xl font-semibold">Create New Event</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-sm opacity-60 hover:opacity-100">✕</button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
              <div>
                <label className="block font-mono uppercase tracking-wider opacity-60 mb-1">Event Title *</label>
                <input
                  required
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono uppercase tracking-wider opacity-60 mb-1">Category</label>
                  <select
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] outline-none focus:border-accent"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Sports">Sports</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-mono uppercase tracking-wider opacity-60 mb-1">Venue *</label>
                  <input
                    required
                    value={newEvent.venue}
                    onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono uppercase tracking-wider opacity-60 mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="You can also generate copy via the AI Copywriting studio!"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-mono uppercase tracking-wider opacity-60 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={newEvent.startDate}
                    onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429]"
                  />
                </div>
                <div>
                  <label className="block font-mono uppercase tracking-wider opacity-60 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={newEvent.endDate}
                    onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429]"
                  />
                </div>
                <div>
                  <label className="block font-mono uppercase tracking-wider opacity-60 mb-1">Deadline</label>
                  <input
                    type="date"
                    required
                    value={newEvent.registrationDeadline}
                    onChange={(e) => setNewEvent({ ...newEvent, registrationDeadline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono uppercase tracking-wider opacity-60 mb-1">Max Participants</label>
                  <input
                    type="number"
                    min="1"
                    value={newEvent.maxParticipants}
                    onChange={(e) => setNewEvent({ ...newEvent, maxParticipants: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429]"
                  />
                </div>
                <div>
                  <label className="block font-mono uppercase tracking-wider opacity-60 mb-1">Registration Fee (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={newEvent.fee}
                    onChange={(e) => setNewEvent({ ...newEvent, fee: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded-full border border-border-light dark:border-border-dark font-mono text-xs"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-2.5 rounded-full bg-accent text-white font-mono text-xs font-semibold hover:opacity-90"
                >
                  {creating ? 'CREATING...' : 'CREATE DRAFT'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default FacultyDashboard;