import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function SplashScreenPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/onboarding');
    }, 10000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>

        <View style={styles.top}>
          <Text style={styles.brandName}>KAIROS</Text>
          <Text style={styles.tagline}>FAVOR SEM MERECIMENTO</Text>
          <View style={styles.divider} />
          <Text style={styles.headline}>{'Clareza para decidir.\nForça para agir.'}</Text>
          <Text style={styles.subtitle}>
            {'Direção diária baseada na Bíblia\npara quem não quer viver no automático.'}
          </Text>
        </View>

        <Image
          source={require('../assets/images/splash-bg.jpg')}
          style={styles.imageContainer}
          resizeMode="cover"
        />

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F7F5F2',
  },
  content: {
    flex: 1,
    padding: 32,
  },
  top: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 72,
    fontFamily: 'Inter_700Bold',
    color: '#1A1A1A',
    letterSpacing: 8,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: '#C84C4C',
    letterSpacing: 4,
    textAlign: 'center',
    marginTop: 4,
  },
  divider: {
    width: 40,
    height: 2,
    backgroundColor: '#C84C4C',
    marginTop: 16,
    marginBottom: 32,
  },
  headline: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: '#1A1A1A',
    lineHeight: 36,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#888888',
    marginTop: 12,
    lineHeight: 24,
    textAlign: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 280,
    borderRadius: 0,
  },
});
