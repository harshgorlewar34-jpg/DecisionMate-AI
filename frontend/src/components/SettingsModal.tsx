import React from 'react';
import { X, Sliders, CheckCircle2, Key, Zap, Shield } from 'lucide-react';
import { ProviderSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ProviderSettings;
  onSaveSettings: (settings: ProviderSettings) => void;
  backendHealthy: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  backendHealthy
}) => {
  const [localSettings, setLocalSettings] = React.useState<ProviderSettings>(settings);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md glass-card rounded-2xl border border-slate-700/80 p-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-base text-white">AI Engine & Provider Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-4 py-4 text-xs text-slate-300">
          {/* Status badge */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-400">Backend Server Status:</span>
            <span className={`flex items-center gap-1.5 font-medium ${backendHealthy ? 'text-emerald-400' : 'text-rose-400'}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              {backendHealthy ? 'Connected (Port 5000)' : 'Disconnected'}
            </span>
          </div>

          {/* AI Provider selection */}
          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider text-[10px] mb-2">
              Decision Intelligence Engine
            </label>
            <div className="space-y-2">
              <label className="flex items-start gap-3 p-3 rounded-xl border bg-slate-900/40 border-slate-800 cursor-pointer hover:border-purple-500/40 transition-colors">
                <input
                  type="radio"
                  name="provider"
                  value="auto"
                  checked={localSettings.provider === 'auto'}
                  onChange={() => setLocalSettings({ ...localSettings, provider: 'auto' })}
                  className="mt-0.5 accent-purple-600"
                />
                <div>
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Auto / Smart Local Engine (Recommended)
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    100% offline-ready, deterministic multi-criteria scoring following Section 13 format. Uses backend .env keys if provided.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border bg-slate-900/40 border-slate-800 cursor-pointer hover:border-purple-500/40 transition-colors">
                <input
                  type="radio"
                  name="provider"
                  value="gemini"
                  checked={localSettings.provider === 'gemini'}
                  onChange={() => setLocalSettings({ ...localSettings, provider: 'gemini' })}
                  className="mt-0.5 accent-purple-600"
                />
                <div>
                  <div className="font-semibold text-white">Google Gemini API</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Powered by Gemini 1.5 Flash with structured system prompt constraints.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border bg-slate-900/40 border-slate-800 cursor-pointer hover:border-purple-500/40 transition-colors">
                <input
                  type="radio"
                  name="provider"
                  value="openai"
                  checked={localSettings.provider === 'openai'}
                  onChange={() => setLocalSettings({ ...localSettings, provider: 'openai' })}
                  className="mt-0.5 accent-purple-600"
                />
                <div>
                  <div className="font-semibold text-white">OpenAI API</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Powered by GPT-4o-mini with objective decision reasoning.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Optional API Key Input */}
          {localSettings.provider === 'gemini' && (
            <div>
              <label className="block font-medium text-slate-300 text-[11px] mb-1 flex items-center gap-1">
                <Key className="w-3 h-3 text-purple-400" /> Gemini API Key (Optional)
              </label>
              <input
                type="password"
                value={localSettings.geminiApiKey}
                onChange={(e) => setLocalSettings({ ...localSettings, geminiApiKey: e.target.value })}
                placeholder="Leave blank to use backend .env key"
                className="w-full bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 text-xs"
              />
            </div>
          )}

          {localSettings.provider === 'openai' && (
            <div>
              <label className="block font-medium text-slate-300 text-[11px] mb-1 flex items-center gap-1">
                <Key className="w-3 h-3 text-purple-400" /> OpenAI API Key (Optional)
              </label>
              <input
                type="password"
                value={localSettings.openaiApiKey}
                onChange={(e) => setLocalSettings({ ...localSettings, openaiApiKey: e.target.value })}
                placeholder="Leave blank to use backend .env key"
                className="w-full bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 text-xs"
              />
            </div>
          )}

          {/* Security Notice */}
          <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-400 shrink-0" />
            <span>Keys entered here stay strictly in local browser memory and are never exposed publicly.</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
