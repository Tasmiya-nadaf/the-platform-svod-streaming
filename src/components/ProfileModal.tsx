import React, { useState } from 'react';
import {
  X,
  Users,
  Plus,
  Shield,
  Lock,
  KeyRound,
  Check,
  Trash2,
  Baby,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { UserProfile, MaturityRating } from '../types/platform';
import { platformStore } from '../services/platformStore';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: UserProfile[];
  activeProfile: UserProfile;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profiles,
  activeProfile,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [isKidsProfile, setIsKidsProfile] = useState(false);
  const [parentalPin, setParentalPin] = useState('1234');
  const [maxRating, setMaxRating] = useState<MaturityRating>('PG-13');
  const [pinPromptProfile, setPinPromptProfile] = useState<UserProfile | null>(null);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');

  if (!isOpen) return null;

  const handleSelectProfile = (profile: UserProfile) => {
    // If PIN protected child profile, prompt for PIN
    if (profile.pin && profile.id !== activeProfile.id) {
      setPinPromptProfile(profile);
      setEnteredPin('');
      setPinError('');
      return;
    }

    platformStore.switchProfile(profile.id);
    onClose();
  };

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinPromptProfile) return;

    if (enteredPin === pinPromptProfile.pin) {
      platformStore.switchProfile(pinPromptProfile.id);
      setPinPromptProfile(null);
      onClose();
    } else {
      setPinError('Incorrect 4-digit Parental PIN. Please try again.');
    }
  };

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;

    const success = platformStore.addProfile(
      newProfileName.trim(),
      isKidsProfile,
      isKidsProfile ? parentalPin : undefined,
      isKidsProfile ? 'PG' : maxRating
    );

    if (success) {
      setIsAdding(false);
      setNewProfileName('');
      setIsKidsProfile(false);
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    platformStore.deleteProfile(id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-600/10 text-red-500 border border-red-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Who’s Watching?</h3>
              <p className="text-xs text-slate-400">
                Manage up to 5 profiles with personal watchlists and parental rating locks
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

        {/* PIN Verification View */}
        {pinPromptProfile ? (
          <div className="p-8 text-center max-w-sm mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center">
              <Lock className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-bold text-white">Parental Lock PIN Required</h4>
            <p className="text-xs text-slate-400">
              Enter the 4-digit PIN to switch to <strong>{pinPromptProfile.name}</strong>
              <br />
              (Default demo PIN: <span className="font-mono text-cyan-400 font-bold">1234</span>)
            </p>

            <form onSubmit={handleVerifyPin} className="space-y-4">
              <input
                type="password"
                maxLength={4}
                autoFocus
                value={enteredPin}
                onChange={(e) => {
                  setEnteredPin(e.target.value);
                  if (pinError) setPinError('');
                }}
                placeholder="••••"
                className="w-36 mx-auto text-center font-mono text-2xl tracking-widest bg-slate-950 border border-slate-700 rounded-xl py-2 text-white focus:outline-none focus:border-red-500"
              />
              {pinError && <p className="text-xs text-rose-400">{pinError}</p>}

              <div className="flex gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => setPinPromptProfile(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg"
                >
                  Unlock & Switch
                </button>
              </div>
            </form>
          </div>
        ) : !isAdding ? (
          /* Profile Picker Grid */
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 justify-center">
              {profiles.map((p) => {
                const isActive = p.id === activeProfile.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectProfile(p)}
                    className="flex flex-col items-center group cursor-pointer text-center relative"
                  >
                    <div
                      className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden p-0.5 border-2 transition-all transform group-hover:scale-105 shadow-xl ${
                        isActive
                          ? 'border-red-500 ring-4 ring-red-500/20'
                          : 'border-slate-700 group-hover:border-slate-400'
                      }`}
                    >
                      <img
                        src={p.avatar}
                        alt={p.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                      {p.isKids && (
                        <div className="absolute bottom-1 right-1 p-1 rounded-md bg-amber-500 text-slate-950 font-black text-[9px] flex items-center gap-0.5 shadow">
                          <Baby className="w-3 h-3" /> KIDS
                        </div>
                      )}
                      {p.pin && (
                        <div className="absolute top-1 left-1 p-1 rounded-md bg-slate-950/80 text-amber-400 text-[10px]">
                          <Lock className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    <div className="mt-2.5">
                      <span className="font-bold text-sm text-slate-200 group-hover:text-white block truncate max-w-[100px]">
                        {p.name}
                      </span>
                      <span className="text-[11px] text-slate-400">Max: {p.maxRating}</span>
                    </div>

                    {profiles.length > 1 && !isActive && (
                      <button
                        onClick={(e) => handleDelete(p.id, e)}
                        className="absolute -top-2 -right-2 p-1.5 rounded-full bg-slate-800 text-slate-500 hover:text-rose-400 hover:bg-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete Profile"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Add Profile button (if < 5 profiles) */}
              {profiles.length < 5 && (
                <div
                  onClick={() => setIsAdding(true)}
                  className="flex flex-col items-center group cursor-pointer text-center"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-dashed border-slate-700 group-hover:border-cyan-400 flex flex-col items-center justify-center text-slate-500 group-hover:text-cyan-400 transition-colors">
                    <Plus className="w-8 h-8" />
                  </div>
                  <span className="font-bold text-xs text-slate-400 group-hover:text-white mt-2.5">
                    Add Profile
                  </span>
                </div>
              )}
            </div>

            {/* Account Security / MFA Status footer */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Multi-Factor Authentication (MFA) Active</span>
              </div>
              <span className="text-[11px] font-mono text-cyan-400">
                {profiles.length}/5 Profiles Used
              </span>
            </div>
          </div>
        ) : (
          /* Add Profile Form */
          <form onSubmit={handleCreateProfile} className="p-6 sm:p-8 space-y-4">
            <h4 className="font-bold text-white text-base">Create New Profile</h4>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Profile Name
              </label>
              <input
                type="text"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                placeholder="e.g. Sarah, Kids Room, Movie Night"
                maxLength={20}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
              />
            </div>

            {/* Kids Profile Toggle */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Baby className="w-5 h-5 text-amber-400" />
                  <div>
                    <span className="font-bold text-sm text-white block">Kids Club Profile</span>
                    <span className="text-xs text-slate-400">
                      Restricts catalog to child-safe content (G, PG only)
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isKidsProfile}
                  onChange={(e) => setIsKidsProfile(e.target.checked)}
                  className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                />
              </div>

              {isKidsProfile && (
                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <label className="block text-xs font-semibold text-slate-400">
                    Parental Control Lock PIN (4 Digits)
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={parentalPin}
                    onChange={(e) => setParentalPin(e.target.value)}
                    placeholder="1234"
                    className="w-32 font-mono text-center text-sm bg-slate-900 border border-slate-700 rounded-lg py-1.5 text-white"
                  />
                </div>
              )}
            </div>

            {/* Maturity Rating Limit */}
            {!isKidsProfile && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Maturity Rating Filter
                </label>
                <div className="flex gap-2">
                  {(['G', 'PG', 'PG-13', 'R', 'NC-17'] as MaturityRating[]).map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setMaxRating(r)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        maxRating === r
                          ? 'bg-red-600 text-white border-red-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30"
              >
                Save Profile
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
