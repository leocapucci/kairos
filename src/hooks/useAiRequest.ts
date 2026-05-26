import { useCallback, useEffect, useReducer, useRef } from 'react';

import { postInteraction } from '../../services/api';
import { parseUnknownError } from '../utils/errors';

// ─── State machine ────────────────────────────────────────────────────────────

export type AiState =
  | { phase: 'idle' }
  | { phase: 'loading'; attempt: number }
  | { phase: 'success'; text: string }
  | { phase: 'error'; message: string; attempt: number }
  | { phase: 'cancelled'; attempt: number };

type AiAction =
  | { type: 'START'; attempt: number }
  | { type: 'SUCCESS'; text: string }
  | { type: 'ERROR'; message: string }
  | { type: 'CANCEL' }
  | { type: 'RESET' };

const INITIAL: AiState = { phase: 'idle' };

function aiReducer(state: AiState, action: AiAction): AiState {
  switch (action.type) {
    case 'START': {
      // Bloqueado apenas se estiver ativamente em loading
      if (state.phase === 'loading') return state;
      return { phase: 'loading', attempt: action.attempt };
    }
    case 'SUCCESS': {
      if (state.phase !== 'loading') return state;
      return { phase: 'success', text: action.text };
    }
    case 'ERROR': {
      if (state.phase !== 'loading') return state;
      return { phase: 'error', message: action.message, attempt: state.attempt };
    }
    case 'CANCEL': {
      if (state.phase !== 'loading') return state;
      return { phase: 'cancelled', attempt: state.attempt };
    }
    case 'RESET': {
      return INITIAL;
    }
    default:
      return state;
  }
}

// ─── Text extraction ──────────────────────────────────────────────────────────

function extractText(data: { response?: string; message?: string; text?: string }): string | null {
  const text = data.response ?? data.message ?? data.text;
  if (!text) return null;
  return text.replace(/^#{1,6}\s*/gm, '').replace(/\*\*/g, '').trim() || null;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAiRequest() {
  const [state, dispatch] = useReducer(aiReducer, INITIAL);
  const abortRef = useRef<AbortController | null>(null);
  const attemptRef = useRef(0);
  const mountedRef = useRef(true);
  // Armazena os parâmetros da última chamada para re-tentativas
  const lastCall = useRef<{ type: string; message: string } | null>(null);

  // Controla o ciclo de vida de montagem e desmontagem do componente
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, []);

  const send = useCallback(async (type: string, message: string) => {
    // Aborta qualquer requisição HTTP pendente antes de iniciar uma nova
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const attempt = ++attemptRef.current;
    lastCall.current = { type, message };

    if (!mountedRef.current) return;
    dispatch({ type: 'START', attempt });

    try {
      const res = await postInteraction(type, message, ctrl.signal);

      // Guard: ignora retornos de requisições que foram superadas por outras mais novas
      if (attempt !== attemptRef.current) return;

      if (!mountedRef.current) return;

      if (ctrl.signal.aborted) {
        dispatch({ type: 'CANCEL' });
        abortRef.current = null;
        return;
      }

      const extracted = extractText(res.data);
      dispatch({ type: 'SUCCESS', text: extracted ?? 'Não consegui finalizar essa reflexão agora.' });
      abortRef.current = null;
    } catch (err: any) {
      // Guard: ignora rejeições de requisições superadas
      if (attempt !== attemptRef.current) return;

      if (!mountedRef.current) return;

      if (ctrl.signal.aborted || err?.name === 'AbortError') {
        console.warn('[kairos] useAiRequest: cancelled', err);
        dispatch({ type: 'CANCEL' });
        abortRef.current = null;
        return;
      }

      console.warn('[kairos] useAiRequest: error', err);
      dispatch({ type: 'ERROR', message: parseUnknownError(err) });
      abortRef.current = null;
    }
  }, []);

  const retry = useCallback(() => {
    if (state.phase !== 'error' || !lastCall.current) return;
    void send(lastCall.current.type, lastCall.current.message);
  }, [state.phase, send]);

  // Aborta manualmente a chamada pendente se ainda estiver ativa
  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    if (!mountedRef.current) return;
    dispatch({ type: 'RESET' });
  }, []);

  return { state, send, retry, cancel, reset };
}
