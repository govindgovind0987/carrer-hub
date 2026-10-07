'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { usePathname } from 'next/navigation';

const AssistantContext = createContext(null);

const DEFAULT_WELCOME_MESSAGE = {
  id: 'welcome-msg',
  role: 'assistant',
  content:
    'Hello! I am your dedicated **CareerHub AI Assistant**.\n\nI can help you with:\n- **DSA & Coding Problems**: Intuition, approaches, Big-O complexity, and solutions in Python, Java, or C++.\n- **AI Mock Interviews**: Question explanations, answer breakdowns, and evaluation feedback.\n- **Resume & ATS Optimization**: Score explanations, keyword improvements, and formatting tips.\n- **Learning & Skills**: Personalized DSA roadmaps, topic weaknesses, and progress analytics.\n- **CareerHub Features**: Fast navigation to any platform feature.\n\nWhat would you like to work on today?',
  timestamp: new Date().toISOString(),
};

function getRouteMetadata(pathname) {
  let pageType = 'dashboard';
  let label = 'Dashboard';

  if (!pathname) return { pathname: '/', pageType, pageLabel: label };

  if (pathname.includes('/assessment/problems/')) {
    pageType = 'coding-problem';
    label = 'DSA Problem Workspace';
  } else if (pathname.includes('/assessment')) {
    pageType = 'assessment';
    label = 'Coding Assessment';
  } else if (pathname.includes('/mock-interview/room/')) {
    pageType = 'interview-room';
    label = 'Live Interview Room';
  } else if (pathname.includes('/mock-interview')) {
    pageType = 'interview';
    label = 'AI Mock Interview';
  } else if (pathname.includes('/ai-analysis')) {
    pageType = 'resume-ats';
    label = 'Resume & ATS Score';
  } else if (pathname.includes('/resumes')) {
    pageType = 'resumes';
    label = 'My Resumes';
  } else if (pathname.includes('/career-workspace')) {
    pageType = 'workspace';
    label = 'My Workspace';
  } else if (pathname.includes('/learning')) {
    pageType = 'learning';
    label = 'My Learning';
  } else if (pathname.includes('/skill-progress')) {
    pageType = 'skill-progress';
    label = 'Skill Progress';
  } else if (pathname.includes('/career-coach')) {
    pageType = 'career-coach';
    label = 'AI Career Coach';
  } else if (pathname.includes('/job-match')) {
    pageType = 'job-match';
    label = 'AI Job Matcher';
  } else if (pathname.includes('/profile')) {
    pageType = 'profile';
    label = 'My Profile';
  }

  return { pathname, pageType, pageLabel: label };
}

export function AssistantProvider({ children }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([DEFAULT_WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customContext, setCustomContext] = useState({});

  // Derive route metadata directly without useEffect
  const routeMetadata = useMemo(() => getRouteMetadata(pathname), [pathname]);

  const activeContext = useMemo(
    () => ({
      ...routeMetadata,
      ...customContext,
    }),
    [routeMetadata, customContext]
  );

  const abortControllerRef = useRef(null);

  // Global toggle shortcut: Ctrl + / or Cmd + /
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleAssistant = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const clearChat = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setMessages([DEFAULT_WELCOME_MESSAGE]);
    setError(null);
    setIsLoading(false);
  }, []);

  const sendMessage = useCallback(
    async (text) => {
      const prompt = (text || '').trim();
      if (!prompt || isLoading) return;

      setError(null);
      const userMsgId = `user-${Date.now()}`;
      const assistantMsgId = `assistant-${Date.now()}`;

      const userMsg = {
        id: userMsgId,
        role: 'user',
        content: prompt,
        timestamp: new Date().toISOString(),
      };

      const updatedHistory = [...messages, userMsg];
      setMessages(updatedHistory);
      setIsLoading(true);

      // Create empty assistant placeholder message
      const initialAssistantMsg = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, initialAssistantMsg]);

      try {
        const controller = new AbortController();
        abortControllerRef.current = controller;

        const res = await fetch('/api/assistant/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: updatedHistory.map((m) => ({ role: m.role, content: m.content })),
            currentContext: activeContext,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error('CareerHub AI is temporarily unavailable. Please try again.');
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId ? { ...msg, content: accumulated } : msg
            )
          );
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('CareerHub Assistant Client Error:', err);
        setError('CareerHub AI is temporarily unavailable. Please try again.');
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  content:
                    'CareerHub AI is temporarily unavailable. Please try again or verify your connection.',
                }
              : msg
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, activeContext]
  );

  const retryLastMessage = useCallback(() => {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUser) {
      sendMessage(lastUser.content);
    }
  }, [messages, sendMessage]);

  const updateCustomContext = useCallback((ctx) => {
    setCustomContext((prev) => ({ ...prev, ...ctx }));
  }, []);

  return (
    <AssistantContext.Provider
      value={{
        isOpen,
        setIsOpen,
        toggleAssistant,
        activeContext,
        setCustomContext: updateCustomContext,
        messages,
        isLoading,
        error,
        sendMessage,
        clearChat,
        retryLastMessage,
      }}
    >
      {children}
    </AssistantContext.Provider>
  );
}

export function useCareerAssistant() {
  const context = useContext(AssistantContext);
  if (!context) {
    throw new Error('useCareerAssistant must be used within an AssistantProvider');
  }
  return context;
}

/**
 * Hook for pages (e.g. LeetCodeWorkspace, MockInterviewRoom) to register their live context
 */
export function useSetAssistantContext(contextData) {
  const { setCustomContext } = useCareerAssistant();

  useEffect(() => {
    if (contextData) {
      const timer = setTimeout(() => {
        setCustomContext(contextData);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [contextData, setCustomContext]);
}
