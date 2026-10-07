'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BotMessageSquare,
  X,
  Send,
  Trash2,
  RotateCcw,
  User,
  Code2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCareerAssistant } from './assistant-context';
import { AssistantMarkdown } from './assistant-markdown';

export function AssistantChatPanel() {
  const {
    isOpen,
    setIsOpen,
    activeContext,
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
    retryLastMessage,
  } = useCareerAssistant();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Auto-resize input textarea up to ~7 lines (~160px) and then enable vertical scrolling
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;

    el.style.height = 'auto';
    const minHeight = 36;
    const maxHeight = 160; // Approx 7 lines
    const currentScrollHeight = el.scrollHeight;

    if (currentScrollHeight > maxHeight) {
      el.style.height = `${maxHeight}px`;
      el.style.overflowY = 'auto';
    } else {
      el.style.height = `${Math.max(currentScrollHeight, minHeight)}px`;
      el.style.overflowY = 'hidden';
    }
  }, [input, isOpen]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    const text = input;
    setInput('');
    sendMessage(text);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Context-aware quick prompt suggestions
  const getQuickPrompts = () => {
    if (activeContext?.problemTitle) {
      return [
        `Explain "${activeContext.problemTitle}"`,
        `Give Python solution for this problem`,
        `Analyze time and space complexity`,
        `Why is my solution failing?`,
      ];
    }
    if (activeContext?.pageType === 'interview' || activeContext?.pageType === 'interview-room') {
      return [
        'Explain question 1 from my last interview',
        'Why was my answer marked wrong?',
        'How can I prepare for technical rounds?',
      ];
    }
    if (activeContext?.pageType === 'resume-ats' || activeContext?.pageType === 'resumes') {
      return [
        'Why is my ATS score low?',
        'Improve my resume summary',
        'What skills are missing from my resume?',
      ];
    }
    return [
      'Explain Two Sum and its approach',
      'Where can I practice DSA?',
      'Show my skill progress',
      'Open My Resumes',
    ];
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-x-2 sm:inset-x-auto bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] sm:bottom-20 sm:right-6 lg:bottom-24 lg:right-8 z-50 w-auto sm:w-[440px] h-[75vh] sm:h-[620px] max-h-[calc(100dvh-5rem)] flex flex-col rounded-2xl border border-border/80 bg-card/95 backdrop-blur-2xl shadow-2xl overflow-hidden font-sans"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-b border-border/70 select-none">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
              <BotMessageSquare className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">CareerHub AI</h3>
                <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                {activeContext?.problemTitle
                  ? `Problem: ${activeContext.problemTitle}`
                  : activeContext?.pageLabel || 'Assistant'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={clearChat}
              title="Clear chat"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              title="Close assistant"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Active Context Banner */}
        {activeContext?.problemTitle && (
          <div className="px-3.5 py-1.5 bg-primary/5 border-b border-border/50 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-primary truncate">
              <Code2 className="h-3.5 w-3.5 shrink-0" />
              <span className="font-medium truncate">{activeContext.problemTitle}</span>
              {activeContext.difficulty && (
                <Badge variant="outline" className="text-[10px] h-4 px-1 py-0 border-primary/30">
                  {activeContext.difficulty}
                </Badge>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground shrink-0 font-mono">Context Active</span>
          </div>
        )}

        {/* Message Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 scrollbar-thin">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role !== 'user' && (
                <div className="h-7 w-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 mt-0.5">
                  <BotMessageSquare className="h-3.5 w-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs text-left ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground font-medium rounded-tr-xs'
                    : 'bg-card text-foreground border border-border/80 rounded-tl-xs'
                }`}
              >
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                ) : msg.content ? (
                  <AssistantMarkdown content={msg.content} />
                ) : (
                  <div className="flex items-center gap-2 py-0.5 text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">CareerHub AI is thinking...</span>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shrink-0 mt-0.5">
                  <User className="h-3.5 w-3.5" />
                </div>
              )}
            </div>
          ))}

          {/* Error Banner with Retry */}
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs flex items-center justify-between text-destructive">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={retryLastMessage}
                className="h-6 px-2 text-[11px] border-destructive/30 text-destructive hover:bg-destructive/10"
              >
                <RotateCcw className="mr-1 h-3 w-3" /> Retry
              </Button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-3.5 py-2 border-t border-border/40 bg-muted/20">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            {getQuickPrompts().map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => sendMessage(prompt)}
                disabled={isLoading}
                className="whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium bg-background border border-border/60 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-accent text-muted-foreground hover:text-foreground transition-all shrink-0 cursor-pointer disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-card border-t border-border/60">
          <div className="careerhub-chat-input-box relative flex items-end gap-2 rounded-xl border border-input bg-background/90 p-1.5 transition-all shadow-2xs">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about DSA, interviews, resumes, code..."
              disabled={isLoading}
              style={{ outline: 'none', boxShadow: 'none' }}
              className="flex-1 resize-none bg-transparent px-2.5 py-1.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/70 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 shadow-none border-none disabled:opacity-50 overflow-x-hidden break-words leading-relaxed min-h-[36px] max-h-[160px] scrollbar-thin"
            />
            <Button
              type="button"
              size="icon"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="h-8 w-8 mb-0.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all shrink-0 disabled:opacity-40 cursor-pointer flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
          <div className="flex items-center justify-between mt-1.5 px-1 text-[10px] text-muted-foreground">
            <span>CareerHub AI • Strictly scoped</span>
            <span className="hidden sm:inline">Press Enter ↵ to send • Shift+Enter for new line</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
