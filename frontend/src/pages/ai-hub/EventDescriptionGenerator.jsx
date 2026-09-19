import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Share2,
  Sliders,
  CheckCircle2,
  Hash,
  Globe,
  Tag,
  AlertCircle,
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';

const navItems = [
  { label: '← AI Hub', to: '/ai-hub' },
  { label: 'Poster Studio', to: '/ai-hub/poster' },
  { label: 'Event Copy', to: '/ai-hub/description' },
  { label: 'Email Studio', to: '/ai-hub/email' },
  { label: 'Feedback', to: '/ai-hub/feedback' },
  { label: 'Recommendations', to: '/ai-hub/recommendations' },
];

const EventDescriptionGenerator = () => {
  const [form, setForm] = useState({
    eventName: 'Autonomous AI Agents Hackathon 2026',
    category: 'Technical',
    date: '2026-10-24',
    time: '10:00 AM',
    venue: 'Arena AI Research Complex, Hall 4',
    organizer: 'Arena AIML Society',
    targetAudience: 'Engineering undergraduates, AI developers, and data science researchers',
    mainTopic: 'Building Multi-Agent Workflows & Real-Time Autonomous Systems',
    objectives: 'Hands-on practical development, mentorship with AI researchers, project certification, and networking.',
    keyActivities: 'Keynote lecture on Agentic Reasoning, 24-hr build marathon, mentor code reviews, project pitch presentations.',
    tone: 'Inspiring, highly technical yet accessible, welcoming, and high-energy',
    desiredLength: 'Comprehensive (approx 250 words with bullet points)',
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copiedKey, setCopiedKey] = useState('');

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGenerate = async () => {
    if (!form.eventName.trim()) {
      setError('Please provide an Event Name.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await api.post('/ai/event/description', form);
      setResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate event description.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2500);
  };

  const copyAll = () => {
    if (!result) return;
    const fullText = `
${result.short_description}

${result.long_description}

HIGHLIGHTS:
${(result.highlights || []).map((h) => `• ${h}`).join('\n')}

CALL TO ACTION: ${result.call_to_action}

SOCIAL CAPTION:
${result.social_caption}

TAGS: ${(result.hashtags || []).join(' ')}
    `.trim();

    copyToClipboard(fullText, 'all');
  };

  return (
    <DashboardLayout navItems={navItems}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full mb-2">
            <FileText size={14} /> AI Event Copy Studio
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold">Generate Structured Event Copy</h1>
          <p className="text-sm opacity-60">Generate descriptions, highlights, social posts, CTA hooks, and SEO metadata.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Column */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 md:p-8 rounded-3xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-[#1A1A1E] space-y-4">
            <h2 className="font-display text-lg font-semibold flex items-center gap-2">
              <Sliders size={18} className="text-accent" /> Event Brief
            </h2>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1.5">Event Name *</label>
                <input
                  type="text"
                  name="eventName"
                  value={form.eventName}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] outline-none focus:border-accent transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1.5">Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] outline-none focus:border-accent transition-colors"
                >
                  <option value="Technical">Technical</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Sports">Sports</option>
                  <option value="Seminar">Seminar</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1.5">Date</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] outline-none focus:border-accent transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1.5">Time</label>
                <input
                  type="text"
                  name="time"
                  value={form.time}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] outline-none focus:border-accent transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1.5">Venue</label>
                <input
                  type="text"
                  name="venue"
                  value={form.venue}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1.5">Target Audience</label>
              <input
                type="text"
                name="targetAudience"
                value={form.targetAudience}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] outline-none focus:border-accent transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1.5">Key Objectives</label>
              <textarea
                name="objectives"
                value={form.objectives}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] outline-none focus:border-accent transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1.5">Key Activities / Schedule Highlights</label>
              <textarea
                name="keyActivities"
                value={form.keyActivities}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] outline-none focus:border-accent transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1.5">Desired Tone</label>
                <input
                  type="text"
                  name="tone"
                  value={form.tone}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] outline-none focus:border-accent transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1.5">Desired Length</label>
                <select
                  name="desiredLength"
                  value={form.desiredLength}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] outline-none focus:border-accent transition-colors"
                >
                  <option value="Short & Punchy (100 words)">Short & Punchy (100 words)</option>
                  <option value="Standard (200 words)">Standard (200 words)</option>
                  <option value="Comprehensive (300+ words)">Comprehensive (300+ words)</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-3 px-6 rounded-full bg-accent text-white font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" /> Synthesizing Structured Copy...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} /> GENERATE EVENT COPY
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Output Column */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 md:p-8 rounded-3xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-[#1A1A1E] space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Structured Copy Output</h2>
              {result && (
                <button
                  onClick={copyAll}
                  className="text-xs font-mono px-3 py-1.5 rounded-full border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] hover:border-accent hover:text-accent transition-colors flex items-center gap-1.5"
                >
                  {copiedKey === 'all' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  {copiedKey === 'all' ? 'COPIED ALL' : 'COPY ALL'}
                </button>
              )}
            </div>

            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                <p className="font-display text-sm font-semibold">Drafting copy with Google Gemini...</p>
                <p className="text-xs opacity-60">Extracting key activities, highlights, and social tags</p>
              </div>
            ) : result ? (
              <div className="space-y-6">
                {/* 1. Elevator Pitch */}
                <div className="p-4 rounded-2xl bg-white dark:bg-[#242429] border border-border-light dark:border-border-dark space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono opacity-60">
                    <span className="uppercase tracking-wider">1. Short Elevator Pitch</span>
                    <button
                      onClick={() => copyToClipboard(result.short_description, 'short')}
                      className="hover:text-accent transition-colors"
                    >
                      {copiedKey === 'short' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <p className="font-display text-sm font-semibold leading-relaxed text-accent">
                    "{result.short_description}"
                  </p>
                </div>

                {/* 2. Detailed Description */}
                <div className="p-4 rounded-2xl bg-white dark:bg-[#242429] border border-border-light dark:border-border-dark space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono opacity-60">
                    <span className="uppercase tracking-wider">2. Full Description</span>
                    <button
                      onClick={() => copyToClipboard(result.long_description, 'long')}
                      className="hover:text-accent transition-colors"
                    >
                      {copiedKey === 'long' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <p className="text-xs md:text-sm opacity-80 whitespace-pre-line leading-relaxed">
                    {result.long_description}
                  </p>
                </div>

                {/* 3. Event Highlights */}
                {result.highlights && result.highlights.length > 0 && (
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#242429] border border-border-light dark:border-border-dark space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono opacity-60">
                      <span className="uppercase tracking-wider">3. Event Highlights</span>
                      <button
                        onClick={() => copyToClipboard(result.highlights.join('\n'), 'highlights')}
                        className="hover:text-accent transition-colors"
                      >
                        {copiedKey === 'highlights' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                      </button>
                    </div>
                    <ul className="space-y-1.5 text-xs md:text-sm">
                      {result.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 size={16} className="text-accent shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 4. Social Caption & Hashtags */}
                <div className="p-4 rounded-2xl bg-white dark:bg-[#242429] border border-border-light dark:border-border-dark space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono opacity-60">
                    <span className="uppercase tracking-wider">4. Social Media Caption</span>
                    <button
                      onClick={() => copyToClipboard(result.social_caption, 'social')}
                      className="hover:text-accent transition-colors"
                    >
                      {copiedKey === 'social' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <p className="text-xs md:text-sm italic opacity-90 leading-relaxed">
                    {result.social_caption}
                  </p>
                  {result.hashtags && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {result.hashtags.map((tag, i) => (
                        <span key={i} className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                          {tag.startsWith('#') ? tag : `#${tag}`}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* 5. Call To Action & SEO */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#242429] border border-border-light dark:border-border-dark space-y-1">
                    <span className="text-[11px] font-mono uppercase tracking-wider opacity-60">5. Call to Action</span>
                    <p className="font-semibold text-xs text-accent">{result.call_to_action}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-[#242429] border border-border-light dark:border-border-dark space-y-1">
                    <span className="text-[11px] font-mono uppercase tracking-wider opacity-60">6. SEO Meta Description</span>
                    <p className="text-xs opacity-75">{result.seo_description || result.short_description}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-16 flex flex-col items-center justify-center text-center opacity-50 space-y-2">
                <FileText size={36} strokeWidth={1.5} />
                <p className="text-xs">Fill out the brief on the left and click Generate to see structured copy.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EventDescriptionGenerator;
