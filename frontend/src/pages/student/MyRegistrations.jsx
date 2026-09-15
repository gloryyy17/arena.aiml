import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';

const navItems = [
  { label: 'Browse Events', to: '/dashboard' },
  { label: 'My Registrations', to: '/dashboard/registrations' },
  { label: 'Certificates', to: '/dashboard/certificates' },
  { label: 'Profile', to: '/dashboard/profile' },
];

const paymentStyles = {
  not_required: 'bg-gray-500/15 text-gray-500',
  pending: 'bg-yellow-500/15 text-yellow-600',
  paid: 'bg-green-500/15 text-green-600',
  failed: 'bg-red-500/15 text-red-600',
  refunded: 'bg-blue-500/15 text-blue-600',
};

const MyRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/registrations/my-registrations')
      .then((res) => setRegistrations(res.data.registrations))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout navItems={navItems}>
      <h1 className="font-display text-2xl font-semibold mb-6">My Registrations</h1>

      {loading && <p className="opacity-60 text-sm">Loading...</p>}
      {!loading && registrations.length === 0 && (
        <p className="opacity-60 text-sm">No registrations yet — go pin something 🎉</p>
      )}

      <div className="flex flex-col gap-4">
        {registrations.map((reg) => (
          <div key={reg._id} className="border border-border-light dark:border-border-dark rounded-2xl p-5 flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold">{reg.event?.title}</h3>
              <p className="text-sm opacity-60">
                {reg.event?.venue} · {new Date(reg.event?.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-mono uppercase ${paymentStyles[reg.paymentStatus]}`}>
              {reg.paymentStatus.replace('_', ' ')}
            </span>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default MyRegistrations;