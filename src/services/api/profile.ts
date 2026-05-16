import { BASE_URL, request } from './http';

export type ProfileResponse = {
  streak_days?: number;
  streak?: number;
  patterns?: Partial<Record<string, number>>;
  onboarding_answers?: Record<string, string>;
};

// Throws on error — useProfileQuery has throwOnError: false, so TanStack Query
// catches the error and exposes isError: true without crashing the screen.
export const getProfile = async (): Promise<{ data: ProfileResponse }> => {
  const res = await request<ProfileResponse | { data?: ProfileResponse }>(`${BASE_URL}/profile`);
  const data = (res as { data?: ProfileResponse })?.data ?? (res as ProfileResponse) ?? {};
  return { data: data as ProfileResponse };
};
