import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Send,
  Sparkles,
  RefreshCw,
  Eye,
  Code,
  Users,
  CheckCircle,
  AlertTriangle,
  FileText,
  Clock,
  ShieldAlert,
  Sliders,
  Check,
  Upload,
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

const emailTypes = [
  { id: 'invitation', label: 'Event Invitation' },
  { id: 'announcement', label: 'Event Announcement' },
  { id: 'reminder', label: 'Event Reminder' },
  { id: 'confirmation', label: 'Registration Confirmation' },
  { id: 'promotional', label: 'Promotional Campaign' },
  { id: 'thank_you', label: 'Thank-You Note' },
  { id: 'feedback_request', label: 'Feedback Request' },
  { id: 'cancellation', label: 'Cancellation / Update' },
];

const EmailStudio = () => {
  const [form, setForm] = useState({
    emailType: 'invitation',
    eventTitle: 'AI Genesis Hackathon 2026',
    eventDate: '2026-10-15 at 09:00 AM',
    eventVenue: 'Campus Tech Arena',
    eventCategory: 'Technical',
    eventDescription: '36-hour national build sprint on autonomous AI agents with cash prizes and digital certificates.',
    recipientType: 'all_students',
    emailPurpose: 'Encourage students across departments to build teams and register early.',
    tone: 'Exciting, inspirational, and clear',
    callToAction: 'Register Your Team Now',
    customRecipientsText: '',
  });

  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState('preview'); // 'preview' | 'html' | 'text'
  const [generatedEmail, setGeneratedEmail] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [error, setError] = useState('');
  const [sendSuccess, setSendSuccess] = useState(null);
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await api.get('/ai/email/campaigns');
      setCampaigns(res.data.campaigns || []);
    } catch (err) {
      console.warn('Failed to load campaigns', err);
    }
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGenerate = async () => {
    if (!form.eventTitle.trim()) {
      setError('Please provide an Event Title.');
      return;
    }

    setError('');
    setLoading(true);
    setSendSuccess(null);

    try {
      const res = await api.post('/ai/email/generate', form);
      setGeneratedEmail(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate email template.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendCampaign = async () => {
    if (!generatedEmail) return;

    setSending(true);
    setError('');

    try {
      let customRecipients = [];
      if (form.recipientType === 'custom' && form.customRecipientsText) {
        customRecipients = form.customRecipientsText
          .split(/[\n,]+/)
          .map((e) => e.trim())
          .filter((e) => e.length > 0);
      }

      const res = await api.post('/ai/email/send', {
        campaignName: `${form.emailType.toUpperCase()}: ${form.eventTitle}`,
        subject: generatedEmail.subject,
        htmlBody: generatedEmail.html_body,
        plainText: generatedEmail.plain_text,
        recipientType: form.recipientType,
        customRecipients,
        confirmSend: true, // Explicit confirmation
      });

      setSendSuccess(res.data);
      setShowConfirmModal(false);
      fetchCampaigns();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to dispatch email campaign.');
    } finally {
      setSending(false);
    }
  };

  return (
    <DashboardLayout navItems={navItems}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full mb-2">
            <Mail size={14} /> AI Email Studio & Campaign Dispatcher
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold">Email Studio</h1>
          <p className="text-sm opacity-60">Generate responsive, high-converting HTML emails, edit live, and dispatch safely.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Config Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 md:p-8 rounded-3xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-[#1A1A1E] space-y-4">
            <h2 className="font-display text-lg font-semibold flex items-center gap-2">
              <Sliders size={18} className="text-accent" /> Campaign Parameters
            </h2>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
                <AlertTriangle size={16} /> {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1.5">Email Purpose / Type</label>
              <select
                name="emailType"
                value={form.emailType}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] outline-none focus:border-accent transition-colors"
              >
                {emailTypes.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1.5">Event Title *</label>
              <input
                type="text"
                name="eventTitle"
                value={form.eventTitle}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] outline-none focus:border-accent transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1.5">Date & Time</label>
                <input
                  type="text"
                  name="eventDate"
                  value={form.eventDate}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] outline-none focus:border-accent transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1.5">Venue</label>
                <input
                  type="text"
                  name="eventVenue"
                  value={form.eventVenue}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1.5">Event Description / Key Details</label>
              <textarea
                name="eventDescription"
                value={form.eventDescription}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] outline-none focus:border-accent transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1.5">Target Recipient Group</label>
              <select
                name="recipientType"
                value={form.recipientType}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] outline-none focus:border-accent transition-colors"
              >
                <option value="all_students">All Active Students</option>
                <option value="registered_participants">Registered Event Attendees</option>
                <option value="faculty">Faculty Members</option>
                <option value="custom">Custom Email List / CSV Text</option>
              </select>
            </div>

            {form.recipientType === 'custom' && (
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1.5">Paste Emails (Comma or Newline Separated)</label>
                <textarea
                  name="customRecipientsText"
                  value={form.customRecipientsText}
                  onChange={handleInputChange}
                  placeholder="student1@campus.edu, student2@campus.edu"
                  rows={2}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] outline-none focus:border-accent transition-colors font-mono text-xs"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1.5">Tone</label>
                <input
                  type="text"
                  name="tone"
                  value={form.tone}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] outline-none focus:border-accent transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1.5">Call to Action</label>
                <input
                  type="text"
                  name="callToAction"
                  value={form.callToAction}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] outline-none focus:border-accent transition-colors"
                />
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
                    <RefreshCw size={16} className="animate-spin" /> Generating Email Template...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} /> GENERATE EMAIL
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Preview & Editor Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 md:p-8 rounded-3xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-[#1A1A1E] space-y-5">
            {/* Header & View Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-light dark:border-border-dark pb-4">
              <h2 className="font-display text-lg font-semibold">Email Studio Canvas</h2>
              {generatedEmail && (
                <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-[#242429] border border-border-light dark:border-border-dark rounded-xl">
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`px-3 py-1 text-xs font-mono rounded-lg transition-colors flex items-center gap-1.5 ${
                      activeTab === 'preview' ? 'bg-accent text-white' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Eye size={13} /> Live Preview
                  </button>
                  <button
                    onClick={() => setActiveTab('html')}
                    className={`px-3 py-1 text-xs font-mono rounded-lg transition-colors flex items-center gap-1.5 ${
                      activeTab === 'html' ? 'bg-accent text-white' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Code size={13} /> Edit HTML
                  </button>
                  <button
                    onClick={() => setActiveTab('text')}
                    className={`px-3 py-1 text-xs font-mono rounded-lg transition-colors flex items-center gap-1.5 ${
                      activeTab === 'text' ? 'bg-accent text-white' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <FileText size={13} /> Plain Text
                  </button>
                </div>
              )}
            </div>

            {/* Send Success Toast */}
            {sendSuccess && (
              <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-500 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} />
                  <span>{sendSuccess.message}</span>
                </div>
                {sendSuccess.campaign?.previewUrl && (
                  <a
                    href={sendSuccess.campaign.previewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="underline font-mono"
                  >
                    View Ethereal Email Preview ↗
                  </a>
                )}
              </div>
            )}

            {generatedEmail ? (
              <div className="space-y-4">
                {/* Subject & Preview Text Inputs (Editable) */}
                <div className="space-y-3 p-4 rounded-2xl bg-white dark:bg-[#242429] border border-border-light dark:border-border-dark">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider opacity-60 mb-1">Subject Line</label>
                    <input
                      type="text"
                      value={generatedEmail.subject}
                      onChange={(e) => setGeneratedEmail({ ...generatedEmail, subject: e.target.value })}
                      className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-border-light dark:border-border-dark bg-transparent outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider opacity-60 mb-1">Inbox Preview Text</label>
                    <input
                      type="text"
                      value={generatedEmail.preview_text}
                      onChange={(e) => setGeneratedEmail({ ...generatedEmail, preview_text: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs opacity-75 rounded-lg border border-border-light dark:border-border-dark bg-transparent outline-none focus:border-accent"
                    />
                  </div>
                </div>

                {/* Canvas Body */}
                {activeTab === 'preview' && (
                  <div className="border border-border-light dark:border-border-dark rounded-2xl overflow-hidden bg-white shadow-inner p-4 min-h-[360px]">
                    <div
                      dangerouslySetInnerHTML={{ __html: generatedEmail.html_body }}
                      className="text-black"
                    />
                  </div>
                )}

                {activeTab === 'html' && (
                  <textarea
                    rows={14}
                    value={generatedEmail.html_body}
                    onChange={(e) => setGeneratedEmail({ ...generatedEmail, html_body: e.target.value })}
                    className="w-full p-4 text-xs font-mono rounded-2xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] outline-none focus:border-accent"
                  />
                )}

                {activeTab === 'text' && (
                  <textarea
                    rows={14}
                    value={generatedEmail.plain_text}
                    onChange={(e) => setGeneratedEmail({ ...generatedEmail, plain_text: e.target.value })}
                    className="w-full p-4 text-xs font-mono rounded-2xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] outline-none focus:border-accent"
                  />
                )}

                {/* Dispatch Trigger Bar */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs font-mono opacity-60 flex items-center gap-1.5">
                    <Users size={14} /> Recipient Target: <span className="font-bold text-accent">{form.recipientType}</span>
                  </div>

                  <button
                    onClick={() => setShowConfirmModal(true)}
                    className="w-full sm:w-auto py-3 px-8 rounded-full bg-accent text-white font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Send size={16} /> SEND EMAIL CAMPAIGN
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-center opacity-50 space-y-3">
                <Mail size={40} strokeWidth={1.5} />
                <p className="text-xs">Configure your parameters and click Generate to preview and customize your email.</p>
              </div>
            )}
          </div>

          {/* Previous Campaigns Log */}
          {campaigns.length > 0 && (
            <div className="p-6 rounded-3xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-[#1A1A1E]">
              <h3 className="font-display text-sm font-semibold mb-3 flex items-center gap-2">
                <Clock size={14} className="text-accent" /> Recent Campaign Dispatches
              </h3>
              <div className="space-y-2">
                {campaigns.slice(0, 3).map((c) => (
                  <div
                    key={c._id}
                    className="p-3 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-[11px] opacity-60">{new Date(c.createdAt).toLocaleString()} • {c.totalRecipients} Recipient(s)</p>
                    </div>
                    <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-500 font-medium">
                      {c.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Safety Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-bg-light dark:bg-[#1A1A1E] border border-border-light dark:border-border-dark rounded-3xl p-6 md:p-8 shadow-2xl space-y-5"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <ShieldAlert size={26} />
              </div>

              <div>
                <h3 className="font-display text-xl font-semibold mb-1">Confirm Campaign Dispatch</h3>
                <p className="text-xs opacity-70 leading-relaxed">
                  Per security and compliance policies, you are explicitly confirming the broadcast of this AI-generated communication:
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#242429] border border-border-light dark:border-border-dark space-y-2 text-xs">
                <p><strong className="opacity-60">Subject:</strong> {generatedEmail?.subject}</p>
                <p><strong className="opacity-60">Audience:</strong> {form.recipientType}</p>
                <p><strong className="opacity-60">Sender:</strong> Arena AIML Broadcast System</p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={sending}
                  className="flex-1 py-2.5 rounded-full border border-border-light dark:border-border-dark text-xs font-mono hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  CANCEL & EDIT
                </button>
                <button
                  onClick={handleSendCampaign}
                  disabled={sending}
                  className="flex-1 py-2.5 rounded-full bg-accent text-white text-xs font-mono font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  {sending ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                  CONFIRM & DISPATCH
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default EmailStudio;
