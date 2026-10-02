import React, { useState } from 'react';
import {
  Search,
  Users,
  CreditCard,
  ShieldCheck,
  Download,
  Tv,
  Film,
  Smartphone,
  Monitor,
  Cpu,
  Baby,
  Sparkles,
  Lock,
} from 'lucide-react';
import { UserProfile, PlanTier, ViewportMode } from '../types/platform';
import { platformStore } from '../services/platformStore';

interface NavbarProps {
  activeTab: 'browse' | 'movies' | 'series' | 'mylist' | 'downloads' | 'cms';
  onSelectTab: (tab: 'browse' | 'movies' | 'series' | 'mylist' | 'downloads' | 'cms') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeProfile: UserProfile;
  onOpenProfiles: () => void;
  onOpenSubscription: () => void;
  onOpenDrmSessions: () => void;
  onOpenExport: () => void;
  viewportMode: ViewportMode;
  onSelectViewport: (mode: ViewportMode) => void;
  activeScreensCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  searchQuery,
  onSearchChange,
  activeProfile,
  onOpenProfiles,
  onOpenSubscription,
  onOpenDrmSessions,
  onOpenExport,
  viewportMode,
  onSelectViewport,
  activeScreensCount,
}) => {
  const planConfig = platformStore.getPlanConfig();
  const [showSearchInput, setShowSearchInput] = useState(false);

  return (
    <header className="bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40 text-slate-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand & SVOD Navigation Links */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div
            onClick={() => onSelectTab('browse')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 flex items-center justify-center shadow-lg shadow-red-600/30 text-white font-black text-lg">
              P
            </div>
            <div>
              <span className="font-black text-base sm:text-lg tracking-wider text-white uppercase group-hover:text-red-400 transition-colors">
                The Platform
              </span>
              <span className="hidden sm:inline-block ml-1.5 px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-red-600/20 text-red-400 border border-red-500/30">
                SVOD
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
            {[
              { id: 'browse', label: 'Home' },
              { id: 'movies', label: 'Movies' },
              { id: 'series', label: 'Series' },
              { id: 'mylist', label: 'My List' },
              { id: 'downloads', label: 'Offline' },
              { id: 'cms', label: 'CMS / Transcoding' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'text-white bg-slate-800 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Viewport Selector (Desktop / iOS / Android) */}
        <div className="hidden lg:flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => onSelectViewport('desktop')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all ${
              viewportMode === 'desktop'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Standard Web Browser"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Web</span>
          </button>
          <button
            onClick={() => onSelectViewport('ios')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all ${
              viewportMode === 'ios'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="iOS Mobile App Viewport"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>iOS</span>
          </button>
          <button
            onClick={() => onSelectViewport('android')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all ${
              viewportMode === 'android'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Android Mobile App Viewport"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android</span>
          </button>
        </div>

        {/* Right Action Controls: Search, DRM/Screens, Plan, Profile, Export */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Search Bar */}
          <div className="relative flex items-center">
            {showSearchInput ? (
              <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-xs">
                <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Titles, actors, genres..."
                  className="bg-transparent text-white placeholder-slate-500 focus:outline-none w-32 sm:w-48 text-xs"
                />
                <button
                  onClick={() => {
                    setShowSearchInput(false);
                    onSearchChange('');
                  }}
                  className="text-slate-400 hover:text-white ml-1 text-xs"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSearchInput(true)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
                title="Search Movies & Shows"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Concurrent Screens / DRM Monitor Pill */}
          <button
            onClick={onOpenDrmSessions}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
            title="DRM & Concurrent Screen Session Management"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">
              {activeScreensCount}/{planConfig.maxScreens} Screens
            </span>
          </button>

          {/* Subscription Tier Pill */}
          <button
            onClick={onOpenSubscription}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500/10 to-red-500/10 hover:from-amber-500/20 hover:to-red-500/20 text-amber-300 border border-amber-500/30 transition-all"
            title="Subscription & Billing Tier"
          >
            <CreditCard className="w-3.5 h-3.5 text-amber-400" />
            <span className="uppercase text-[11px]">{planConfig.name}</span>
          </button>

          {/* Profile Switcher & Avatar */}
          <button
            onClick={onOpenProfiles}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-900 transition-colors group"
            title="Switch User Profile or Parental Controls"
          >
            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-700 group-hover:border-red-500">
              <img
                src={activeProfile.avatar}
                alt={activeProfile.name}
                className="w-full h-full object-cover"
              />
              {activeProfile.isKids && (
                <div className="absolute inset-0 bg-amber-500/80 flex items-center justify-center">
                  <Baby className="w-3 h-3 text-slate-950 font-black" />
                </div>
              )}
            </div>
            <span className="text-xs font-bold text-slate-200 hidden md:inline truncate max-w-[80px]">
              {activeProfile.name}
            </span>
          </button>

          {/* Export Code & Submission Button */}
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-lg shadow-red-600/30 transition-all shrink-0 transform active:scale-95"
            title="Download Complete Project ZIP Archive for Assessment Submission"
          >
            <Download className="w-4 h-4" />
            <span>Download ZIP Project</span>
          </button>
        </div>
      </div>

      {/* Mobile Secondary Tab Bar */}
      <div className="flex md:hidden items-center justify-around border-t border-slate-800/80 px-2 py-1 text-[11px] font-semibold bg-slate-950">
        {[
          { id: 'browse', label: 'Home' },
          { id: 'movies', label: 'Movies' },
          { id: 'series', label: 'Series' },
          { id: 'mylist', label: 'My List' },
          { id: 'downloads', label: 'Offline' },
          { id: 'cms', label: 'CMS' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id as any)}
            className={`py-1 px-2 rounded ${
              activeTab === tab.id ? 'text-red-400 font-bold' : 'text-slate-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
};
