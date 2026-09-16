import React, { useState } from 'react';
import { User, Bot, Copy, Check } from 'lucide-react';
import { Message } from '../types';
import { ComparisonCard } from './ComparisonCard';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render markdown-like text nicely
  const formatContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, index) => {
      // Heading 3
      if (line.startsWith('### ')) {
        return (
          <h3 key={index} className="text-base font-bold text-white mt-4 mb-2 first:mt-0 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block"></span>
            {line.replace('### ', '')}
          </h3>
        );
      }
      // Heading 2
      if (line.startsWith('## ')) {
        return (
          <h2 key={index} className="text-lg font-bold text-white mt-4 mb-2 first:mt-0">
            {line.replace('## ', '')}
          </h2>
        );
      }
      // Bullet point +
      if (line.trim().startsWith('+ ')) {
        return (
          <div key={index} className="flex items-start gap-2 my-1 text-emerald-300 text-xs sm:text-sm pl-2">
            <span className="font-bold text-emerald-400 shrink-0">+</span>
            <span>{line.trim().replace(/^\+\s*/, '')}</span>
          </div>
        );
      }
      // Bullet point -
      if (line.trim().startsWith('- ')) {
        return (
          <div key={index} className="flex items-start gap-2 my-1 text-rose-300 text-xs sm:text-sm pl-2">
            <span className="font-bold text-rose-400 shrink-0">-</span>
            <span>{line.trim().replace(/^-\s*/, '')}</span>
          </div>
        );
      }
      // Bullet point • or *
      if (line.trim().startsWith('• ') || line.trim().startsWith('* ')) {
        return (
          <div key={index} className="flex items-start gap-2 my-1 text-slate-200 text-xs sm:text-sm pl-2">
            <span className="font-bold text-purple-400 shrink-0">•</span>
            <span>{line.trim().replace(/^[•\*]\s*/, '')}</span>
          </div>
        );
      }
      // Numbered list
      if (/^\d+\.\s/.test(line.trim())) {
        const numMatch = line.trim().match(/^(\d+)\.\s*(.*)$/);
        return (
          <div key={index} className="flex items-start gap-2 my-1.5 text-slate-200 text-xs sm:text-sm pl-2">
            <span className="font-semibold text-purple-400 shrink-0">{numMatch?.[1]}.</span>
            <span>{numMatch?.[2]}</span>
          </div>
        );
      }
      // Empty line
      if (!line.trim()) {
        return <div key={index} className="h-2" />;
      }
      // Regular paragraph (with bold parsing)
      return (
        <p key={index} className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-1.5">
          {renderFormattedInline(line)}
        </p>
      );
    });
  };

  // Helper to render **bold**
  const renderFormattedInline = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className={`flex items-start gap-3 my-4 animate-fade-in ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div
        className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
          isUser
            ? 'bg-purple-600 text-white'
            : 'bg-slate-800 text-purple-400 border border-purple-500/20'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Bubble Container */}
      <div className={`relative max-w-[85%] sm:max-w-[78%] group ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`p-4 rounded-2xl shadow-sm text-left ${
            isUser
              ? 'bg-gradient-to-tr from-purple-700 to-indigo-600 text-white rounded-tr-sm'
              : 'glass-panel text-slate-200 rounded-tl-sm border border-slate-800'
          }`}
        >
          {formatContent(message.content)}

          {/* If there's an interactive ComparisonCard payload */}
          {message.structuredAnalysis && (
            <ComparisonCard analysis={message.structuredAnalysis} />
          )}

          {/* Copy Button & Timestamp */}
          <div className="flex items-center justify-end gap-2 mt-2 pt-1 border-t border-slate-800/40 text-[10px] text-slate-400">
            <span>
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <button
              onClick={handleCopy}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-white"
              title="Copy message text"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
