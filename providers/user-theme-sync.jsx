'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';

export function UserThemeSync() {
  const { data: session, status } = useSession();
  const { setTheme } = useTheme();
  const prevUserIdRef = useRef(undefined);

  useEffect(() => {
    if (status === 'loading') return;

    const currentUserId = session?.user?.id;

    if (currentUserId && currentUserId !== prevUserIdRef.current) {
      // User logged in or switched to a different account
      prevUserIdRef.current = currentUserId;
      const userTheme = session?.user?.theme === 'dark' ? 'dark' : 'light';
      setTheme(userTheme);
      try {
        localStorage.setItem('careerhub_theme', userTheme);
        document.cookie = `careerhub_theme=${userTheme}; path=/; max-age=31536000; SameSite=Lax`;
      } catch {
        // ignore storage errors
      }
    } else if (!currentUserId && prevUserIdRef.current !== undefined) {
      // User logged out - reset to default Light mode
      prevUserIdRef.current = null;
      setTheme('light');
      try {
        localStorage.setItem('careerhub_theme', 'light');
        document.cookie = `careerhub_theme=light; path=/; max-age=31536000; SameSite=Lax`;
      } catch {
        // ignore
      }
    }
  }, [session, status, setTheme]);

  return null;
}
