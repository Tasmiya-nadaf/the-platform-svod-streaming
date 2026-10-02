import React, { useState } from 'react';
import {
  X,
  Flame,
  Key,
  Shield,
  CheckCircle2,
  ExternalLink,
  Save,
  RotateCcw,
} from 'lucide-react';
import { SyncSettings } from '../services/storage';

interface FirebaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SyncSettings;
  onSaveSettings: (settings: Partial<SyncSettings>) => void;
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [apiKey, setApiKey] = useState(settings.firebaseCustomConfig?.apiKey || '');
  const [projectId, setProjectId] = useState(settings.firebaseCustomConfig?.projectId || '');
  const [authDomain, setAuthDomain] = useState(settings.firebaseCustomConfig?.authDomain || '');
  const [simulatedLatency, setSimulatedLatency] = useState(settings.simulatedLatencyMs);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      simulatedLatencyMs: simulatedLatency,
      firebaseCustomConfig: apiKey || projectId ? { apiKey, projectId, authDomain } : undefined,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleReset = () => {
    setApiKey('');
    setProjectId('');
    setAuthDomain('');
    setSimulatedLatency(400);
    onSaveSettings({
      simulatedLatencyMs: 400,
      firebaseCustomConfig: undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Firebase Connection & Sync Settings</h3>
              <p className="text-xs text-slate-400">
                Configure live Firebase credentials or adjust offline simulation parameters
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Settings saved! Real-time sync engine updated.</span>
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 leading-relaxed">
            TaskFlow includes an embedded Firestore offline simulation engine with <strong>BroadcastChannel multi-tab mesh</strong>, <strong>persistent local cache</strong>, and <strong>LWW conflict resolution</strong>. You can optionally connect your live Firebase project below.
          </div>

          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Simulated Network Latency (ms)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="2000"
                step="100"
                value={simulatedLatency}
                onChange={(e) => setSimulatedLatency(Number(e.target.value))}
                className="flex-1 accent-cyan-500 cursor-pointer"
              />
              <span className="font-mono text-cyan-400 w-16 text-right font-bold">
                {simulatedLatency} ms
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Simulates real-world mobile 4G/5G latency when re-syncing queued offline mutations.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <h4 className="font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              Live Firebase Credentials (Optional)
            </h4>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">Firebase Project ID</label>
                <input
                  type="text"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  placeholder="e.g. taskflow-project-12345"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Web API Key</label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Auth Domain (optional)</label>
                <input
                  type="text"
                  value={authDomain}
                  onChange={(e) => setAuthDomain(e.target.value)}
                  placeholder="project-id.firebaseapp.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-400 hover:text-slate-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/30 transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Settings</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
