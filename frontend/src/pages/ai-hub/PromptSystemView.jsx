import { useState, useEffect, useCallback } from 'react';
import {
  Cpu,
  Code,
  Play,
  RefreshCw,
  Layers,
  Sliders,
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';

const navItems = [
  { label: '← AI Hub', to: '/ai-hub' },
  { label: 'Prompt Registry', to: '/ai-hub/prompts' },
  { label: 'Event Copy', to: '/ai-hub/description' },
  { label: 'Email Studio', to: '/ai-hub/email' },
  { label: 'Poster Studio', to: '/ai-hub/poster' },
];

const PromptSystemView = () => {
  const [prompts, setPrompts] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [testVariables, setTestVariables] = useState({});
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const selectPrompt = useCallback((prompt) => {
    setSelectedPrompt(prompt);
    setTestResult(null);

    // Populate initial sample variables
    const initialVars = {};
    (prompt.variables || []).forEach((v) => {
      initialVars[v] = `Sample ${v}`;
    });
    if (initialVars.eventName) initialVars.eventName = 'AI Research Symposium';
    if (initialVars.category) initialVars.category = 'Technical';
    if (initialVars.emailType) initialVars.emailType = 'invitation';
    if (initialVars.eventTitle) initialVars.eventTitle = 'AI Research Symposium';
    if (initialVars.userQuery) initialVars.userQuery = 'What technical workshops are happening this week?';

    setTestVariables(initialVars);
  }, []);

  const fetchPrompts = useCallback(async () => {
    try {
      const res = await api.get('/ai/prompts');
      const list = res.data.prompts || [];
      setPrompts(list);
      if (list.length > 0) {
        selectPrompt(list[0]);
      }
    } catch (err) {
      console.warn('Failed to load prompts', err);
    }
  }, [selectPrompt]);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  const handleTestRun = async () => {
    if (!selectedPrompt) return;
    setTesting(true);
    try {
      const res = await api.post('/ai/prompts/test', {
        promptName: selectedPrompt.name,
        variables: testVariables,
      });
      setTestResult(res.data);
    } catch (err) {
      setTestResult({ error: err.response?.data?.message || 'Test execution failed.' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <DashboardLayout navItems={navItems}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-neutral-400 bg-neutral-500/10 px-3 py-1 rounded-full mb-2">
            <Cpu size={14} /> Centralized Prompt Engineering System
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold">Prompt Registry & Playground</h1>
          <p className="text-sm opacity-60">
            Version-controlled templates, JSON schemas, variable validation, and testing playground.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Registered Prompt List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 rounded-3xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-[#1A1A1E] space-y-3">
            <h2 className="font-display text-base font-semibold flex items-center gap-2">
              <Layers size={16} className="text-accent" /> Registered Templates ({prompts.length})
            </h2>

            <div className="space-y-2">
              {prompts.map((p) => (
                <button
                  key={p.name}
                  onClick={() => selectPrompt(p)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                    selectedPrompt?.name === p.name
                      ? 'border-accent bg-accent/10 shadow-sm'
                      : 'border-border-light dark:border-border-dark bg-white dark:bg-[#242429] hover:border-accent/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-display font-semibold text-xs">{p.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5">
                      v{p.version}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-60 line-clamp-2 leading-relaxed">{p.purpose}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Template Inspector & Playground */}
        <div className="lg:col-span-8 space-y-6">
          {selectedPrompt && (
            <div className="p-6 md:p-8 rounded-3xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-[#1A1A1E] space-y-6">
              {/* Template Metadata */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-light dark:border-border-dark pb-4">
                <div>
                  <h3 className="font-display text-xl font-semibold text-accent">{selectedPrompt.name}</h3>
                  <p className="text-xs opacity-60">{selectedPrompt.purpose}</p>
                </div>
                <span className="font-mono text-xs px-3 py-1 rounded-full bg-accent/10 text-accent font-bold self-start sm:self-auto">
                  Version {selectedPrompt.version}
                </span>
              </div>

              {/* Variable Inputs */}
              <div className="space-y-3">
                <h4 className="font-display text-sm font-semibold flex items-center gap-2">
                  <Sliders size={16} className="text-accent" /> Runtime Interpolation Variables
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(selectedPrompt.variables || []).map((v) => (
                    <div key={v}>
                      <label className="block text-[11px] font-mono uppercase tracking-wider opacity-60 mb-1">{v}</label>
                      <input
                        type="text"
                        value={testVariables[v] || ''}
                        onChange={(e) => setTestVariables({ ...testVariables, [v]: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] outline-none focus:border-accent font-mono"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Execution Action Button */}
              <div className="pt-2">
                <button
                  onClick={handleTestRun}
                  disabled={testing}
                  className="py-3 px-6 rounded-full bg-accent text-white text-xs font-mono font-medium hover:opacity-90 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {testing ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
                  EXECUTE PROMPT TEST IN PLAYGROUND
                </button>
              </div>

              {/* Live Test Result Output */}
              {testResult && (
                <div className="p-4 md:p-6 rounded-2xl bg-white dark:bg-[#242429] border border-border-light dark:border-border-dark space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-xs font-semibold flex items-center gap-1.5 text-accent">
                      <Code size={14} /> Structured JSON Response
                    </span>
                    {testResult.metadata && (
                      <span className="text-[10px] font-mono opacity-50">
                        Provider: {testResult.metadata.provider} | Model: {testResult.metadata.model}
                      </span>
                    )}
                  </div>

                  {testResult.error ? (
                    <p className="text-xs text-red-500">{testResult.error}</p>
                  ) : (
                    <pre className="p-4 rounded-xl bg-bg-light dark:bg-[#1A1A1E] border border-border-light dark:border-border-dark text-[11px] font-mono overflow-x-auto text-ink-light dark:text-ink-dark leading-relaxed">
                      {JSON.stringify(testResult.result || testResult, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PromptSystemView;
