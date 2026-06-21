import { useCallback, useEffect, useRef, useState } from 'react';

import { BASE_URL, request } from '../services/api/http';
import { parseUnknownError } from '../utils/errors';

// ─── Tipos ──────────────────────────────────────────────────────────────────
// Formato tolerante: campos opcionais e listas que podem vir como string ou
// array, evitando quebra caso o backend ainda não tenha gerado parte do estudo.

export type StudyContext = {
  author?: string;
  date?: string;
  recipients?: string;
  historical_scenario?: string;
  chapter_situation?: string;
};

export type StudyExplanation = {
  main_meaning?: string;
  gods_teaching?: string[] | string;
  central_message?: string;
};

export type StudyApplication = {
  how_to_apply?: string;
  reflection_questions?: string[] | string;
  practical_challenges?: string[] | string;
};

export type StudyContent = {
  context_json?: StudyContext | null;
  explanation_json?: StudyExplanation | null;
  application_json?: StudyApplication | null;
  prayer_text?: string | null;
  // Backend pode sinalizar que o estudo ainda está sendo gerado.
  status?: string | null;
};

export type UseStudyContentResult = {
  loading: boolean;
  error: string | null;
  data: StudyContent | null;
  refetch: () => void;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
// GET /bible/study/:book/:chapter/:verse
// Não gera chamadas duplicadas: cada mudança de parâmetro aborta a anterior e
// um contador de requisição descarta respostas obsoletas.
export function useStudyContent(
  book: string,
  chapter: string | number,
  verse: string | number,
): UseStudyContentResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<StudyContent | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  const reqIdRef = useRef(0);

  const enabled = Boolean(book) && chapter !== '' && verse !== '';

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, []);

  const fetchStudy = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      setError(null);
      setData(null);
      return;
    }

    // Aborta qualquer requisição pendente antes de iniciar outra.
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const reqId = ++reqIdRef.current;

    setLoading(true);
    setError(null);

    const url =
      `${BASE_URL}/bible/study/` +
      `${encodeURIComponent(String(book))}/` +
      `${encodeURIComponent(String(chapter))}/` +
      `${encodeURIComponent(String(verse))}`;

    try {
      const res = await request<StudyContent>(url, ctrl.signal);
      // Descarta respostas superadas ou após desmontagem.
      if (reqId !== reqIdRef.current || !mountedRef.current) return;
      setData(res ?? null);
      setLoading(false);
    } catch (err) {
      if (reqId !== reqIdRef.current || !mountedRef.current) return;
      if (ctrl.signal.aborted) return; // cancelamento silencioso
      setError(parseUnknownError(err));
      setData(null);
      setLoading(false);
    }
  }, [book, chapter, verse, enabled]);

  useEffect(() => {
    void fetchStudy();
  }, [fetchStudy]);

  const refetch = useCallback(() => {
    void fetchStudy();
  }, [fetchStudy]);

  return { loading, error, data, refetch };
}
