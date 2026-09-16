import React from 'react';
import { Sparkles, Sliders, RotateCcw, Activity, ShieldCheck } from 'lucide-react';
import { DecisionState } from '../types';

interface HeaderProps {
  state: DecisionState;
  onReset: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  state,
  onReset,
  onToggleSidebar,
  isSidebarOpen,
  onOpenSettings
}) => {
  const optionCount = state.options.length;
  const isRecommended = state.stage === 'recommended';

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-slate-800/80 px-4 sm:px-6 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-violet-400 flex items-center justify-center shadow-lg shadow-purple-500/20 text-white font-bold">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold font-sans tracking-tight text-white flex items-center gap-1.5">
                DecisionMate <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-300">AI</span>
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
                <ShieldCheck className="w-3 h-3 text-purple-400" />
                Decision Support
              </span>
            </div>
            <p className="text-xs text-slate-400 font-normal hidden sm:block">
              Intelligent multi-criteria dilemma analysis & recommendations
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Decision Inspector Toggle */}
          <button
            onClick={onToggleSidebar}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${
              isSidebarOpen
                ? 'bg-purple-600/20 text-purple-300 border-purple-500/50 shadow-sm shadow-purple-500/20'
                : 'bg-slate-800/60 text-slate-300 border-slate-700/60 hover:bg-slate-800 hover:text-white'
            }`}
            title="Inspect current decision state and criteria weights"
          >
            <Activity className={`w-3.5 h-3.5 ${isRecommended ? 'text-emerald-400 animate-pulse' : 'text-purple-400'}`} />
            <span className="hidden xs:inline">Decision State</span>
            {optionCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-purple-500/30 text-purple-200">
                {optionCount} {optionCount === 1 ? 'opt' : 'opts'}
              </span>
            )}
          </button>

          {/* New Decision / Reset */}
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/60 text-slate-300 border border-slate-700/60 hover:bg-slate-800 hover:text-white transition-all duration-200"
            title="Start a new decision conversation"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">New Decision</span>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all border border-transparent hover:border-slate-700/50"
            title="AI Model & Provider Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
