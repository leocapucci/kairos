import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { logger } from '../utils/logger';

const STORAGE_KEY = 'saved_verses';
const OLD_STORAGE_KEY = 'kairos:saved_verses';

async function migrateOldVerses(): Promise<SavedVerse[]> {
  try {
    const raw = await AsyncStorage.getItem(OLD_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown[];
    if (!Array.isArray(parsed)) return [];
    const migrated: SavedVerse[] = (parsed as unknown[])
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

export type SavedVerse = {
  reference: string;
  text: string;
  book: string;
  chapter: number;
  verse: number;
};

export function useSavedVerses() {
  const [savedVerses, setSavedVerses] = useState<SavedVerse[]>([]);

  // Guard: prevents the persist useEffect from overwriting storage before the
  // initial load completes (avoids wipe-on-mount race condition).
  const didLoad = useRef(false);
  // Guard: prevents concurrent loadFromStorage() calls (useEffect + useFocusEffect
  // both fire on mount, which could cause the second read to overwrite an
  // in-flight save).
  const isLoadingRef = useRef(false);

  const loadFromStorage = useCallback(() => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then(async (raw) => {
        if (raw !== null) {
          setSavedVerses(JSON.parse(raw) as SavedVerse[]);
        } else {
          // Primeira vez com a chave nova — migrar dados da chave antiga se existirem
          const migrated = await migrateOldVerses();
          setSavedVerses(migrated);
        }
        didLoad.current = true;
      })
      .catch((err) => {
        logger.warn('useSavedVerses: load failed', err);
        didLoad.current = true;
      })
      .finally(() => {
        isLoadingRef.current = false;
      });
  }, []);

  // Load on mount
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // Re-load when screen gains focus — picks up saves made on other screens
  useFocusEffect(
    useCallback(() => {
      loadFromStorage();
    }, [loadFromStorage])
  );

  // Persist whenever the list changes (didLoad guard prevents premature writes)
  useEffect(() => {
    if (!didLoad.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(savedVerses)).catch((err) => {
      logger.warn('useSavedVerses: save failed', err);
    });
  }, [savedVerses]);

  const isVerseSaved = useCallback(
    (reference: string) => savedVerses.some((v) => v.reference === reference),
    [savedVerses]
  );

  const saveVerse = useCallback((verse: SavedVerse) => {
    setSavedVerses((prev) =>
      prev.some((v) => v.reference === verse.reference)
        ? prev
        : [verse, ...prev]
    );
  }, []);

  const removeSavedVerse = useCallback((reference: string) => {
    setSavedVerses((prev) => prev.filter((v) => v.reference !== reference));
  }, []);

  return { savedVerses, saveVerse, removeSavedVerse, isVerseSaved };
}
