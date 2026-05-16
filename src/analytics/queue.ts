import AsyncStorage from '@react-native-async-storage/async-storage';

import type { EventName } from './events';

const STORAGE_KEY = 'analytics_queue_v1';
const MAX_QUEUE_SIZE = 200;
const FLUSH_INTERVAL_MS = 5_000;
const MAX_BATCH_SIZE = 20;
const MAX_RETRIES = 3;

export interface QueuedEvent {
  event: EventName | '$identify';
  props: Record<string, unknown>;
  ts: number;
  sessionId: string;
  distinctId: string;
}

type FlushFn = (batch: QueuedEvent[]) => Promise<void>;

let _queue: QueuedEvent[] = [];
let _flushFn: FlushFn | null = null;
let _timer: ReturnType<typeof setInterval> | null = null;
let _retries = 0;
let _flushing = false;

export function initQueue(fn: FlushFn): void {
  _flushFn = fn;
  _loadFromStorage();
  _timer = setInterval(_flush, FLUSH_INTERVAL_MS);
}

export function enqueue(event: QueuedEvent): void {
  if (_queue.length >= MAX_QUEUE_SIZE) _queue.shift(); // drop oldest on overflow
  _queue.push(event);
  _persistAsync();
}

export async function flush(): Promise<void> {
  await _flush();
}

export function stopQueue(): void {
  if (_timer) clearInterval(_timer);
  _timer = null;
}

async function _flush(): Promise<void> {
  if (_flushing || !_flushFn || _queue.length === 0) return;
  _flushing = true;

  const batch = _queue.splice(0, MAX_BATCH_SIZE);
  try {
    await _flushFn(batch);
    _retries = 0;
    _persistAsync();
  } catch {
    // Restore events at front of queue
    _queue.unshift(...batch);
    _retries += 1;
    if (_retries >= MAX_RETRIES) {
      // Drop this batch after repeated failures (malformed events, permanent error)
      _queue.splice(0, batch.length);
      _retries = 0;
    }
  } finally {
    _flushing = false;
  }
}

function _persistAsync(): void {
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(_queue)).catch(() => {});
}

async function _loadFromStorage(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as QueuedEvent[];
      _queue = [...saved, ..._queue].slice(-MAX_QUEUE_SIZE);
    }
  } catch {
    // Corrupt storage — start fresh
  }
}
