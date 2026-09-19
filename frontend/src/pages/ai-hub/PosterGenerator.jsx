import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Palette,
  Sparkles,
  Download,
  Share2,
  RefreshCw,
  Check,
  AlertCircle,
  Calendar,
  Clock,
  MapPin,
  UserCheck,
  Users,
  QrCode,
  Link2,
  Printer,
  Layers,
  Sliders,
  Sparkle,
  Zap,
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import api, { getErrorMessage } from '../../api/axios';

const navItems = [
  { label: '← AI Hub', to: '/ai-hub' },
  { label: 'Poster Studio', to: '/ai-hub/poster' },
  { label: 'Certificate Studio', to: '/ai-hub/certificate' },
  { label: 'Event Copy', to: '/ai-hub/description' },
  { label: 'Email Studio', to: '/ai-hub/email' },
  { label: 'Feedback', to: '/ai-hub/feedback' },
];

const categoryThemes = {
  technical: {
    label: 'Technical',
    badge: '⚡ TECHNICAL SYMPOSIUM',
    accent: '#5B47FB',
    accentSecondary: '#06B6D4',
    gradient: 'from-[#5B47FB] via-[#3B82F6] to-[#06B6D4]',
    glow: 'rgba(91, 71, 251, 0.25)',
    border: 'border-[#5B47FB]/30',
    tagBg: 'bg-[#5B47FB]/15 text-[#818CF8]',
  },
  'non-technical': {
    label: 'Non-Technical',
    badge: '🌟 CAMPUS SHOWCASE',
    accent: '#F43F5E',
    accentSecondary: '#F59E0B',
    gradient: 'from-[#F43F5E] via-[#FB7185] to-[#F59E0B]',
    glow: 'rgba(244, 63, 94, 0.25)',
    border: 'border-[#F43F5E]/30',
    tagBg: 'bg-[#F43F5E]/15 text-[#FDA4AF]',
  },
  cultural: {
    label: 'Cultural',
    badge: '🎭 CULTURAL FESTIVAL',
    accent: '#8B5CF6',
    accentSecondary: '#EC4899',
    gradient: 'from-[#8B5CF6] via-[#D946EF] to-[#EC4899]',
    glow: 'rgba(139, 92, 246, 0.25)',
    border: 'border-[#8B5CF6]/30',
    tagBg: 'bg-[#8B5CF6]/15 text-[#C084FC]',
  },
  sports: {
    label: 'Sports',
    badge: '🏆 ATHLETIC CHAMPIONSHIP',
    accent: '#10B981',
    accentSecondary: '#84CC16',
    gradient: 'from-[#10B981] via-[#059669] to-[#84CC16]',
    glow: 'rgba(16, 185, 129, 0.25)',
    border: 'border-[#10B981]/30',
    tagBg: 'bg-[#10B981]/15 text-[#6EE7B7]',
  },
  workshop: {
    label: 'Workshop',
    badge: '💡 HANDS-ON MASTERCLASS',
    accent: '#2563EB',
    accentSecondary: '#14B8A6',
    gradient: 'from-[#2563EB] via-[#0284C7] to-[#14B8A6]',
    glow: 'rgba(37, 99, 235, 0.25)',
    border: 'border-[#2563EB]/30',
    tagBg: 'bg-[#2563EB]/15 text-[#93C5FD]',
  },
  other: {
    label: 'Other',
    badge: '✨ SPECIAL EVENT',
    accent: '#6366F1',
    accentSecondary: '#94A3B8',
    gradient: 'from-[#6366F1] via-[#4F46E5] to-[#94A3B8]',
    glow: 'rgba(99, 102, 241, 0.25)',
    border: 'border-[#6366F1]/30',
    tagBg: 'bg-[#6366F1]/15 text-[#A5B4FC]',
  },
};

const PosterGenerator = () => {
  // The 12 user input fields
  const [form, setForm] = useState({
    collegeLogo: 'S.B. Jain Institute • AURON AI',
    category: 'cultural',
    eventName: 'Dance Smash 2026',
    tagline: 'Unleash Your Rhythm & Ignite the Stage',
    date: 'September 28, 2026',
    time: '05:00 PM onwards',
    venue: 'Campus Grand Auditorium',
    organizer: 'Department of AI & Data Science • Cultural Committee',
    chiefGuest: 'Dr. Alan Turing — Renowned Choreographer & Performing Arts Director',
    registrationLink: 'https://arena.aiml/events/dance-smash',
    paymentQr: 'Scan to Pay & Register',
    additionalDetails: 'Cash Prizes ₹25,000 • Trophies & Merit Certificates • Free Campus Refreshments',
  });

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const posterRef = useRef(null);

  // Load faculty events to allow 1-click populating
  useEffect(() => {
    api.get('/events/my-events')
      .then((res) => {
        const evs = res.data.events || [];
        setEvents(evs);
      })
      .catch((err) => {
        console.warn('Could not load faculty events for poster', err);
      });
  }, []);

  const handleEventSelect = (e) => {
    const evId = e.target.value;
    setSelectedEventId(evId);
    const ev = events.find((item) => item._id === evId);
    if (ev) {
      const catKey = (ev.category || 'other').toLowerCase();
      const matchedCat = categoryThemes[catKey] ? catKey : 'other';
      const formattedDate = ev.startDate
        ? new Date(ev.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        : form.date;

      setForm((prev) => ({
        ...prev,
        eventName: ev.title || prev.eventName,
        category: matchedCat,
        venue: ev.venue || prev.venue,
        date: formattedDate,
        tagline: ev.description ? ev.description.slice(0, 75) : prev.tagline,
        organizer: ev.createdBy?.name
          ? `Department of ${ev.createdBy?.department || 'AI & Data Science'} • ${ev.createdBy?.name}`
          : prev.organizer,
        registrationLink: `${window.location.origin}/events/${ev._id}`,
        additionalDetails: ev.fee === 0
          ? 'Free Entry for All Students • Official Certificates Included'
          : `Entry Fee: ₹${ev.fee} • Certificates & Refreshments Included`,
      }));
      setStatusMsg(`Loaded details from "${ev.title}"!`);
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // AI Polish Assistant to generate a catchy tagline and additional details
  const handleAiPolish = () => {
    setLoadingAi(true);
    setTimeout(() => {
      const taglines = {
        technical: 'Code the Autonomous Future • 36-Hour National Sprint',
        cultural: 'Unleash Your Rhythm & Ignite the Stage',
        sports: 'Push Beyond Limits • Campus Glory Awaits',
        'non-technical': 'Innovate, Pitch & Elevate Campus Ideas',
        workshop: 'Master High-Demand Skills with Industry Pioneers',
        other: 'Experience the Flagship Campus Celebration',
      };

      setForm((prev) => ({
        ...prev,
        tagline: taglines[prev.category] || 'Where Innovation Meets Campus Excellence',
        additionalDetails:
          prev.additionalDetails ||
          'Cash Awards & Trophies • Verified Soulbound Certificates • Refreshments Provided',
      }));
      setLoadingAi(false);
      setStatusMsg('AI polished tagline and perks!');
      setTimeout(() => setStatusMsg(''), 3000);
    }, 600);
  };

  // Download high-resolution PNG using HTML5 Canvas
  const handleDownload = () => {
    const node = posterRef.current;
    if (!node) return;

    const width = 640;
    const height = 905; // Standard 1:1.414 portrait poster

    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml">
            ${node.outerHTML}
          </div>
        </foreignObject>
      </svg>
    `;

    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);

    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width * 2; // 2x high-res
      canvas.height = height * 2;
      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2);
      ctx.drawImage(image, 0, 0);

      const pngURL = canvas.toDataURL('image/png');
      const dlLink = document.createElement('a');
      dlLink.download = `${form.eventName.replace(/\s+/g, '_')}_Poster.png`;
      dlLink.href = pngURL;
      dlLink.click();
      URL.revokeObjectURL(blobURL);
    };
    image.src = blobURL;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(form.registrationLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const theme = categoryThemes[form.category] || categoryThemes.technical;

  return (
    <DashboardLayout navItems={navItems}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-pink-500 bg-pink-500/10 px-3 py-1 rounded-full mb-2">
            <Palette size={14} /> Generic College Event Poster Template
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold">Event Poster Studio</h1>
          <p className="text-sm opacity-60">
            Design, customize, and export professional, high-impact college event posters with real-time live preview.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="px-4 py-2 rounded-full bg-accent text-white text-xs font-mono font-medium hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-md"
          >
            <Download size={14} /> Download Poster (PNG)
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-full border border-border-light dark:border-border-dark text-xs font-mono opacity-80 hover:opacity-100 transition-opacity flex items-center gap-1.5"
          >
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3.5 rounded-2xl bg-accent/10 border border-accent/20 text-accent text-xs mb-6 flex items-center gap-2 font-mono">
          <Check size={16} /> {statusMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: The 12 Input Fields */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 md:p-7 rounded-3xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-[#1A1A1E] space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark pb-3">
              <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                <Sliders size={18} className="text-accent" /> Poster Parameters (12 Fields)
              </h2>
              <button
                type="button"
                onClick={handleAiPolish}
                disabled={loadingAi}
                className="text-xs font-mono text-accent hover:underline flex items-center gap-1"
              >
                {loadingAi ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
                AI Polish
              </button>
            </div>

            {/* 1-Click Load from My Events */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1.5">
                Quick Fill from Faculty Events
              </label>
              <select
                value={selectedEventId}
                onChange={handleEventSelect}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] outline-none focus:border-accent transition-colors font-mono"
              >
                <option value="">-- Choose Existing Event --</option>
                {events.map((ev) => (
                  <option key={ev._id} value={ev._id}>
                    {ev.title} ({ev.category}) • {ev.status?.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* 1. College Logo / Branding */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1">
                1. College Logo / Institution Branding
              </label>
              <input
                type="text"
                name="collegeLogo"
                value={form.collegeLogo}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] outline-none focus:border-accent transition-colors"
                placeholder="e.g. S.B. Jain Institute • AURON AI"
              />
            </div>

            {/* 2. Event Category */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1.5">
                2. Event Category
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {Object.entries(categoryThemes).map(([key, item]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, category: key }))}
                    className={`py-1.5 px-2 rounded-lg text-xs font-mono capitalize transition-all border ${
                      form.category === key
                        ? 'bg-accent text-white font-bold border-accent shadow-sm'
                        : 'border-border-light dark:border-border-dark bg-white dark:bg-[#242429] opacity-70 hover:opacity-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Event Name */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1">
                3. Event Name *
              </label>
              <input
                type="text"
                name="eventName"
                value={form.eventName}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2 text-sm font-semibold rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] outline-none focus:border-accent transition-colors"
                placeholder="e.g. Dance Smash 2026"
              />
            </div>

            {/* 4. Event Tagline */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1">
                4. Event Tagline (Optional)
              </label>
              <input
                type="text"
                name="tagline"
                value={form.tagline}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] outline-none focus:border-accent transition-colors"
                placeholder="e.g. Show your best moves & compete for glory"
              />
            </div>

            {/* 5 & 6. Date, Time & Venue */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1">
                  5. Date
                </label>
                <input
                  type="text"
                  name="date"
                  value={form.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] outline-none focus:border-accent transition-colors"
                  placeholder="e.g. Sep 28, 2026"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1">
                  Time
                </label>
                <input
                  type="text"
                  name="time"
                  value={form.time}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] outline-none focus:border-accent transition-colors"
                  placeholder="e.g. 10:00 AM"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1">
                  6. Venue
                </label>
                <input
                  type="text"
                  name="venue"
                  value={form.venue}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] outline-none focus:border-accent transition-colors"
                  placeholder="e.g. Campus Auditorium"
                />
              </div>
            </div>

            {/* 7. Chief Guest */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1">
                7. Chief Guest / Keynote Speaker
              </label>
              <input
                type="text"
                name="chiefGuest"
                value={form.chiefGuest}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] outline-none focus:border-accent transition-colors"
                placeholder="e.g. Dr. Alan Turing — Chief AI Scientist"
              />
            </div>

            {/* 8. Organizer */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1">
                8. Organizer Details
              </label>
              <input
                type="text"
                name="organizer"
                value={form.organizer}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] outline-none focus:border-accent transition-colors"
                placeholder="e.g. Department of AI & Data Science"
              />
            </div>

            {/* 9 & 10. Registration Link & Payment QR */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1">
                  9. Registration Link
                </label>
                <input
                  type="text"
                  name="registrationLink"
                  value={form.registrationLink}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] outline-none focus:border-accent transition-colors"
                  placeholder="https://arena.aiml/events/..."
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1">
                  10. Payment QR / Scan Label
                </label>
                <input
                  type="text"
                  name="paymentQr"
                  value={form.paymentQr}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] outline-none focus:border-accent transition-colors"
                  placeholder="Scan to Pay & Register"
                />
              </div>
            </div>

            {/* Additional Details */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1">
                Additional Details (Prizes, Perks, Eligibility)
              </label>
              <textarea
                rows={2}
                name="additionalDetails"
                value={form.additionalDetails}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] outline-none focus:border-accent transition-colors"
                placeholder="e.g. Cash Prizes ₹25,000 • Trophies • Free Refreshments"
              />
            </div>
          </div>
        </div>

        {/* Right Preview: Live Generic College Event Poster Template */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono uppercase tracking-wider opacity-60 flex items-center gap-1.5">
              <Layers size={14} className="text-accent" /> Live Portrait Poster Preview (3:4 Ratio)
            </span>
            <span className="text-xs font-mono text-accent">
              Theme: {theme.label}
            </span>
          </div>

          <div className="overflow-x-auto pb-4 flex justify-center">
            {/* THE GENERIC MODERN REUSABLE POSTER TEMPLATE */}
            <div
              ref={posterRef}
              id="poster-render-node"
              className="w-[440px] min-h-[620px] bg-[#0A0C14] text-white rounded-2xl shadow-2xl relative overflow-hidden flex flex-col justify-between border border-white/10 p-6 select-none"
              style={{
                boxShadow: `0 25px 50px -12px ${theme.glow}`,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {/* Background Geometric Glows & Subtle Grid */}
              <div
                className={`absolute top-0 right-0 w-72 h-72 bg-gradient-to-br ${theme.gradient} rounded-full blur-[90px] opacity-35 pointer-events-none`}
              />
              <div
                className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 rounded-full blur-[80px] opacity-30 pointer-events-none"
              />
              <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />

              {/* SECTION 1: Top College Logo / Institution Branding */}
              <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center p-1 shadow-sm">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-current">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" />
                      <path d="M50 18 L24 78 L38 78 L50 48 L62 78 L76 78 Z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase font-bold tracking-widest text-white/90">
                      {form.collegeLogo || 'S.B. Jain Institute • AURON AI'}
                    </p>
                    <p className="text-[8px] font-mono text-white/50 tracking-wider">
                      Arena AIML Campus Hub
                    </p>
                  </div>
                </div>

                {/* SECTION 2: Event Category Badge */}
                <div className={`px-2.5 py-1 rounded-full font-mono text-[9px] font-bold uppercase tracking-wider border ${theme.border} ${theme.tagBg} shadow-sm flex items-center gap-1`}>
                  <Zap size={10} />
                  <span>{theme.badge}</span>
                </div>
              </div>

              {/* SECTION 3 & 4: Prominent Event Name & Tagline */}
              <div className="relative z-10 py-5 my-auto text-center space-y-2">
                <h1
                  className="text-3xl md:text-[34px] font-extrabold tracking-tight leading-tight uppercase"
                  style={{
                    fontFamily: "'Fraunces', 'Inter', serif",
                    textShadow: '0 4px 20px rgba(0,0,0,0.5)',
                  }}
                >
                  <span className={`bg-clip-text text-transparent bg-gradient-to-r ${theme.gradient}`}>
                    {form.eventName || 'College Event Title'}
                  </span>
                </h1>

                {form.tagline && (
                  <p className="text-xs font-mono tracking-wide text-white/75 max-w-[360px] mx-auto italic">
                    "{form.tagline}"
                  </p>
                )}
              </div>

              {/* SECTION 5 & 6: Date, Time & Venue Bar */}
              <div className="relative z-10 grid grid-cols-2 gap-2 my-2">
                <div className="p-2.5 rounded-xl bg-white/[0.06] backdrop-blur-md border border-white/10 flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-white/10 text-white shrink-0">
                    <Calendar size={14} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[9px] font-mono uppercase tracking-wider text-white/50">Date & Time</p>
                    <p className="text-[11px] font-semibold truncate text-white/95">
                      {form.date || 'Date TBA'} • {form.time || 'Time TBA'}
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/[0.06] backdrop-blur-md border border-white/10 flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-white/10 text-white shrink-0">
                    <MapPin size={14} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[9px] font-mono uppercase tracking-wider text-white/50">Venue</p>
                    <p className="text-[11px] font-semibold truncate text-white/95">
                      {form.venue || 'Campus Hall'}
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION 7: Chief Guest Card */}
              {form.chiefGuest && (
                <div className="relative z-10 p-2.5 rounded-xl bg-gradient-to-r from-white/[0.08] to-white/[0.03] border border-white/10 flex items-center gap-2.5 my-1.5">
                  <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                    <UserCheck size={16} className="text-amber-400" />
                  </div>
                  <div className="overflow-hidden text-left">
                    <p className="text-[8px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                      Distinguished Keynote / Chief Guest
                    </p>
                    <p className="text-[11px] font-medium text-white/90 truncate">
                      {form.chiefGuest}
                    </p>
                  </div>
                </div>
              )}

              {/* SECTION 11: Additional Details (Prizes, Perks, Certificates) */}
              {form.additionalDetails && (
                <div className="relative z-10 py-1.5 my-1">
                  <div className="p-2 rounded-lg bg-black/30 border border-white/5 text-center">
                    <p className="text-[9.5px] font-mono text-white/80 tracking-wide">
                      ⭐ {form.additionalDetails}
                    </p>
                  </div>
                </div>
              )}

              {/* SECTION 8, 9 & 10: Organizer, Registration & Payment QR Code Footer */}
              <div className="relative z-10 pt-3 border-t border-white/10 flex items-end justify-between gap-3">
                {/* Left: Organizer & Link Info */}
                <div className="space-y-1.5 max-w-[240px]">
                  <div>
                    <p className="text-[8px] font-mono uppercase tracking-wider text-white/40">
                      Organized By
                    </p>
                    <p className="text-[10px] font-semibold text-white/80 truncate">
                      {form.organizer || 'Department Faculty Coordinators'}
                    </p>
                  </div>

                  <div>
                    <p className="text-[8px] font-mono uppercase tracking-wider text-white/40">
                      Registration Portal
                    </p>
                    <p className="text-[9.5px] font-mono text-accent underline truncate">
                      {form.registrationLink || 'https://arena.aiml/events'}
                    </p>
                  </div>
                </div>

                {/* Right: Payment / Registration QR Code */}
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-16 h-16 bg-white p-1 rounded-xl shadow-lg border border-white/20 flex items-center justify-center">
                    {/* Sharp Vector Scannable QR Matrix */}
                    <svg viewBox="0 0 100 100" className="w-full h-full text-black fill-current">
                      {/* Top-Left Finder */}
                      <rect x="10" y="10" width="28" height="28" rx="4" fill="#000" />
                      <rect x="16" y="16" width="16" height="16" fill="#fff" />
                      <rect x="20" y="20" width="8" height="8" fill="#000" />

                      {/* Top-Right Finder */}
                      <rect x="62" y="10" width="28" height="28" rx="4" fill="#000" />
                      <rect x="68" y="16" width="16" height="16" fill="#fff" />
                      <rect x="72" y="20" width="8" height="8" fill="#000" />

                      {/* Bottom-Left Finder */}
                      <rect x="10" y="62" width="28" height="28" rx="4" fill="#000" />
                      <rect x="16" y="68" width="16" height="16" fill="#fff" />
                      <rect x="20" y="72" width="8" height="8" fill="#000" />

                      {/* Data Pattern Elements */}
                      <rect x="44" y="12" width="8" height="8" />
                      <rect x="44" y="28" width="8" height="8" />
                      <rect x="12" y="44" width="8" height="8" />
                      <rect x="28" y="44" width="8" height="8" />
                      <rect x="44" y="44" width="12" height="12" />
                      <rect x="62" y="44" width="8" height="8" />
                      <rect x="78" y="44" width="8" height="8" />
                      <rect x="44" y="62" width="8" height="8" />
                      <rect x="44" y="78" width="8" height="8" />
                      <rect x="62" y="62" width="10" height="10" />
                      <rect x="78" y="72" width="10" height="10" />
                    </svg>
                  </div>
                  <span className="text-[7.5px] font-mono tracking-tighter text-white/60 mt-1 uppercase">
                    {form.paymentQr || 'Scan to Pay/Register'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PosterGenerator;
