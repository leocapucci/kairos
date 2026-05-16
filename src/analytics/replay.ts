// Logical session replay — ordered event log per session.
//
// Reconstructs user journey without video: each entry is event name + elapsed ms.
// Flushed as a single 'session_replay' event when the app backgrounds.
// Max 50 entries per session (~1.5KB payload).
//
// Only navigation + action events are recorded — perf marks and errors
// are excluded to keep the log readable.

import { enqueue } from './queue';

interface ReplayEntry {
  e: string;  // event name
  t: number;  // ms elapsed since session start
}

// Events worth including in the replay log
const REPLAY_SET = new Set([
  'session_start', 'app_backgrounded', 'app_foregrounded',
  'screen_viewed',
  'onboarding_started', 'onboarding_step_completed', 'onboarding_completed',
  'onboarding_skipped', 'onboarding_failed',
  'home_loaded',
  'verse_viewed', 'verse_saved', 'verse_shared',
  'interaction_started', 'interaction_completed', 'interaction_failed',
  'interaction_aborted', 'interaction_shared',
  'deep_reflection_started', 'deep_reflection_completed', 'deep_reflection_failed',
  'follow_up_chosen',
  'plan_started', 'plan_day_completed',
  'share_triggered', 'share_completed',
  'kairos_moment',
  'error_occurred', 'api_error',
]);

const MAX_ENTRIES = 50;

let _log: ReplayEntry[] = [];
let _sessionId = '';
let _sessionStartTs = 0;
let _lastDistinctId = 'anon';

export function recordForReplay(event: string, sessionId: string, distinctId: string): void {
  if (!REPLAY_SET.has(event)) return;
  _lastDistinctId = distinctId;

  if (sessionId !== _sessionId) {
    _log = [];
    _sessionId = sessionId;
    _sessionStartTs = Date.now();
  }

  if (_log.length >= MAX_ENTRIES) return;
  _log.push({ e: event, t: Date.now() - _sessionStartTs });
}

// Called when session backgrounds — sends the full log as one event.
export function flushReplay(): void {
  if (_log.length === 0 || !_sessionId) return;

  const snapshot = _log.slice();
  enqueue({
    event: 'session_replay',
    props: { session_id: _sessionId, events: snapshot, count: snapshot.length },
    ts: Date.now(),
    sessionId: _sessionId,
    distinctId: _lastDistinctId,
  });

  _log = []; // clear after flush
}
