import { BASE_URL, post } from './http';

export async function registerPushToken(
  token: string,
  userId: string,
  platform: string,
): Promise<void> {
  await post<{ ok: boolean }>(`${BASE_URL}/push/register`, { token, userId, platform });
}
