import { consoleProvider } from './providers/console';
import { makePostHogProvider } from './providers/posthog';
import { initQueue } from './queue';
import { initSession } from './session';
import { resolveDistinctId, track } from './track';

export { E } from './events';
export type { EventName } from './events';
export { track, identify, trackError, trackPerf, flush, getDistinctId } from './track';
export { getSessionId } from './session';

interface AnalyticsConfig {
  posthogApiKey?: string;
}

export async function initAnalytics(config: AnalyticsConfig = {}): Promise<void> {
  const isDev = typeof __DEV__ !== 'undefined' && __DEV__;

  type Flusher = (batch: Parameters<typeof consoleProvider>[0]) => Promise<void>;
  const providers: Flusher[] = [];

  if (config.posthogApiKey) providers.push(makePostHogProvider(config.posthogApiKey));
  if (isDev || providers.length === 0) providers.push(consoleProvider);

  initQueue(async (batch) => {
    await Promise.allSettled(providers.map((p) => p(batch)));
  });

  await resolveDistinctId();
  initSession(track);
}
