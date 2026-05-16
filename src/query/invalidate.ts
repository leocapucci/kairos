import { queryClient } from './queryClient';
import { queryKeys } from './queryKeys';

// Typed invalidation helpers — screens never construct query keys manually.
// Call after mutations to trigger background refetch of affected queries.

export const invalidate = {
  profile: () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.profile.all() }),

  planProgress: (userId: string) =>
    queryClient.invalidateQueries({ queryKey: queryKeys.plans.progress(userId) }),

  plans: () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.plans.all() }),

  interactions: () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.interactions.all() }),

  verse: () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.verse.all() }),

  daily: () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.daily.all() }),
};
