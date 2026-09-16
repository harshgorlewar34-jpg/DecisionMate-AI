import React from 'react';
import { Briefcase, GraduationCap, Laptop, BookOpen, Compass, HelpCircle } from 'lucide-react';
import { DecisionType } from '../types';

interface SuggestedPromptsProps {
  onSelectPrompt: (prompt: string) => void;
}

interface CategoryOption {
  type: DecisionType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const CATEGORIES: CategoryOption[] = [
  { type: 'career', label: 'Career', icon: Briefcase, color: 'from-blue-500/20 to-indigo-500/20 text-blue-300 border-blue-500/30' },
  { type: 'internship', label: 'Internship', icon: GraduationCap, color: 'from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30' },
  { type: 'education', label: 'Education', icon: BookOpen, color: 'from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/30' },
  { type: 'purchase', label: 'Purchase', icon: Laptop, color: 'from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30' },
  { type: 'learning', label: 'Learning', icon: Compass, color: 'from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/30' },
  { type: 'other', label: 'Other Dilemma', icon: HelpCircle, color: 'from-slate-500/20 to-zinc-500/20 text-slate-300 border-slate-500/30' },
];

const EXAMPLE_PROMPTS = [
  {
    category: 'Internship',
    text: 'Which internship should I choose?',
    desc: 'Compare roles, stipends, tech stack, and PPO opportunities.'
  },
  {
    category: 'Purchase',
    text: 'Should I buy Laptop A or Laptop B for AI and coding?',
    desc: 'Evaluate specs, GPU, RAM, thermals, and price-to-performance.'
  },
  {
    category: 'Learning',
    text: 'Should I learn Python or Java first?',
    desc: 'Align learning path with career objectives, difficulty, and job demand.'
  },
  {
    category: 'Career',
    text: 'Should I accept this job offer?',
    desc: 'Weigh salary, career trajectory, work-life balance, and stability.'
  }
];

export const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({ onSelectPrompt }) => {
  return (
    <div className="w-full max-w-2xl mx-auto my-auto py-8 px-4 flex flex-col items-center text-center animate-fade-in">
      {/* Friendly Hero Banner */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/30 mb-4 shadow-sm">
        👋 What decision are you facing today?
      </div>
      
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
        Think through choices with clarity.
      </h2>
      <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
        Describe your situation or options. DecisionMate AI helps uncover trade-offs, evaluates criteria, and provides structured recommendations.
      </p>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.type}
              onClick={() => onSelectPrompt(`I need help deciding on a ${cat.label.toLowerCase()} decision: `)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border bg-gradient-to-r ${cat.color} hover:scale-105 transition-all duration-150 shadow-sm`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Suggested Prompt Cards */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
        {EXAMPLE_PROMPTS.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(item.text)}
            className="p-3.5 rounded-xl glass-panel-subtle hover:glass-card hover:border-purple-500/40 transition-all duration-200 group flex flex-col justify-between"
          >
            <div>
              <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-purple-400 mb-1">
                {item.category}
              </span>
              <p className="text-xs font-medium text-slate-200 group-hover:text-purple-200 transition-colors">
                "{item.text}"
              </p>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-normal">
              {item.desc}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
