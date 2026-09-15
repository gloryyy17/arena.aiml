import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';

const navItems = [
  { label: 'Approvals', to: '/dashboard' },
  { label: 'All Users', to: '/dashboard/users' },
];

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
  };

  return (
    <DashboardLayout navItems={navItems}>
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
    </DashboardLayout>
  );
};

export default AdminDashboard;