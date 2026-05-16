import AsyncStorage from '@react-native-async-storage/async-storage';

import { E, type EventName } from './events';
import { notifyMoment } from './moment';
import { enqueue, flush as queueFlush } from './queue';
import { recordForReplay } from './replay';
import { getSessionId } from './session';

const DISTINCT_ID_KEY = 'analytics_distinct_id_v1';
let _distinctId = 'anon';

// ─── Public API ───────────────────────────────────────────────────────────────

export function track(event: EventName, props?: Record<string, unknown>): void {
  const sid = getSessionId();
  enqueue({ event, props: props ?? {}, ts: Date.now(), sessionId: sid, distinctId: _distinctId });
  notifyMoment(event, props, _distinctId);
  recordForReplay(event, sid, _distinctId);
}

export function identify(id: string, traits?: Record<string, unknown>): void {
  _distinctId = id;
  enqueue({
    event: '$identify',
    props: { $set: traits ?? {} },
    ts: Date.now(),
    sessionId: getSessionId(),
    distinctId: id,
  });
}

export function trackError(
  screen: string,
  error: unknown,
  context?: Record<string, unknown>,
): void {
  track(E.ERROR_OCCURRED, {
    screen,
    error: error instanceof Error ? error.message : String(error),
    ...context,
  });
}

export function trackPerf(label: string, ms: number, context?: Record<string, unknown>): void {
  track(E.PERF_MARK, { label, ms, ...context });
}

export function getDistinctId(): string {
  return _distinctId;
}

export { queueFlush as flush };

// ─── Internal ─────────────────────────────────────────────────────────────────

export async function resolveDistinctId(): Promise<string> {
  try {
    let id = await AsyncStorage.getItem(DISTINCT_ID_KEY);
    if (!id) {
      id = `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
      await AsyncStorage.setItem(DISTINCT_ID_KEY, id);
    }
    _distinctId = id;
    return id;
  } catch {
    return 'anon';
  }
}
