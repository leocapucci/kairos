import { router, Stack } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../src/auth';
import { requestEmailOtp, verifyEmailOtp } from '../src/auth/authService';
import { identify } from '../src/analytics';
import { colors, radius } from '../theme';

type Phase = 'email' | 'otp';

export default function LoginEmailScreen() {
  const { refreshUser } = useAuth();
  const [phase, setPhase] = useState<Phase>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      setError('Digite um email válido.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await requestEmailOtp(trimmed);
      setPhase('otp');
    } catch {
      setError('Não foi possível enviar o código. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const trimmed = otp.trim();
    if (!trimmed) { setError('Digite o código recebido.'); return; }
    setError('');
    setLoading(true);
    try {
      const user = await verifyEmailOtp(email.trim().toLowerCase(), trimmed);
      refreshUser(user);
      identify(user.user_id, { email: user.email, provider: 'email' });
      router.replace('/home');
    } catch {
      setError('Código inválido ou expirado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false, animation: 'slide_from_right' }} />
      <SafeAreaView style={s.safe}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={s.container}>

            <View style={s.topBar}>
              <Pressable onPress={() => router.back()} style={s.backBtn} hitSlop={12}>
                <Text style={s.backIcon}>‹</Text>
              </Pressable>
              <Text style={s.topLabel}>{phase === 'email' ? 'EMAIL' : 'CÓDIGO'}</Text>
            </View>

            <View style={s.body}>
              {phase === 'email' ? (
                <>
                  <Text style={s.title}>Qual é o{'\n'}seu email?</Text>
                  <Text style={s.subtitle}>Enviaremos um código de acesso.</Text>
                  <TextInput
                    style={s.input}
                    placeholder="seu@email.com"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="send"
                    onSubmitEditing={handleSendOtp}
                    editable={!loading}
                  />
                </>
              ) : (
                <>
                  <Text style={s.title}>Código{'\n'}enviado</Text>
                  <Text style={s.subtitle}>{`Verifique ${email}\ne cole o código abaixo.`}</Text>
                  <TextInput
                    style={s.input}
                    placeholder="000000"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    returnKeyType="done"
                    onSubmitEditing={handleVerifyOtp}
                    editable={!loading}
                    autoFocus
                  />
                  <Pressable onPress={handleSendOtp} style={s.resendBtn}>
                    <Text style={s.resendText}>Reenviar código</Text>
                  </Pressable>
                </>
              )}

              {error ? <Text style={s.errorText}>{error}</Text> : null}
            </View>

            <View style={s.actions}>
              <Pressable
                onPress={phase === 'email' ? handleSendOtp : handleVerifyOtp}
                disabled={loading}
                style={({ pressed }) => [s.primaryBtn, pressed && { opacity: 0.85 }]}
              >
                {loading
                  ? <ActivityIndicator color="#FFFFFF" />
                  : <Text style={s.primaryBtnText}>
                      {phase === 'email' ? 'Enviar código' : 'Verificar'}
                    </Text>
                }
              </Pressable>
            </View>

          </View>
        </KeyboardAvoidingView>
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
    gap: 16,
  },
  title: {
    fontSize: 36,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
    letterSpacing: -0.8,
    lineHeight: 44,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 22,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.md,
    paddingVertical: 16,
    paddingHorizontal: 18,
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Inter_400Regular',
    marginTop: 8,
  },
  resendBtn: { alignSelf: 'flex-start', paddingVertical: 4 },
  resendText: {
    color: colors.sage,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  errorText: {
    color: colors.coral,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  actions: { paddingBottom: 32 },
  primaryBtn: {
    backgroundColor: colors.sage,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.2,
  },
});
