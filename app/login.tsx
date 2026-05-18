import { router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../src/auth';
import { colors, radius } from '../theme';

export default function LoginScreen() {
  const { signInWithGoogle, isAuthenticated, isLoading } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) router.replace('/home');
  }, [isAuthenticated]);

  const handleGoogle = async () => {
    setError('');
    try {
      await signInWithGoogle();
    } catch {
      setError('Não foi possível entrar com Google. Tente novamente.');
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false, animation: 'slide_from_bottom' }} />
      <SafeAreaView style={s.safe}>
        <View style={s.container}>

          <View style={s.topBar}>
            <Pressable onPress={() => router.back()} style={s.backBtn} hitSlop={12}>
              <Text style={s.backIcon}>‹</Text>
            </Pressable>
            <Text style={s.topLabel}>ENTRAR</Text>
          </View>

          <View style={s.body}>
            <Text style={s.title}>Continue sua{'\n'}jornada</Text>
            <Text style={s.subtitle}>
              {'Entre para salvar seu progresso,\nversículos e histórico.'}
            </Text>
          </View>

          <View style={s.actions}>
            {error ? <Text style={s.errorText}>{error}</Text> : null}

            <Pressable
              onPress={handleGoogle}
              disabled={isLoading}
              style={({ pressed }) => [s.googleBtn, pressed && { opacity: 0.85 }]}
            >
              {isLoading
                ? <ActivityIndicator color="#FFFFFF" />
                : <Text style={s.googleBtnText}>Entrar com Google</Text>
              }
            </Pressable>

            <Pressable
              onPress={() => router.push('/login-email')}
              style={({ pressed }) => [s.emailBtn, pressed && { opacity: 0.75 }]}
            >
              <Text style={s.emailBtnText}>Entrar com email</Text>
            </Pressable>

            <Pressable
              onPress={() => router.replace('/home')}
              style={({ pressed }) => [s.skipBtn, pressed && { opacity: 0.6 }]}
            >
              <Text style={s.skipText}>Continuar sem conta →</Text>
            </Pressable>
          </View>

        </View>
      </SafeAreaView>
    </>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceDark },
  container: { flex: 1, paddingHorizontal: 24 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  backBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backIcon: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 26,
    lineHeight: 26,
    fontFamily: 'Inter_400Regular',
  },
  topLabel: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 2.5,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  title: {
    fontSize: 36,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
    letterSpacing: -0.8,
    lineHeight: 44,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 22,
  },
  actions: {
    paddingBottom: 32,
    gap: 12,
  },
  errorText: {
    color: colors.coral,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  googleBtn: {
    backgroundColor: colors.sage,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  googleBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.2,
  },
  emailBtn: {
    borderRadius: radius.md,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  emailBtnText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipText: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
});
