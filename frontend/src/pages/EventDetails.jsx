import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Share2,
  Check,
  Tag,
} from 'lucide-react';
import api, { getErrorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [registering, setRegistering] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;

    api.get(`/events/${id}`)
      .then((res) => {
        if (isMounted) {
          setEvent(res.data.event);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(getErrorMessage(err, 'Event not found or failed to load.'));
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);


  const handleRegister = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setRegistering(true);
    setRegisterError('');
    setRegisterSuccess('');

    try {
      const res = await api.post(`/registrations/${id}`);
      setRegisterSuccess(res.data?.message || 'Successfully registered for this event!');
      // Refresh event data to update participant counts
      const updatedRes = await api.get(`/events/${id}`);
      setEvent(updatedRes.data.event);
    } catch (err) {
      setRegisterError(getErrorMessage(err, 'Failed to register for event.'));
    } finally {
      setRegistering(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const isDeadlinePassed = event?.registrationDeadline
    ? new Date() > new Date(event.registrationDeadline)
    : false;

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-ink-light dark:text-ink-dark">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Back navigation & Share */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-mono opacity-70 hover:opacity-100 hover:text-accent transition-colors"
          >
            <ArrowLeft size={16} /> Back to Events
          </button>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-border-light dark:border-border-dark bg-white dark:bg-[#1A1A1E] text-xs font-mono hover:border-accent hover:text-accent transition-colors"
          >
            {copied ? <Check size={14} className="text-green-500" /> : <Share2 size={14} />}
            <span>{copied ? 'Link Copied' : 'Share Event'}</span>
          </button>
        </div>

        {loading ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="font-display text-sm font-semibold">Loading event details...</p>
            <p className="text-xs opacity-60">Connecting to Arena event records</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center rounded-3xl border border-rose-500/20 bg-rose-500/5 space-y-4">
            <AlertCircle size={40} className="mx-auto text-rose-500" />
            <h2 className="font-display text-xl font-semibold">Unable to Load Event</h2>
            <p className="text-xs md:text-sm opacity-75 max-w-md mx-auto">{error}</p>
            <Link
              to="/dashboard"
              className="inline-block px-5 py-2.5 rounded-full bg-accent text-white text-xs font-medium hover:opacity-90 transition-opacity"
            >
              Return to Dashboard
            </Link>
          </div>
        ) : event ? (
          <motion.article
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Header info */}
            <div className="p-6 md:p-8 rounded-3xl border border-border-light dark:border-border-dark bg-white dark:bg-[#1A1A1E] shadow-sm space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-mono text-xs uppercase bg-sticker text-ink-light px-3 py-1 rounded-full font-bold">
                  {event.category}
                </span>
                <span
                  className={`font-mono text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                    event.status === 'approved'
                      ? 'bg-green-500/10 text-green-500'
                      : event.status === 'rejected'
                      ? 'bg-rose-500/10 text-rose-500'
                      : 'bg-amber-500/10 text-amber-500'
                  }`}
                >
                  {event.status}
                </span>
                {event.department && (
                  <span className="text-xs font-mono opacity-60">
                    Dept: {event.department}
                  </span>
                )}
              </div>

              <h1 className="font-display text-3xl md:text-4xl font-semibold leading-tight">
                {event.title}
              </h1>

              <div className="text-xs font-mono opacity-60">
                Organized by: <span className="font-semibold">{event.createdBy?.name || 'Faculty Organizer'}</span>
                {event.createdBy?.department && ` (${event.createdBy.department})`}
              </div>
            </div>

            {/* Event Key Parameters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl border border-border-light dark:border-border-dark bg-white dark:bg-[#1A1A1E] space-y-1">
                <span className="text-xs font-mono uppercase tracking-wider opacity-60 flex items-center gap-1.5">
                  <Calendar size={13} className="text-accent" /> Date
                </span>
                <p className="font-display text-sm font-semibold">
                  {new Date(event.startDate).toLocaleDateString('en-IN', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
                {event.endDate && event.endDate !== event.startDate && (
                  <p className="text-[11px] opacity-60 font-mono">
                    to {new Date(event.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                )}
              </div>

              <div className="p-5 rounded-2xl border border-border-light dark:border-border-dark bg-white dark:bg-[#1A1A1E] space-y-1">
                <span className="text-xs font-mono uppercase tracking-wider opacity-60 flex items-center gap-1.5">
                  <MapPin size={13} className="text-accent" /> Venue
                </span>
                <p className="font-display text-sm font-semibold truncate">{event.venue}</p>
              </div>

              <div className="p-5 rounded-2xl border border-border-light dark:border-border-dark bg-white dark:bg-[#1A1A1E] space-y-1">
                <span className="text-xs font-mono uppercase tracking-wider opacity-60 flex items-center gap-1.5">
                  <Users size={13} className="text-accent" /> Capacity
                </span>
                <p className="font-display text-sm font-semibold">
                  {event.maxParticipants ? `${event.maxParticipants} Seats` : 'Open'}
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-border-light dark:border-border-dark bg-white dark:bg-[#1A1A1E] space-y-1">
                <span className="text-xs font-mono uppercase tracking-wider opacity-60 flex items-center gap-1.5">
                  Fee
                </span>
                <p className="font-display text-base font-bold text-accent">
                  {event.fee === 0 ? 'Free Entry' : `₹${event.fee}`}
                </p>
              </div>
            </div>

            {/* Full Description & Details */}
            <div className="p-6 md:p-8 rounded-3xl border border-border-light dark:border-border-dark bg-white dark:bg-[#1A1A1E] shadow-sm space-y-6">
              <div>
                <h2 className="font-display text-lg font-semibold mb-3">About This Event</h2>
                <p className="text-sm md:text-base opacity-80 leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </div>

              {event.tags && event.tags.length > 0 && (
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider opacity-60 mb-2 flex items-center gap-1.5">
                    <Tag size={12} /> Relevant Topics
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-mono px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-border-light dark:border-border-dark"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {event.registrationDeadline && (
                <div className="pt-4 border-t border-border-light dark:border-border-dark flex items-center gap-2 text-xs font-mono opacity-70">
                  <Clock size={14} className="text-amber-500" />
                  <span>
                    Registration Deadline: {new Date(event.registrationDeadline).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Registration Callout Box */}
            <div className="p-6 md:p-8 rounded-3xl border border-accent/30 bg-gradient-to-br from-accent/10 via-transparent to-accent/5 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-xl font-semibold">Join This Event</h3>
                  <p className="text-xs md:text-sm opacity-75">
                    {event.fee === 0
                      ? 'Free entry for verified college students with instant confirmation.'
                      : `Registration fee: ₹${event.fee}.`}
                  </p>
                </div>

                <div>
                  {user?.role === 'student' ? (
                    <button
                      onClick={handleRegister}
                      disabled={registering || isDeadlinePassed || event.status !== 'approved'}
                      className="w-full sm:w-auto px-8 py-3 rounded-full bg-accent text-white font-medium text-xs font-mono hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                    >
                      {registering ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Processing Registration...</span>
                        </>
                      ) : isDeadlinePassed ? (
                        'Registration Closed'
                      ) : event.status !== 'approved' ? (
                        'Event Not Open'
                      ) : (
                        'Confirm Registration'
                      )}
                    </button>
                  ) : user ? (
                    <span className="text-xs font-mono opacity-70 px-4 py-2 rounded-full border border-border-light dark:border-border-dark bg-white dark:bg-[#1A1A1E]">
                      Logged in as {user.role?.toUpperCase()}
                    </span>
                  ) : (
                    <Link
                      to="/login"
                      className="w-full sm:w-auto px-8 py-3 rounded-full bg-accent text-white font-medium text-xs font-mono hover:opacity-90 transition-all inline-flex items-center justify-center gap-2 shadow-lg"
                    >
                      Sign In to Register →
                    </Link>
                  )}
                </div>
              </div>

              {registerSuccess && (
                <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-500 text-xs flex items-center gap-2 font-medium">
                  <CheckCircle2 size={16} /> {registerSuccess}
                </div>
              )}

              {registerError && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle size={16} /> {registerError}
                </div>
              )}
            </div>
          </motion.article>
        ) : null}
      </main>
    </div>
  );
};

export default EventDetails;
