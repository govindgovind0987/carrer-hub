'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { saveUserTheme } from '@/actions/theme';

export function ThemeToggle({ className }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { data: session } = useSession();

  const handleToggle = () => {
    const isCurrentlyDark =
      typeof document !== 'undefined'
        ? document.documentElement.classList.contains('dark')
        : (resolvedTheme || theme) === 'dark';

    const nextTheme = isCurrentlyDark ? 'light' : 'dark';

    setTheme(nextTheme);

    try {
      localStorage.setItem('careerhub_theme', nextTheme);
      document.cookie = `careerhub_theme=${nextTheme}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      // ignore storage errors
    }

    if (session?.user?.id) {
      saveUserTheme(nextTheme).catch((err) => {
        console.error('Failed to persist user theme:', err);
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className={className}
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {/* 
        In Light mode: Show Moon icon
        In Dark mode: Show Sun icon
        CSS classes ensure instant, zero-flicker rendering matching the html element.
      */}
      <Moon className="h-[1.2rem] w-[1.2rem] transition-transform duration-200 dark:hidden" />
      <Sun className="h-[1.2rem] w-[1.2rem] transition-transform duration-200 hidden dark:block" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
