import React, { useState } from 'react';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Layers,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { SyncSettings } from '../services/storage';
import { QueuedMutation } from '../types/task';

interface SyncStatusBarProps {
  settings: SyncSettings;
  queue: QueuedMutation[];
  onToggleOnline: () => void;
  onForceSync: () => Promise<void>;
  onOpenDiagnostics: () => void;
  onSimulatePeerUpdate: () => void;
}

export const SyncStatusBar: React.FC<SyncStatusBarProps> = ({
  settings,
  queue,
  onToggleOnline,
  onForceSync,
  onOpenDiagnostics,
  onSimulatePeerUpdate,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncClick = async () => {
    setIsSyncing(true);
    await onForceSync();
    setTimeout(() => setIsSyncing(false), 500);
  };

  return (
    <div className="w-full mb-6">
      <div
        className={`rounded-2xl p-4 sm:p-5 border transition-all duration-300 shadow-xl ${
          settings.isOnline
            ? 'bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border-emerald-500/30'
            : 'bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border-amber-500/40'
        }`}
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Status Indicator & Text */}
          <div className="flex items-start sm:items-center gap-3.5">
            <div
              className={`p-3 rounded-xl border flex items-center justify-center shrink-0 ${
                settings.isOnline
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse'
              }`}
            >
              {settings.isOnline ? (
                <Wifi className="w-5 h-5" />
              ) : (
                <WifiOff className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  {settings.isOnline
                    ? 'Cloud Real-Time Sync Active'
                    : 'Offline Mode: Local Persistence Engaged'}
                </h3>
                {settings.isOnline ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    Live
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-950 text-amber-300 border border-amber-800">
                    Local Cache Only
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                {settings.isOnline
                  ? queue.length > 0
                    ? `Flushing ${queue.length} pending offline operations to Firestore...`
                    : 'Connected to Firestore. Instant multi-tab synchronization active.'
                  : `Offline write queue has ${queue.length} uncommitted item${
                      queue.length === 1 ? '' : 's'
                    }. All reads & writes occur locally without data loss.`}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5 w-full lg:w-auto flex-wrap sm:flex-nowrap justify-end">
            {/* Toggle Online / Offline */}
            <button
              onClick={onToggleOnline}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                settings.isOnline
                  ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700 hover:border-amber-500/50'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-600/30'
              }`}
            >
              {settings.isOnline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  <span>Simulate Offline</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5" />
                  <span>Reconnect & Sync</span>
                </>
              )}
            </button>

            {/* Force Sync button */}
            {settings.isOnline && (
              <button
                onClick={handleSyncClick}
                disabled={isSyncing}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 disabled:opacity-50 transition-colors"
                title="Force Flush Offline Cache & Refresh"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 text-cyan-400 ${
                    isSyncing ? 'animate-spin' : ''
                  }`}
                />
                <span>Sync Now</span>
              </button>
            )}

            {/* Test Multi-Client Peer Broadcast */}
            <button
              onClick={onSimulatePeerUpdate}
              className="px-3 py-2 rounded-xl text-xs font-medium bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 border border-blue-800/80 flex items-center gap-1.5 transition-colors"
              title="Simulates an update coming from another user/device in real time"
            >
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              <span>Simulate Peer Sync</span>
            </button>

            {/* View Queue / Logs */}
            <button
              onClick={onOpenDiagnostics}
              className="px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>Queue ({queue.length})</span>
            </button>
          </div>
        </div>

        {/* Offline Notice Strip */}
        {!settings.isOnline && (
          <div className="mt-3.5 pt-3 border-t border-amber-900/40 flex items-center justify-between text-xs text-amber-200/90">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                You are currently in simulated offline mode. Try adding or editing tasks! They are saved to local persistence with zero latency.
              </span>
            </div>
            <button
              onClick={onToggleOnline}
              className="underline font-semibold hover:text-white shrink-0 ml-2"
            >
              Go Online to Sync →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
