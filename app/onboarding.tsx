import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing } from '../theme';
import { postOnboarding } from '../services/api';
import { Button } from '../src/design-system';
import { E, track } from '../src/analytics';

export const ONBOARDING_ANSWERS_KEY = 'kairos_onboarding_v1';

type Option = { value: string; label: string };
type OnboardingQuestion = { key: string; question: string; options: Option[] };

const QUESTIONS: OnboardingQuestion[] = [
  {
    key: 'life_phase',
    question: 'Em qual fase da vida você está agora?',
    options: [
      { value: 'adolescente', label: 'Adolescência (13-17 anos)' },
      { value: 'jovem_adulto', label: 'Jovem adulto (18-29 anos)' },
      { value: 'adulto', label: 'Adulto (30-50 anos)' },
      { value: 'maduro', label: 'Maduro (50+ anos)' },
    ],
  },
  {
    key: 'main_struggle',
    question: 'Qual é a sua maior luta agora?',
    options: [
      { value: 'ansiedade', label: 'Ansiedade e medo do futuro' },
      { value: 'relacionamento', label: 'Relacionamentos difíceis' },
      { value: 'proposito', label: 'Falta de propósito ou direção' },
      { value: 'fe', label: 'Dúvidas sobre a fé' },
      { value: 'financeiro', label: 'Pressão financeira' },
      { value: 'luto', label: 'Luto ou perda' },
    ],
  },
  {
    key: 'faith_level',
    question: 'Como você descreveria sua caminhada espiritual hoje?',
    options: [
      { value: 'iniciando', label: 'Estou começando a conhecer' },
      { value: 'retomando', label: 'Estou retomando após um tempo longe' },
      { value: 'crescendo', label: 'Estou crescendo e buscando mais' },
      { value: 'firme', label: 'Estou firme e quero aprofundar' },
    ],
  },
];

type Phase = 'intro' | 'questions' | 'transitioning';

export default function OnboardingScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('intro');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  useEffect(() => {
    track(E.ONBOARDING_STARTED);
  }, []);

  // Navigate to home after transition delay
  useEffect(() => {
    if (phase !== 'transitioning') return;
    const timer = setTimeout(() => { router.replace('/home'); }, 2000);
    return () => clearTimeout(timer);
  }, [phase, router]);

  const currentQuestion = QUESTIONS[step];
  const selectedValue = answers[currentQuestion?.key ?? ''];
  const isLastStep = step === QUESTIONS.length - 1;

  const progress = useMemo(
    () => QUESTIONS.map((_, i) => ({ id: `dot_${i}`, active: i <= step })),
    [step]
  );

  const handleSelect = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.key]: value }));
  };

  const handleContinue = async () => {
    if (!selectedValue || isSubmitting) return;

    track(E.ONBOARDING_STEP_COMPLETED, {
      step,
      question_key: currentQuestion.key,
      answer: selectedValue,
    });

    if (!isLastStep) {
      setStep((prev) => prev + 1);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(false);

    try {
      const payload = QUESTIONS.map((q) => ({ question_key: q.key, answer: answers[q.key] ?? '' }));
      await postOnboarding(payload);
      // Save locally — used by home screen for context display + interaction personalization
      await AsyncStorage.setItem(ONBOARDING_ANSWERS_KEY, JSON.stringify(answers)).catch(() => {});
      track(E.ONBOARDING_COMPLETED, { answers });
      setPhase('transitioning');
    } catch (e) {
      setIsSubmitting(false);
      setSubmitError(true);
      track(E.ONBOARDING_FAILED, { error: e instanceof Error ? e.message : String(e) });
    }
  };

  const handleSkip = () => {
    track(E.ONBOARDING_SKIPPED, { step });
    router.replace('/home');
  };

  // ─── Intro ───────────────────────────────────────────────────────────────────

  if (phase === 'intro') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <View style={styles.brand}>
            <Text style={styles.brandName}>KAIROS</Text>
            <Text style={styles.brandTagline}>Favor sem merecimento.</Text>
          </View>

          <View style={styles.introContent}>
            <Text style={styles.introHeading}>
              O Kairos vai te entregar uma direção espiritual todos os dias.
            </Text>
            <View style={styles.introAccent} />
            <Text style={styles.introBody}>
              Ela será moldada pelo que você está vivendo agora.
            </Text>
            <Text style={styles.introMinute}>Menos de 1 minuto.</Text>
          </View>

          <Button
            label="Começar →"
            onPress={() => setPhase('questions')}
            variant="primary"
          />
        </View>
      </SafeAreaView>
    );
  }

  // ─── Transition ──────────────────────────────────────────────────────────────

  if (phase === 'transitioning') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.transitionContainer}>
          <Text style={styles.brandName}>KAIROS</Text>
          <Text style={styles.transitionText}>Sua direção está sendo preparada.</Text>
          <ActivityIndicator color={colors.accent} size="small" style={styles.transitionLoader} />
        </View>
      </SafeAreaView>
    );
  }

  // ─── Questions ───────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        <View style={styles.brand}>
          <Text style={styles.brandName}>KAIROS</Text>
          <Text style={styles.brandTagline}>Favor sem merecimento.</Text>
        </View>

        {step === 0 && (
          <Text style={styles.greeting}>Olá, bom te{'\n'}ver aqui!</Text>
        )}

        <View style={styles.progressContainer}>
          {progress.map((item) => (
            <View
              key={item.id}
              style={[styles.progressDot, item.active && styles.progressDotActive]}
            />
          ))}
        </View>

        <Text style={styles.questionText}>{currentQuestion.question}</Text>

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option) => {
            const isSelected = selectedValue === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => handleSelect(option.value)}
                style={({ pressed }) => [
                  styles.optionButton,
                  isSelected && styles.optionButtonSelected,
                  pressed && styles.optionButtonPressed,
                ]}
              >
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {submitError && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>
              Não foi possível salvar suas respostas. Tente novamente ou continue sem salvar.
            </Text>
            <Pressable onPress={handleSkip} style={styles.skipLink}>
              <Text style={styles.skipLinkText}>Continuar mesmo assim</Text>
            </Pressable>
          </View>
        )}

        <Button
          label={isLastStep ? (submitError ? 'Tentar novamente' : 'Receber direção →') : 'Continuar →'}
          onPress={handleContinue}
          disabled={!selectedValue}
          loading={isSubmitting}
          variant="primary"
        />

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },

  brand: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  brandName: {
    color: colors.text,
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 4,
  },
  brandTagline: {
    color: colors.gray,
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
    fontStyle: 'italic',
  },

  // ── Intro
  introContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 8,
    gap: 0,
  },
  introHeading: {
    color: colors.text,
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    lineHeight: 38,
    letterSpacing: -0.5,
    marginBottom: spacing.lg,
  },
  introAccent: {
    width: 30,
    height: 2,
    backgroundColor: colors.accent,
    borderRadius: 1,
    marginBottom: spacing.lg,
  },
  introBody: {
    color: colors.text,
    fontSize: 18,
    fontFamily: 'Inter_400Regular',
    lineHeight: 28,
    letterSpacing: 0.1,
    marginBottom: spacing.md,
    opacity: 0.82,
  },
  introMinute: {
    color: colors.gray,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    fontStyle: 'italic',
    letterSpacing: 0.2,
  },

  // ── Transition
  transitionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: 40,
  },
  transitionText: {
    color: colors.text,
    fontSize: 20,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 30,
    letterSpacing: 0.1,
    opacity: 0.85,
  },
  transitionLoader: {
    marginTop: spacing.sm,
  },

  // ── Questions
  greeting: {
    color: colors.text,
    fontSize: 40,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.8,
    lineHeight: 48,
    marginBottom: spacing.xl,
  },

  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.softGray,
  },
  progressDotActive: {
    backgroundColor: colors.accent,
    width: 18,
    borderRadius: 3,
  },

  questionText: {
    color: colors.text,
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    lineHeight: 28,
    letterSpacing: -0.3,
    marginBottom: spacing.lg,
  },

  optionsContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: colors.softGray,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
  },
  optionButtonSelected: {
    borderColor: colors.accent,
    borderWidth: 1.5,
    backgroundColor: 'rgba(200,76,76,0.05)',
  },
  optionButtonPressed: {
    opacity: 0.75,
  },
  optionText: {
    color: colors.text,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
  },
  optionTextSelected: {
    fontFamily: 'Inter_700Bold',
    color: colors.text,
  },

  errorBox: {
    backgroundColor: 'rgba(200,76,76,0.07)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(200,76,76,0.20)',
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: spacing.sm,
    gap: 8,
  },
  errorText: {
    color: colors.text,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    lineHeight: 19,
  },
  skipLink: {
    alignSelf: 'flex-start',
  },
  skipLinkText: {
    color: colors.accent,
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    textDecorationLine: 'underline',
  },
});
