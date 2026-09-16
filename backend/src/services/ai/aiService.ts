import { ChatMessage, ChatRequest, ChatResponse, DecisionState } from '../../types/decision.js';
import { geminiProvider } from './geminiProvider.js';
import { openaiProvider } from './openaiProvider.js';
import { heuristicProvider } from './heuristicProvider.js';

export class AIService {
  async handleChat(
    req: ChatRequest,
    state: DecisionState,
    history: ChatMessage[] = []
  ): Promise<ChatResponse> {
    const { message, provider = 'auto', apiKey } = req;

    // Check custom client-supplied API keys or environment variables
    const geminiKey = apiKey && provider === 'gemini' ? apiKey : process.env.GEMINI_API_KEY;
    const openaiKey = apiKey && provider === 'openai' ? apiKey : process.env.OPENAI_API_KEY;

    if (provider === 'gemini' && geminiKey) {
      return geminiProvider.processTurn(geminiKey, message, state, history);
    }

    if (provider === 'openai' && openaiKey) {
      return openaiProvider.processTurn(openaiKey, message, state, history);
    }

    if (provider === 'auto') {
      if (geminiKey) {
        return geminiProvider.processTurn(geminiKey, message, state, history);
      }
      if (openaiKey) {
        return openaiProvider.processTurn(openaiKey, message, state, history);
      }
    }

    // Default to the robust internal Heuristic decision engine
    return heuristicProvider.processTurn(message, state);
  }
}

export const aiService = new AIService();
