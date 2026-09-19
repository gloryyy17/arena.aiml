import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import EventCard from '../components/EventCard';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Calendar, ShieldCheck, Mail, MapPin, Phone } from 'lucide-react';

const fallbackSampleEvents = [
  { _id: 'sample-ai-hackathon', title: 'AI Hackathon 2026', description: '24-hour build sprint for AI enthusiasts across departments.', category: 'Technical', startDate: '2026-09-15', fee: 0, venue: 'Main Auditorium' },
  { _id: 'sample-rangmanch', title: 'Cultural Fest: Rangmanch', description: 'Dance, music, and drama competitions all week.', category: 'Cultural', startDate: '2026-09-20', fee: 100, venue: 'Open Air Theatre' },
  { _id: 'sample-design-sprint', title: 'Design Sprint Workshop', description: 'Hands-on UI/UX workshop with industry mentors.', category: 'Workshop', startDate: '2026-09-25', fee: 50, venue: 'Design Studio Lab' },
  { _id: 'sample-cricket-cup', title: 'Inter-College Cricket Cup', description: 'Annual cricket tournament between AIML colleges.', category: 'Sports', startDate: '2026-10-02', fee: 0, venue: 'Sports Ground' },
];

const Landing = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api.get('/events')
      .then((res) => {
        if (isMounted) {
          const list = res.data?.events || [];
          setEvents(list.length > 0 ? list : fallbackSampleEvents);
        }
      })
      .catch(() => {
        if (isMounted) {
          setEvents(fallbackSampleEvents);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-ink-light dark:text-ink-dark">
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
          className="text-lg opacity-70 max-w-xl mb-8 leading-relaxed"
        >
          AIML Arena brings every hackathon, fest, and workshop onto one board —
          register, pay, and get certified without the group-chat chaos.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-wrap items-center gap-4"
        >
          <Link
            to={user ? '/dashboard' : '/register'}
            className="inline-block px-8 py-3.5 rounded-full bg-accent text-white font-medium hover:opacity-90 transition-opacity shadow-lg"
          >
            {user ? 'Go to Dashboard →' : 'Join the board →'}
          </Link>
          <a
            href="#events"
            className="inline-block px-6 py-3.5 rounded-full border border-border-light dark:border-border-dark font-mono text-xs hover:border-accent hover:text-accent transition-colors"
          >
            Explore Events ↓
          </a>
        </motion.div>
      </section>

      {/* Event sticker board */}
      <section id="events" className="px-6 md:px-12 pb-24 scroll-mt-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-semibold">Pinned this week</h2>
            <p className="text-xs opacity-60 mt-1">Live approved college events and workshops</p>
          </div>
          <Link
            to={user ? '/dashboard' : '/login'}
            className="text-sm font-mono opacity-60 hover:opacity-100 hover:text-accent transition-all"
          >
            {user ? 'Manage in Dashboard →' : 'Sign In to View All →'}
          </Link>
        </div>

        {loading ? (
          <div className="py-20 text-center opacity-60 text-xs font-mono">Loading events from Arena board...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {events.map((event, i) => (
              <EventCard key={event._id || event.title} event={event} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* About Arena Section */}
      <section id="about" className="px-6 md:px-12 py-20 border-t border-border-light/60 dark:border-border-dark/60 scroll-mt-24 bg-black/[0.02] dark:bg-white/[0.02]">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-3 text-center md:text-left">
            <span className="font-mono text-xs uppercase tracking-widest text-accent font-bold">About Arena.AIML</span>
            <h2 className="font-display text-3xl md:text-4xl font-semibold">Intelligent event management for modern campuses.</h2>
            <p className="text-sm md:text-base opacity-75 leading-relaxed">
              Arena is designed for students, faculty organizers, and academic administrators. We streamline event coordination with integrated AI copywriting, poster rendering, automated email campaigns, and multi-signal personalized recommendations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
            <div className="p-6 rounded-3xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-[#1A1A1E] space-y-2.5">
              <Sparkles size={20} className="text-accent" />
              <h3 className="font-display text-lg font-semibold">AI Creative Hub</h3>
              <p className="text-xs opacity-70 leading-relaxed">
                Automated copy generation, prompt engineering playground, and multi-format poster design.
              </p>
            </div>
            <div className="p-6 rounded-3xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-[#1A1A1E] space-y-2.5">
              <Calendar size={20} className="text-cyan-500" />
              <h3 className="font-display text-lg font-semibold">Live Moderation</h3>
              <p className="text-xs opacity-70 leading-relaxed">
                Faculty event draft submission, deanery administrative review, and instant published updates.
              </p>
            </div>
            <div className="p-6 rounded-3xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-[#1A1A1E] space-y-2.5">
              <ShieldCheck size={20} className="text-emerald-500" />
              <h3 className="font-display text-lg font-semibold">Smart Registrations</h3>
              <p className="text-xs opacity-70 leading-relaxed">
                One-click enrollment, capacity tracking, attendance confirmation, and NLP feedback analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="px-6 md:px-12 py-20 border-t border-border-light/60 dark:border-border-dark/60 scroll-mt-24">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-3">
            <span className="font-mono text-xs uppercase tracking-widest text-accent font-bold">Get In Touch</span>
            <h2 className="font-display text-3xl font-semibold">Have questions or feedback?</h2>
            <p className="text-sm opacity-70 max-w-md leading-relaxed">
              Reach out to the Arena AIML campus team or connect directly with your department event coordinator.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-[#1A1A1E] space-y-3 text-xs font-mono shrink-0">
            <div className="flex items-center gap-2.5">
              <Mail size={15} className="text-accent" />
              <span>events@arena.aiml</span>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin size={15} className="text-accent" />
              <span>AIML Innovation Center, Campus Hub</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone size={15} className="text-accent" />
              <span>+91 (0) 80-2026-AIML</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-8 border-t border-border-light/40 dark:border-border-dark/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono opacity-60">
        <p>© 2026 Arena AIML Platform. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <a href="#events" className="hover:text-accent">Events</a>
          <a href="#about" className="hover:text-accent">About</a>
          <a href="#contact" className="hover:text-accent">Contact</a>
        </div>
      </footer>
    </div>
  );
};

export default Landing;