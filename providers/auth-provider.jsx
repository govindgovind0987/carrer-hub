'use client';

import { SessionProvider } from 'next-auth/react';
import { UserThemeSync } from '@/providers/user-theme-sync';

export function AuthProvider({ children, session }) {
  return (
    <SessionProvider session={session}>
      <UserThemeSync />
      {children}
    </SessionProvider>
  );
}
