/**
 * TanStack Query hooks for the Home screen's 3 critical data sources.
 *
 * Benefits over raw useEffect:
 *  - Automatic deduplication: multiple components calling the same hook
 *    share a single in-flight request
 *  - Stale-while-revalidate: shows cached data instantly, refetches in bg
 *  - Retry: inherits QueryClient retry config (2 retries, exponential backoff)
 *  - Request cancellation: query is aborted when component unmounts
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';

import { getDaily, getProfile, getVerseOfDay } from '../../services/api';
import { queryKeys } from '../query/queryKeys';
import { dailyContentPolicy, profilePolicy } from '../query/queryDefaults';

// ─── Types ────────────────────────────────────────────────────────────────────

export type VerseData = {
  text: string;
  book: string;
  chapter: number;
  verse_number: number;
};

export type DailyData = {
  daily_message_id?: string;
  id?: string;
  conforto?: string;
  confronto?: string;
  forca?: string;
};

export type ProfileData = {
  streak_days?: number;
  streak?: number;
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useVerseOfDay(): UseQueryResult<VerseData | null> {
  return useQuery({
    queryKey: queryKeys.verse.ofDay(),
    queryFn: () => getVerseOfDay(),
    ...dailyContentPolicy,
  });
}

export function useDaily(): UseQueryResult<{ data: unknown } | null> {
  return useQuery({
    queryKey: queryKeys.daily.message(),
    queryFn: () => getDaily(),
    ...dailyContentPolicy,
  });
}

export function useProfile(): UseQueryResult<{ data: unknown }> {
  return useQuery({
    queryKey: queryKeys.profile.me(),
    queryFn: () => getProfile(),
    ...profilePolicy,
  });
}
