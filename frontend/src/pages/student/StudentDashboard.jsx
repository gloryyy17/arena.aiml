import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import EventCard from '../../components/EventCard';
import api from '../../api/axios';

const navItems = [
  { label: 'Browse Events', to: '/dashboard' },
  { label: 'My Registrations', to: '/dashboard/registrations' },
  { label: 'Certificates', to: '/dashboard/certificates' },
  { label: 'Profile', to: '/dashboard/profile' },
];

const StudentDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/events')
      .then((res) => setEvents(res.data.events))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout navItems={navItems}>
      <h1 className="font-display text-2xl font-semibold mb-6">Browse Events</h1>

      {loading && <p className="opacity-60 text-sm">Loading events...</p>}

      {!loading && events.length === 0 && (
        <p className="opacity-60 text-sm">No events pinned yet — check back soon 🎉</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event, i) => (
          <EventCard key={event._id} event={event} index={i} />
        ))}
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;