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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-sm rounded-3xl theme-card overflow-hidden shadow-2xl relative flex flex-col"
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

          {/* Ticket Details & QR */}
          <div className="p-6 space-y-5 text-center flex flex-col items-center">
            {/* High contrast QR Container */}
            <div className="p-4 rounded-3xl bg-white shadow-md border border-slate-200">
              {qrUrl ? (
                <img
                  src={qrUrl}
                  alt="Entrance QR Pass"
                  className="w-44 h-44 object-contain"
                />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center text-zinc-400 font-mono text-xs">
                  Generating Pass...
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold border border-emerald-500/20">
                <CheckCircle size={13} /> VERIFIED ENTRANCE PASS
              </div>
              <p className="text-[11px] theme-text-secondary font-mono">
                Present this QR code to the entrance volunteers at the venue.
              </p>
            </div>

            {/* Event Metadata Strip */}
            <div className="w-full p-3 rounded-2xl theme-card-subtle flex items-center justify-around text-xs font-mono theme-text-secondary">
              <div className="flex items-center gap-1.5">
                <Calendar size={13} className="text-[#5B47FB]" />
                <span>
                  {ev.date
                    ? new Date(ev.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'TBA'}
                </span>
              </div>
              <div className="h-4 w-px theme-border" />
              <div className="flex items-center gap-1.5">
                <MapPin size={13} className="text-[#06B6D4]" />
                <span className="truncate max-w-[120px]">{ev.venue || 'Audi'}</span>
              </div>
            </div>

            <div className="w-full pt-1 border-t theme-border flex items-center justify-between text-[10px] font-mono theme-text-muted">
              <span>Pass ID: {registration._id?.slice(-8).toUpperCase()}</span>
              <span className="inline-flex items-center gap-1 text-[#5B47FB]">
                <ShieldCheck size={11} /> Arena Verified
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TicketPassModal;
