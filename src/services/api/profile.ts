import { BASE_URL, request } from './http';
import { logger } from '../../utils/logger';

export type ProfileResponse = {
  streak_days?: number;
  streak?: number;
  patterns?: Partial<Record<string, number>>;
  onboarding_answers?: Record<string, string>;
};

// NOTE: endpoint path is a best guess — verify /profile against actual backend routes

export const getProfile = async (): Promise<{ data: ProfileResponse }> => {
  try {
    const res = await request<ProfileResponse | { data?: ProfileResponse }>(`${BASE_URL}/profile`);
    const data = (res as any)?.data ?? res ?? {};
    return { data: data as ProfileResponse };
  } catch (err) {
    logger.error('getProfile failed', err);
    return { data: {} };
  }
};
