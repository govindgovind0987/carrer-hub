'use client';

import { useState, useEffect, useSyncExternalStore, useCallback } from 'react';

/**
 * Custom hook for responsive media queries.
 * Returns true if the viewport matches the given query.
 */
export function useMediaQuery(query) {
  const subscribe = useCallback(
    (callback) => {
      if (typeof window === 'undefined') return () => {};
      const matchMedia = window.matchMedia(query);
      matchMedia.addEventListener('change', callback);
      return () => matchMedia.removeEventListener('change', callback);
    },
    [query]
  );

  const getSnapshot = () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  };

  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Custom hook for scroll-based state.
 * Returns true when scrolled past the threshold.
 */
export function useScrolled(threshold = 20) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > threshold);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return scrolled;
}

/**
 * Custom hook for copied-to-clipboard state.
 */
export function useCopyToClipboard(duration = 2000) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), duration);
        return true;
      } catch {
        setCopied(false);
        return false;
      }
    },
    [duration]
  );

  return { copied, copy };
}
