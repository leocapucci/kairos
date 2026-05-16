import { AppState, type AppStateStatus } from 'react-native';

import type { EventName } from './events';
import { flushReplay } from './replay';

const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

let _sessionId = '';
let _sessionStartTs = 0;
let _lastBackgroundTs = 0;

type TrackFn = (event: EventName, props?: Record<string, unknown>) => void;

export function initSession(track: TrackFn): string {
  _sessionId = _id();
  _sessionStartTs = Date.now();

  track('session_start', { session_id: _sessionId });

  AppState.addEventListener('change', (next: AppStateStatus) => {
    if (next === 'background' || next === 'inactive') {
      _lastBackgroundTs = Date.now();
      track('app_backgrounded', {
        session_id: _sessionId,
        duration_s: Math.floor((Date.now() - _sessionStartTs) / 1000),
      });
      // Flush logical replay so this session's journey is persisted even if
      // the user doesn't return before the process is killed by the OS.
      flushReplay();
    } else if (next === 'active') {
      const gap = _lastBackgroundTs ? Date.now() - _lastBackgroundTs : 0;
      if (gap > SESSION_TIMEOUT_MS) {
        _sessionId = _id();
        _sessionStartTs = Date.now();
        track('session_start', { session_id: _sessionId, resumed: true });
      } else {
        track('app_foregrounded', { session_id: _sessionId, gap_ms: gap });
      }
    }
  });

  return _sessionId;
}

export function getSessionId(): string {
  return _sessionId;
}

function _id(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
