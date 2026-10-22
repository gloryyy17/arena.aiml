import { useState } from 'react';
import { getServerUrl, setServerUrl, testServerConnection, DEFAULT_SERVER_URL } from '../api/axios';
import { Server, Wifi, CheckCircle2, AlertCircle, RefreshCw, X } from 'lucide-react';

const ServerConfigModal = ({ isOpen, onClose }) => {
  const [url, setUrl] = useState(getServerUrl());
  const [status, setStatus] = useState(null); // { success: boolean, message: string }
  const [testing, setTesting] = useState(false);

  if (!isOpen) return null;

  const handleTest = async () => {
    setTesting(true);
    setStatus(null);
    const result = await testServerConnection(url);
    setStatus(result);
    setTesting(false);
  };

  const handleSave = () => {
    const formatted = setServerUrl(url);
    setUrl(formatted);
    onClose();
  };

  const handleReset = () => {
    setUrl(DEFAULT_SERVER_URL);
    setStatus(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl theme-card p-5 space-y-4 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full theme-card-subtle text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#5B47FB]/15 text-[#5B47FB] flex items-center justify-center">
            <Server size={18} />
          </div>
          <div>
            <h3 className="font-display text-sm font-bold theme-text">Server Connection</h3>
            <p className="text-[11px] theme-text-secondary">Configure backend API address</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-mono uppercase tracking-wider theme-text-secondary block">
            Backend API Endpoint
          </label>
          <div className="relative">
            <Wifi size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="http://10.18.157.15:5000/api"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl theme-input text-xs font-mono outline-none focus:border-[#5B47FB] transition-colors"
            />
          </div>
          <p className="text-[10px] theme-text-muted">
            Phone & PC must be on the same Wi-Fi network.
          </p>
        </div>

        {status && (
          <div
            className={`p-3 rounded-xl text-xs flex items-start gap-2 border ${
              status.success
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
            }`}
          >
            {status.success ? (
              <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-500" />
            ) : (
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
            )}
            <span className="font-mono text-[11px] leading-tight">{status.message}</span>
          </div>
        )}

        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={handleTest}
            disabled={testing}
            className="flex-1 py-2.5 rounded-xl theme-card-subtle theme-text text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            {testing ? <RefreshCw size={13} className="animate-spin" /> : <Wifi size={13} />}
            {testing ? 'Testing...' : 'Test Ping'}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-[#5B47FB] text-white text-xs font-semibold active:scale-95 transition-all shadow-md shadow-[#5B47FB]/25"
          >
            Save & Connect
          </button>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={handleReset}
            className="text-[10px] font-mono theme-text-muted hover:underline"
          >
            Reset to default Wi-Fi IP (10.18.157.15:5000)
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServerConfigModal;
