import { ComparisonAnalysis } from '../../types/decision.js';

export class ResponseFormatter {
  /**
   * Generates the strict Section 13 markdown response format for final decision recommendations.
   */
  formatRecommendation(analysis: ComparisonAnalysis): string {
    const {
      recommendedOption,
      reasons,
      comparisonText,
      mainTradeoff,
      risksAndMissingInfo,
      nextSteps,
      confidence
    } = analysis;

    let md = `### Recommendation\n\nRecommended option: **${recommendedOption}**\n\n`;

    // Why
    md += `### Why\n\n`;
    for (const r of reasons) {
      md += `• ${r}\n`;
    }
    md += `\n`;

    // Comparison
    md += `### Comparison\n\n`;
    for (const [optName, item] of Object.entries(comparisonText)) {
      md += `**${optName}**\n`;
      for (const s of item.strengths) {
        md += `+ ${s}\n`;
      }
      for (const w of item.weaknesses) {
        md += `- ${w}\n`;
      }
      md += `\n`;
    }

    // Main Trade-off
    md += `### Main Trade-off\n\n${mainTradeoff}\n\n`;

    // Risks / Missing Information
    md += `### Risks / Missing Information\n\n`;
    for (const risk of risksAndMissingInfo) {
      md += `• ${risk}\n`;
    }
    md += `\n`;

    // Next Step
    md += `### Next Step\n\n`;
    for (const step of nextSteps) {
      md += `1. ${step}\n`;
    }
    md += `\n`;

    // Confidence
    md += `### Confidence\n\n**${confidence}**\n`;

    return md;
  }

  /**
   * Formats a clarifying follow-up message when missing information exists (1-3 questions).
   */
  formatClarification(intro: string, questions: string[]): string {
    let text = `${intro}\n\n`;
    questions.forEach((q, idx) => {
      text += `${idx + 1}. ${q}\n`;
    });
    return text.trim();
  }
}

export const responseFormatter = new ResponseFormatter();
