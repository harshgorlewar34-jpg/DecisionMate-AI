import { DecisionCriteria, DecisionType } from '../../types/decision.js';

export const DEFAULT_CRITERIA_BY_TYPE: Record<DecisionType, DecisionCriteria[]> = {
  internship: [
    { key: 'career_relevance', label: 'Career Relevance', weight: 4, description: 'Alignment with long-term target career' },
    { key: 'learning', label: 'Learning & Skill Growth', weight: 4, description: 'Practical knowledge acquisition' },
    { key: 'real_project', label: 'Real Project Exposure', weight: 3, description: 'Working on tangible production projects' },
    { key: 'mentorship', label: 'Mentorship & Guidance', weight: 3, description: 'Access to experienced mentors' },
    { key: 'stipend', label: 'Stipend / Compensation', weight: 3, description: 'Financial compensation during internship' },
    { key: 'duration', label: 'Duration & Flexibility', weight: 2, description: 'Timeline fit with academic/personal schedule' },
    { key: 'ppo_opportunity', label: 'PPO Opportunity', weight: 3, description: 'Prospects of full-time conversion' }
  ],
  career: [
    { key: 'salary', label: 'Salary & Benefits', weight: 4, description: 'Total financial package' },
    { key: 'role', label: 'Role & Responsibilities', weight: 4, description: 'Daily responsibilities and title fit' },
    { key: 'career_relevance', label: 'Career Growth', weight: 4, description: 'Long-term promotion and path' },
    { key: 'job_stability', label: 'Job Stability', weight: 3, description: 'Company health and layoff resilience' },
    { key: 'work_environment', label: 'Work Culture & Environment', weight: 3, description: 'Work-life balance and team culture' },
    { key: 'skills', label: 'Skill Advancement', weight: 3, description: 'Cutting-edge tech stack and market value' },
    { key: 'location', label: 'Location & Commute', weight: 2, description: 'Remote/hybrid/onsite convenience' }
  ],
  education: [
    { key: 'fees', label: 'Cost / Fees', weight: 3, description: 'Tuition and overall expense' },
    { key: 'placement', label: 'Placements & ROI', weight: 4, description: 'Employment outcomes and campus recruitment' },
    { key: 'curriculum', label: 'Curriculum Rigor', weight: 4, description: 'Modern, industry-aligned syllabus' },
    { key: 'reputation', label: 'Reputation & Accreditation', weight: 3, description: 'Brand recognition in industry' },
    { key: 'faculty', label: 'Faculty & Mentorship', weight: 3, description: 'Quality of professors and instructors' },
    { key: 'location', label: 'Location & Campus', weight: 2, description: 'Networking hub and living conditions' }
  ],
  purchase: [
    { key: 'price', label: 'Price & Value', weight: 4, description: 'Cost vs feature offering' },
    { key: 'performance', label: 'Performance / CPU', weight: 4, description: 'Speed, multitasking and processing' },
    { key: 'gpu_ai', label: 'GPU / AI Suitability', weight: 3, description: 'Dedicated graphics and ML acceleration' },
    { key: 'ram_storage', label: 'RAM & Storage', weight: 3, description: 'Memory speed and expandable disk' },
    { key: 'battery', label: 'Battery & Portability', weight: 3, description: 'Endurance on battery and chassis weight' },
    { key: 'build_quality', label: 'Display & Build Quality', weight: 3, description: 'Screen fidelity, thermals, durability' }
  ],
  learning: [
    { key: 'goal_alignment', label: 'Goal Alignment', weight: 5, description: 'Relevance to target career objective' },
    { key: 'market_demand', label: 'Market Demand & Jobs', weight: 4, description: 'Job openings and ecosystem adoption' },
    { key: 'learning_curve', label: 'Learning Curve', weight: 3, description: 'Accessibility for current skill level' },
    { key: 'practical_utility', label: 'Practical Projects', weight: 4, description: 'Ease of building portfolio projects' },
    { key: 'ecosystem', label: 'Ecosystem & Libraries', weight: 3, description: 'Community support and tooling maturity' }
  ],
  finance: [
    { key: 'roi', label: 'Expected Return', weight: 4, description: 'Anticipated financial return' },
    { key: 'risk', label: 'Risk Profile', weight: 5, description: 'Capital preservation and volatility' },
    { key: 'liquidity', label: 'Liquidity', weight: 3, description: 'Ease of conversion to cash' },
    { key: 'horizon', label: 'Time Horizon', weight: 3, description: 'Short-term vs long-term investment fit' }
  ],
  other: [
    { key: 'goal_fit', label: 'Alignment with Core Goal', weight: 5, description: 'How directly it achieves the primary goal' },
    { key: 'cost_effort', label: 'Cost vs Effort', weight: 4, description: 'Resource expenditure required' },
    { key: 'downside_risk', label: 'Downside Risk', weight: 4, description: 'Worst-case scenario impact' },
    { key: 'flexibility', label: 'Reversibility & Flexibility', weight: 3, description: 'Ability to pivot if circumstances change' }
  ]
};

export function getDynamicCriteria(
  decisionType: DecisionType | null,
  priorities: string[] = []
): DecisionCriteria[] {
  const base = DEFAULT_CRITERIA_BY_TYPE[decisionType || 'other'] || DEFAULT_CRITERIA_BY_TYPE.other;
  const normalizedPriorities = priorities.map(p => p.toLowerCase());

  return base.map(c => {
    let weight = c.weight;
    // If priority matches this criteria key or label, elevate weight to top tier (5)
    const isHighPriority = normalizedPriorities.some(p =>
      c.key.includes(p) ||
      c.label.toLowerCase().includes(p) ||
      (p.includes('salary') && (c.key === 'salary' || c.key === 'stipend' || c.key === 'price')) ||
      (p.includes('money') && (c.key === 'salary' || c.key === 'stipend' || c.key === 'fees')) ||
      (p.includes('learn') && (c.key === 'learning' || c.key === 'curriculum' || c.key === 'skills')) ||
      (p.includes('grow') && (c.key === 'career_relevance' || c.key === 'goal_alignment')) ||
      (p.includes('ai') && (c.key === 'gpu_ai' || c.key === 'career_relevance'))
    );

    if (isHighPriority) {
      weight = 5;
    }

    return { ...c, weight };
  });
}
