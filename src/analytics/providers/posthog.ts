import type { QueuedEvent } from '../queue';

const POSTHOG_HOST = 'https://us.i.posthog.com';

// Returns a flush function bound to the given API key.
// Call makePostHogProvider(key) once at init time and pass the result to initQueue().
export function makePostHogProvider(apiKey: string) {
  return async function posthogFlush(batch: QueuedEvent[]): Promise<void> {
    const body = JSON.stringify({
      api_key: apiKey,
      batch: batch.map(({ event, props, ts, distinctId, sessionId }) => ({
        event,
        distinct_id: distinctId,
        timestamp: new Date(ts).toISOString(),
        properties: {
          ...props,
          $session_id: sessionId,
          $lib: 'kairos-rn',
          $lib_version: '1.0.0',
        },
      })),
    });

    const res = await fetch(`${POSTHOG_HOST}/batch/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    if (!res.ok) {
      throw new Error(`PostHog batch HTTP ${res.status}`);
    }
  };
}
