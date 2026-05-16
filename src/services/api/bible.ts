import { BASE_URL, request } from './http';

export type SearchResult = { book: string; chapter: number; verse: number; text: string };

export type VerseOfDay = { text: string; book: string; chapter: number; verse_number: number };

const EMPTY_SEARCH: { data: { results: SearchResult[] } } = { data: { results: [] } };

// Throws on error — callers (TanStack Query hooks) handle via error state.
export const getDailyVerse = async (): Promise<{ data: unknown }> => {
  const res = await request(`${BASE_URL}/daily`);
  return { data: res };
};

// Throws on error — callers handle via error state or fallback verse.
export const getVerseOfDay = async (): Promise<VerseOfDay> => {
  return await request<VerseOfDay>(`${BASE_URL}/bible/verse-of-day`);
};

// Returns empty array on error — static list, non-critical.
export const getBooks = async (): Promise<string[]> => {
  try {
    const res = await request<{ books?: string[] }>(`${BASE_URL}/bible/books`);
    return Array.isArray(res?.books) ? res.books : [];
  } catch {
    return [];
  }
};

// Returns empty verses on error — chapter view handles gracefully.
export const getChapter = async (
  book: string,
  chapter: string | number,
): Promise<{ verses: { number: number; text: string }[] }> => {
  try {
    const res = await request<{ verses?: { number: number; text: string }[] }>(
      `${BASE_URL}/bible/chapter?book=${encodeURIComponent(book)}&chapter=${chapter}`,
    );
    return { verses: Array.isArray(res?.verses) ? res.verses : [] };
  } catch {
    return { verses: [] };
  }
};

// Returns empty results on error — search failure is non-critical.
export const searchBible = async (q: string): Promise<{ data: { results: SearchResult[] } }> => {
  if (!q.trim()) return EMPTY_SEARCH;
  try {
    const res = await request<{ results?: SearchResult[] }>(
      `${BASE_URL}/bible/search?q=${encodeURIComponent(q)}`,
    );
    return { data: { results: Array.isArray(res?.results) ? res.results : [] } };
  } catch {
    return EMPTY_SEARCH;
  }
};
