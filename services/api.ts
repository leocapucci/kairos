import { getDailyVerse } from '../src/services/api/bible';
import { postOnboardingAnswers } from '../src/services/api/onboarding';

export { shareKairos } from '../src/services/api/share';

// name mappings: old → new
export const getDaily = getDailyVerse;
export const postOnboarding = (payload: { question_key: string; answer: string }[]) =>
  postOnboardingAnswers(payload);

// stubs — safe no-ops until src/services/api/* implements them
export const getPlans = async () => null;
export const searchBible = async (_q: string) => ({ results: [] });
export const postInteraction = async (
  _type: string,
  _message: string
) => null;
export const getPlanProgress = async (_userId: string) => null;
export const startPlan = async (_userId: string, _planId: string) => null;
export const getInteractionsHistory = async () => ({ history: [] });
export const getProfile = async (_userId?: string) => null;
export const postDeep = async (
  _interactionId: string,
  _userChoice: string
) => null;
