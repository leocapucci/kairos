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
import { useEffect } from 'react';

import { ErrorBoundary } from '../components/ErrorBoundary';
import { queryClient } from '../src/query/queryClient';
import { initSentry } from '../src/utils/sentry';
import { initAnalytics } from '../src/analytics';
import { BASE_URL } from '../src/services/api/http';

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

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
