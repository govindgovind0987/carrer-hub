'use client';

import dynamic from 'next/dynamic';
import { Sparkles, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCareerAssistant } from './assistant-context';

// Lazy-load chat panel only when needed (Requirement 15: performance & lazy-loading)
const AssistantChatPanel = dynamic(
  () => import('./assistant-chat-panel').then((mod) => mod.AssistantChatPanel),
  { ssr: false }
);

export function AssistantFloatingButton() {
  const { isOpen, toggleAssistant } = useCareerAssistant();

  return (
    <>
      {isOpen && <AssistantChatPanel />}

      {!isOpen && (
        <motion.button
          type="button"
          onClick={toggleAssistant}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Open CareerHub AI Assistant"
          title="CareerHub AI Assistant (Ctrl + /)"
          className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer border border-primary/20 group"
        >
          <div className="relative">
            <Sparkles className="h-5 w-5 transition-transform group-hover:rotate-12" />
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400" />
          </div>
          <span className="text-xs font-semibold tracking-wide hidden sm:inline">
            CareerHub AI
          </span>
          <span className="hidden md:inline text-[10px] bg-primary-foreground/20 px-1.5 py-0.5 rounded-sm font-mono opacity-80">
            Ctrl+/
          </span>
        </motion.button>
      )}
    </>
  );
}
