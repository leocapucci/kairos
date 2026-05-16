import { useQuery, UseQueryResult } from '@tanstack/react-query';

import { getBooks } from '../../services/api/bible';
import { BASE_URL, request } from '../../services/api/http';
import { startTimer } from '../../utils/perf';
import {
  bibleChapterPolicy,
  dailyContentPolicy,
  searchPolicy,
  staticDataPolicy,
} from '../queryDefaults';
import { queryKeys } from '../queryKeys';

// ─── Types ────────────────────────────────────────────────────────────────────

export type VerseOfDay = {
  text: string;
  book: string;
  chapter: number;
  verse_number: number;
};

export type BibleChapter = {
  verses: { number: number; text: string }[];
};

export type SearchResult = {
  book: string;
  chapter: number;
  verse: number;
  text: string;
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

// Verse of the day — shared cache with home.tsx (same query key).
// Using request() directly so TanStack Query sees real errors (not null fallback).
export function useVerseOfDay(): UseQueryResult<VerseOfDay> {
  return useQuery({
    queryKey: queryKeys.verse.ofDay(),
    queryFn: ({ signal }) => {
      const done = startTimer('verse-of-day');
      return request<VerseOfDay>(`${BASE_URL}/bible/verse-of-day`, signal).then(
        (r) => { done(); return r; },
        (e) => { done('(failed)'); throw e; },
      );
    },
    ...dailyContentPolicy,
  });
}

// Bible books list — near-static, cached for a week.
export function useBibleBooks(): UseQueryResult<string[]> {
  return useQuery({
    queryKey: queryKeys.bible.books(),
    queryFn: () => {
      const done = startTimer('bible-books');
      return getBooks().then(
        (r) => { done(); return r; },
        (e) => { done('(failed)'); throw e; },
      );
    },
    ...staticDataPolicy,
  });
}

// Single chapter — cached per (book, chapter) pair.
export function useBibleChapter(
  book: string,
  chapter: number,
): UseQueryResult<BibleChapter> {
  return useQuery({
    queryKey: queryKeys.verse.chapter(book, chapter),
    queryFn: ({ signal }) => {
      const done = startTimer(`chapter:${book}-${chapter}`);
      return request<BibleChapter>(
        `${BASE_URL}/bible/chapter?book=${encodeURIComponent(book)}&chapter=${chapter}`,
        signal,
      ).then(
        (r) => { done(); return r; },
        (e) => { done('(failed)'); throw e; },
      );
    },
    enabled: Boolean(book && chapter > 0),
    ...bibleChapterPolicy,
  });
}

// Bible full-text search — enabled only when query has at least 2 characters.
export function useBibleSearch(query: string): UseQueryResult<SearchResult[]> {
  return useQuery({
    queryKey: queryKeys.verse.search(query),
    queryFn: async ({ signal }) => {
      const done = startTimer(`bible-search:${query}`);
      try {
        const res = await request<{ results?: SearchResult[] }>(
          `${BASE_URL}/bible/search?q=${encodeURIComponent(query)}`,
          signal,
        );
        done();
        return Array.isArray(res?.results) ? res.results : [];
      } catch (e) {
        done('(failed)');
        throw e;
      }
    },
    enabled: query.trim().length >= 2,
    ...searchPolicy,
  });
}
