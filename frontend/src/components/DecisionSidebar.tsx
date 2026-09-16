import React, { useState } from 'react';
import { X, Layers, Target, Star, SlidersHorizontal, HelpCircle, Code } from 'lucide-react';
import { DecisionState } from '../types';

interface DecisionSidebarProps {
  state: DecisionState;
  isOpen: boolean;
  onClose: () => void;
}

export const DecisionSidebar: React.FC<DecisionSidebarProps> = ({
  state,
  isOpen,
  onClose
}) => {
  const [showRawJson, setShowRawJson] = useState(false);

  if (!isOpen) return null;

  const stageColors = {
    detecting: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
    clarifying: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    analyzing: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
    recommended: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
  };

  return (
    <aside className="fixed inset-y-0 right-0 z-40 w-full max-w-sm glass-panel border-l border-slate-800 shadow-2xl flex flex-col animate-slide-up sm:animate-none">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-400" />
          <h3 className="font-bold text-sm text-white">Decision State Inspector</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRawJson(!showRawJson)}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              showRawJson ? 'bg-purple-600/30 text-purple-300' : 'text-slate-400 hover:text-white'
            }`}
            title="Toggle Raw JSON State"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs text-slate-300">
        {showRawJson ? (
          <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-purple-300 overflow-x-auto whitespace-pre-wrap font-mono">
            {JSON.stringify(state, null, 2)}
          </pre>
        ) : (
          <>
            {/* Stage & Type */}
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                  Engine Stage
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${stageColors[state.stage] || stageColors.detecting}`}>
                  {state.stage}
                </span>
              </div>
              {state.decisionType && (
                <div className="text-right">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                    Decision Type
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/30 capitalize">
                    {state.decisionType}
                  </span>
                </div>
              )}
            </div>

            {/* Target Goal */}
            <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-purple-300 uppercase tracking-wider mb-1">
                <Target className="w-3.5 h-3.5" />
                Target Goal
              </div>
              {state.goal ? (
                <p className="text-white font-medium">{state.goal}</p>
              ) : (
                <p className="text-slate-400 italic">Not explicitly specified yet</p>
              )}
            </div>

            {/* User Priorities */}
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                <Star className="w-3.5 h-3.5 text-amber-400" />
                Detected Priorities
              </div>
              {state.priorities.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {state.priorities.map((p, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[11px] capitalize">
                      {p}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 italic">Determining during conversation...</p>
              )}
            </div>

            {/* Extracted Options */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Options Detected ({state.options.length})
                </span>
              </div>
              {state.options.length > 0 ? (
                <div className="space-y-2">
                  {state.options.map(opt => (
                    <div key={opt.id} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                      <div className="font-semibold text-white flex items-center justify-between">
                        <span>{opt.name}</span>
                        {opt.stipend && (
                          <span className="text-emerald-400 text-[10px] font-mono">{opt.stipend}</span>
                        )}
                      </div>
                      {opt.role && (
                        <p className="text-slate-300 text-[11px] mt-0.5">Role: {opt.role}</p>
                      )}
                      {opt.technology && opt.technology.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {opt.technology.map((t, idx) => (
                            <span key={idx} className="px-1.5 py-0.2 rounded text-[10px] bg-purple-500/20 text-purple-300">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-xl border border-dashed border-slate-800 text-center text-slate-400">
                  <HelpCircle className="w-5 h-5 mx-auto mb-1 text-slate-400" />
                  No specific options identified yet.
                </div>
              )}
            </div>

            {/* Dynamic Criteria Breakdown */}
            {state.criteria.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" />
                  Dynamic Criteria (Weights)
                </div>
                <div className="space-y-1.5">
                  {state.criteria.map(crit => (
                    <div key={crit.key} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/40 border border-slate-800/60">
                      <span className="text-slate-300 text-[11px]">{crit.label}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-purple-400 font-bold text-[11px]">{crit.weight}/5</span>
                        <div className="w-12 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${(crit.weight / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Information Alerts */}
            {state.missingInformation.length > 0 && state.stage !== 'recommended' && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px]">
                <span className="font-semibold block mb-1">Awaiting Information:</span>
                <ul className="list-disc list-inside space-y-0.5 text-amber-200/80">
                  {state.missingInformation.map((m, i) => (
                    <li key={i} className="capitalize">{m}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-800 text-center text-[11px] text-slate-400">
        Turn count: {state.turnCount} • Memory Active
      </div>
    </aside>
  );
};
