import React from 'react';
import { Award, CheckCircle2, AlertTriangle, ArrowRight, TrendingUp, ShieldAlert, Sparkles } from 'lucide-react';
import { ComparisonAnalysis } from '../types';

interface ComparisonCardProps {
  analysis: ComparisonAnalysis;
}

export const ComparisonCard: React.FC<ComparisonCardProps> = ({ analysis }) => {
  const {
    recommendedOption,
    reasons,
    comparisonText,
    mainTradeoff,
    risksAndMissingInfo,
    nextSteps,
    confidence
  } = analysis;

  const confidenceColor =
    confidence === 'High'
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
      : confidence === 'Medium'
      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
      : 'bg-rose-500/10 text-rose-400 border-rose-500/30';

  return (
    <div className="w-full my-4 rounded-2xl glass-card overflow-hidden border border-purple-500/30 shadow-2xl animate-slide-up">
      {/* Top Banner: Recommendation & Confidence */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-slate-900/50 border-b border-purple-500/20 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-inner">
            <Award className="w-5 h-5 text-purple-300" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-purple-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Recommended Option
            </div>
            <div className="text-xl font-bold text-white tracking-tight">
              {recommendedOption}
            </div>
          </div>
        </div>

        <div className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${confidenceColor}`}>
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Confidence: {confidence}</span>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Why this choice */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
            Why This Recommendation
          </h4>
          <ul className="space-y-2">
            {reasons.map((r, i) => (
              <li key={i} className="text-xs sm:text-sm text-slate-200 flex items-start gap-2">
                <span className="text-purple-400 font-bold">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Structured Comparison Grid */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Options Comparison Breakdown
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(comparisonText).map(([optName, details]) => {
              const isWinner = optName === recommendedOption;
              return (
                <div
                  key={optName}
                  className={`p-4 rounded-xl border transition-all ${
                    isWinner
                      ? 'bg-purple-950/20 border-purple-500/40 shadow-sm'
                      : 'bg-slate-900/40 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                      {optName}
                      {isWinner && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          Recommended
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Strengths */}
                  <div className="space-y-1.5 mb-3">
                    {details.strengths.map((s, idx) => (
                      <div key={idx} className="text-xs text-emerald-300/90 flex items-start gap-1.5">
                        <span className="font-bold text-emerald-400 shrink-0">+</span>
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>

                  {/* Weaknesses */}
                  <div className="space-y-1.5">
                    {details.weaknesses.map((w, idx) => (
                      <div key={idx} className="text-xs text-rose-300/90 flex items-start gap-1.5">
                        <span className="font-bold text-rose-400 shrink-0">-</span>
                        <span>{w}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Trade-off Box */}
        {mainTradeoff && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200/90 text-xs sm:text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-amber-300 text-xs uppercase tracking-wider mb-0.5">
                Main Trade-off
              </div>
              <p className="leading-relaxed">{mainTradeoff}</p>
            </div>
          </div>
        )}

        {/* Risks & Missing Information */}
        {risksAndMissingInfo && risksAndMissingInfo.length > 0 && (
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs sm:text-sm text-slate-300">
            <div className="font-semibold text-slate-400 text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-slate-400" />
              Risks / Missing Information
            </div>
            <ul className="space-y-1">
              {risksAndMissingInfo.map((risk, idx) => (
                <li key={idx} className="flex items-start gap-2 text-slate-300">
                  <span className="text-slate-500">•</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Next Steps */}
        {nextSteps && nextSteps.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <ArrowRight className="w-4 h-4 text-purple-400" />
              Suggested Next Steps
            </h4>
            <div className="space-y-1.5">
              {nextSteps.map((step, idx) => (
                <div key={idx} className="text-xs sm:text-sm text-slate-300 flex items-start gap-2">
                  <span className="font-bold text-purple-400">{idx + 1}.</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
