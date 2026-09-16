import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Palette,
  FileText,
  Mail,
  MessageSquare,
  BarChart3,
  Compass,
  Cpu,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const modules = [
  {
    id: 'poster',
    title: 'AI Poster Generator',
    description: 'Design photorealistic and stylized high-res event posters with custom styles, dimensions, and visual themes.',
    icon: Palette,
    to: '/ai-hub/poster',
    badge: 'Creativity',
    badgeColor: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
    color: 'from-pink-500/20 to-rose-500/5',
  },
  {
    id: 'description',
    title: 'Event Copy Generator',
    description: 'Instantly generate multi-paragraph descriptions, highlights, social captions, SEO tags, and calls to action.',
    icon: FileText,
    to: '/ai-hub/description',
    badge: 'Marketing',
    badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    color: 'from-amber-500/20 to-orange-500/5',
  },
  {
    id: 'email',
    title: 'AI Email Studio',
    description: 'Draft conversion-optimized HTML & plain-text campaigns, edit with live preview, and dispatch with 1-click confirmation.',
    icon: Mail,
    to: '/ai-hub/email',
    badge: 'Communication',
    badgeColor: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    color: 'from-blue-500/20 to-indigo-500/5',
  },
  {
    id: 'chat',
    title: 'Arena AI Concierge',
    description: 'Interactive intelligent assistant grounded in authoritative database event schedules, venues, and registrations.',
    icon: MessageSquare,
    to: '/ai-hub/chat',
    badge: 'Assistant',
    badgeColor: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    color: 'from-purple-500/20 to-violet-500/5',
  },
  {
    id: 'feedback',
    title: 'AI Feedback Analyzer',
    description: 'Synthesize participant sentiment scores, key positive & negative themes, participant suggestions, and priority issue lists.',
    icon: BarChart3,
    to: '/ai-hub/feedback',
    badge: 'Analytics',
    badgeColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    color: 'from-emerald-500/20 to-teal-500/5',
  },
  {
    id: 'recommendations',
    title: 'Smart Recommendations',
    description: 'Multi-signal content-based discovery engine delivering personalized events with explainable affinity scores.',
    icon: Compass,
    to: '/ai-hub/recommendations',
    badge: 'Intelligence',
    badgeColor: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
    color: 'from-cyan-500/20 to-sky-500/5',
  },
  {
    id: 'prompts',
    title: 'Prompt Engineering Registry',
    description: 'Inspect centralized prompt schemas, template versions, validation rules, and run live playground experiments.',
    icon: Cpu,
    to: '/ai-hub/prompts',
    badge: 'System',
    badgeColor: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20',
    color: 'from-neutral-500/20 to-stone-500/5',
  },
];

const AIHub = () => {
  const navigate = useNavigate();

  const navItems = [
    { label: 'Overview', to: '/dashboard' },
    { label: 'AI Hub', to: '/ai-hub' },
    { label: 'Poster Studio', to: '/ai-hub/poster' },
    { label: 'Event Copy', to: '/ai-hub/description' },
    { label: 'Email Studio', to: '/ai-hub/email' },
    { label: 'Feedback Analysis', to: '/ai-hub/feedback' },
    { label: 'Recommendations', to: '/ai-hub/recommendations' },
    { label: 'Prompt Registry', to: '/ai-hub/prompts' },
  ];

  return (
    <DashboardLayout navItems={navItems}>
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl p-8 md:p-10 mb-10 border border-border-light dark:border-border-dark bg-gradient-to-br from-accent/15 via-bg-light dark:via-[#1A1A1E] to-accent/5">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent font-mono text-xs uppercase tracking-wider mb-4">
            <Sparkles size={14} /> Modular AI Hub • Production Grade
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-semibold leading-tight mb-4">
            Event intelligence & creative automation.
          </h1>
          <p className="text-sm md:text-base opacity-75 leading-relaxed mb-6">
            Leverage Google Gemini LLMs, image diffusion, multi-signal recommendation heuristics, and NLP sentiment pipelines directly into your Arena workflow.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono opacity-80">
            <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-accent" /> Server-side API Isolation</span>
            <span className="flex items-center gap-1.5"><Zap size={14} className="text-accent" /> Deterministic Structured JSON</span>
            <span className="flex items-center gap-1.5"><Cpu size={14} className="text-accent" /> Provider Agnostic</span>
          </div>
        </div>
      </div>

      {/* Grid of Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((mod, index) => {
          const Icon = mod.icon;
          return (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              whileHover={{ y: -4 }}
              onClick={() => navigate(mod.to)}
              className="group cursor-pointer p-6 rounded-2xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-[#1A1A1E] hover:border-accent/40 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${mod.color} rounded-full blur-2xl -z-0 opacity-40 group-hover:opacity-80 transition-opacity`} />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all">
                    <Icon size={22} />
                  </div>
                  <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border ${mod.badgeColor}`}>
                    {mod.badge}
                  </span>
                </div>
                <h3 className="font-display text-xl font-semibold mb-2 group-hover:text-accent transition-colors">
                  {mod.title}
                </h3>
                <p className="text-xs md:text-sm opacity-70 leading-relaxed mb-6">
                  {mod.description}
                </p>
              </div>

              <div className="relative z-10 pt-4 border-t border-border-light/60 dark:border-border-dark/60 flex items-center justify-between text-xs font-mono font-medium text-accent">
                <span>Launch Studio</span>
                <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </DashboardLayout>
  );
};

export default AIHub;
