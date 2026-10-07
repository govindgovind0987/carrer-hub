'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  Send,
  Trash2,
  RotateCcw,
  Bot,
  User,
  Code2,
  BookOpen,
  Briefcase,
  TrendingUp,
  FileText,
  AlertCircle,
  Loader2,
  CornerDownLeft,
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
        className="fixed bottom-20 right-4 sm:bottom-24 sm:right-8 z-50 w-[calc(100vw-2rem)] sm:w-[440px] h-[620px] max-h-[82vh] flex flex-col rounded-2xl border border-border/80 bg-card/95 backdrop-blur-2xl shadow-2xl overflow-hidden font-sans"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-b border-border/70 select-none">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
              <Sparkles className="h-4 w-4" />
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
        <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role !== 'user' && (
                <div className="h-7 w-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 mt-0.5">
                  <Bot className="h-3.5 w-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground font-medium rounded-tr-xs'
                    : 'bg-muted/50 border border-border/60 text-foreground rounded-tl-xs shadow-xs'
                }`}
              >
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                ) : msg.content ? (
                  <AssistantMarkdown content={msg.content} />
                ) : (
                  <div className="flex items-center gap-1.5 py-1 text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span className="text-xs">Analyzing CareerHub database...</span>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground shrink-0 mt-0.5">
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
                className="whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium bg-background border border-border/60 hover:border-primary/50 hover:bg-accent text-muted-foreground hover:text-foreground transition-all shrink-0 cursor-pointer disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-card border-t border-border/60">
          <div className="relative flex items-center rounded-xl border border-border/70 bg-background focus-within:border-primary/60 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about DSA, interviews, resumes, code..."
              disabled={isLoading}
              className="flex-1 max-h-24 resize-none bg-transparent px-3 py-2.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-hidden disabled:opacity-50"
            />
            <Button
              type="button"
              size="icon"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="h-7 w-7 mr-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all shrink-0 disabled:opacity-40"
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
            <span className="hidden sm:inline">Press Enter ↵ to send</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
