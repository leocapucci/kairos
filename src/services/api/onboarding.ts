import { BASE_URL, post } from './http';
import { getDistinctId } from '../../analytics';
import { logger } from '../../utils/logger';

export type OnboardingAnswer = { question_key: string; answer: string };

export const postOnboardingAnswers = async (answers: OnboardingAnswer[]): Promise<void> => {
  const userId = getDistinctId();
  const answersObj = Object.fromEntries(answers.map(({ question_key, answer }) => [question_key, answer]));
  try {
    await post(`${BASE_URL}/onboarding`, { userId, answers: answersObj });
  } catch (err) {
    logger.error('postOnboardingAnswers failed', err);
    // swallow — onboarding failure must not block navigation to home
  }
};
