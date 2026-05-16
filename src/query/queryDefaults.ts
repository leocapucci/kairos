// Cache policy presets — one per data domain, rationale documented.
// Screens import the preset and spread it into useQuery options.
// This is the single source of truth for staleTime, gcTime, and refetch behavior.

const MS = {
  min: 60_000,
  h: 3_600_000,
  day: 86_400_000,
  week: 604_800_000,
} as const;

// Verse of day + daily message
// Rationale: content is generated once per day at midnight. Users should see
// the same content throughout their session regardless of reconnects.
export const dailyContentPolicy = {
  staleTime: MS.day,
  gcTime: MS.day + MS.h,   // survive a bit past midnight so midnight-users don't re-fetch
  refetchOnMount: false,
  refetchOnReconnect: false,
  refetchOnWindowFocus: false,
  retry: 0,                 // http.ts already retries 2× with backoff — no double retry
} as const;

// Bible books list
// Rationale: 66 books, the biblical canon does not change. Cache for a week.
export const staticDataPolicy = {
  staleTime: MS.week,
  gcTime: MS.week * 2,
  refetchOnMount: false,
  refetchOnReconnect: false,
  refetchOnWindowFocus: false,
  retry: 0,
} as const;

// Bible chapter text
// Rationale: content is static but could be corrected server-side.
// 1h stale allows corrections to propagate within the same session.
export const bibleChapterPolicy = {
  staleTime: MS.h,
  gcTime: MS.h * 2,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  retry: 0,
} as const;

// Bible search results
// Rationale: query-specific; user may refine the same search.
// 5min stale gives a responsive feel without hammering the API on each keystroke.
export const searchPolicy = {
  staleTime: 5 * MS.min,
  gcTime: 10 * MS.min,
  refetchOnWindowFocus: false,
  retry: 0,
} as const;

// User profile (streak + patterns)
// Rationale: streak updates daily, patterns update per interaction.
// 5min stale: fresh enough for a session, not so aggressive it spams requests.
// throwOnError: false — degrade gracefully with cached/empty data instead of crash.
export const profilePolicy = {
  staleTime: 5 * MS.min,
  gcTime: 30 * MS.min,
  throwOnError: false,
  refetchOnWindowFocus: false,
  retry: 0,
} as const;

// Plans catalog (managed content)
// Rationale: admins add/update plans rarely. 30min stale is fine.
// refetchOnMount: false — once per session is sufficient.
export const plansCatalogPolicy = {
  staleTime: 30 * MS.min,
  gcTime: MS.h,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  retry: 0,
} as const;

// Plan progress (current day + active plan)
// Rationale: changes when user completes a day. 2min is tight enough to reflect
// real completions, loose enough to avoid spamming on every mount.
export const plansProgressPolicy = {
  staleTime: 2 * MS.min,
  gcTime: 5 * MS.min,
  refetchOnWindowFocus: false,
  retry: 0,
} as const;

// Interaction history
// Rationale: grows on every interaction. 1min stale gives near-real-time feel.
export const interactionsPolicy = {
  staleTime: MS.min,
  gcTime: 5 * MS.min,
  refetchOnWindowFocus: false,
  retry: 0,
} as const;
