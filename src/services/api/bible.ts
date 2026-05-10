import { BASE_URL, request } from './http';
import { logger } from '../../utils/logger';

export type SearchResult = { book: string; chapter: number; verse: number; text: string };

export const getDailyVerse = async (): Promise<{ data: unknown }> => {
  try {
    const res = await request(`${BASE_URL}/daily`);
    return { data: res };
  } catch (err) {
    logger.error('getDailyVerse failed', err);
    return { data: null };
  }
};

// NOTE: endpoint path is a best guess — verify /bible/search against actual backend routes
export const searchBible = async (q: string): Promise<{ data: { results: SearchResult[] } }> => {
  try {
    const res = await request<{ results?: SearchResult[] }>(
      `${BASE_URL}/bible/search?q=${encodeURIComponent(q)}`
    );
    return { data: { results: Array.isArray(res?.results) ? res.results : [] } };
  } catch (err) {
    logger.error('searchBible failed', err);
    return { data: { results: [] } };
  }
};
