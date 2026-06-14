import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useSyncExternalStore } from 'react';

import { logger } from '../utils/logger';

const STORAGE_KEY = 'saved_verses';
const OLD_STORAGE_KEY = 'kairos:saved_verses';

export type SavedVerse = {
  reference: string;
  text: string;
  book: string;
  chapter: number;
  verse: number;
};

async function migrateOldVerses(): Promise<SavedVerse[]> {
  try {
    const raw = await AsyncStorage.getItem(OLD_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown[];
    if (!Array.isArray(parsed)) return [];
    const migrated: SavedVerse[] = parsed
      .filter((item): item is string => typeof item === 'string')
      .map((ref) => {
        const match = ref.match(/^(.+)\s+(\d+):(\d+)$/);
        return {
          reference: ref,
          text: '',
          book: match?.[1] ?? ref,
          chapter: match ? parseInt(match[2], 10) : 0,
          verse: match ? parseInt(match[3], 10) : 0,
        };
      });
    await AsyncStorage.removeItem(OLD_STORAGE_KEY);
    return migrated;
  } catch {
    return [];
  }
}

// ── Singleton store shared across every screen (single source of truth) ──
// Saving on one screen mutates this module-level state and notifies all
// subscribers synchronously, so other screens reflect it immediately without
// re-reading AsyncStorage (which caused the save/load race condition).
let verses: SavedVerse[] = [];
let loaded = false;
let loadPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function persist() {
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(verses)).catch((err) => {
    logger.warn('useSavedVerses: save failed', err);
  });
}

// Always replace the array reference (never mutate in place) so
// useSyncExternalStore detects the change.
function setVerses(next: SavedVerse[]) {
  verses = next;
  emit();
  persist();
}

function ensureLoaded(): Promise<void> {
  if (loaded) return Promise.resolve();
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw !== null) {
        verses = JSON.parse(raw) as SavedVerse[];
      } else {
        verses = await migrateOldVerses();
        if (verses.length) persist();
      }
    } catch (err) {
      logger.warn('useSavedVerses: load failed', err);
    } finally {
      loaded = true;
      emit();
    }
  })();
  return loadPromise;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  void ensureLoaded();
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return verses;
}

export function useSavedVerses() {
  const savedVerses = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const isVerseSaved = useCallback(
    (reference: string) => savedVerses.some((v) => v.reference === reference),
    [savedVerses]
  );

  const saveVerse = useCallback((verse: SavedVerse) => {
    if (verses.some((v) => v.reference === verse.reference)) return;
    setVerses([verse, ...verses]);
  }, []);

  const removeSavedVerse = useCallback((reference: string) => {
    setVerses(verses.filter((v) => v.reference !== reference));
  }, []);

  return { savedVerses, saveVerse, removeSavedVerse, isVerseSaved };
}
