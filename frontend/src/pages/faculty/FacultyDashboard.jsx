import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';

const navItems = [
  { label: 'My Events', to: '/dashboard' },
  { label: 'Create Event', to: '/dashboard/create' },
];

const statusStyles = {
  pending: 'bg-yellow-500/15 text-yellow-600',
  approved: 'bg-green-500/15 text-green-600',
  rejected: 'bg-red-500/15 text-red-600',
  completed: 'bg-blue-500/15 text-blue-600',
  cancelled: 'bg-gray-500/15 text-gray-500',
};

const FacultyDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = () => {
    setLoading(true);
    api.get('/events/my-events')
      .then((res) => setEvents(res.data.events))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEvents(); }, []);

  const submitForApproval = async (id) => {
    await api.patch(`/events/${id}/submit`);
    fetchEvents();
  };

  return (
    <DashboardLayout navItems={navItems}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold">My Events</h1>
        <Link to="/dashboard/create" className="px-4 py-2 rounded-full bg-accent text-white text-sm font-medium hover:opacity-90 transition-opacity">
          + New Event
        </Link>
      </div>

      {loading && <p className="opacity-60 text-sm">Loading...</p>}
      {!loading && events.length === 0 && <p className="opacity-60 text-sm">No events yet — create your first one 🎉</p>}

      <div className="flex flex-col gap-4">
        {events.map((event) => (
          <div key={event._id} className="border border-border-light dark:border-border-dark rounded-2xl p-5 flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold">{event.title}</h3>
              <p className="text-sm opacity-60">{event.venue} · {new Date(event.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
              {event.status === 'rejected' && event.rejectionReason && (
                <p className="text-xs text-red-500 mt-1">Rejected: {event.rejectionReason}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
  <span className={`px-3 py-1 rounded-full text-xs font-mono uppercase ${statusStyles[event.status]}`}>
    {event.status}
  </span>
  <Link
    to={`/dashboard/events/${event._id}/registrations`}
    className="px-3 py-1.5 rounded-full border border-border-light dark:border-border-dark text-xs font-medium hover:border-accent hover:text-accent transition-colors"
  >
    View Registrations
  </Link>
  {!event.isPublished && (
    <button
      onClick={() => submitForApproval(event._id)}
      className="px-3 py-1.5 rounded-full border border-border-light dark:border-border-dark text-xs font-medium hover:border-accent hover:text-accent transition-colors"
    >
      Submit for Approval
    </button>
  )}
</div>  
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default FacultyDashboard;