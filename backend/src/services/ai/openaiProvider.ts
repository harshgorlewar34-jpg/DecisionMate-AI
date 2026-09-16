import OpenAI from 'openai';
import { DecisionState, ChatResponse, ChatMessage } from '../../types/decision.js';
import { heuristicProvider } from './heuristicProvider.js';

export class OpenAIProvider {
  async processTurn(
    apiKey: string,
    message: string,
    state: DecisionState,
    history: ChatMessage[] = []
  ): Promise<ChatResponse> {
    try {
      const openai = new OpenAI({ apiKey });

      const systemPrompt = `You are DecisionMate AI, a personal decision support chatbot.
Your goal is to guide users through decisions objectively.
RULES:
1. Ask only 1-3 targeted questions if options or goals are missing.
2. Avoid generic corporate buzzwords.
3. Once options and goals are clear, follow the structured format:
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
[Tradeoff explanation]

### Risks / Missing Information
• Risk item

### Next Step
1. Next step item

### Confidence
High / Medium / Low
`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Current state: ${JSON.stringify(state)}\n\nUser message: ${message}` }
        ]
      });

      const reply = response.choices[0]?.message?.content || '';

      // Sync state with heuristic analyzer
      await heuristicProvider.processTurn(message, state);

      return {
        reply,
        conversationId: state.conversationId,
        state
      };
    } catch (err: any) {
      console.warn('OpenAI API call failed, falling back to heuristic engine:', err?.message);
      return heuristicProvider.processTurn(message, state);
    }
  }
}

export const openaiProvider = new OpenAIProvider();
