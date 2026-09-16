export type DecisionType =
  | 'internship'
  | 'career'
  | 'education'
  | 'purchase'
  | 'learning'
  | 'finance'
  | 'other';

export interface DecisionOption {
  id: string;
  name: string;
  role?: string;
  stipend?: string;
  salary?: string;
  duration?: string;
  cost?: string;
  price?: string;
  technology?: string[];
  specs?: Record<string, string>;
  pros?: string[];
  cons?: string[];
  rawDetails?: string;
  attributes: Record<string, any>;
}

export interface DecisionCriteria {
  key: string;
  label: string;
  weight: number; // 1 to 5
  description?: string;
}

export interface OptionScore {
  optionId: string;
  optionName: string;
  score: number;
  criteriaBreakdown: Record<string, { score: number; reason: string }>;
  strengths: string[];
  weaknesses: string[];
}

export interface ComparisonAnalysis {
  scores: Record<string, OptionScore>;
  ranking: string[]; // option names ordered highest to lowest
  recommendedOption: string;
  reasons: string[];
  comparisonText: Record<string, { strengths: string[]; weaknesses: string[] }>;
  mainTradeoff: string;
  risksAndMissingInfo: string[];
  nextSteps: string[];
  confidence: 'High' | 'Medium' | 'Low';
}

export interface DecisionState {
  conversationId: string;
  decisionType: DecisionType | null;
  question: string | null;
  options: DecisionOption[];
  goal: string | null;
  priorities: string[];
  constraints: string[];
  facts: Record<string, any>;
  missingInformation: string[];
  researchRequired: boolean;
  researchResults: Array<{
    query: string;
    title: string;
    snippet: string;
    url?: string;
  }>;
  criteria: DecisionCriteria[];
  analysis: ComparisonAnalysis | null;
  recommendation: string | null;
  stage: 'detecting' | 'clarifying' | 'analyzing' | 'recommended';
  turnCount: number;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  state?: Partial<DecisionState>;
  structuredAnalysis?: ComparisonAnalysis | null;
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
  provider?: 'gemini' | 'openai' | 'heuristic' | 'auto';
  apiKey?: string;
}

export interface ChatResponse {
  reply: string;
  conversationId: string;
  state: DecisionState;
  structuredAnalysis?: ComparisonAnalysis | null;
}

export interface AnalyzeRequest {
  decision: {
    question: string;
    decisionType?: DecisionType;
    options: Array<Partial<DecisionOption>>;
    goal?: string;
    priorities?: string[];
    constraints?: string[];
  };
}

export interface AnalyzeResponse {
  recommendation: string;
  reasons: string[];
  comparison: Record<string, { strengths: string[]; weaknesses: string[] }>;
  tradeoff: string;
  risksAndMissingInfo: string[];
  nextSteps: string[];
  confidence: 'High' | 'Medium' | 'Low';
}
