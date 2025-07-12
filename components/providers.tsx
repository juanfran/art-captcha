'use client';

import type React from 'react';

import { SessionProvider } from 'next-auth/react';
import { unstable_ViewTransition as ViewTransition } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange>
        <QueryClientProvider client={queryClient}>
          <ViewTransition>{children}</ViewTransition>
        </QueryClientProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
