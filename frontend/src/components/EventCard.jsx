import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const rotations = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2'];

const EventCard = ({ event, index = 0 }) => {
  const navigate = useNavigate();
  const rotation = rotations[index % rotations.length];

  const handleClick = () => {
    const targetId = event._id || event.id;
    if (targetId) {
      navigate(`/events/${targetId}`);
    } else if (event.title) {
      navigate(`/events/${encodeURIComponent(event.title)}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const formattedDate = event.startDate
    ? new Date(event.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : 'Upcoming';

  return (
    <motion.div
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ rotate: 0, scale: 1.03 }}
      className={`${rotation} bg-bg-light dark:bg-[#1A1A1E] border border-border-light dark:border-border-dark rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent`}
    >
      <span className="inline-block font-mono text-xs uppercase tracking-wider bg-sticker text-ink-light px-2 py-1 rounded-full mb-3 font-semibold">
        {event.category || 'Event'}
      </span>
      <h3 className="font-display text-lg font-semibold mb-1 truncate">{event.title}</h3>
      <p className="text-sm opacity-70 mb-3 line-clamp-2">{event.description}</p>
      <div className="flex items-center justify-between text-xs font-mono opacity-60">
        <span>{formattedDate}</span>
        <span>{event.fee === 0 ? 'Free' : `₹${event.fee || 0}`}</span>
      </div>
    </motion.div>
  );
};

export default EventCard;