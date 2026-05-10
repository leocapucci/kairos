import { BASE_URL, post, request } from './http';
import { logger } from '../../utils/logger';

export type Plan = {
  id: string;
  title: string;
  description: string;
  days: number;
  theme: string;
};

export type PlanProgress = {
  plan_id: string | null;
  current_day: number;
} | null;

// NOTE: all endpoint paths are best guesses — verify /plans, /plans/progress,
//       /plans/start, /plans/complete against actual backend routes

export const getPlans = async (): Promise<{ data: Plan[] }> => {
  try {
    const res = await request<Plan[] | { plans?: Plan[] }>(`${BASE_URL}/plans`);
    const list = Array.isArray(res) ? res : ((res as any)?.plans ?? []);
    return { data: list };
  } catch (err) {
    logger.error('getPlans failed', err);
    return { data: [] };
  }
};

export const getPlanProgress = async (userId: string): Promise<{ data: PlanProgress }> => {
  try {
    const res = await request<PlanProgress | { data?: PlanProgress }>(
      `${BASE_URL}/plans/progress?user_id=${encodeURIComponent(userId)}`
    );
    const progress = (res as any)?.data ?? res ?? null;
    return { data: progress as PlanProgress };
  } catch (err) {
    logger.error('getPlanProgress failed', err);
    return { data: null };
  }
};

export const startPlan = async (planId: string, userId: string): Promise<void> => {
  // throws intentionally — caller (plans.tsx) shows error to user on failure
  await post(`${BASE_URL}/plans/start`, { plan_id: planId, user_id: userId });
};

export const completePlanDay = async (
  planId: string,
  day: number,
  userId: string
): Promise<void> => {
  try {
    await post(`${BASE_URL}/plans/complete`, { plan_id: planId, day, user_id: userId });
  } catch (err) {
    logger.error('completePlanDay failed', err);
    throw err;
  }
};
