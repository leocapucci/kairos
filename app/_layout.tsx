import {
  Inter_300Light,
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

import { ErrorBoundary } from '../components/ErrorBoundary';
import { queryClient } from '../src/query/queryClient';
import { initSentry } from '../src/utils/sentry';
import { initAnalytics } from '../src/analytics';
import { BASE_URL } from '../src/services/api/http';
import { AuthProvider } from '../src/auth';
import { ClerkProvider } from '../src/auth/clerkConfig';
import { tokenCache } from '../src/auth/clerkConfig';
import { colors } from '../theme';

SplashScreen.preventAutoHideAsync();

initSentry();
initAnalytics({ posthogApiKey: process.env.EXPO_PUBLIC_POSTHOG_API_KEY });

// Keep-alive: warms the Render Free instance before the user hits the first
// real API call (~30-60s cold start). Fire-and-forget, never blocks UI.
fetch(`${BASE_URL}/health`).catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Defensive timeout: if fonts never resolve, unblock rendering after 3s
  // to prevent a permanent blank screen.
  const [fontTimeout, setFontTimeout] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setFontTimeout(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError || fontTimeout) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, fontTimeout]);

  if (!fontsLoaded && !fontError && !fontTimeout) {
    return null;
  }

  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? ''}
      tokenCache={tokenCache}
    >
      <ErrorBoundary>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
              }}
            />
          </QueryClientProvider>
        </AuthProvider>
      </ErrorBoundary>
    </ClerkProvider>
  );
}
