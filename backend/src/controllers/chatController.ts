import { Request, Response } from 'express';
import { stateManager } from '../services/memory/stateManager.js';
import { aiService } from '../services/ai/aiService.js';
import { comparisonAnalyzer } from '../services/decisionEngine/comparisonAnalyzer.js';
import { getDynamicCriteria } from '../services/decisionEngine/dynamicCriteria.js';
import { ChatMessage, DecisionOption, DecisionType } from '../types/decision.js';

export class ChatController {
  /**
   * POST /api/chat
   * Main conversational endpoint.
   */
  async handleChat(req: Request, res: Response): Promise<void> {
    try {
      const { message, conversationId, provider, apiKey } = req.body;

      if (!message || typeof message !== 'string') {
        res.status(400).json({ error: 'Message string is required.' });
        return;
      }

      const activeId = conversationId || `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const currentState = stateManager.getState(activeId);
      const history = stateManager.getHistory(activeId);

      // Save user message to history
      const userMsg: ChatMessage = {
        id: `msg_${Date.now()}_user`,
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      };
      stateManager.addMessage(activeId, userMsg);

      // Process with AI service
      const response = await aiService.handleChat(
        { message, conversationId: activeId, provider, apiKey },
        currentState,
        history
      );

      // Save assistant message to history
      const assistantMsg: ChatMessage = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toISOString(),
        state: response.state,
        structuredAnalysis: response.structuredAnalysis
      };
      stateManager.addMessage(activeId, assistantMsg);

      res.status(200).json(response);
    } catch (error: any) {
      console.error('Error handling chat turn:', error);
      res.status(500).json({
        reply: "Sorry, I encountered an issue processing that right now. Please try again.",
        error: error?.message
      });
    }
  }

  /**
   * POST /api/decision/analyze
   * Direct structured state analysis.
   */
  async handleAnalyze(req: Request, res: Response): Promise<void> {
    try {
      const { decision } = req.body;
      if (!decision || !decision.options) {
        res.status(400).json({ error: 'Valid decision payload with options is required.' });
        return;
      }

      const decisionType: DecisionType = decision.decisionType || 'other';
      const priorities: string[] = decision.priorities || [];
      const criteria = getDynamicCriteria(decisionType, priorities);

      const tempState = {
        conversationId: 'direct_analysis',
        decisionType,
        question: decision.question || 'Direct Analysis',
        options: decision.options.map((opt: any, index: number): DecisionOption => ({
          id: opt.id || `opt_${index}`,
          name: opt.name || `Option ${index + 1}`,
          role: opt.role,
          stipend: opt.stipend,
          salary: opt.salary,
          duration: opt.duration,
          cost: opt.cost,
          price: opt.price,
          technology: opt.technology,
          specs: opt.specs,
          attributes: opt.attributes || {},
          rawDetails: opt.rawDetails
        })),
        goal: decision.goal || null,
        priorities,
        constraints: decision.constraints || [],
        facts: {},
        missingInformation: [],
        researchRequired: false,
        researchResults: [],
        criteria,
        analysis: null,
        recommendation: null,
        stage: 'recommended' as const,
        turnCount: 1,
        updatedAt: new Date().toISOString()
      };

      const analysis = comparisonAnalyzer.analyze(tempState);

      res.status(200).json({
        recommendation: analysis.recommendedOption,
        reasons: analysis.reasons,
        comparison: analysis.comparisonText,
        tradeoff: analysis.mainTradeoff,
        risksAndMissingInfo: analysis.risksAndMissingInfo,
        nextSteps: analysis.nextSteps,
        confidence: analysis.confidence
      });
    } catch (error: any) {
      console.error('Error analyzing decision:', error);
      res.status(500).json({ error: 'Failed to analyze decision.' });
    }
  }

  /**
   * GET /api/decision/state/:conversationId
   */
  getState(req: Request, res: Response): void {
    const rawId = req.params.conversationId;
    const conversationId = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!conversationId) {
      res.status(400).json({ error: 'Conversation ID required' });
      return;
    }
    const state = stateManager.getState(conversationId);
    const history = stateManager.getHistory(conversationId);
    res.status(200).json({ state, history });
  }

  /**
   * POST /api/chat/reset
   */
  resetConversation(req: Request, res: Response): void {
    const { conversationId } = req.body;
    if (!conversationId) {
      res.status(400).json({ error: 'Conversation ID required' });
      return;
    }
    const fresh = stateManager.reset(conversationId);
    res.status(200).json({ message: 'Conversation reset successfully', state: fresh });
  }
}

export const chatController = new ChatController();
