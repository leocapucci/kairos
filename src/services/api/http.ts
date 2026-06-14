import { logger } from '../../utils/logger';

export const BASE_URL = 'https://kairos-backend-vjdp.onrender.com';

const TIMEOUT_MS = 35_000;
const MAX_RETRIES = 2;
const RETRY_BASE_MS = 800;

// ─── Typed errors ─────────────────────────────────────────────────────────────

export class ApiError extends Error {
  readonly name = 'ApiError';
  constructor(
    public readonly status: number,
    public readonly url: string,
    public readonly detail: string,
  ) {
    super(`API ${status} — ${url}`);
  }
}

export class NetworkError extends Error {
  readonly name = 'NetworkError';
  constructor(public readonly url: string, cause?: unknown) {
    super(`Network error — ${url}`);
    if (cause) (this as any).cause = cause;
  }
}

export class TimeoutError extends Error {
  readonly name = 'TimeoutError';
  constructor(public readonly url: string) {
    super(`Request timeout — ${url}`);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isRetryable(err: unknown): boolean {
  if (err instanceof TimeoutError) return true;
  if (err instanceof NetworkError) return true;
  if (err instanceof ApiError) return err.status >= 500;
  return false;
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) { reject(new Error('aborted')); return; }
    const t = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => { clearTimeout(t); reject(new Error('aborted')); }, { once: true });
  });
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  callerSignal?: AbortSignal,
): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  callerSignal?.addEventListener('abort', () => ctrl.abort(), { once: true });

  try {
    return await fetch(url, { ...options, signal: ctrl.signal });
  } catch (err) {
    // Distinguish our timeout from an external cancel
    if (ctrl.signal.aborted && !callerSignal?.aborted) {
      throw new TimeoutError(url);
    }
    throw new NetworkError(url, err);
  } finally {
    clearTimeout(timer);
  }
}

async function withRetry<T>(fn: () => Promise<T>, signal?: AbortSignal): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const shouldRetry = isRetryable(err) && !signal?.aborted && attempt < MAX_RETRIES;
      if (!shouldRetry) break;
      const delay = RETRY_BASE_MS * Math.pow(2, attempt);
      logger.warn(`Retry ${attempt + 1}/${MAX_RETRIES} in ${delay}ms`, {
        error: err instanceof Error ? err.message : String(err),
      });
      await sleep(delay, signal);
    }
  }
  throw lastError;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function request<T = unknown>(url: string, signal?: AbortSignal): Promise<T> {
  return withRetry(async () => {
    const res = await fetchWithTimeout(url, {}, signal);
    if (!res.ok) {
      let body = '';
      try { body = await res.text(); } catch { /* ignore */ }
      logger.error(`GET ${res.status}`, { url, body: body.slice(0, 200) });
      throw new ApiError(res.status, url, body.slice(0, 200));
    }
    return res.json() as Promise<T>;
  }, signal);
}

export async function post<T = unknown>(
  url: string,
  body: unknown,
  signal?: AbortSignal,
): Promise<T> {
  return withRetry(async () => {
    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }, signal);
    if (!res.ok) {
      let detail = '';
      try {
        const text = await res.text();
        const j = JSON.parse(text);
        detail = j?.error ?? j?.details ?? j?.message ?? text.slice(0, 200);
      } catch { /* ignore */ }
      logger.error(`POST ${res.status}`, { url, detail });
      throw new ApiError(res.status, url, detail || `HTTP ${res.status}`);
    }
    return res.json() as Promise<T>;
  }, signal);
}
