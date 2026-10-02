import React, { useState } from 'react';
import {
  X,
  Shield,
  ShieldCheck,
  Tv,
  Smartphone,
  Laptop,
  AlertTriangle,
  Trash2,
  Lock,
  Plus,
  Radio,
  CheckCircle2,
} from 'lucide-react';
import { ActiveSession, PlanTier } from '../types/platform';
import { platformStore } from '../services/platformStore';

interface DRMSessionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ActiveSession[];
  currentPlan: PlanTier;
}

export const DRMSessionDrawer: React.FC<DRMSessionDrawerProps> = ({
  isOpen,
  onClose,
  sessions,
  currentPlan,
}) => {
  const [testSimulatingSession, setTestSimulatingSession] = useState(false);

  if (!isOpen) return null;

  const planConfig = platformStore.getPlanConfig();
  const maxAllowed = planConfig.maxScreens;
  const currentCount = sessions.length;
  const isLimitReached = currentCount >= maxAllowed;

  const handleSimulateNewDevice = () => {
    const success = platformStore.addActiveSession(
      'Bedroom iPad Air (iOS 18)',
      'Tears of Steel: Cyber Rebirth'
    );
    if (!success) {
      setTestSimulatingSession(true);
      setTimeout(() => setTestSimulatingSession(false), 3000);
    }
  };

  const handleTerminate = (id: string) => {
    platformStore.terminateSession(id);
  };

  const getDeviceIcon = (type: ActiveSession['deviceType']) => {
    switch (type) {
      case 'smart_tv':
        return <Tv className="w-4 h-4 text-cyan-400" />;
      case 'web_browser':
        return <Laptop className="w-4 h-4 text-blue-400" />;
      default:
        return <Smartphone className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl text-slate-100">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">DRM & Concurrent Session Guard</h3>
              <p className="text-xs text-slate-400">
                SRS Section 5 • Multi-DRM (Widevine/FairPlay/PlayReady) & Stream Limits
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {/* Active Screen Gauge */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-white text-sm block">
                  Concurrent Screen Utilization
                </span>
                <span className="text-slate-400 text-xs">
                  {planConfig.name} Plan allows up to {maxAllowed} simultaneous screen{maxAllowed > 1 ? 's' : ''}
                </span>
              </div>
              <div className="text-right">
                <span
                  className={`text-lg font-black font-mono ${
                    isLimitReached ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {currentCount} / {maxAllowed}
                </span>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">
                  Active Screens
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isLimitReached ? 'bg-amber-400' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, (currentCount / maxAllowed) * 100)}%` }}
              />
            </div>

            {isLimitReached && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  Maximum concurrent screen limit reached for your {planConfig.name} plan. Additional streaming requests will be blocked.
                </span>
              </div>
            )}
          </div>

          {/* Test Screen Spawner CTA */}
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
              Active Devices Streaming Now ({sessions.length})
            </span>
            <button
              onClick={handleSimulateNewDevice}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Simulate Extra Screen</span>
            </button>
          </div>

          {testSimulatingSession && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                Stream Blocked: Concurrent stream limit exceeded ({maxAllowed}/{maxAllowed}). Upgrade plan or terminate a session below.
              </span>
            </div>
          )}

          {/* Active Sessions List */}
          <div className="space-y-2.5">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    {getDeviceIcon(sess.deviceType)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{sess.deviceName}</span>
                      {sess.isCurrentDevice && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                          This Device
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Watching: <span className="text-slate-200">{sess.currentMediaTitle}</span> • {sess.resolution}
                    </p>
                    <span className="text-[10px] text-slate-500 font-mono">
                      IP: {sess.ipAddress} • Active: {sess.startedAt}
                    </span>
                  </div>
                </div>

                {!sess.isCurrentDevice && (
                  <button
                    onClick={() => handleTerminate(sess.id)}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-800 transition-colors shrink-0"
                    title="Terminate Remote Stream"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Multi-DRM Security Specifications (SRS Section 5) */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] block">
              Multi-DRM Content Protection Architecture
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-[11px]">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Google Widevine
                </div>
                <p className="text-slate-400 text-[10px] font-sans">
                  Modular L1 Hardware Decryption for Chrome, Android & Smart TVs.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Apple FairPlay
                </div>
                <p className="text-slate-400 text-[10px] font-sans">
                  HLS FairPlay Streaming protocol for iOS, iPadOS, Safari & Apple TV.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-1.5 text-blue-400 font-bold mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Microsoft PlayReady
                </div>
                <p className="text-slate-400 text-[10px] font-sans">
                  SL3000 Hardware DRM for Windows Edge & Xbox systems.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-1.5 text-purple-400 font-bold mb-1">
                  <Lock className="w-3.5 h-3.5" /> TLS 1.3 & AES-128
                </div>
                <p className="text-slate-400 text-[10px] font-sans">
                  Encrypted stream transport with dynamic rotation key licenses.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>Session heartbeat verified every 15s</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
