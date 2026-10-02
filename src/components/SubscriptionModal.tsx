import React from 'react';
import {
  X,
  CreditCard,
  Check,
  Zap,
  Sparkles,
  ShieldCheck,
  Tv,
  Smartphone,
  Layers,
} from 'lucide-react';
import { PlanTier } from '../types/platform';
import { SUBSCRIPTION_PLANS } from '../data/mockCatalog';
import { platformStore } from '../services/platformStore';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: PlanTier;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  currentPlan,
}) => {
  if (!isOpen) return null;

  const isTrialActive = platformStore.isFreeTrialActive();

  const handleSelectPlan = (tier: PlanTier) => {
    platformStore.setPlanTier(tier);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Subscription & Tiered Plans</h3>
              <p className="text-xs text-slate-400">
                Choose the SVOD streaming plan that fits your household and device needs
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

        {/* Free Promotional Trial Banner */}
        <div className="mx-6 mt-6 p-4 rounded-2xl bg-gradient-to-r from-red-950/60 via-slate-900 to-amber-950/60 border border-red-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-sm text-white block">
                {isTrialActive ? '30-Day Free Promotional Trial Active' : 'Standard Monthly Billing'}
              </span>
              <span className="text-xs text-slate-400">
                {isTrialActive
                  ? 'First month free. Automated recurring billing begins on Day 31. Cancel anytime with 1 click.'
                  : 'Automated recurring billing active.'}
              </span>
            </div>
          </div>

          <button
            onClick={() => platformStore.toggleFreeTrial()}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shrink-0 transition-colors"
          >
            {isTrialActive ? 'Switch to Standard' : 'Enable Free Trial'}
          </button>
        </div>

        {/* 3 Tier Cards Grid */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto">
          {(['basic', 'standard', 'premium'] as PlanTier[]).map((tierKey) => {
            const plan = SUBSCRIPTION_PLANS[tierKey];
            const isSelected = currentPlan === tierKey;
            const isPremium = tierKey === 'premium';

            return (
              <div
                key={tierKey}
                className={`rounded-2xl p-5 border transition-all flex flex-col justify-between relative shadow-xl ${
                  isSelected
                    ? 'bg-slate-950 border-red-500 ring-2 ring-red-500/30'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {isPremium && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-red-500 text-white shadow-md">
                    Most Popular
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-black text-lg text-white">{plan.name}</h4>
                      <p className="text-xs text-slate-400 font-medium">{plan.maxResolution}</p>
                    </div>
                    {isSelected && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600/20 text-red-400 border border-red-500/30">
                        Current Plan
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <span className="text-3xl font-black text-white">
                      ${plan.priceMonthly.toFixed(2)}
                    </span>
                    <span className="text-slate-400 text-xs"> / month</span>
                  </div>

                  {/* Features list */}
                  <ul className="space-y-2.5 text-xs text-slate-300 mb-6">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleSelectPlan(tierKey)}
                  disabled={isSelected}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
                    isSelected
                      ? 'bg-slate-800 text-slate-400 cursor-default'
                      : isPremium
                      ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  {isSelected ? 'Active Plan' : `Upgrade to ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encrypted recurring subscription billing (Visa, Mastercard, Apple Pay)</span>
          </div>
          <button
            onClick={onClose}
            className="font-semibold text-slate-300 hover:text-white"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
