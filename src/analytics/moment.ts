// Kairos Moment Score — session-scoped accumulator.
//
// Fires 'kairos_moment' once per session when enough high-value actions
// happen together, signaling that the product delivered real impact.
//
// Score weights are intentionally conservative:
//   - completion alone (1pt) is NOT a moment
//   - deep + completion (3pt) IS a moment
//   - commitment "hoje" (5pt) is a strong moment on its own
//
// Called from track() for every event — cost is O(1) per call.

import { enqueue } from './queue';
import { getSessionId } from './session';

const WEIGHTS: Partial<Record<string, number>> = {
  interaction_completed:    1,
  deep_reflection_completed: 2,
  verse_saved:              1,
  share_triggered:          1,
  share_completed:          1,
  // follow_up_chosen is dynamic (see below)
};

const MOMENT_THRESHOLD = 3;

let _sessionId = '';
let _score = 0;
let _fired = false;
let _lastDistinctId = 'anon';

export function notifyMoment(
  event: string,
  props: Record<string, unknown> | undefined,
  distinctId: string,
): void {
  const sid = getSessionId();
  _lastDistinctId = distinctId;

  if (sid !== _sessionId) {
    _score = 0;
    _fired = false;
    _sessionId = sid;
  }

  let w = WEIGHTS[event] ?? 0;
  if (event === 'follow_up_chosen') {
    w = props?.choice === 'hoje' ? 3 : 1;
  }
  if (w === 0) return;

  _score += w;

  if (!_fired && _score >= MOMENT_THRESHOLD) {
    _fired = true;
    enqueue({
      event: 'kairos_moment',
      props: { score: _score, trigger_event: event },
      ts: Date.now(),
      sessionId: sid,
      distinctId,
    });
  }
}
