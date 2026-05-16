import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'kairos:user_profile';
const MAX_HISTORY = 5;

export type EmotionalTag = 'peace' | 'confrontation' | 'direction';

type UserProfile = {
  emotionalTags: Record<EmotionalTag, number>;
  lastViewedVerses: string[];
};

const DEFAULT_PROFILE: UserProfile = {
  emotionalTags: { peace: 0, confrontation: 0, direction: 0 },
  lastViewedVerses: [],
};

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const didLoad = useRef(false);

  const loadFromStorage = useCallback(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setProfile(JSON.parse(raw) as UserProfile);
        didLoad.current = true;
      })
      .catch((err) => {
        if (__DEV__) console.warn('[kairos] useUserProfile: load failed', err);
        didLoad.current = true;
      });
  }, []);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useFocusEffect(
    useCallback(() => {
      loadFromStorage();
    }, [loadFromStorage])
  );

  // Persist whenever profile changes — pure state updates only, no side effects in updaters
  useEffect(() => {
    if (!didLoad.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile)).catch((err) => {
      if (__DEV__) console.warn('[kairos] useUserProfile: save failed', err);
    });
  }, [profile]);

  // Pure state updates — persistence handled by the useEffect above
  const recordEmotion = useCallback((tag: EmotionalTag) => {
    setProfile((prev) => ({
      ...prev,
      emotionalTags: { ...prev.emotionalTags, [tag]: prev.emotionalTags[tag] + 1 },
    }));
  }, []);

  const recordVerseView = useCallback((verseRef: string) => {
    if (!verseRef) return;
    setProfile((prev) => {
      const filtered = prev.lastViewedVerses.filter((r) => r !== verseRef);
      return {
        ...prev,
        lastViewedVerses: [verseRef, ...filtered].slice(0, MAX_HISTORY),
      };
    });
  }, []);

  return { profile, recordEmotion, recordVerseView };
}
