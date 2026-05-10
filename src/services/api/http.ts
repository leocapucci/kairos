import { logger } from '../../utils/logger';

export const BASE_URL = 'https://kairos-backend-vjdp.onrender.com';
const TIMEOUT_MS = 10_000;

function withTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  return fetch(url, { ...options, signal: ctrl.signal }).finally(() => clearTimeout(timer));
}

export async function request<T = unknown>(url: string): Promise<T> {
  const res = await withTimeout(url);
  if (!res.ok) throw new Error(`API ${res.status} — ${url}`);
  return res.json() as Promise<T>;
}

export async function post<T = unknown>(url: string, body: unknown): Promise<T> {
  const res = await withTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let detail = '';
    try { const j = await res.json(); detail = j?.error ?? j?.details ?? ''; } catch {}
    throw new Error(detail || `API ${res.status} — ${url}`);
  }
  return res.json() as Promise<T>;
}
