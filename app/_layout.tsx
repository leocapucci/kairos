import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';

import { colors } from '../theme';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const router = useRouter();

  useEffect(() => {
    if (!fontsLoaded) return;
    AsyncStorage.getItem('onboarding_complete')
      .then((val) => {
        if (val) {
          router.replace('/home');
        } else {
          router.replace('/splash-screen');
        }
      })
      .catch(() => {
        router.replace('/splash-screen');
      });
  }, [fontsLoaded, router]);

  if (!fontsLoaded) return null;

  return (
    <>
      <StatusBar style="dark" backgroundColor={colors.background} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'fade',
        }}
      />
    </>
  );
}
