import { DecisionState } from '../../types/decision.js';

export interface MissingInfoCheckResult {
  hasSufficientInfo: boolean;
  missingItems: string[];
  followUpQuestions: string[];
  clarificationMessage?: string;
}

export class MissingInfoChecker {
  /**
   * Evaluates current decision state and generates at most 1-3 targeted follow-up questions.
   */
  checkMissingInfo(state: DecisionState): MissingInfoCheckResult {
    const missing: string[] = [];
    const questions: string[] = [];

    // 1. Check options
    if (state.options.length < 2) {
      missing.push('options');
      if (state.options.length === 0) {
        if (state.decisionType === 'internship') {
          questions.push('What are the specific internship offers or companies you are considering? Please share the company name, role, stipend, and duration for each.');
        } else if (state.decisionType === 'purchase') {
          questions.push('Which specific laptop or product models are you considering? (e.g., MacBook Air M2 vs Lenovo Legion 5)');
        } else if (state.decisionType === 'learning') {
          questions.push('Which programming languages, frameworks, or skills are you deciding between? (e.g., Python vs Java)');
        } else if (state.decisionType === 'career') {
          questions.push('What are the specific job offers or roles you are comparing? (e.g., Company, title, compensation, and work mode)');
        } else {
          questions.push('What are the specific choices or options you are trying to decide between?');
        }
      } else {
        // Only 1 option provided
        questions.push(`You mentioned "${state.options[0].name}". What is the second option or alternative you are comparing it against?`);
      }

      return {
        hasSufficientInfo: false,
        missingItems: missing,
        followUpQuestions: questions.slice(0, 2),
        clarificationMessage: questions[0]
      };
    }

    // 2. Options exist. Now check details for options if completely empty.
    const missingKeyDetails = state.options.some(opt =>
      !opt.role && !opt.stipend && !opt.salary && !opt.rawDetails && Object.keys(opt.specs || {}).length === 0
    );

    if (missingKeyDetails && state.turnCount <= 2) {
      if (state.decisionType === 'internship') {
        questions.push(`Could you share a few details for ${state.options.map(o => o.name).join(' and ')}, such as the role, stipend, or tech stack?`);
      } else if (state.decisionType === 'purchase') {
        questions.push(`What are the key specs (budget, processor, RAM, and primary use case) for ${state.options.map(o => o.name).join(' and ')}?`);
      }
    }

    // 3. Check user's goal
    if (!state.goal && questions.length < 3) {
      missing.push('goal');
      if (state.decisionType === 'internship' || state.decisionType === 'career') {
        questions.push('What is your primary long-term career target? (e.g., AI/ML Engineer, Full-Stack Developer, High starting salary, etc.)');
      } else if (state.decisionType === 'learning') {
        questions.push('What is your end goal for learning this? (e.g., Building web apps, landing a data science job, competitive coding, or campus placements?)');
      } else if (state.decisionType === 'purchase') {
        questions.push('What will be your primary workload? (e.g., heavy coding, machine learning, gaming, or battery-focused travel?)');
      } else {
        questions.push('What is the main goal or outcome you want to achieve with this decision?');
      }
    }

    // 4. Check user priorities (Do NOT assume Learning > Salary!)
    if (state.priorities.length === 0 && questions.length < 3) {
      missing.push('priorities');
      questions.push('What matters most to you in this decision: financial compensation/cost, learning curve, brand reputation, or long-term growth?');
    }

    // Strictly limit to 1-3 questions per turn as required by spec Section 9
    const finalQuestions = questions.slice(0, 3);
    const hasSufficient = finalQuestions.length === 0 || (state.options.length >= 2 && (state.goal !== null || state.priorities.length > 0));

    return {
      hasSufficientInfo: hasSufficient,
      missingItems: missing,
      followUpQuestions: finalQuestions,
      clarificationMessage: finalQuestions.length > 0 ? finalQuestions.join('\n\n') : undefined
    };
  }
}

export const missingInfoChecker = new MissingInfoChecker();
