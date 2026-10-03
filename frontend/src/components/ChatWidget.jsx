import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Bot, User as UserIcon, Loader2 } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const ChatWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello ${user?.name || 'there'}! 👋 I am your Arena AI Assistant. Ask me anything about upcoming events, registrations, venues, or schedules!`,
      suggestedQueries: [
        'What events are happening this week?',
        'How do I register for an event?',
        'Show me Technical workshops',
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMessage = { role: 'user', content: query };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', {
        message: query,
        conversationId,
      });

      if (res.data.conversationId) {
        setConversationId(res.data.conversationId);
      }

      const botMessage = {
        role: 'assistant',
        content: res.data.answer,
        suggestedQueries: res.data.suggestedQueries || [],
        referencedEvents: res.data.referencedEvents || [],
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an issue retrieving event details. Please try again.',
          suggestedQueries: ['What events are available?'],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-80 sm:w-96 h-[520px] bg-bg-light dark:bg-[#1A1A1E] border border-border-light dark:border-border-dark rounded-3xl shadow-2xl flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-border-light dark:border-border-dark flex items-center justify-between bg-accent/5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-sm leading-tight">Arena Concierge</h3>
                  <span className="flex items-center gap-1 text-[11px] font-mono text-green-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Grounded in Live DB
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-sm">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles size={14} />
                    </div>
                  )}

                  <div className="max-w-[82%] space-y-2">
                    <div
                      className={`p-3.5 rounded-2xl ${
                        m.role === 'user'
                          ? 'bg-accent text-white rounded-br-none'
                          : 'bg-white dark:bg-[#242429] border border-border-light dark:border-border-dark rounded-bl-none'
                      }`}
                    >
                      <p className="whitespace-pre-line leading-relaxed text-[13px]">{m.content}</p>
                    </div>

                    {/* Referenced Event Cards */}
                    {m.referencedEvents && m.referencedEvents.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        {m.referencedEvents.map((ev) => (
                          <div
                            key={ev._id}
                            className="p-2.5 bg-accent/5 dark:bg-accent/10 border border-accent/20 rounded-xl text-xs flex items-center justify-between"
                          >
                            <div>
                              <p className="font-semibold">{ev.title}</p>
                              <p className="opacity-60">{ev.category} • {new Date(ev.startDate).toLocaleDateString()}</p>
                            </div>
                            <span className="font-mono text-[11px] font-bold bg-accent text-white px-2 py-0.5 rounded-full">
                              {ev.fee === 0 ? 'Free' : `₹${ev.fee}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Suggested queries */}
                    {m.suggestedQueries && m.suggestedQueries.length > 0 && idx === messages.length - 1 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {m.suggestedQueries.map((q, qIdx) => (
                          <button
                            key={qIdx}
                            onClick={() => handleSend(q)}
                            className="text-[11px] font-mono px-2.5 py-1 rounded-full border border-border-light dark:border-border-dark bg-bg-light dark:bg-[#1F1F24] hover:border-accent hover:text-accent transition-colors text-left"
                          >
                            {q} →
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {m.role === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-ink-light dark:bg-ink-dark text-bg-light dark:text-bg-dark flex items-center justify-center shrink-0 mt-0.5">
                      <UserIcon size={14} />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-xs font-mono opacity-60 p-2">
                  <Loader2 size={14} className="animate-spin text-accent" /> Searching events & drafting answer...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 border-t border-border-light dark:border-border-dark flex items-center gap-2 bg-bg-light dark:bg-[#1A1A1E]"
            >
              <input
                type="text"
                placeholder="Ask about events, dates, venue..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] outline-none focus:border-accent transition-colors"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-9 h-9 rounded-xl bg-accent text-white flex items-center justify-center disabled:opacity-40 hover:opacity-90 transition-opacity shrink-0"
              >
                <Send size={14} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-accent text-white shadow-xl hover:bg-accent/90 transition-all"
        aria-label="Open AI Assistant"
      >
        <Sparkles size={18} />
        <span className="font-display font-medium text-sm hidden sm:inline">Ask AI Assistant</span>
      </motion.button>
    </div>
  );
};

export default ChatWidget;
