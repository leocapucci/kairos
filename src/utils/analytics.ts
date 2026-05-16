/**
 * Lightweight analytics — wraps PostHog's HTTP Capture API.
 * No native SDK needed; works with Expo managed workflow and Expo Go.
 *
 * Setup:
 *   1. Create a project at https://app.posthog.com
 *   2. Add EXPO_PUBLIC_POSTHOG_KEY to your .env / EAS secrets
 *   3. Events will appear in PostHog under the distinct_id stored in AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const POSTHOG_HOST = 'https://app.posthog.com';
const STORAGE_KEY = '@kairos/analytics_id';

// Lazily resolved — avoids async at module init
let _distinctId: string | null = null;

async function getDistinctId(): Promise<string> {
  if (_distinctId) return _distinctId;
  let id = await AsyncStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = `anon_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    await AsyncStorage.setItem(STORAGE_KEY, id);
  }
  _distinctId = id;
  return id;
}

function getBaseProperties(): Record<string, unknown> {
  return {
    $app_version: Constants.expoConfig?.version ?? 'unknown',
    $platform: Platform.OS,
    $os_version: Platform.Version,
  };
}

/**
 * Track an event. Fire-and-forget — never throws, never blocks UI.
 */
export function track(event: AnalyticsEvent, properties?: Record<string, unknown>): void {
  const key = (Constants.expoConfig?.extra?.posthogKey as string | undefined)
    ?? (process.env.EXPO_PUBLIC_POSTHOG_KEY);

  if (!key) {
    // Dev hint — not a hard error
    if (__DEV__) console.log(`[analytics] ${event}`, properties ?? {});
    return;
  }

  // Non-blocking — ignore failures
  getDistinctId()
    .then((distinctId) =>
      fetch(`${POSTHOG_HOST}/capture/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: key,
          event,
          distinct_id: distinctId,
          properties: { ...getBaseProperties(), ...properties },
          timestamp: new Date().toISOString(),
        }),
      })
    )
    .catch(() => {});
}

/**
 * Identify the user with their distinct_id.
 * Call after onboarding or authentication.
 */
export function identify(traits?: Record<string, unknown>): void {
  const key = (Constants.expoConfig?.extra?.posthogKey as string | undefined)
    ?? (process.env.EXPO_PUBLIC_POSTHOG_KEY);

  if (!key) return;

  getDistinctId()
    .then((distinctId) =>
      fetch(`${POSTHOG_HOST}/capture/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: key,
          event: '$identify',
          distinct_id: distinctId,
          $set: { ...getBaseProperties(), ...traits },
        }),
      })
    )
    .catch(() => {});
}

// ─── Event catalog ────────────────────────────────────────────────────────────
// Centralised so typos are caught at compile time.

export type AnalyticsEvent =
  | 'app_open'
  | 'onboarding_started'
  | 'onboarding_complete'
  | 'onboarding_skipped'        // user skipped after API failure
  | 'verse_saved'
  | 'verse_shared'
  | 'share_clicked'
  | 'interaction_opened'        // tap on direction card
  | 'interaction_reaction_sent' // one of the 4 reaction buttons
  | 'devotional_opened'
  | 'bible_searched'
  | 'plan_started'
  | 'plan_day_completed'
  | 'profile_opened'
  | 'streak_viewed'
  | 'deep_modal_opened'
  | 'section_expanded';         // meditacao/confronto/oracao section tapped
