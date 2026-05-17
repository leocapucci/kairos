import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery } from '@tanstack/react-query';

import type { Plan, PlanProgress } from '../../services/api/plans';
import { completePlanDay, startPlan } from '../../services/api/plans';
import { BASE_URL, request } from '../../services/api/http';
import { startTimer } from '../../utils/perf';
import { plansCatalogPolicy, plansProgressPolicy } from '../queryDefaults';
import { queryClient } from '../queryClient';
import { queryKeys } from '../queryKeys';

// ─── Device ID ───────────────────────────────────────────────────────────────

async function resolveDeviceId(): Promise<string> {
  let id = await AsyncStorage.getItem('device_id');
  if (!id) {
    id = `device_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    await AsyncStorage.setItem('device_id', id);
  }
  return id;
}

// ─── usePlansData ─────────────────────────────────────────────────────────────
//
// Encapsulates all plans-related queries and mutations.
// Replaces the manual useEffect + 7 useState pattern in plans.tsx.
//
// `enabled` allows lazy loading — pass `enabled: activeTab === 'Planos'` in
// screens that only need plans data when a specific tab is visible.

export function usePlansData({ enabled: externalEnabled = true } = {}) {
  // Device ID — loaded once from AsyncStorage, never changes during the session.
  const { data: userId = '', isPending: isDeviceIdPending } = useQuery({
    queryKey: queryKeys.device.id(),
    queryFn: resolveDeviceId,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 0,
  });

  // Plans catalog — infrequent updates, cached for 30min.
  const plansQuery = useQuery({
    queryKey: queryKeys.plans.list(),
    queryFn: async ({ signal }) => {
      const done = startTimer('plans-list');
      try {
        const res = await request<Plan[] | { plans?: Plan[] }>(`${BASE_URL}/plans`, signal);
        done();
        return (Array.isArray(res) ? res : ((res as { plans?: Plan[] })?.plans ?? [])) as Plan[];
      } catch (e) {
        done('(failed)');
        throw e;
      }
    },
    enabled: externalEnabled,
    ...plansCatalogPolicy,
  });

  // Plan progress — refreshed every 2min, enabled only after userId is resolved.
  const progressQuery = useQuery({
    queryKey: queryKeys.plans.progress(userId),
    queryFn: async ({ signal }) => {
      const done = startTimer('plan-progress');
      try {
        const res = await request<PlanProgress | { data?: PlanProgress }>(
          `${BASE_URL}/plans/progress?user_id=${encodeURIComponent(userId)}`,
          signal,
        );
        done();
        const progress =
          (res as { data?: PlanProgress })?.data ?? (res as PlanProgress) ?? null;
        return progress as PlanProgress;
      } catch (e) {
        done('(failed)');
        throw e;
      }
    },
    enabled: externalEnabled && userId.length > 0,
    ...plansProgressPolicy,
  });

  // Start plan — optimistic cache update so UI responds immediately.
  const startPlanMutation = useMutation({
    mutationFn: (planId: string) => startPlan(planId, userId),
    onSuccess: (_, planId) => {
      queryClient.setQueryData<PlanProgress>(queryKeys.plans.progress(userId), {
        plan_id: planId,
        current_day: 1,
      });
    },
  });

  // Complete day — increments current_day in cache immediately.
  const completeDayMutation = useMutation({
    mutationFn: ({ planId, day }: { planId: string; day: number }) =>
      completePlanDay(planId, day, userId),
    onSuccess: () => {
      queryClient.setQueryData<PlanProgress>(
        queryKeys.plans.progress(userId),
        (old) => (old ? { ...old, current_day: (old.current_day ?? 1) + 1 } : old),
      );
    },
  });

  const isLoading =
    externalEnabled &&
    (isDeviceIdPending || plansQuery.isPending || (userId.length > 0 && progressQuery.isPending));

  return {
    userId,
    plans: plansQuery.data ?? [],
    progress: progressQuery.data ?? null,
    isLoading,
    isError: plansQuery.isError,
    startPlanMutation,
    completeDayMutation,
  };
}
