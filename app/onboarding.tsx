import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing } from '../theme';
import { postOnboarding } from '../services/api';

type Option = {
  value: string;
  label: string;
};

type OnboardingQuestion = {
  key: string;
  question: string;
  options: Option[];
};

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

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [networkMessage, setNetworkMessage] = useState('');
  const [submitErrorMessage, setSubmitErrorMessage] = useState('');

  const currentQuestion = QUESTIONS[step];
  const selectedValue = answers[currentQuestion.key];
  const isLastStep = step === QUESTIONS.length - 1;

  const progress = useMemo(
    () =>
      QUESTIONS.map((_, index) => ({
        id: `dot_${index}`,
        active: index <= step,
      })),
    [step]
  );

  const handleSelect = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.key]: value }));
  };

  const handleContinue = async () => {
    if (!selectedValue || isSubmitting) return;

    if (!isLastStep) {
      setStep((prev) => prev + 1);
      return;
    }

    setIsSubmitting(true);
    setNetworkMessage('');
    setSubmitErrorMessage('');

    try {
      const existingDeviceId = await AsyncStorage.getItem('device_id');
      const deviceId =
        existingDeviceId ?? `device_${Date.now()}_${Math.random().toString(36).slice(2)}`;

      if (!existingDeviceId) {
        await AsyncStorage.setItem('device_id', deviceId);
      }

      await AsyncStorage.setItem('onboarding_answers', JSON.stringify(answers));

      const payload = QUESTIONS.map((question) => ({
        question_key: question.key,
        answer: answers[question.key] ?? '',
      }));

      try {
        await postOnboarding(payload);
      } catch {
        setNetworkMessage(
          'Suas respostas foram salvas neste dispositivo. Vamos sincronizar quando houver conexão.'
        );
      }
    } catch {
      setSubmitErrorMessage(
        'Não conseguimos salvar tudo corretamente, mas você seguirá para a tela inicial.'
      );
    } finally {
      setIsSubmitting(false);
      await AsyncStorage.setItem('onboarding_complete', 'true');
      router.replace('/home');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Brand */}
        <View style={styles.brand}>
          <Text style={styles.brandName}>KAIROS</Text>
          <Text style={styles.brandTagline}>Favor sem merecimento.</Text>
        </View>

        {/* Greeting — only on first step */}
        {step === 0 && (
          <Text style={styles.greeting}>Olá, bom te{'\n'}ver aqui!</Text>
        )}

        {/* Progress */}
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
                style={[styles.optionButton, isSelected && styles.optionButtonSelected]}
              >
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={handleContinue}
          disabled={!selectedValue || isSubmitting}
          style={[
            styles.continueButton,
            (!selectedValue || isSubmitting) && styles.continueButtonDisabled,
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.continueButtonText}>
              {isLastStep ? 'Receber direção →' : 'Continuar →'}
            </Text>
          )}
        </Pressable>

        {networkMessage ? (
          <Text style={styles.infoText}>{networkMessage}</Text>
        ) : null}
        {submitErrorMessage ? (
          <Text style={styles.errorText}>{submitErrorMessage}</Text>
        ) : null}

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

  continueButton: {
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  continueButtonDisabled: {
    opacity: 0.4,
  },
  continueButtonText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.3,
  },

  infoText: {
    marginTop: spacing.sm,
    color: colors.gray,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  errorText: {
    marginTop: 4,
    color: colors.gray,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    fontStyle: 'italic',
  },
});
