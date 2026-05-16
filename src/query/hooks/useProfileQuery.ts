import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, UseQueryResult } from '@tanstack/react-query';

import type { ProfileResponse } from '../../services/api/profile';
import { BASE_URL, request } from '../../services/api/http';
import { startTimer } from '../../utils/perf';
import { profilePolicy } from '../queryDefaults';
import { queryKeys } from '../queryKeys';

// ─── Hook ─────────────────────────────────────────────────────────────────────

// Fetches /profile and normalises the response shape.
// On error, throwOnError: false means isError=true but no crash — caller renders
// with the local AsyncStorage fallback for onboarding_answers.
export function useProfileQuery(): UseQueryResult<ProfileResponse> {
  return useQuery({
    queryKey: queryKeys.profile.me(),
    queryFn: async ({ signal }) => {
      const done = startTimer('profile');
      try {
        const raw = await request<ProfileResponse | { data?: ProfileResponse }>(
          `${BASE_URL}/profile`,
          signal,
        );
        done();
        const data =
          (raw as { data?: ProfileResponse })?.data ?? (raw as ProfileResponse) ?? {};
        return data as ProfileResponse;
      } catch (e) {
        done('(failed)');
        throw e;
      }
    },
    ...profilePolicy,
  });
}

// Thin helper used by ProfileScreen to fall back to local onboarding answers
// when the API is unreachable.
export async function loadLocalOnboardingAnswers(): Promise<Record<string, string>> {
  try {
    const raw = await AsyncStorage.getItem('onboarding_answers');
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}
