// State machine for the interaction screen.
//
// WHY useReducer instead of 9 useState:
//   - Impossible states are structurally eliminated (e.g. `deep loading` without a reply)
//   - Every transition is explicit — no scattered setFoo calls across async handlers
//   - State is serialisable — easy to log and reproduce bugs
//   - Guards live in one place — the reducer rejects invalid actions instead of
//     sprinkling `if (isLoading) return` across handlers

// ─── Deep state (nested inside Revealed) ─────────────────────────────────────

export type DeepState =
  | { phase: 'idle' }
  | { phase: 'loading'; buttonId: string }
  | { phase: 'revealed'; buttonId: string; text: string }
  | { phase: 'error'; buttonId: string; message: string };

// ─── Top-level state ──────────────────────────────────────────────────────────

export type InteractionState =
  | { phase: 'idle' }
  | { phase: 'submitting'; buttonId: string }
  | { phase: 'error'; buttonId: string; message: string }
  | {
      phase: 'revealed';
      buttonId: string;
      replyText: string;
      followUp: '' | 'hoje' | 'depois';
      deep: DeepState;
    };

// ─── Actions ──────────────────────────────────────────────────────────────────

export type InteractionAction =
  | { type: 'REACT'; buttonId: string }
  | { type: 'REACT_SUCCESS'; text: string }
  | { type: 'REACT_ERROR'; message: string }
  | { type: 'RETRY' }
  | { type: 'DEEP'; buttonId: string }
  | { type: 'DEEP_SUCCESS'; text: string }
  | { type: 'DEEP_ERROR'; message: string }
  | { type: 'FOLLOW_UP'; choice: 'hoje' | 'depois' }
  | { type: 'RESET' };

// ─── Reducer ──────────────────────────────────────────────────────────────────

export const INITIAL_STATE: InteractionState = { phase: 'idle' };

export function interactionReducer(
  state: InteractionState,
  action: InteractionAction,
): InteractionState {
  switch (action.type) {
    // ── Reaction (Phase 1) ────────────────────────────────────────────────────

    case 'REACT': {
      // Only allowed from idle or error — prevents double-taps and race conditions
      if (state.phase !== 'idle' && state.phase !== 'error') return state;
      return { phase: 'submitting', buttonId: action.buttonId };
    }

    case 'REACT_SUCCESS': {
      if (state.phase !== 'submitting') return state;
      return {
        phase: 'revealed',
        buttonId: state.buttonId,
        replyText: action.text,
        followUp: '',
        deep: { phase: 'idle' },
      };
    }

    case 'REACT_ERROR': {
      if (state.phase !== 'submitting') return state;
      return { phase: 'error', buttonId: state.buttonId, message: action.message };
    }

    case 'RETRY': {
      // Return to idle regardless of current state — user explicitly asked to retry
      return { phase: 'idle' };
    }

    // ── Deep follow-up (Phase 2, only inside Revealed) ────────────────────────

    case 'DEEP': {
      // Only allowed when revealed and deep is not already loading
      if (state.phase !== 'revealed') return state;
      if (state.deep.phase === 'loading') return state;
      return { ...state, deep: { phase: 'loading', buttonId: action.buttonId } };
    }

    case 'DEEP_SUCCESS': {
      if (state.phase !== 'revealed') return state;
      if (state.deep.phase !== 'loading') return state;
      return {
        ...state,
        deep: { phase: 'revealed', buttonId: state.deep.buttonId, text: action.text },
      };
    }

    case 'DEEP_ERROR': {
      if (state.phase !== 'revealed') return state;
      if (state.deep.phase !== 'loading') return state;
      return {
        ...state,
        deep: { phase: 'error', buttonId: state.deep.buttonId, message: action.message },
      };
    }

    // ── Follow-up commitment ──────────────────────────────────────────────────

    case 'FOLLOW_UP': {
      if (state.phase !== 'revealed') return state;
      return { ...state, followUp: action.choice };
    }

    // ── Reset to initial state ────────────────────────────────────────────────

    case 'RESET': {
      return INITIAL_STATE;
    }

    default:
      return state;
  }
}

// ─── Derived helpers ─────────────────────────────────────────────────────────

export function isIdle(s: InteractionState): s is { phase: 'idle' } {
  return s.phase === 'idle';
}

export function isSubmitting(s: InteractionState): s is { phase: 'submitting'; buttonId: string } {
  return s.phase === 'submitting';
}

export function isRevealed(
  s: InteractionState,
): s is Extract<InteractionState, { phase: 'revealed' }> {
  return s.phase === 'revealed';
}

export function isError(
  s: InteractionState,
): s is { phase: 'error'; buttonId: string; message: string } {
  return s.phase === 'error';
}
