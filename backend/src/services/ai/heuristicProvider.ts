import { DecisionState, ChatResponse } from '../../types/decision.js';
import { decisionExtractor } from '../decisionEngine/decisionExtractor.js';
import { missingInfoChecker } from '../decisionEngine/missingInfoChecker.js';
import { comparisonAnalyzer } from '../decisionEngine/comparisonAnalyzer.js';
import { responseFormatter } from '../decisionEngine/responseFormatter.js';
import { webSearchService } from '../search/webSearchService.js';
import { getDynamicCriteria } from '../decisionEngine/dynamicCriteria.js';

export class HeuristicProvider {
  /**
   * Processes a turn deterministically using the built-in Decision Intelligence Engine.
   */
  async processTurn(
    message: string,
    state: DecisionState
  ): Promise<ChatResponse> {
    // 1. Detect or update Decision Type
    const detectedType = decisionExtractor.detectDecisionType(message, state);
    state.decisionType = detectedType;

    // 2. Extract Options
    const extractedOptions = decisionExtractor.extractOptions(message, state.options);
    state.options = extractedOptions;

    // 3. Extract Goal
    const extractedGoal = decisionExtractor.extractGoal(message, state.goal);
    if (extractedGoal) {
      state.goal = extractedGoal;
    }

    // 4. Extract Priorities
    const extractedPriorities = decisionExtractor.extractPriorities(message, state.priorities);
    state.priorities = extractedPriorities;

    // 5. Extract Constraints
    const extractedConstraints = decisionExtractor.extractConstraints(message, state.constraints);
    state.constraints = extractedConstraints;

    // 6. Check if Question is saved
    if (!state.question && message.length > 5) {
      state.question = message;
    }

    // 7. Update Dynamic Criteria
    state.criteria = getDynamicCriteria(state.decisionType, state.priorities);

    // 8. Check if web research is required
    let searchNotice = '';
    if (webSearchService.isResearchRequired(message)) {
      state.researchRequired = true;
      const searchResult = await webSearchService.search(message);
      if (searchResult.success && searchResult.results.length > 0) {
        state.researchResults = searchResult.results;
        searchNotice = `\n\n*(Web search insight: Verified latest data across ${searchResult.results.length} sources)*`;
      } else if (searchResult.error) {
        searchNotice = `\n\n*(Note on current web research: ${searchResult.error})*`;
      }
    }

    // 9. Check for Missing Information
    const missingCheck = missingInfoChecker.checkMissingInfo(state);
    state.missingInformation = missingCheck.missingItems;

    // If options are missing or we need vital clarification
    if (!missingCheck.hasSufficientInfo && missingCheck.followUpQuestions.length > 0) {
      state.stage = 'clarifying';
      let intro = "I can definitely help you think through this decision and find the best choice!";
      if (state.options.length === 0) {
        intro = "I can help compare your choices, but I need the actual options first.";
      } else if (!state.goal) {
        intro = `I have noted the options (${state.options.map(o => o.name).join(' vs ')}). To make a personalized recommendation, I need a bit more context:`;
      }

      const reply = responseFormatter.formatClarification(intro, missingCheck.followUpQuestions) + searchNotice;
      return {
        reply,
        conversationId: state.conversationId,
        state
      };
    }

    // 10. Sufficient Information Available -> Run Comparison Analysis!
    state.stage = 'recommended';
    const analysis = comparisonAnalyzer.analyze(state);
    state.analysis = analysis;
    state.recommendation = analysis.recommendedOption;

    let reply = responseFormatter.formatRecommendation(analysis);
    if (searchNotice) {
      reply += `\n${searchNotice}`;
    }

    return {
      reply,
      conversationId: state.conversationId,
      state,
      structuredAnalysis: analysis
    };
  }
}

export const heuristicProvider = new HeuristicProvider();
