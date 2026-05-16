// Compatibility barrel — all screens import from here.
// Real implementations live in src/services/api/*.

export { shareKairos } from '../src/services/api/share';

export { getDailyVerse as getDaily } from '../src/services/api/bible';
export { getVerseOfDay } from '../src/services/api/bible';
export { searchBible } from '../src/services/api/bible';

export { saveVerseAction } from '../src/services/api/action';

export { postOnboardingAnswers as postOnboarding } from '../src/services/api/onboarding';

export {
  getPlans,
  getPlanProgress,
  startPlan,
  completePlanDay,
} from '../src/services/api/plans';

export {
  postInteraction,
  getInteractionsHistory,
  postDeep,
} from '../src/services/api/interactions';

export { getProfile } from '../src/services/api/profile';
