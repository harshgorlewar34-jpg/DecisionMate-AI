import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { SuggestedPrompts } from './components/SuggestedPrompts';
import { MessageBubble } from './components/MessageBubble';
import { TypingIndicator } from './components/TypingIndicator';
import { ChatInput } from './components/ChatInput';
import { DecisionSidebar } from './components/DecisionSidebar';
import { SettingsModal } from './components/SettingsModal';
import { sendChatMessage, resetChat, checkServerHealth } from './services/api';
import { Message, DecisionState, ProviderSettings } from './types';
import { AlertCircle, RotateCcw } from 'lucide-react';

const INITIAL_STATE: DecisionState = {
  conversationId: '',
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

export const App: React.FC = () => {
  const [conversationId, setConversationId] = useState<string>(() => `conv_${Date.now()}`);
  const [messages, setMessages] = useState<Message[]>([]);
  const [decisionState, setDecisionState] = useState<DecisionState>({
    ...INITIAL_STATE,
    conversationId
  });
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [backendHealthy, setBackendHealthy] = useState<boolean>(false);

  const [settings, setSettings] = useState<ProviderSettings>(() => {
    const saved = localStorage.getItem('decisionmate_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      provider: 'auto',
      geminiApiKey: '',
      openaiApiKey: ''
    };
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Health check on mount
  useEffect(() => {
    const verifyHealth = async () => {
      try {
        const res = await checkServerHealth();
        setBackendHealthy(res.status === 'ok');
      } catch {
        setBackendHealthy(false);
      }
    };
    verifyHealth();
    const interval = setInterval(verifyHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveSettings = (newSettings: ProviderSettings) => {
    setSettings(newSettings);
    localStorage.setItem('decisionmate_settings', JSON.stringify(newSettings));
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    setError(null);
    setInput('');

    // Append user message immediately
    const userMessage: Message = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await sendChatMessage(text, conversationId, settings);

      // Append assistant message
      const assistantMessage: Message = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toISOString(),
        stateSnapshot: response.state,
        structuredAnalysis: response.structuredAnalysis
      };

      setMessages(prev => [...prev, assistantMessage]);
      setDecisionState(response.state);

      // If recommendation was produced, auto-open state inspector for transparent auditing
      if (response.state.stage === 'recommended') {
        setIsSidebarOpen(true);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err?.message || 'Failed to communicate with DecisionMate AI backend.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    if (confirm('Start a new decision conversation? Current choices will be cleared.')) {
      try {
        const freshId = `conv_${Date.now()}`;
        await resetChat(conversationId).catch(() => {});
        setConversationId(freshId);
        setMessages([]);
        setDecisionState({ ...INITIAL_STATE, conversationId: freshId });
        setError(null);
      } catch (err) {
        console.error('Reset error:', err);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0B0F19] text-slate-100 font-sans selection:bg-purple-500/30 selection:text-purple-200">
      {/* Header Bar */}
      <Header
        state={decisionState}
        onReset={handleReset}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Conversation Canvas */}
      <main className="flex-1 flex flex-col max-w-4xl w-full mx-auto p-4 sm:p-6 overflow-hidden">
        {messages.length === 0 ? (
          <SuggestedPrompts onSelectPrompt={(prompt) => handleSendMessage(prompt)} />
        ) : (
          <div className="flex-1 overflow-y-auto pr-1 space-y-2">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="my-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => {
                const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
                if (lastUserMsg) handleSendMessage(lastUserMsg.content);
              }}
              className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-medium flex items-center gap-1 shrink-0"
            >
              <RotateCcw className="w-3 h-3" />
              Retry
            </button>
          </div>
        )}
      </main>

      {/* Chat Input Bar */}
      <ChatInput
        input={input}
        setInput={setInput}
        onSend={() => handleSendMessage()}
        isLoading={isLoading}
      />

      {/* Decision State Inspector Drawer */}
      <DecisionSidebar
        state={decisionState}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* AI Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        backendHealthy={backendHealthy}
      />
    </div>
  );
};

export default App;
