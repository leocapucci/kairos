import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import KairosSymbol from '../components/KairosSymbol';
import { Colors } from '../constants/colors';

const SPLASH_DURATION_MS = 2500;
const FADE_OUT_DURATION_MS = 400;

export default function SplashScreen() {
  const router = useRouter();
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        const deviceId = await AsyncStorage.getItem('device_id');

        const delay = setTimeout(() => {
          Animated.timing(opacity, {
            toValue: 0,
            duration: FADE_OUT_DURATION_MS,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }).start(() => {
            if (!isMounted) return;
            router.replace(deviceId ? '/home' : '/onboarding');
          });
        }, SPLASH_DURATION_MS);

        return () => clearTimeout(delay);
      } catch {
        router.replace('/onboarding');
      }
    };

    const cleanupPromise = bootstrap();

    return () => {
      isMounted = false;
      cleanupPromise.then((cleanup) => cleanup?.()).catch(() => undefined);
    };
  }, [opacity, router]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={[styles.container, { opacity }]}>
        <View style={styles.brandBlock}>
          <KairosSymbol size={80} color={Colors.textSecondary} />
          <Text style={styles.logo}>KAIROS</Text>
          <Text style={styles.tagline}>Favor sem merecimento.</Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBlock: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    marginTop: 20,
    color: Colors.textPrimary,
    fontSize: 28,
    fontWeight: '300',
    letterSpacing: 5,
    textTransform: 'uppercase',
  },
  tagline: {
    marginTop: 10,
    color: Colors.textTertiary,
    fontSize: 12,
    fontStyle: 'italic',
  },
});
