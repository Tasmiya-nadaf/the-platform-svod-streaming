import React from 'react';
import { ViewportMode } from '../types/platform';
import { Wifi, Battery, Signal, ChevronLeft } from 'lucide-react';

interface DeviceSimulatorProps {
  mode: ViewportMode;
  children: React.ReactNode;
  onExit: () => void;
  isOnline: boolean;
}

export const DeviceSimulator: React.FC<DeviceSimulatorProps> = ({
  mode,
  children,
  onExit,
  isOnline,
}) => {
  if (mode === 'desktop') {
    return <>{children}</>;
  }

  const isIOS = mode === 'ios';

  return (
    <div className="min-h-screen py-8 px-4 flex flex-col items-center justify-center bg-slate-950/80">
      {/* Viewport header switcher bar */}
      <div className="mb-4 flex items-center justify-between w-full max-w-[420px] px-2 text-xs text-slate-400">
        <button
          onClick={onExit}
          className="flex items-center gap-1 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Exit Simulator</span>
        </button>

        <span className="font-semibold text-slate-300">
          {isIOS ? 'iPhone 15 Pro Simulator' : 'Android Pixel Simulator'}
        </span>

        <span className="text-[11px] font-mono text-cyan-400">
          React Native Frame
        </span>
      </div>

      {/* Phone chassis */}
      <div
        className={`w-full max-w-[390px] h-[820px] bg-slate-950 rounded-[50px] p-3 shadow-2xl relative border-[6px] transition-all flex flex-col overflow-hidden ${
          isIOS
            ? 'border-slate-700 shadow-cyan-950/30'
            : 'border-slate-800 rounded-[44px]'
        }`}
        style={{
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 40px rgba(14, 165, 233, 0.1)',
        }}
      >
        {/* Dynamic Island / Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          {isIOS ? (
            <div className="w-28 h-6 bg-black rounded-full flex items-center justify-between px-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800"></div>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>
          ) : (
            <div className="w-3.5 h-3.5 rounded-full bg-black border border-slate-800"></div>
          )}
        </div>

        {/* Mobile Screen Container */}
        <div className="w-full h-full bg-slate-900 rounded-[38px] overflow-hidden flex flex-col relative border border-slate-800/80">
          {/* Native Status Bar */}
          <div className="h-10 px-6 pt-2 flex items-center justify-between text-[11px] font-semibold text-slate-300 shrink-0 z-40 bg-slate-900">
            <span>9:41</span>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Signal className="w-3 h-3" />
              {isOnline ? (
                <Wifi className="w-3 h-3 text-emerald-400" />
              ) : (
                <span className="text-[9px] text-amber-400 font-bold">OFFLINE</span>
              )}
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Screen Content Scroll Area */}
          <div className="flex-1 overflow-y-auto px-4 pb-20 pt-1 [scrollbar-width:none]">
            {children}
          </div>

          {/* Home Indicator Bar */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-600 rounded-full pointer-events-none z-50"></div>
        </div>
      </div>
    </div>
  );
};
