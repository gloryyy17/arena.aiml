import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';

const navItems = [
  { label: 'My Events', to: '/dashboard' },
  { label: 'Create Event', to: '/dashboard/create' },
];

const paymentStyles = {
  not_required: 'bg-gray-500/15 text-gray-500',
  pending: 'bg-yellow-500/15 text-yellow-600',
  paid: 'bg-green-500/15 text-green-600',
  failed: 'bg-red-500/15 text-red-600',
  refunded: 'bg-blue-500/15 text-blue-600',
};

const EventRegistrations = () => {
  const { eventId } = useParams();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/registrations/event/${eventId}`)
      .then((res) => setRegistrations(res.data.registrations))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load registrations'))
      .finally(() => setLoading(false));
  }, [eventId]);

  return (
    <DashboardLayout navItems={navItems}>
      <Link to="/dashboard" className="text-sm font-mono opacity-60 hover:text-accent transition-colors mb-4 inline-block">
        ← Back to My Events
      </Link>
      <h1 className="font-display text-2xl font-semibold mb-6">Registrations</h1>

      {loading && <p className="opacity-60 text-sm">Loading...</p>}
      {error && <p className="text-sm text-red-500 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}
      {!loading && !error && registrations.length === 0 && (
        <p className="opacity-60 text-sm">No one's registered yet.</p>
      )}

      {registrations.length > 0 && (
        <div className="border border-border-light dark:border-border-dark rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-border-light/30 dark:bg-border-dark/30">
              <tr className="text-left font-mono text-xs uppercase tracking-wider opacity-60">
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3">Attended</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((reg) => (
                <tr key={reg._id} className="border-t border-border-light dark:border-border-dark">
                  <td className="px-5 py-3 font-medium">{reg.student?.name}</td>
                  <td className="px-5 py-3 opacity-70">{reg.student?.email}</td>
                  <td className="px-5 py-3 opacity-70">{reg.student?.department || '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-mono uppercase ${paymentStyles[reg.paymentStatus]}`}>
                      {reg.paymentStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3">{reg.attended ? '✅' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
};

export default EventRegistrations;