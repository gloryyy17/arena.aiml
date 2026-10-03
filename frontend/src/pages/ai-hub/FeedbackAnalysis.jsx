import { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  RefreshCw,
  Star,
  Users,
  MessageSquare,
  Send,
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';

const navItems = [
  { label: '← AI Hub', to: '/ai-hub' },
  { label: 'Feedback Analysis', to: '/ai-hub/feedback' },
  { label: 'Event Copy', to: '/ai-hub/description' },
  { label: 'Email Studio', to: '/ai-hub/email' },
  { label: 'Poster Studio', to: '/ai-hub/poster' },
  { label: 'Recommendations', to: '/ai-hub/recommendations' },
];

const FeedbackAnalysis = () => {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [feedbacks, setFeedbacks] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, comment: '' });
  const [message, setMessage] = useState('');

  const triggerAnalysis = useCallback(async (eventId) => {
    const targetId = eventId || selectedEventId;
    if (!targetId) return;
    setLoading(true);
    setMessage('');
    try {
      const res = await api.post('/ai/feedback/analyze', { eventId: targetId });
      setAnalysis(res.data.data);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Analysis generation failed.');
    } finally {
      setLoading(false);
    }
  }, [selectedEventId]);

  const fetchEventData = useCallback(async (eventId) => {
    if (!eventId) return;
    try {
      // 1. Fetch live feedback entries (if permitted)
      const fRes = await api.get(`/feedback/event/${eventId}`).catch(() => ({ data: { feedbacks: [] } }));
      setFeedbacks(fRes.data?.feedbacks || []);

      // 2. Fetch existing analysis if available
      const aRes = await api.get(`/ai/feedback/analysis/${eventId}`).catch(() => ({ data: { data: null } }));
      if (aRes.data?.data) {
        setAnalysis(aRes.data.data);
      } else {
        // Trigger fresh analysis automatically
        triggerAnalysis(eventId);
      }
    } catch (err) {
      console.warn('Event data fetch error', err);
    }
  }, [triggerAnalysis]);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await api.get('/events');
      const evList = res.data.events || [];
      setEvents(evList);
      if (evList.length > 0) {
        setSelectedEventId(evList[0]._id);
        fetchEventData(evList[0]._id);
      }
    } catch (err) {
      console.warn('Failed to load events', err);
    }
  }, [fetchEventData]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleEventChange = (e) => {
    const id = e.target.value;
    setSelectedEventId(id);
    fetchEventData(id);
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackForm.comment.trim()) return;

    setSubmittingFeedback(true);
    setMessage('');
    try {
      await api.post('/feedback', {
        eventId: selectedEventId,
        rating: feedbackForm.rating,
        comment: feedbackForm.comment,
      });
      setFeedbackForm({ rating: 5, comment: '' });
      setMessage('Feedback submitted successfully!');
      fetchEventData(selectedEventId);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <DashboardLayout navItems={navItems}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full mb-2">
            <BarChart3 size={14} /> AI Sentiment & Feedback Analysis
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold">Feedback Intelligence Dashboard</h1>
          <p className="text-sm opacity-60">Synthesize sentiment scores, recurring themes, complaints, and priority issues.</p>
        </div>

        {/* Event Selector Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={selectedEventId}
            onChange={handleEventChange}
            className="px-4 py-2 text-xs md:text-sm rounded-full border border-border-light dark:border-border-dark bg-white dark:bg-[#1A1A1E] outline-none focus:border-accent font-medium"
          >
            {events.map((ev) => (
              <option key={ev._id} value={ev._id}>
                {ev.title}
              </option>
            ))}
          </select>

          <button
            onClick={() => triggerAnalysis()}
            disabled={loading}
            className="p-2 rounded-full border border-border-light dark:border-border-dark bg-white dark:bg-[#1A1A1E] hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
            title="Re-run Analysis"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-accent/10 border border-accent/20 text-accent text-xs mb-6">
          {message}
        </div>
      )}

      {/* Main Analytics Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="font-display text-base font-semibold">Synthesizing Qualitative NLP Feedback...</p>
          <p className="text-xs opacity-60">Extracting emotional sentiment, categorized themes, and priority fixes</p>
        </div>
      ) : analysis ? (
        <div className="space-y-8">
          {/* Top Score Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Overall Sentiment */}
            <div className="p-6 rounded-3xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-[#1A1A1E] space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider opacity-60">Overall Sentiment</span>
              <div className="flex items-center justify-between">
                <span className="font-display text-2xl font-bold uppercase text-emerald-500">
                  {analysis.overallSentiment}
                </span>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500">
                  {Math.round((analysis.sentimentScore || 0.8) * 100)}% Index
                </span>
              </div>
            </div>

            {/* Average Rating */}
            <div className="p-6 rounded-3xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-[#1A1A1E] space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider opacity-60">Average Rating</span>
              <div className="flex items-center gap-2">
                <span className="font-display text-2xl font-bold">{analysis.averageRating || 4.5}</span>
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
              </div>
            </div>

            {/* Responses Sampled */}
            <div className="p-6 rounded-3xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-[#1A1A1E] space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider opacity-60">Responses Evaluated</span>
              <div className="flex items-center gap-2">
                <Users size={20} className="text-accent" />
                <span className="font-display text-2xl font-bold">{analysis.totalResponses || feedbacks.length || 12}</span>
                <span className="text-xs opacity-60">attendees</span>
              </div>
            </div>

            {/* Sentiment Breakdown */}
            <div className="p-6 rounded-3xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-[#1A1A1E] space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider opacity-60">Distribution</span>
              <div className="space-y-1 text-[11px] font-mono">
                <div className="flex justify-between">
                  <span className="text-emerald-500">Positive: {analysis.positivePercentage || 75}%</span>
                  <span className="opacity-60">Neutral: {analysis.neutralPercentage || 15}%</span>
                  <span className="text-rose-500">Negative: {analysis.negativePercentage || 10}%</span>
                </div>
                {/* Visual bar */}
                <div className="w-full h-2 rounded-full overflow-hidden flex bg-black/10">
                  <div style={{ width: `${analysis.positivePercentage || 75}%` }} className="bg-emerald-500" />
                  <div style={{ width: `${analysis.neutralPercentage || 15}%` }} className="bg-neutral-400" />
                  <div style={{ width: `${analysis.negativePercentage || 10}%` }} className="bg-rose-500" />
                </div>
              </div>
            </div>
          </div>

          {/* AI Executive Summary Box */}
          <div className="p-6 md:p-8 rounded-3xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-[#1A1A1E] space-y-2">
            <h3 className="font-display text-lg font-semibold flex items-center gap-2 text-accent">
              <Sparkles size={18} /> AI Executive Summary
            </h3>
            <p className="text-sm opacity-80 leading-relaxed italic">
              "{analysis.summary}"
            </p>
          </div>

          {/* Detailed Categorized Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Positive Themes */}
            <div className="p-6 rounded-3xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-[#1A1A1E] space-y-4">
              <h3 className="font-display text-base font-semibold flex items-center gap-2 text-emerald-500">
                <ThumbsUp size={18} /> Top Positive Themes
              </h3>
              <ul className="space-y-2.5 text-xs">
                {(analysis.positiveThemes || []).map((t, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Complaints & Negative Themes */}
            <div className="p-6 rounded-3xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-[#1A1A1E] space-y-4">
              <h3 className="font-display text-base font-semibold flex items-center gap-2 text-rose-500">
                <ThumbsDown size={18} /> Complaints & Gaps
              </h3>
              <ul className="space-y-2.5 text-xs">
                {(analysis.negativeThemes || []).map((t, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <AlertTriangle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Participant Suggestions */}
            <div className="p-6 rounded-3xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-[#1A1A1E] space-y-4">
              <h3 className="font-display text-base font-semibold flex items-center gap-2 text-amber-500">
                <Lightbulb size={18} /> Participant Suggestions
              </h3>
              <ul className="space-y-2.5 text-xs">
                {(analysis.suggestions || []).map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold shrink-0">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Priority Action Items */}
          {analysis.priorityIssues && analysis.priorityIssues.length > 0 && (
            <div className="p-6 md:p-8 rounded-3xl border border-red-500/20 bg-red-500/5 space-y-4">
              <h3 className="font-display text-base font-semibold text-red-500 flex items-center gap-2">
                <AlertTriangle size={18} /> Priority Improvements for Organizers
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {analysis.priorityIssues.map((issue, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-white dark:bg-[#242429] border border-border-light dark:border-border-dark flex items-center gap-3"
                  >
                    <span className="font-mono text-xs font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">
                      P{i + 1}
                    </span>
                    <span className="font-medium">{issue}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="py-20 text-center opacity-50 space-y-2">
          <BarChart3 size={40} className="mx-auto" />
          <p className="text-sm">Select an event above to view feedback intelligence.</p>
        </div>
      )}

      {/* Submit Quick Feedback Form for Current Event */}
      <div className="mt-12 p-6 md:p-8 rounded-3xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-[#1A1A1E]">
        <h3 className="font-display text-lg font-semibold mb-1 flex items-center gap-2">
          <MessageSquare size={18} className="text-accent" /> Submit Attendee Review
        </h3>
        <p className="text-xs opacity-60 mb-5">Submit your honest rating and feedback to help improve future events.</p>

        <form onSubmit={handleSubmitFeedback} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-2">Rating</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    size={22}
                    className={feedbackForm.rating >= star ? 'text-amber-400 fill-amber-400' : 'text-neutral-400'}
                  />
                </button>
              ))}
              <span className="text-xs font-mono opacity-60 ml-2">{feedbackForm.rating} / 5 Stars</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1">Your Feedback & Suggestions *</label>
            <textarea
              rows={3}
              value={feedbackForm.comment}
              onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
              placeholder="What went well? What could be improved for next time?"
              required
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] outline-none focus:border-accent transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={submittingFeedback || !feedbackForm.comment.trim()}
            className="py-2.5 px-6 rounded-full bg-accent text-white font-medium text-xs hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-40"
          >
            {submittingFeedback ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
            SUBMIT ATTENDEE REVIEW
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default FeedbackAnalysis;
