'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';

export function UserThemeSync() {
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const prevUserIdRef = useRef(null);

  const userId = session?.user?.id || session?.user?.email || null;
  const userTheme = session?.user?.theme === 'dark' ? 'dark' : 'light';

  useEffect(() => {
    if (status === 'loading') return;

    if (userId) {
      if (prevUserIdRef.current !== userId) {
        prevUserIdRef.current = userId;
        if (theme !== userTheme) {
          setTheme(userTheme);
        }
        try {
          localStorage.setItem('careerhub_theme', userTheme);
          document.cookie = `careerhub_theme=${userTheme}; path=/; max-age=31536000; SameSite=Lax`;
        } catch {
          // ignore storage errors
        }
      }
    } else {
      if (prevUserIdRef.current !== null) {
        prevUserIdRef.current = null;
        if (theme !== 'light') {
          setTheme('light');
        }
        try {
          localStorage.setItem('careerhub_theme', 'light');
          document.cookie = `careerhub_theme=light; path=/; max-age=31536000; SameSite=Lax`;
        } catch {
          // ignore storage errors
        }
      }
    }
  }, [userId, userTheme, status, theme, setTheme]);

  return null;
}
