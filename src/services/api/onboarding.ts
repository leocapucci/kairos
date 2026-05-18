import { BASE_URL, post } from './http';
import { getUserId } from '../../auth/authService';
import { logger } from '../../utils/logger';

export type OnboardingAnswer = { question_key: string; answer: string };

export const postOnboardingAnswers = async (answers: OnboardingAnswer[]): Promise<void> => {
  const user_id = getUserId();
  const answersObj = Object.fromEntries(answers.map(({ question_key, answer }) => [question_key, answer]));
  try {
    await post(`${BASE_URL}/onboarding`, { user_id, answers: answersObj });
  } catch (err) {
    logger.error('postOnboardingAnswers failed', err);
    // swallow — onboarding failure must not block navigation to home
  }
};
