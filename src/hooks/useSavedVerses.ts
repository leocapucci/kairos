import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'kairos:saved_verses';

export function useSavedVerses() {
  const [savedVerses, setSavedVerses] = useState<string[]>([]);

  // Tracks whether the first AsyncStorage load has completed.
  // Without this guard, the useEffect below would fire immediately on mount
  // with savedVerses=[] and overwrite the stored data before it's read.
  const didLoad = useRef(false);

  const loadFromStorage = useCallback(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        setSavedVerses(raw ? (JSON.parse(raw) as string[]) : []);
        didLoad.current = true;
      })
      .catch((err) => {
        if (__DEV__) console.warn('[kairos] useSavedVerses: load failed', err);
        didLoad.current = true;
      });
  }, []);

  // Initial load on mount
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // Reload on screen focus to pick up changes made by other screens
  useFocusEffect(
    useCallback(() => {
      loadFromStorage();
    }, [loadFromStorage])
  );

  // Persist to AsyncStorage whenever savedVerses changes.
  // The didLoad guard ensures we never write the initial [] before reading stored data.
  useEffect(() => {
    if (!didLoad.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(savedVerses)).catch((err) => {
      if (__DEV__) console.warn('[kairos] useSavedVerses: save failed', err);
    });
  }, [savedVerses]);

  const isSaved = useCallback(
    (key: string) => savedVerses.includes(key),
    [savedVerses]
  );

  // Pure state update — persistence is handled by the useEffect above
  const toggleSave = useCallback((key: string) => {
    setSavedVerses((prev) =>
      prev.includes(key)
        ? prev.filter((k) => k !== key)
        : [...prev, key]
    );
  }, []);

  return { isSaved, toggleSave, savedVerses };
}
