import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Palette,
  Sparkles,
  Download,
  Share2,
  RefreshCw,
  Check,
  AlertCircle,
  Clock,
  Sliders,
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

const designStyles = [
  { id: 'modern_abstract', label: 'Modern Abstract 3D', desc: 'Fluid gradients & prism refractions' },
  { id: 'cyberpunk', label: 'Cyberpunk / Neon', desc: 'Glowing neon circuits & dark synthwave' },
  { id: 'minimalist', label: 'Swiss Minimalist', desc: 'Clean typography & striking geometry' },
  { id: 'retro', label: 'Retro Risograph', desc: 'Nostalgic grain & bold vintage shapes' },
  { id: 'vibrant_3d', label: 'Playful 3D Clay', desc: 'Warm studio lighting & soft 3D assets' },
  { id: 'corporate', label: 'Executive Summit', desc: 'Navy, platinum, & structured prestige' },
];

const aspectRatios = [
  { id: '1024x1024', label: 'Square (1:1)', desc: 'Instagram / Feed' },
  { id: '800x1200', label: 'Poster Portrait (2:3)', desc: 'Noticeboards / Stories' },
  { id: '1200x630', label: 'Landscape Banner (16:9)', desc: 'Web Hero & LinkedIn' },
];

const PosterGenerator = () => {
  const [form, setForm] = useState({
    eventName: 'AI Genesis Hackathon 2026',
    category: 'Technical',
    date: '2026-10-15',
    time: '09:00 AM',
    venue: 'Campus Tech Arena & Innovation Hub',
    organizer: 'Department of AI & Data Science',
    description: '36-hour national build sprint tackling generative AI and autonomous agents.',
    targetAudience: 'Engineering & CS Students, AI Developers',
    theme: 'Next-Gen Autonomous Agent Orchestration',
    designStyle: 'modern_abstract',
    colorPreference: 'Electric violet, deep onyx, luminous cyber lime (#C4F135)',
    posterSize: '1024x1024',
    customInstructions: 'Dynamic glowing circuit network forming a futuristic sphere with floating tech particles.',
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await api.get('/ai/poster/history');
      setHistory(res.data.history || []);
    } catch (err) {
      console.warn('Failed to load history', err);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

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
      const res = await api.post('/ai/poster/generate', form);
      setResult(res.data.data);
      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate poster. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result?.imageUrl) return;
    const a = document.createElement('a');
    a.href = result.imageUrl;
    a.download = `${form.eventName.replace(/\s+/g, '_')}_Poster.png`;
    a.target = '_blank';
    a.click();
  };

  const handleShare = () => {
    if (!result?.imageUrl) return;
    navigator.clipboard.writeText(result.imageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <DashboardLayout navItems={navItems}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-pink-500 bg-pink-500/10 px-3 py-1 rounded-full mb-2">
            <Palette size={14} /> AI Poster Generator Studio
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold">Generate Event Posters</h1>
          <p className="text-sm opacity-60">Design customized, ultra-high resolution posters tuned to your event theme.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 md:p-8 rounded-3xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-[#1A1A1E] space-y-5">
            <h2 className="font-display text-lg font-semibold flex items-center gap-2">
              <Sliders size={18} className="text-accent" /> Event Parameters
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
                  placeholder="e.g. 10:00 AM"
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
                  placeholder="e.g. Main Hall"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1.5">Core Theme / Tagline</label>
              <input
                type="text"
                name="theme"
                value={form.theme}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] outline-none focus:border-accent transition-colors"
              />
            </div>

            {/* Design Style Selector */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-2">Aesthetic Style</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {designStyles.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setForm({ ...form, designStyle: style.id })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      form.designStyle === style.id
                        ? 'border-accent bg-accent/10 shadow-sm'
                        : 'border-border-light dark:border-border-dark bg-white dark:bg-[#242429] hover:border-accent/40'
                    }`}
                  >
                    <p className="font-semibold text-xs">{style.label}</p>
                    <p className="text-[11px] opacity-60 mt-0.5">{style.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio Selector */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-2">Dimensions & Aspect Ratio</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {aspectRatios.map((ratio) => (
                  <button
                    key={ratio.id}
                    type="button"
                    onClick={() => setForm({ ...form, posterSize: ratio.id })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      form.posterSize === ratio.id
                        ? 'border-accent bg-accent/10 shadow-sm'
                        : 'border-border-light dark:border-border-dark bg-white dark:bg-[#242429] hover:border-accent/40'
                    }`}
                  >
                    <p className="font-semibold text-xs">{ratio.label}</p>
                    <p className="text-[11px] opacity-60 mt-0.5">{ratio.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1.5">Color Preference</label>
              <input
                type="text"
                name="colorPreference"
                value={form.colorPreference}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] outline-none focus:border-accent transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1.5">Custom Visual Prompt Instructions</label>
              <textarea
                name="customInstructions"
                value={form.customInstructions}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] outline-none focus:border-accent transition-colors"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="flex-1 py-3 px-6 rounded-full bg-accent text-white font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" /> Rendering AI Poster...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} /> GENERATE POSTER
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Preview Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 md:p-8 rounded-3xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-[#1A1A1E] flex flex-col items-center">
            <h2 className="font-display text-lg font-semibold mb-4 w-full text-left flex items-center justify-between">
              <span>Rendered Preview</span>
              {result && <span className="text-xs font-mono opacity-50">{form.posterSize}</span>}
            </h2>

            {/* Poster Canvas / Image Display */}
            <div className="w-full aspect-square max-w-[380px] rounded-2xl border border-border-light dark:border-border-dark bg-black/5 dark:bg-black/30 overflow-hidden flex items-center justify-center relative shadow-inner">
              {loading ? (
                <div className="flex flex-col items-center gap-3 p-6 text-center">
                  <div className="w-12 h-12 rounded-full border-4 border-accent border-t-transparent animate-spin" />
                  <p className="font-display text-sm font-semibold">Diffusion Model Generating...</p>
                  <p className="text-xs opacity-60 max-w-[200px]">Synthesizing typography, lighting, and style parameters</p>
                </div>
              ) : result?.imageUrl ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full h-full relative group"
                >
                  <img
                    src={result.imageUrl}
                    alt={form.eventName}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      onClick={handleDownload}
                      className="p-3 bg-white text-black rounded-full hover:scale-110 transition-transform shadow-lg"
                      title="Download Image"
                    >
                      <Download size={18} />
                    </button>
                    <button
                      onClick={handleShare}
                      className="p-3 bg-accent text-white rounded-full hover:scale-110 transition-transform shadow-lg"
                      title="Copy URL"
                    >
                      {copied ? <Check size={18} /> : <Share2 size={18} />}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center gap-3 p-6 text-center opacity-50">
                  <Palette size={40} strokeWidth={1.5} />
                  <p className="text-xs">Adjust your parameters and click Generate to produce a poster.</p>
                </div>
              )}
            </div>

            {/* Control Actions Bar */}
            {result?.imageUrl && (
              <div className="w-full mt-6 space-y-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownload}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] text-xs font-mono font-medium hover:border-accent transition-colors flex items-center justify-center gap-2"
                  >
                    <Download size={14} /> DOWNLOAD
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] text-xs font-mono font-medium hover:border-accent transition-colors flex items-center justify-center gap-2"
                  >
                    {copied ? <Check size={14} className="text-green-500" /> : <Share2 size={14} />}
                    {copied ? 'COPIED!' : 'SHARE'}
                  </button>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl border border-accent/30 bg-accent/5 text-accent text-xs font-mono font-medium hover:bg-accent/10 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw size={14} /> REGENERATE WITH NEW SEED
                </button>
              </div>
            )}
          </div>

          {/* History Snippet */}
          {history.length > 0 && (
            <div className="p-6 rounded-3xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-[#1A1A1E]">
              <h3 className="font-display text-sm font-semibold mb-3 flex items-center gap-2">
                <Clock size={14} className="text-accent" /> Recent Generations
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {history.slice(0, 4).map((h) => (
                  <div
                    key={h._id}
                    onClick={() => setResult({ imageUrl: h.result?.imageUrl })}
                    className="aspect-square rounded-xl overflow-hidden border border-border-light dark:border-border-dark cursor-pointer hover:border-accent transition-colors"
                  >
                    <img src={h.result?.imageUrl} alt="Poster" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PosterGenerator;
