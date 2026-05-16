// Central event taxonomy — every event fired in the app lives here.
// Never use string literals in screens: import { E } from '../../analytics'.
export const E = {
  // Session lifecycle
  SESSION_START:      'session_start',
  SESSION_END:        'session_end',
  APP_BACKGROUNDED:   'app_backgrounded',
  APP_FOREGROUNDED:   'app_foregrounded',

  // Navigation
  SCREEN_VIEWED: 'screen_viewed',

  // Onboarding
  ONBOARDING_STARTED:          'onboarding_started',
  ONBOARDING_STEP_COMPLETED:   'onboarding_step_completed',
  ONBOARDING_COMPLETED:        'onboarding_completed',
  ONBOARDING_SKIPPED:          'onboarding_skipped',
  ONBOARDING_FAILED:           'onboarding_failed',

  // Home
  HOME_LOADED: 'home_loaded',

  // Verse
  VERSE_VIEWED: 'verse_viewed',
  VERSE_SAVED:  'verse_saved',
  VERSE_SHARED: 'verse_shared',

  // Interaction (card reaction)
  INTERACTION_STARTED:   'interaction_started',
  INTERACTION_COMPLETED: 'interaction_completed',
  INTERACTION_FAILED:    'interaction_failed',
  INTERACTION_ABORTED:   'interaction_aborted',
  INTERACTION_SHARED:    'interaction_shared',

  // Deep reflection
  DEEP_REFLECTION_STARTED:   'deep_reflection_started',
  DEEP_REFLECTION_COMPLETED: 'deep_reflection_completed',
  DEEP_REFLECTION_FAILED:    'deep_reflection_failed',

  // Follow-up commitment
  FOLLOW_UP_CHOSEN: 'follow_up_chosen',

  // Plans
  PLAN_STARTED:                'plan_started',
  PLAN_DAY_REFLECTION_STARTED: 'plan_day_reflection_started',
  PLAN_DAY_COMPLETED:          'plan_day_completed',

  // Share (native share sheet)
  SHARE_TRIGGERED:  'share_triggered',
  SHARE_COMPLETED:  'share_completed',
  SHARE_DISMISSED:  'share_dismissed',

  // Profile
  PROFILE_OPENED: 'profile_opened',

  // Errors
  ERROR_OCCURRED: 'error_occurred',
  API_TIMEOUT:    'api_timeout',
  API_ERROR:      'api_error',
  RENDER_ERROR:   'render_error',

  // Performance (perceived latency marks)
  PERF_MARK: 'perf_mark',

  // Derived — fired internally, never by screens directly
  KAIROS_MOMENT:  'kairos_moment',
  SESSION_REPLAY: 'session_replay',
  SILENT_SESSION: 'silent_session',
} as const;

export type EventName = (typeof E)[keyof typeof E];
