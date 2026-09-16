import { ComparisonAnalysis, DecisionOption, DecisionState, OptionScore } from '../../types/decision.js';
import { getDynamicCriteria } from './dynamicCriteria.js';

export class ComparisonAnalyzer {
  /**
   * Performs multi-criteria analysis of options against user goal, priorities, and facts.
   */
  analyze(state: DecisionState): ComparisonAnalysis {
    const { options, decisionType, goal, priorities, constraints } = state;
    const criteria = getDynamicCriteria(decisionType, priorities);
    const scores: Record<string, OptionScore> = {};

    const normalizedGoal = (goal || '').toLowerCase();
    const normalizedPriorities = priorities.map(p => p.toLowerCase());

    // Evaluate each option
    for (const option of options) {
      let totalWeightedScore = 0;
      let totalWeight = 0;
      const breakdown: Record<string, { score: number; reason: string }> = {};
      const strengths: string[] = [];
      const weaknesses: string[] = [];

      const raw = (option.rawDetails || '').toLowerCase();
      const role = (option.role || '').toLowerCase();
      const stipendStr = (option.stipend || option.salary || '').toLowerCase();
      const techs = (option.technology || []).map(t => t.toLowerCase());
      const name = option.name;

      for (const crit of criteria) {
        let score = 5; // Base score out of 10
        let reason = 'Moderate fit for this criterion.';

        switch (crit.key) {
          case 'career_relevance':
          case 'goal_alignment':
          case 'goal_fit':
            if (normalizedGoal) {
              const stopWords = new Set(['a', 'an', 'the', 'in', 'on', 'of', 'to', 'for', 'at', 'by', 'as', 'is', 'it', 'or', 'and', 'my', 'be', 'with', 'become']);
              const cleanGoal = normalizedGoal.replace(/^(?:to\s+become|to\s+be|to|become)\s+/i, '');
              const goalTokens = cleanGoal.split(/[\s\/\-\,\.]+/).filter(w => w.length >= 2 && !stopWords.has(w));
              const matchesGoal = goalTokens.some(tok => {
                const wordRegex = new RegExp(`\\b${tok}\\b`, 'i');
                return wordRegex.test(role) || techs.some(t => wordRegex.test(t)) || wordRegex.test(raw) || wordRegex.test(name);
              });

              if (matchesGoal) {
                score = 9;
                reason = `Directly aligns with your stated target goal: "${goal}".`;
                strengths.push(`Direct alignment with your target goal (${goal})`);
              } else {
                score = 4;
                reason = `Less direct alignment with your target goal of "${goal}".`;
                weaknesses.push(`Does not directly advance your primary goal of ${goal}`);
              }
            } else {
              score = 6;
              reason = 'Relevant domain experience.';
            }
            break;

          case 'learning':
          case 'learning_curve':
          case 'practical_utility':
            if (techs.some(t => ['ai', 'machine learning', 'python', 'deep learning', 'cloud'].includes(t))) {
              score = 9;
              reason = 'Exposure to high-growth, modern technical stack.';
              strengths.push('Exposure to modern, high-demand technical capabilities');
            } else if (techs.length > 0) {
              score = 7.5;
              reason = `Hands-on work with practical stack (${techs.join(', ')}).`;
              strengths.push(`Hands-on practical development with ${techs.join(', ')}`);
            } else {
              score = 6;
              reason = 'Standard learning opportunities.';
            }
            break;

          case 'stipend':
          case 'salary':
          case 'price':
          case 'fees':
            const numericValue = this.extractNumericAmount(stipendStr || option.price || option.cost || '');
            if (numericValue !== null) {
              // Higher stipend is good for internship/job, lower price is good for purchase
              if (decisionType === 'purchase' || decisionType === 'education') {
                score = numericValue < 60000 ? 8.5 : 5.5;
                reason = `Priced around ${numericValue}, offering solid budget efficiency.`;
              } else {
                // Higher stipend
                score = numericValue >= 20000 ? 9 : numericValue >= 10000 ? 6.5 : 4.5;
                reason = `Offers compensation of ${stipendStr || 'stated amount'}.`;
                if (score >= 8) {
                  strengths.push(`Higher financial compensation (${stipendStr})`);
                } else if (score < 6) {
                  weaknesses.push(`Lower financial compensation (${stipendStr || 'modest pay'})`);
                }
              }
            } else {
              score = 5;
              reason = 'Compensation details not fully specified.';
            }
            break;

          case 'gpu_ai':
          case 'performance':
            const hasDedicatedGpu = /rtx|gtx|radeon|m[234]\s*(?:pro|max)/i.test(raw);
            const highRam = /16gb|32gb|64gb/i.test(raw);
            if (hasDedicatedGpu || highRam) {
              score = 9;
              reason = 'Strong hardware specs suitable for compute-heavy workloads.';
              strengths.push('High-performance computing capacity');
            } else {
              score = 6;
              reason = 'Sufficient for standard daily workflows.';
            }
            break;

          default:
            score = 6.5;
            reason = 'Meets standard baseline criteria.';
            break;
        }

        // Apply criteria weight
        totalWeightedScore += score * crit.weight;
        totalWeight += crit.weight;
        breakdown[crit.key] = { score, reason };
      }

      // Deduplicate strengths/weaknesses and ensure fallback
      const finalStrengths = Array.from(new Set(strengths));
      const finalWeaknesses = Array.from(new Set(weaknesses));

      if (finalStrengths.length === 0) {
        finalStrengths.push(`Solid general option with proven track record in ${name}`);
      }
      if (finalWeaknesses.length === 0) {
        finalWeaknesses.push('Requires proactive initiative to maximize value');
      }

      const finalScore = Math.round((totalWeightedScore / (totalWeight || 1)) * 10) / 10;

      scores[option.name] = {
        optionId: option.id,
        optionName: option.name,
        score: finalScore,
        criteriaBreakdown: breakdown,
        strengths: finalStrengths,
        weaknesses: finalWeaknesses
      };
    }

    // Rank options
    const ranking = Object.keys(scores).sort((a, b) => scores[b].score - scores[a].score);
    const recommended = ranking[0] || options[0]?.name || 'Option 1';
    const runnerUp = ranking[1] || options[1]?.name || 'Option 2';

    // Generate reasons
    const winnerScore = scores[recommended];
    const runnerScore = scores[runnerUp];
    const reasons: string[] = [];

    if (goal) {
      reasons.push(`Direct alignment: ${recommended} gives you the exact skills and background needed for your target goal of "${goal}".`);
    }
    if (winnerScore?.strengths && winnerScore.strengths[0]) {
      reasons.push(`Key strength: ${winnerScore.strengths[0]}.`);
    }
    if (runnerScore && runnerScore.weaknesses && runnerScore.weaknesses[0]) {
      reasons.push(`Better strategic fit: While ${runnerUp} is viable, it compromises on your core focus.`);
    }
    if (reasons.length === 0) {
      reasons.push(`Evaluated as the strongest overall match across the defined criteria.`);
    }

    // Main Trade-off
    let mainTradeoff = '';
    if (decisionType === 'internship' || decisionType === 'career') {
      const recStipend = options.find(o => o.name === recommended)?.stipend || '';
      const otherStipend = options.find(o => o.name === runnerUp)?.stipend || '';
      if (recStipend && otherStipend) {
        mainTradeoff = `Choosing ${recommended} offers higher long-term career relevance for your specific focus, but you may receive a different short-term compensation compared to ${runnerUp} (${otherStipend}).`;
      } else {
        mainTradeoff = `Choosing ${recommended} prioritizes targeted specialization, but leaves less room for broader generalist exploration found in ${runnerUp}.`;
      }
    } else if (decisionType === 'purchase') {
      mainTradeoff = `Choosing ${recommended} provides stronger raw performance for heavy tasks, but may involve higher power draw or budget investment compared to ${runnerUp}.`;
    } else if (decisionType === 'learning') {
      mainTradeoff = `Choosing ${recommended} lets you build domain-specific projects faster, while ${runnerUp} would offer different enterprise or syntax paradigms.`;
    } else {
      mainTradeoff = `Choosing ${recommended} maximizes your primary objective, but requires accepting the constraints of ${runnerScore ? runnerScore.strengths.join(', ') : 'the alternative'}.`;
    }

    // Risks and Missing Info
    const risksAndMissingInfo: string[] = [];
    if (!state.goal) {
      risksAndMissingInfo.push('Your target career goal was not fully specified; if your goal changes, the recommendation could flip.');
    }
    const hasUnconfirmedDetails = options.some(o => !o.stipend && !o.role && !o.specs);
    if (hasUnconfirmedDetails) {
      risksAndMissingInfo.push('Some specifics (exact mentor availability, work culture, or unlisted contract terms) were unconfirmed.');
    }
    if (decisionType === 'finance') {
      risksAndMissingInfo.push('Financial markets carry volatility. Past performance does not guarantee future results. Consult a certified financial advisor.');
    }
    if (risksAndMissingInfo.length === 0) {
      risksAndMissingInfo.push('Verify day-to-day team expectations and confirm deliverables before locking in your choice.');
    }

    // Next steps
    const nextSteps: string[] = [
      `Review the written offer or terms for ${recommended} to confirm duties and dates.`,
      `If you have lingering doubts, speak with an engineer or alumni currently at ${recommended}.`,
      `Make your final decision confidently knowing the trade-offs are understood.`
    ];

    // Confidence
    let confidence: 'High' | 'Medium' | 'Low' = 'High';
    if (options.length < 2 || !goal || (winnerScore && runnerScore && Math.abs(winnerScore.score - runnerScore.score) < 0.5)) {
      confidence = 'Medium';
    }
    if (hasUnconfirmedDetails && !goal) {
      confidence = 'Low';
    }

    const comparisonText: Record<string, { strengths: string[]; weaknesses: string[] }> = {};
    for (const opt of options) {
      comparisonText[opt.name] = {
        strengths: scores[opt.name]?.strengths || ['Reliable choice'],
        weaknesses: scores[opt.name]?.weaknesses || ['Has standard trade-offs']
      };
    }

    return {
      scores,
      ranking,
      recommendedOption: recommended,
      reasons,
      comparisonText,
      mainTradeoff,
      risksAndMissingInfo,
      nextSteps,
      confidence
    };
  }

  private extractNumericAmount(text: string): number | null {
    const clean = text.replace(/,/g, '').toLowerCase();
    const match = clean.match(/(\d+(?:\.\d+)?)\s*(k|lpa|thousand)?/);
    if (!match) return null;
    let val = parseFloat(match[1]);
    if (match[2] === 'k' || match[2] === 'thousand') val *= 1000;
    if (match[2] === 'lpa') val *= 100000;
    return val;
  }
}

export const comparisonAnalyzer = new ComparisonAnalyzer();
