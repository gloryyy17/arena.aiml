import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import EventCard from '../components/EventCard';

// Placeholder events until we wire up the real API call
const sampleEvents = [
  { title: 'AI Hackathon 2026', description: '24-hour build sprint for AI enthusiasts across departments.', category: 'Technical', startDate: '2026-09-15', fee: 0 },
  { title: 'Cultural Fest: Rangmanch', description: 'Dance, music, and drama competitions all week.', category: 'Cultural', startDate: '2026-09-20', fee: 100 },
  { title: 'Design Sprint Workshop', description: 'Hands-on UI/UX workshop with industry mentors.', category: 'Workshop', startDate: '2026-09-25', fee: 50 },
  { title: 'Inter-College Cricket Cup', description: 'Annual cricket tournament between AIML colleges.', category: 'Sports', startDate: '2026-10-02', fee: 0 },
];

const Landing = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="px-6 md:px-12 pt-16 pb-24 max-w-5xl">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-mono text-xs uppercase tracking-widest text-accent mb-4"
        >
          Your college, one board
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="font-display text-5xl md:text-7xl font-semibold leading-[1.05] tracking-tight mb-6"
        >
          Every event worth
          <br />
          showing up for.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-lg opacity-70 max-w-xl mb-8"
        >
          AIML Arena brings every hackathon, fest, and workshop onto one board —
          register, pay, and get certified without the group-chat chaos.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Link
            to="/register"
            className="inline-block px-6 py-3 rounded-full bg-accent text-white font-medium hover:opacity-90 transition-opacity"
          >
            Join the board →
          </Link>
        </motion.div>
      </section>

      {/* Event sticker board */}
      <section className="px-6 md:px-12 pb-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-2xl font-semibold">Pinned this week</h2>
          <Link to="/events" className="text-sm font-mono opacity-60 hover:opacity-100 hover:text-accent transition-all">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sampleEvents.map((event, i) => (
            <EventCard key={event.title} event={event} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Landing;