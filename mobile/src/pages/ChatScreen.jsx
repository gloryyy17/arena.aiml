import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import MobileHeader from '../components/MobileHeader';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const ChatScreen = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello ${user?.name || 'there'}! 👋 I am your Arena AI Assistant. What can I help you with today? Feel free to ask about upcoming hackathons, campus workshops, registration, or just chat!`,
      suggestedQueries: [
        'How was your day?',
        'What events are happening this week?',
        'Show Technical workshops',
        'How do I register for an event?',
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
    scrollToBottom();
  }, [messages, loading]);

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
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I ran into a connection issue. Please make sure the server is reachable and try again!',
          suggestedQueries: ['What events are available?', 'Tell me a joke'],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen theme-bg theme-text transition-colors">
      <MobileHeader title="Arena Concierge" subtitle="Conversational Campus Assistant" />

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-36">
        {messages.map((m, idx) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={idx}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-start gap-2 max-w-[85%]">
                {!isUser && (
                  <div className="w-7 h-7 rounded-full bg-[#5B47FB] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Bot size={15} />
                  </div>
                )}

                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                    isUser
                      ? 'bg-[#5B47FB] text-white rounded-br-xs shadow-md'
                      : 'theme-card theme-text rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.content}</p>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-full bg-slate-300 dark:bg-zinc-800 text-slate-700 dark:text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User size={14} />
                  </div>
                )}
              </div>

              {/* Suggested Follow-up Chips */}
              {!isUser && m.suggestedQueries && m.suggestedQueries.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 ml-9">
                  {m.suggestedQueries.map((q, qIdx) => (
                    <button
                      key={qIdx}
                      onClick={() => handleSend(q)}
                      className="text-[11px] font-mono px-2.5 py-1 rounded-full theme-card hover:border-[#5B47FB]/40 theme-text-secondary hover:theme-text transition-all text-left shadow-sm"
                    >
                      {q} →
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-xs font-mono theme-text-muted">
            <div className="w-7 h-7 rounded-full bg-[#5B47FB]/20 text-[#5B47FB] flex items-center justify-center">
              <Loader2 size={14} className="animate-spin" />
            </div>
            <span>Concierge is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar Fixed Above Bottom Navigation */}
      <div className="fixed bottom-16 left-0 right-0 z-30 p-3 glass-panel border-t shadow-lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="max-w-md mx-auto flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask anything or just chat..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-2xl theme-input text-xs outline-none focus:border-[#5B47FB] transition-colors shadow-sm"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-2xl bg-[#5B47FB] text-white flex items-center justify-center disabled:opacity-40 active:scale-95 transition-all shadow-md shrink-0"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatScreen;
