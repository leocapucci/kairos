import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { registerPushToken } from '../services/api/push';

// Configure how notifications appear while the app is foregrounded.
// Sound off by default — the product tone is contemplative, not intrusive.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Call this once from a post-onboarding screen (e.g. home.tsx).
// Fires permission prompt on first call if not yet granted.
// Silently no-ops in Expo Go without a development build and in simulators.
export function usePushToken(userId: string): void {
  useEffect(() => {
    if (!userId || userId === 'anon') return;
    _register(userId).catch(() => {});
  }, [userId]);
}

async function _register(userId: string): Promise<void> {
  if (Platform.OS === 'web') return;

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;

  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync();
    await registerPushToken(token, userId, Platform.OS);
  } catch {
    // Push token unavailable in Expo Go without configuration or in simulators.
    // Fail silently — push is enhancement, not critical path.
  }
}
