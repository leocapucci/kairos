// Lightweight performance instrumentation for __DEV__ only.
// All exports are no-ops in production — zero runtime cost.

const SLOW_MS = 1_500;  // warn threshold
const OK_MS = 400;      // fast threshold

export function startTimer(label: string): () => void {
  if (!__DEV__) return () => {};
  const t0 = Date.now();
  return (suffix?: string) => {
    const ms = Date.now() - t0;
    const tag = ms < OK_MS ? '⚡' : ms < SLOW_MS ? '⏱' : '🐢';
    console.log(`[perf] ${tag} ${label}${suffix ? ` ${suffix}` : ''}: ${ms}ms`);
  };
}

export function logCacheEvent(
  label: string,
  event: 'hit' | 'miss' | 'stale' | 'retry',
): void {
  if (!__DEV__) return;
  const tag = { hit: '✅', miss: '🔄', stale: '⏳', retry: '🔁' }[event];
  console.log(`[cache] ${tag} ${label}: ${event}`);
}

// Wrap a queryFn to automatically log timing and cache events.
// Usage: queryFn: withPerfLog('verse-of-day', () => request(...))
export function withPerfLog<T>(
  label: string,
  fn: () => Promise<T>,
): () => Promise<T> {
  if (!__DEV__) return fn;
  return async () => {
    const done = startTimer(label);
    try {
      const result = await fn();
      done();
      return result;
    } catch (err) {
      done('(failed)');
      throw err;
    }
  };
}
