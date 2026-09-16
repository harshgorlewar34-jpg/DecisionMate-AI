import { DecisionState, ComparisonAnalysis, ProviderSettings } from '../types';

const API_BASE = '/api';

export interface ChatApiResponse {
  reply: string;
  conversationId: string;
  state: DecisionState;
  structuredAnalysis?: ComparisonAnalysis | null;
  error?: string;
}

export async function sendChatMessage(
  message: string,
  conversationId: string,
  settings?: ProviderSettings
): Promise<ChatApiResponse> {
  const payload: any = {
    message,
    conversationId,
    provider: settings?.provider || 'auto'
  };

  if (settings?.provider === 'gemini' && settings.geminiApiKey) {
    payload.apiKey = settings.geminiApiKey;
  } else if (settings?.provider === 'openai' && settings.openaiApiKey) {
    payload.apiKey = settings.openaiApiKey;
  }

  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with status ${response.status}`);
  }

  return response.json();
}

export async function resetChat(conversationId: string): Promise<{ state: DecisionState }> {
  const response = await fetch(`${API_BASE}/chat/reset`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ conversationId })
  });

  if (!response.ok) {
    throw new Error('Failed to reset conversation');
  }

  return response.json();
}

export async function fetchConversationState(conversationId: string): Promise<{ state: DecisionState }> {
  const response = await fetch(`${API_BASE}/decision/state/${conversationId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch conversation state');
  }
  return response.json();
}

export async function checkServerHealth(): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE}/health`);
  if (!response.ok) {
    throw new Error('Backend health check failed');
  }
  return response.json();
}
