import { QueryClient } from '@tanstack/react-query';

// Single QueryClient instance for the app.
// Imported by _layout.tsx (provider) and by invalidate.ts (setQueryData calls).
//
// retry: 2 here would double-retry on top of http.ts's own 2-retry backoff.
// Individual query hooks set retry: 0 — http.ts already handles retries.
// This global retry: 2 applies only to hooks that don't set their own retry.

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60_000,
      retry: 2,
      retryDelay: (attempt) => Math.min(800 * Math.pow(2, attempt), 10_000),
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
