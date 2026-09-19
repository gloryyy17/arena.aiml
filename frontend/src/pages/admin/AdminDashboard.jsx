import { useEffect, useState } from 'react';
<<<<<<< HEAD
=======
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Check,
  X,
  Sparkles,
  Calendar,
  Layers,
  BarChart3,
  Clock,
  CheckCircle2,
} from 'lucide-react';
>>>>>>> b5eade6dd82a7ac4eb45ee39014e8e6f0cf09347
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';

const navItems = [
  { label: 'Event Approvals', to: '/dashboard' },
  { label: '✨ AI Hub Center', to: '/ai-hub' },
  { label: '🧠 Prompt Registry', to: '/ai-hub/prompts' },
  { label: '⭐ Feedback Analytics', to: '/ai-hub/feedback' },
  { label: '📧 Email Studio', to: '/ai-hub/email' },
];

<<<<<<< HEAD
const statusStyles = {
  pending: 'bg-yellow-500/15 text-yellow-600',
  approved: 'bg-green-500/15 text-green-600',
  rejected: 'bg-red-500/15 text-red-600',
  completed: 'bg-blue-500/15 text-blue-600',
  cancelled: 'bg-gray-500/15 text-gray-500',
};

const filters = ['pending', 'approved', 'rejected', 'all'];

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('pending');
  const [rejectingId, setRejectingId] = useState(null);
  const [reason, setReason] = useState('');

  const fetchEvents = (status) => {
    setLoading(true);
    const query = status === 'all' ? '' : `?status=${status}`;
    api.get(`/events/admin/all${query}`)
      .then((res) => setEvents(res.data.events))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEvents(activeFilter); }, [activeFilter]);

  const approve = async (id) => {
    await api.patch(`/events/${id}/approve`);
    fetchEvents(activeFilter);
  };

  const reject = async (id) => {
    await api.patch(`/events/${id}/reject`, { reason });
    setRejectingId(null);
    setReason('');
    fetchEvents(activeFilter);
=======
const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('pending'); // 'pending' | 'all'

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const url = filter === 'pending' ? '/events/admin/all?status=pending' : '/events/admin/all';
      const res = await api.get(url);
      setEvents(res.data.events || []);
    } catch (err) {
      console.warn('Failed to load admin events', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.patch(`/events/${id}/approve`);
      setMessage('Event approved and published to the live student board!');
      fetchEvents();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Approval failed.');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection feedback reason:');
    if (!reason) return;
    try {
      await api.patch(`/events/${id}/reject`, { reason });
      setMessage('Event rejected and feedback returned to faculty.');
      fetchEvents();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Rejection failed.');
    }
>>>>>>> b5eade6dd82a7ac4eb45ee39014e8e6f0cf09347
  };

  return (
    <DashboardLayout navItems={navItems}>
<<<<<<< HEAD
      <h1 className="font-display text-2xl font-semibold mb-6">Event Approvals</h1>

      <div className="flex gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-mono uppercase transition-colors ${
              activeFilter === f
                ? 'bg-ink-light dark:bg-ink-dark text-bg-light dark:text-bg-dark'
                : 'border border-border-light dark:border-border-dark hover:border-accent'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading && <p className="opacity-60 text-sm">Loading...</p>}
      {!loading && events.length === 0 && <p className="opacity-60 text-sm">Nothing here 🎉</p>}

      <div className="flex flex-col gap-4">
        {events.map((event) => (
          <div key={event._id} className="border border-border-light dark:border-border-dark rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-semibold">{event.title}</h3>
                <p className="text-sm opacity-60">
                  {event.createdBy?.name} · {event.department} · {event.venue}
                </p>
                <p className="text-xs opacity-50 mt-1">
                  {new Date(event.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {' · '}{event.fee === 0 ? 'Free' : `₹${event.fee}`} · Cap {event.maxParticipants}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-mono uppercase ${statusStyles[event.status]}`}>
                  {event.status}
                </span>
                {event.status === 'pending' && (
                  <>
                    <button
                      onClick={() => approve(event._id)}
                      className="px-3 py-1.5 rounded-full bg-accent text-white text-xs font-medium hover:opacity-90 transition-opacity"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setRejectingId(rejectingId === event._id ? null : event._id)}
                      className="px-3 py-1.5 rounded-full border border-border-light dark:border-border-dark text-xs font-medium hover:border-red-500 hover:text-red-500 transition-colors"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>

            {rejectingId === event._id && (
              <div className="mt-4 flex gap-2">
                <input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Reason for rejection..."
                  className="flex-1 px-4 py-2 rounded-xl border border-border-light dark:border-border-dark bg-transparent outline-none focus:border-accent text-sm"
                />
                <button
                  onClick={() => reject(event._id)}
                  className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Confirm Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
=======
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-accent bg-accent/10 px-3 py-1 rounded-full mb-2">
            <ShieldCheck size={14} /> Admin Moderation & AI Controls
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold">Event Approval Center</h1>
          <p className="text-sm opacity-60">Review submitted department events before publishing to students.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-1.5 rounded-full text-xs font-mono transition-colors ${
              filter === 'pending'
                ? 'bg-accent text-white font-medium'
                : 'border border-border-light dark:border-border-dark opacity-70'
            }`}
          >
            Pending ({events.filter((e) => e.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-mono transition-colors ${
              filter === 'all'
                ? 'bg-accent text-white font-medium'
                : 'border border-border-light dark:border-border-dark opacity-70'
            }`}
          >
            All Events
          </button>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-accent/10 border border-accent/20 text-accent text-xs mb-6 flex items-center gap-2">
          <CheckCircle2 size={16} /> {message}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center opacity-60 text-xs font-mono">Loading moderation queue...</div>
      ) : events.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-[#1A1A1E] space-y-3">
          <ShieldCheck size={40} className="mx-auto opacity-40 text-accent" />
          <h3 className="font-display text-lg font-semibold">No Pending Approvals</h3>
          <p className="text-xs opacity-60">All department events have been reviewed.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((ev) => (
            <div
              key={ev._id}
              className="p-6 rounded-3xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-[#1A1A1E] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs uppercase bg-sticker text-ink-light px-2.5 py-0.5 rounded-full font-bold">
                    {ev.category}
                  </span>
                  <span className="text-xs font-mono opacity-50">
                    Organizer: {ev.createdBy?.name || 'Faculty'} ({ev.createdBy?.department || 'Department'})
                  </span>
                  <span
                    className={`font-mono text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
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

                <h3 className="font-display text-xl font-semibold">{ev.title}</h3>
                <p className="text-xs md:text-sm opacity-75">{ev.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-xs font-mono opacity-60 pt-1">
                  <span>Venue: {ev.venue}</span>
                  <span>Date: {new Date(ev.startDate).toDateString()}</span>
                  <span>Capacity: {ev.maxParticipants}</span>
                  <span>Fee: {ev.fee === 0 ? 'Free' : `₹${ev.fee}`}</span>
                </div>
              </div>

              {ev.status === 'pending' && (
                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    onClick={() => handleReject(ev._id)}
                    className="py-2.5 px-4 rounded-xl border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 transition-colors text-xs font-mono font-medium flex items-center gap-1.5"
                  >
                    <X size={14} /> Reject
                  </button>
                  <button
                    onClick={() => handleApprove(ev._id)}
                    className="py-2.5 px-6 rounded-xl bg-accent text-white hover:opacity-90 transition-opacity text-xs font-mono font-semibold flex items-center gap-1.5 shadow-md"
                  >
                    <Check size={14} /> Approve Event
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
>>>>>>> b5eade6dd82a7ac4eb45ee39014e8e6f0cf09347
    </DashboardLayout>
  );
};

export default AdminDashboard;