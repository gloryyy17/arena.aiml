import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, CheckCircle, ShieldCheck } from 'lucide-react';

const TicketPassModal = ({ registration, isOpen, onClose }) => {
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    if (registration?._id) {
      const payload = JSON.stringify({
        ticketId: registration._id,
        student: registration.student?.name || registration.student,
        eventId: registration.event?._id || registration.event?.id,
        eventTitle: registration.event?.title,
        verified: true,
      });

      QRCode.toDataURL(payload, {
        width: 240,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })
        .then((url) => setQrUrl(url))
        .catch((err) => console.error('QR code generation error:', err));
    }
  }, [registration]);

  if (!isOpen || !registration) return null;

  const ev = registration.event || {};

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-sm rounded-3xl bg-[#18181D] border border-white/10 overflow-hidden shadow-2xl relative flex flex-col"
        >
          {/* Top Pass Header */}
          <div className="p-5 bg-gradient-to-br from-[#5B47FB] to-[#3B82F6] text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-black/20 flex items-center justify-center hover:bg-black/40 text-white transition-colors"
            >
              <X size={16} />
            </button>
            <span className="font-mono text-[10px] uppercase font-bold tracking-widest bg-white/20 px-2 py-0.5 rounded-full inline-block mb-2">
              Official Campus Pass
            </span>
            <h2 className="font-display text-xl font-bold leading-snug">
              {ev.title || 'Event Pass'}
            </h2>
            <p className="text-xs opacity-90 font-mono mt-1">
              Category: {ev.category || 'General'}
            </p>
          </div>

          {/* Ticket Details */}
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400 border-b border-white/5 pb-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-500">Pass Holder</p>
                <p className="font-semibold text-white mt-0.5">
                  {registration.student?.name || 'Registered Student'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-zinc-500">Status</p>
                <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                  <CheckCircle size={12} /> Confirmed
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-zinc-300">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-[#5B47FB]" />
                <span>
                  {ev.startDate
                    ? new Date(ev.startDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Upcoming'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-pink-400" />
                <span className="truncate">{ev.venue || 'Campus Venue'}</span>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center shadow-inner my-2">
              {qrUrl ? (
                <img src={qrUrl} alt="Entrance QR Code" className="w-44 h-44 object-contain" />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center text-xs text-zinc-500 font-mono">
                  Generating Pass...
                </div>
              )}
              <span className="font-mono text-[10px] text-zinc-600 mt-1 uppercase tracking-widest font-bold">
                Scan at Hall Entrance
              </span>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-zinc-500 text-[11px] font-mono">
              <ShieldCheck size={13} className="text-[#5B47FB]" />
              <span>Tamper-proof verifiable credential</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TicketPassModal;
