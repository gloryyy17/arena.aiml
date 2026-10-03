import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Bot,
  User as UserIcon,
  Sparkles,
  Send,
  Loader2,
  Calendar,
  MapPin,
  ArrowRight,
  PlusCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { label: '← AI Hub', to: '/ai-hub' },
  { label: 'Chatbot', to: '/ai-hub/chat' },
  { label: 'Recommendations', to: '/ai-hub/recommendations' },
  { label: 'Feedback', to: '/ai-hub/feedback' },
  { label: 'Email Studio', to: '/ai-hub/email' },
  { label: 'Poster Studio', to: '/ai-hub/poster' },
];

const quickSuggestions = [
  'What events are available this week?',
  'Show me all Technical events & workshops',
  'How do I register and receive my digital certificate?',
  'What is the schedule for AI Genesis Hackathon?',
  'Are there any free events upcoming?',
];

const ChatbotPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Welcome to the Arena AI Concierge, ${user?.name || 'there'}! 🤖\n\nI have real-time access to the Arena event catalog, registration guidelines, and department schedules. How can I help you today?`,
      suggestedQueries: quickSuggestions.slice(0, 3),
      referencedEvents: [],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const messagesEndRef = useRef(null);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await api.get('/ai/chat/conversations');
      setConversations(res.data.conversations || []);
    } catch (err) {
      console.warn('Failed to load conversations', err);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (queryText) => {
    const text = queryText || input;
    if (!text.trim() || loading) return;

    const userMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', {
        message: text,
        conversationId,
      });

      if (res.data.conversationId) {
        setConversationId(res.data.conversationId);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.data.answer,
          suggestedQueries: res.data.suggestedQueries || [],
          referencedEvents: res.data.referencedEvents || [],
        },
      ]);
      fetchConversations();
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I encountered an issue connecting to the Arena database. Please retry in a moment.',
          suggestedQueries: ['What events are available?'],
          referencedEvents: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    setConversationId(null);
    setMessages([
      {
        role: 'assistant',
        content: `New session started! What would you like to explore across Arena AIML?`,
        suggestedQueries: quickSuggestions.slice(0, 3),
        referencedEvents: [],
      },
    ]);
  };

  return (
    <DashboardLayout navItems={navItems}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-purple-500 bg-purple-500/10 px-3 py-1 rounded-full mb-2">
            <Bot size={14} /> AI Event Concierge & Assistant
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold">Arena AI Concierge</h1>
          <p className="text-sm opacity-60">Grounded in verified Arena database records. Zero hallucinated event dates.</p>
        </div>

        <button
          onClick={startNewChat}
          className="px-4 py-2 rounded-full border border-border-light dark:border-border-dark bg-white dark:bg-[#1A1A1E] text-xs font-mono hover:border-accent hover:text-accent transition-colors flex items-center gap-2 self-start md:self-auto"
        >
          <PlusCircle size={14} /> NEW SESSION
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px]">
        {/* Left Conversation List Sidebar */}
        <div className="hidden lg:block lg:col-span-3 p-5 rounded-3xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-[#1A1A1E] flex flex-col justify-between overflow-y-auto">
          <div>
            <h3 className="font-display text-sm font-semibold mb-3 flex items-center gap-2 opacity-80">
              <Clock size={14} className="text-accent" /> Past Sessions
            </h3>
            <div className="space-y-1.5">
              {conversations.length === 0 && (
                <p className="text-xs opacity-50 italic">No past sessions yet.</p>
              )}
              {conversations.map((c) => (
                <button
                  key={c._id}
                  onClick={() => {
                    setConversationId(c._id);
                    api.get(`/ai/chat/history/${c._id}`).then((res) => {
                      if (res.data.conversation?.messages) {
                        setMessages(res.data.conversation.messages);
                      }
                    });
                  }}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors truncate ${
                    conversationId === c._id
                      ? 'bg-accent text-white font-medium'
                      : 'hover:bg-accent/10 opacity-70 hover:opacity-100'
                  }`}
                >
                  {c.title}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-border-light dark:border-border-dark text-[11px] font-mono opacity-60 flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-accent" /> RAG Grounded Database
          </div>
        </div>

        {/* Main Chat Center */}
        <div className="lg:col-span-9 rounded-3xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-[#1A1A1E] flex flex-col overflow-hidden shadow-sm">
          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-5">
            {messages.map((m, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles size={16} />
                  </div>
                )}

                <div className="max-w-[85%] space-y-3">
                  <div
                    className={`p-4 md:p-5 rounded-2xl ${
                      m.role === 'user'
                        ? 'bg-accent text-white rounded-br-none shadow-md'
                        : 'bg-white dark:bg-[#242429] border border-border-light dark:border-border-dark rounded-bl-none shadow-sm'
                    }`}
                  >
                    <p className="whitespace-pre-line leading-relaxed text-xs md:text-sm">
                      {m.content}
                    </p>
                  </div>

                  {/* Grounded Referenced Event Cards */}
                  {m.referencedEvents && m.referencedEvents.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {m.referencedEvents.map((ev) => (
                        <div
                          key={ev._id}
                          className="p-3.5 rounded-2xl bg-accent/5 dark:bg-accent/10 border border-accent/20 space-y-1.5 text-xs"
                        >
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-sticker text-ink-light">
                            {ev.category}
                          </span>
                          <h4 className="font-display font-semibold text-sm">{ev.title}</h4>
                          <p className="opacity-70 flex items-center gap-1">
                            <Calendar size={12} /> {new Date(ev.startDate).toDateString()}
                          </p>
                          <p className="opacity-70 flex items-center gap-1">
                            <MapPin size={12} /> {ev.venue}
                          </p>
                          <div className="pt-2 flex items-center justify-between font-mono">
                            <span className="font-bold text-accent">{ev.fee === 0 ? 'Free' : `₹${ev.fee}`}</span>
                            <a
                              href="/dashboard"
                              className="text-accent underline flex items-center gap-1 hover:opacity-80"
                            >
                              Register →
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Suggested Quick Prompts */}
                  {m.suggestedQueries && m.suggestedQueries.length > 0 && idx === messages.length - 1 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {m.suggestedQueries.map((q, qIdx) => (
                        <button
                          key={qIdx}
                          onClick={() => handleSend(q)}
                          className="text-xs font-mono px-3 py-1.5 rounded-full border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] hover:border-accent hover:text-accent transition-colors text-left flex items-center gap-1.5"
                        >
                          {q} <ArrowRight size={12} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {m.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-ink-light dark:bg-ink-dark text-bg-light dark:text-bg-dark flex items-center justify-center shrink-0 mt-0.5">
                    <UserIcon size={16} />
                  </div>
                )}
              </motion.div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs font-mono opacity-70 p-4">
                <Loader2 size={16} className="animate-spin text-accent" />
                Querying Arena Event Database & Synthesizing Answer...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-4 md:p-5 border-t border-border-light dark:border-border-dark bg-bg-light dark:bg-[#1A1A1E] flex items-center gap-3"
          >
            <input
              type="text"
              placeholder="Ask about events, registrations, venues, certificates, or dates..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 px-4 py-3 text-xs md:text-sm rounded-2xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] outline-none focus:border-accent transition-colors shadow-inner"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="py-3 px-6 rounded-2xl bg-accent text-white font-medium hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-40 shrink-0 shadow-md"
            >
              <Send size={16} />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ChatbotPage;
