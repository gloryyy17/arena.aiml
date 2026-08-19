import { motion } from 'framer-motion';

const rotations = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2'];

const EventCard = ({ event, index }) => {
  const rotation = rotations[index % rotations.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ rotate: 0, scale: 1.03 }}
      className={`${rotation} bg-bg-light dark:bg-[#1A1A1E] border border-border-light dark:border-border-dark rounded-2xl p-5 shadow-sm hover:shadow-lg transition-shadow cursor-pointer`}
    >
      <span className="inline-block font-mono text-xs uppercase tracking-wider bg-sticker text-ink-light px-2 py-1 rounded-full mb-3">
        {event.category}
      </span>
      <h3 className="font-display text-lg font-semibold mb-1">{event.title}</h3>
      <p className="text-sm opacity-70 mb-3 line-clamp-2">{event.description}</p>
      <div className="flex items-center justify-between text-xs font-mono opacity-60">
        <span>{new Date(event.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
        <span>{event.fee === 0 ? 'Free' : `₹${event.fee}`}</span>
      </div>
    </motion.div>
  );
};

export default EventCard;