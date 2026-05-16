/**
 * Sentry error monitoring.
 *
 * Setup:
 *   1. Create a project at https://sentry.io → React Native
 *   2. Copy the DSN from Project Settings → Client Keys
 *   3. Add EXPO_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx to your .env
 *   4. For native crash reporting (recommended), run: npx expo prebuild
 *      — or use EAS Build which runs prebuild automatically
 *
 * Without DSN set, all calls are no-ops (safe for local dev without Sentry account).
 */

import * as SentryNative from '@sentry/react-native';
import Constants from 'expo-constants';

const DSN = (Constants.expoConfig?.extra?.sentryDsn as string | undefined)
  ?? process.env.EXPO_PUBLIC_SENTRY_DSN;

let initialised = false;

export function initSentry(): void {
  if (!DSN || initialised) return;
  SentryNative.init({
    dsn: DSN,
    environment: __DEV__ ? 'development' : 'production',
    release: Constants.expoConfig?.version ?? '1.0.0',
    // Reduce noise: only send 20% of performance transactions in prod
    tracesSampleRate: __DEV__ ? 1.0 : 0.2,
    // Capture unhandled promise rejections automatically
    enableNativeNagger: false,
    integrations: [
      SentryNative.reactNavigationIntegration(),
    ],
  });
  initialised = true;
}

/**
 * Capture an exception with optional context. Safe to call before init.
 */
export function captureException(err: unknown, context?: Record<string, unknown>): void {
  if (!initialised) {
    console.error('[sentry:not-init]', err, context);
    return;
  }
  SentryNative.withScope((scope) => {
    if (context) scope.setContext('context', context);
    SentryNative.captureException(err);
  });
}

/**
 * Add a breadcrumb visible in Sentry's event timeline.
 */
export function addBreadcrumb(
  message: string,
  category: string,
  level: SentryNative.SeverityLevel = 'info',
): void {
  if (!initialised) return;
  SentryNative.addBreadcrumb({ message, category, level });
}

export const Sentry = SentryNative;
