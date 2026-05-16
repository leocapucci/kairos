import { BASE_URL, post } from './http';

export const saveVerseAction = async (
  userId: string,
  verse: string,
  interactionType: string,
  action: string
) => {
  return post(`${BASE_URL}/action`, {
    userId,
    verse,
    interaction_type: interactionType,
    action,
  });
};
