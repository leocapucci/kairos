import { BASE_URL, post } from './http';
import { logger } from '../../utils/logger';

export type OnboardingAnswer = { question_key: string; answer: string };

export const postOnboardingAnswers = async (answers: OnboardingAnswer[]): Promise<void> => {
  try {
    await post(`${BASE_URL}/onboarding`, { answers });
  } catch (err) {
    logger.error('postOnboardingAnswers failed', err);
    // swallow — onboarding failure must not block navigation to home
  }
};
