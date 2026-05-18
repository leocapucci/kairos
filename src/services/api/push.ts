import { BASE_URL, post } from './http';
import { getUserId } from '../../auth/authService';

export async function registerPushToken(
  token: string,
  _userId: string, // kept for call-site compatibility — value is ignored, auth userId is used
  platform: string,
): Promise<void> {
  await post<{ ok: boolean }>(`${BASE_URL}/push/register`, {
    token,
    user_id: getUserId(),
    platform,
  });
}
