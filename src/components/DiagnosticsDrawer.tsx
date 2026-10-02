import React, { useState } from 'react';
import {
  X,
  Activity,
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Trash2,
  Database,
  Radio,
  Share2,
} from 'lucide-react';
import { SyncLogEntry, QueuedMutation } from '../types/task';
import { SyncSettings } from '../services/storage';

interface DiagnosticsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  logs: SyncLogEntry[];
  queue: QueuedMutation[];
  settings: SyncSettings;
  onClearData: () => void;
  onRestoreDefaults: () => void;
}

export const DiagnosticsDrawer: React.FC<DiagnosticsDrawerProps> = ({
  isOpen,
  onClose,
  logs,
  queue,
  settings,
  onClearData,
  onRestoreDefaults,
}) => {
  const [activeTab, setActiveTab] = useState<'logs' | 'queue' | 'architecture'>('logs');

  if (!isOpen) return null;

  const getLogBadge = (type: SyncLogEntry['type']) => {
    switch (type) {
      case 'ONLINE':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'OFFLINE':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'SYNC_SUCCESS':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'SYNC_START':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'MUTATION_QUEUED':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'PEER_SYNC':
        return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl text-slate-100">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Sync Monitor & Diagnostics</h3>
              <p className="text-xs text-slate-400">
                Real-Time Firestore & Offline Cache Telemetry
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-4 pt-2">
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'logs'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Event Stream ({logs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('queue')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'queue'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Offline Queue ({queue.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'architecture'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Sync Architecture</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TAB 1: EVENT STREAM LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-2">
                <span>Real-time operations log (most recent first)</span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  Listening
                </span>
              </div>

              {logs.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-sm">
                  No sync events logged yet.
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs font-mono"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getLogBadge(
                          log.type
                        )}`}
                      >
                        {log.type}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-slate-300 font-sans text-xs mt-1">{log.message}</p>
                    {log.details && (
                      <pre className="mt-1.5 p-2 rounded bg-slate-900 text-[10px] text-slate-400 overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: OFFLINE MUTATION QUEUE */}
          {activeTab === 'queue' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                <p className="font-semibold mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  What is the Offline Mutation Queue?
                </p>
                When disconnected, actions (creates, updates, deletes) are held in this queue with metadata while immediately updating local state optimistically. Once connection is restored, the queue is drained and committed sequentially.
              </div>

              {queue.length === 0 ? (
                <div className="text-center py-12 bg-slate-950/50 rounded-2xl border border-slate-800/80">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
                  <p className="text-sm font-semibold text-slate-300">Queue is Clear</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    All local changes have been confirmed and synchronized to Firestore.
                  </p>
                </div>
              ) : (
                queue.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-bold text-amber-400">
                        #{idx + 1} {item.action}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-slate-400 font-mono text-[11px] space-y-1">
                      <div>Target Task ID: <span className="text-cyan-400">{item.taskId}</span></div>
                      <div>Retry Count: {item.retryCount}</div>
                    </div>
                    {item.taskData && (
                      <pre className="mt-2 p-2 rounded bg-slate-900 text-[10px] text-slate-300 overflow-x-auto">
                        {JSON.stringify(item.taskData, null, 2)}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: ARCHITECTURE */}
          {activeTab === 'architecture' && (
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-cyan-400" />
                  Firestore Snapshot Metadata Model
                </h4>
                <p className="text-slate-400 mb-3">
                  In production React Native applications, Firestore provides snapshot metadata flags:
                </p>
                <div className="space-y-2 font-mono text-[11px]">
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-amber-400 font-bold">fromCache: true/false</span>
                    <p className="text-slate-400 font-sans text-xs mt-0.5">
                      Indicates whether documents were served directly from local persistence without a network round-trip.
                    </p>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-amber-400 font-bold">hasPendingWrites: true/false</span>
                    <p className="text-slate-400 font-sans text-xs mt-0.5">
                      Indicates whether local edits have not yet been acknowledged by the cloud backend.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-blue-400" />
                  Multi-Tab Real-Time Sync Channel
                </h4>
                <p className="text-slate-400">
                  TaskFlow utilizes a live BroadcastChannel mesh (<code className="text-cyan-400 font-mono">taskflow_realtime_mesh</code>) replicating Firebase Firestore listeners across active browser tabs and native views. Open this app in another window or tab to watch updates reflect synchronously in &lt;100ms.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Conflict Resolution Policy
                </h4>
                <p className="text-slate-400">
                  When concurrent edits occur during network disconnection, TaskFlow applies <strong>Last-Write-Wins (LWW)</strong> governed by deterministic ISO-8601 timestamps and monotonic version vectors (<code className="text-cyan-400 font-mono">syncVersion</code>).
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Utilities */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-3 text-xs">
          <button
            onClick={onRestoreDefaults}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>

          <button
            onClick={onClearData}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/60 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Cache</span>
          </button>
        </div>
      </div>
    </div>
  );
};
