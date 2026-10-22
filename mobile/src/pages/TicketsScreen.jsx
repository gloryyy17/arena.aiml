import { useState, useEffect } from 'react';
import { Ticket, QrCode, Calendar, MapPin, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import MobileHeader from '../components/MobileHeader';
import TicketPassModal from '../components/TicketPassModal';
import api, { getErrorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const TicketsScreen = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPass, setSelectedPass] = useState(null);
  const [error, setError] = useState('');

  const fetchRegistrations = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.get('/registrations/my-registrations');
      setRegistrations(res.data.registrations || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load event registrations.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen pb-24 bg-[#0F0F12] text-white">
        <MobileHeader title="My Tickets" subtitle="Event Passes & QR Codes" />
        <div className="max-w-md mx-auto px-6 py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#5B47FB]/15 text-[#5B47FB] flex items-center justify-center mx-auto">
            <Ticket size={28} />
          </div>
          <h2 className="font-display text-lg font-bold">Sign In Required</h2>
          <p className="text-xs text-zinc-400">
            Sign in to view your registered event tickets and mobile entrance passes.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2.5 rounded-full bg-[#5B47FB] text-white text-xs font-semibold shadow-md active:scale-95 transition-all"
          >
            Sign In with Student Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 bg-[#0F0F12] text-white">
      <MobileHeader title="My Tickets" subtitle="Event Passes & QR Codes" />

      <main className="max-w-md mx-auto px-5 pt-4 space-y-4">
        {error && (
          <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-mono flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
            Active Passes ({registrations.length})
          </p>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-zinc-500 font-mono text-xs">
            <Loader2 size={24} className="animate-spin text-[#5B47FB]" />
            <span>Loading tickets...</span>
          </div>
        ) : registrations.length === 0 ? (
          <div className="p-8 rounded-3xl bg-[#18181D] border border-white/5 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-white/5 text-zinc-500 flex items-center justify-center mx-auto">
              <Ticket size={20} />
            </div>
            <h3 className="font-display text-sm font-bold text-white">No active tickets</h3>
            <p className="text-xs text-zinc-400">
              Browse events from the home screen and register to get instant QR passes.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 rounded-full bg-white/10 text-xs text-white hover:bg-white/20 transition-all font-medium"
            >
              Explore Events
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {registrations.map((reg) => {
              const ev = reg.event || {};
              const isConfirmed = reg.registrationStatus === 'confirmed';

              return (
                <div
                  key={reg._id}
                  onClick={() => setSelectedPass(reg)}
                  className="p-5 rounded-3xl bg-gradient-to-br from-[#1E1E26] to-[#141419] border border-white/10 hover:border-[#5B47FB]/40 transition-all cursor-pointer active:scale-[0.98] relative overflow-hidden space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#A5B4FC] bg-[#5B47FB]/15 px-2 py-0.5 rounded-full">
                        {ev.category || 'Event'}
                      </span>
                      <h3 className="font-display text-base font-bold text-white mt-1.5 leading-snug">
                        {ev.title || 'Event Pass'}
                      </h3>
                    </div>

                    <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white shrink-0 shadow-sm border border-white/10">
                      <QrCode size={20} />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-[#5B47FB]" />
                      <span>
                        {ev.startDate
                          ? new Date(ev.startDate).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'TBD'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin size={13} className="text-pink-400" />
                      <span className="truncate">{ev.venue || 'Campus Venue'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[11px] font-mono">
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle size={12} /> {reg.registrationStatus?.toUpperCase()}
                    </span>
                    <span className="text-[#A5B4FC] font-bold flex items-center gap-1">
                      Tap to open QR Pass →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* QR Code Pass Modal */}
      <TicketPassModal
        registration={selectedPass}
        isOpen={Boolean(selectedPass)}
        onClose={() => setSelectedPass(null)}
      />
    </div>
  );
};

export default TicketsScreen;
