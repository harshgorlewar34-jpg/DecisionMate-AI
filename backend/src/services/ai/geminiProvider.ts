import { GoogleGenerativeAI } from '@google/generative-ai';
import { DecisionState, ChatResponse, ChatMessage } from '../../types/decision.js';
import { heuristicProvider } from './heuristicProvider.js';

export class GeminiProvider {
  async processTurn(
    apiKey: string,
    message: string,
    state: DecisionState,
    history: ChatMessage[] = []
  ): Promise<ChatResponse> {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1200
        }
      });

      const systemPrompt = `You are DecisionMate AI, a personal decision support chatbot.
Your role is to help users think through real-life decisions (career, internship, education, purchases, learning, finances, everyday life).
CRITICAL RULES:
1. Decision support, not blindly making decisions.
2. If options are missing or user just asked a broad dilemma (e.g., "Which internship is better?"), do NOT invent options or make an immediate recommendation. Ask 1-3 concise follow-up questions maximum!
3. Avoid generic buzzwords like "maximize long-term growth", "maximize learning velocity", "asymmetric upside", "market leverage", "optionalities". Base all reasoning on concrete facts.
4. When sufficient options, goal, and priorities exist, give a single clear recommendation following EXACTLY this format:
### Recommendation
Recommended option: [Option Name]

### Why
• Reason 1
• Reason 2
• Reason 3

### Comparison
[Option A]
+ Strength
+ Strength
- Weakness

[Option B]
+ Strength
+ Strength
- Weakness

### Main Trade-off
[Clear explanation of the main compromise]

### Risks / Missing Information
• Risk or unverified assumption 1

### Next Step
1. What the user should verify or do next

### Confidence
High / Medium / Low

CURRENT DECISION STATE (JSON):
${JSON.stringify({
  decisionType: state.decisionType,
  options: state.options,
  goal: state.goal,
  priorities: state.priorities,
  stage: state.stage
}, null, 2)}
`;

      const contents = [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser message: "${message}"` }] }
      ];

      const result = await model.generateContent({ contents });
      const reply = result.response.text();

      // Also run heuristic extractor to keep state synchronized
      await heuristicProvider.processTurn(message, state);

      return {
        reply,
        conversationId: state.conversationId,
        state
      };
    } catch (err: any) {
      console.warn('Gemini API call failed, falling back to smart heuristic provider:', err?.message);
      return heuristicProvider.processTurn(message, state);
    }
  }
}

export const geminiProvider = new GeminiProvider();
