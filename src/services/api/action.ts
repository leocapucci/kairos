import { BASE_URL, post } from './http';
import { getUserId } from '../../auth/authService';

export const saveVerseAction = async (
  _userId: string, // kept for call-site compatibility — value is ignored, auth userId is used
  verse: string,
  interactionType: string,
  action: string,
) => {
  return post(`${BASE_URL}/action`, {
    user_id: getUserId(),
    verse,
    interaction_type: interactionType,
    action,
  });
};
