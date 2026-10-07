'use client';

import dynamic from 'next/dynamic';
import { BotMessageSquare } from 'lucide-react';
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
          title="CareerHub AI Assistant"
          className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] right-[calc(1rem+env(safe-area-inset-right,0px))] sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8 z-40 flex items-center justify-center sm:gap-2 h-11 w-11 sm:h-auto sm:w-auto rounded-full bg-primary text-primary-foreground sm:px-4 sm:py-2.5 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer border border-primary/20 group"
        >
          <div className="relative flex items-center justify-center">
            <BotMessageSquare className="h-5 w-5 shrink-0" />
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-background sm:hidden" />
          </div>
          <span className="hidden sm:inline text-xs font-semibold tracking-wide">
            CareerHub AI
          </span>
        </motion.button>
      )}
    </>
  );
}
