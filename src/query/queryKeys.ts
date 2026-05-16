// Central query key factory — all query keys must come from here.
// Factory functions (not plain arrays) enable scoped hierarchical invalidation:
//   queryClient.invalidateQueries({ queryKey: queryKeys.plans.all() })
//   → invalidates plans/list AND plans/progress/* in one call

export const queryKeys = {
  // Verse of the day + chapter text + search results
  verse: {
    all: () => ['verse'] as const,
    ofDay: () => ['verse', 'of-day'] as const,
    chapter: (book: string, chapter: number) =>
      ['verse', 'chapter', book, chapter] as const,
    search: (query: string) => ['verse', 'search', query] as const,
  },

  // Daily devotional message (conforto / confronto / forca)
  daily: {
    all: () => ['daily'] as const,
    message: () => ['daily', 'message'] as const,
  },

  // Bible books list (effectively static)
  bible: {
    all: () => ['bible'] as const,
    books: () => ['bible', 'books'] as const,
  },

  // User profile — streak + emotional patterns + onboarding answers
  profile: {
    all: () => ['profile'] as const,
    me: () => ['profile', 'me'] as const,
  },

  // Interaction history
  interactions: {
    all: () => ['interactions'] as const,
    history: () => ['interactions', 'history'] as const,
  },

  // Plans catalog + per-user progress
  plans: {
    all: () => ['plans'] as const,
    list: () => ['plans', 'list'] as const,
    progress: (userId: string) => ['plans', 'progress', userId] as const,
  },

  // Local device ID (AsyncStorage, never changes)
  device: {
    id: () => ['device', 'id'] as const,
  },
} as const;
