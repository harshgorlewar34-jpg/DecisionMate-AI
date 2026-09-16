import { DecisionState, ChatMessage } from '../../types/decision.js';

class StateManager {
  private states: Map<string, DecisionState> = new Map();
  private histories: Map<string, ChatMessage[]> = new Map();

  createInitialState(conversationId: string): DecisionState {
    return {
      conversationId,
      decisionType: null,
      question: null,
      options: [],
      goal: null,
      priorities: [],
      constraints: [],
      facts: {},
      missingInformation: [],
      researchRequired: false,
      researchResults: [],
      criteria: [],
      analysis: null,
      recommendation: null,
      stage: 'detecting',
      turnCount: 0,
      updatedAt: new Date().toISOString()
    };
  }

  getState(conversationId: string): DecisionState {
    if (!this.states.has(conversationId)) {
      const newState = this.createInitialState(conversationId);
      this.states.set(conversationId, newState);
      this.histories.set(conversationId, []);
    }
    return this.states.get(conversationId)!;
  }

  updateState(conversationId: string, partial: Partial<DecisionState>): DecisionState {
    const current = this.getState(conversationId);
    const updated: DecisionState = {
      ...current,
      ...partial,
      // Merge options smartly if provided
      options: partial.options ?? current.options,
      priorities: partial.priorities ? Array.from(new Set([...current.priorities, ...partial.priorities])) : current.priorities,
      constraints: partial.constraints ? Array.from(new Set([...current.constraints, ...partial.constraints])) : current.constraints,
      facts: { ...current.facts, ...(partial.facts || {}) },
      updatedAt: new Date().toISOString(),
      turnCount: current.turnCount + 1
    };
    this.states.set(conversationId, updated);
    return updated;
  }

  addMessage(conversationId: string, message: ChatMessage): void {
    const history = this.histories.get(conversationId) || [];
    history.push(message);
    this.histories.set(conversationId, history);
  }

  getHistory(conversationId: string): ChatMessage[] {
    return this.histories.get(conversationId) || [];
  }

  reset(conversationId: string): DecisionState {
    const fresh = this.createInitialState(conversationId);
    this.states.set(conversationId, fresh);
    this.histories.set(conversationId, []);
    return fresh;
  }
}

export const stateManager = new StateManager();
