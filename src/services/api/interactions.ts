import { BASE_URL, post, request } from './http';
import { getDistinctId } from '../../analytics';

export type InteractionResponse = {
  interaction_id?: string;
  id?: string;
  response?: string;
  message?: string;
  text?: string;
};

export type HistoryItem = {
  id: string;
  message?: string;
  text?: string;
  created_at?: string;
  createdAt?: string;
};

export type DeepResponse = {
  response?: string;
  message?: string;
  text?: string;
};

// Throws on API/network/timeout errors — callers are responsible for catch.
// Abort signals are respected: an aborted request rejects with Error('aborted');
// callers should check signal.aborted before dispatching error state.

export const postInteraction = async (
  type: string,
  message: string,
  signal?: AbortSignal,
  context?: string,
): Promise<{ data: InteractionResponse }> => {
  const userId = getDistinctId();
  const body: Record<string, string> = { type, message };
  if (userId) body.userId = userId;
  if (context) body.context = context;
  const res = await post<InteractionResponse>(`${BASE_URL}/interaction`, body, signal);
  return { data: res ?? {} };
};

export const getInteractionsHistory = async (): Promise<{ data: HistoryItem[] }> => {
  const res = await request<HistoryItem[] | { interactions?: HistoryItem[]; history?: HistoryItem[] }>(
    `${BASE_URL}/interactions/history`,
  );
  const list = Array.isArray(res)
    ? res
    : (
        (res as Record<string, unknown>)?.interactions ??
        (res as Record<string, unknown>)?.history ??
        []
      ) as HistoryItem[];
  return { data: list };
};

export const postDeep = async (
  interactionId: string,
  userChoice: string,
  signal?: AbortSignal,
): Promise<{ data: DeepResponse }> => {
  const res = await post<DeepResponse>(
    `${BASE_URL}/interaction/deep`,
    { interaction_id: interactionId, user_choice: userChoice },
    signal,
  );
  return { data: res ?? {} };
};
