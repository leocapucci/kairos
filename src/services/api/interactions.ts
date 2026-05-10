import { BASE_URL, post, request } from './http';
import { logger } from '../../utils/logger';

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

// NOTE: endpoint paths are best guesses — verify /interaction, /interactions/history,
//       /interaction/deep against actual backend routes

export const postInteraction = async (
  type: string,
  message: string
): Promise<{ data: InteractionResponse }> => {
  try {
    const res = await post<InteractionResponse>(`${BASE_URL}/interaction`, { type, message });
    return { data: res ?? {} };
  } catch (err) {
    logger.error('postInteraction failed', err);
    return { data: {} };
  }
};

export const getInteractionsHistory = async (): Promise<{ data: HistoryItem[] }> => {
  try {
    const res = await request<HistoryItem[] | { interactions?: HistoryItem[]; history?: HistoryItem[] }>(
      `${BASE_URL}/interactions/history`
    );
    const list = Array.isArray(res)
      ? res
      : ((res as any)?.interactions ?? (res as any)?.history ?? []);
    return { data: list };
  } catch (err) {
    logger.error('getInteractionsHistory failed', err);
    return { data: [] };
  }
};

export const postDeep = async (
  interactionId: string,
  userChoice: string
): Promise<{ data: DeepResponse }> => {
  try {
    const res = await post<DeepResponse>(`${BASE_URL}/interaction/deep`, {
      interaction_id: interactionId,
      user_choice: userChoice,
    });
    return { data: res ?? {} };
  } catch (err) {
    logger.error('postDeep failed', err);
    return { data: {} };
  }
};
