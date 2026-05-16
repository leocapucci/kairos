import { BASE_URL, post, request } from './http';

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

// Throws on error — callers (TanStack Query hooks) handle via error state.
export const getPlans = async (): Promise<{ data: Plan[] }> => {
  const res = await request<Plan[] | { plans?: Plan[] }>(`${BASE_URL}/plans`);
  const list = Array.isArray(res) ? res : ((res as { plans?: Plan[] })?.plans ?? []);
  return { data: list };
};

// Throws on error — callers handle via error state.
export const getPlanProgress = async (userId: string): Promise<{ data: PlanProgress }> => {
  const res = await request<PlanProgress | { data?: PlanProgress }>(
    `${BASE_URL}/plans/progress?user_id=${encodeURIComponent(userId)}`,
  );
  const progress = (res as { data?: PlanProgress })?.data ?? (res as PlanProgress) ?? null;
  return { data: progress as PlanProgress };
};

// Throws intentionally — caller (plans.tsx) shows error to user on failure.
export const startPlan = async (planId: string, userId: string): Promise<void> => {
  await post(`${BASE_URL}/plans/start`, { plan_id: planId, user_id: userId });
};

// Throws intentionally — caller handles.
export const completePlanDay = async (
  planId: string,
  day: number,
  userId: string,
): Promise<void> => {
  await post(`${BASE_URL}/plans/complete`, { plan_id: planId, day, user_id: userId });
};
