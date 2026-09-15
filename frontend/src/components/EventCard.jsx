import { motion } from 'framer-motion';
import { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const rotations = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2'];

const EventCard = ({ event, index, onRegistered }) => {
  const rotation = rotations[index % rotations.length];
  const { user } = useAuth();
  const [status, setStatus] = useState('idle'); // idle | loading | done
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.stopPropagation();
    setStatus('loading');
    setError('');
    try {
      const res = await api.post(`/registrations/${event._id}`);

      if (!res.data.requiresPayment) {
        setStatus('done');
        onRegistered?.();
        return;
      }

      // Paid event — open Razorpay checkout
      const { order } = res.data;
      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: 'AIML Arena',
        description: event.title,
        handler: async (response) => {
          await api.post('/registrations/verify-payment', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          setStatus('done');
          onRegistered?.();
        },
        prefill: { name: user?.name, email: user?.email },
        theme: { color: '#5B47FB' },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
      setStatus('idle');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      setStatus('idle');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ rotate: 0, scale: 1.03 }}
      className={`${rotation} bg-bg-light dark:bg-[#1A1A1E] border border-border-light dark:border-border-dark rounded-2xl p-5 shadow-sm hover:shadow-lg transition-shadow`}
    >
      <span className="inline-block font-mono text-xs uppercase tracking-wider bg-sticker text-ink-light px-2 py-1 rounded-full mb-3">
        {event.category}
      </span>
      <h3 className="font-display text-lg font-semibold mb-1">{event.title}</h3>
      <p className="text-sm opacity-70 mb-3 line-clamp-2">{event.description}</p>
      <div className="flex items-center justify-between text-xs font-mono opacity-60 mb-4">
        <span>{new Date(event.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
        <span>{event.fee === 0 ? 'Free' : `₹${event.fee}`}</span>
      </div>

      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}

      {user?.role === 'student' && (
        <button
          onClick={handleRegister}
          disabled={status !== 'idle'}
          className="w-full py-2 rounded-full bg-accent text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {status === 'done' ? 'Registered ✓' : status === 'loading' ? 'Processing...' : 'Register'}
        </button>
      )}
    </motion.div>
  );
};

export default EventCard;