import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing } from '../theme';
import { postOnboarding } from '../services/api';
import { Button } from '../src/design-system';

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

    try {
      const payload = QUESTIONS.map((question) => ({
        question_key: question.key,
        answer: answers[question.key] ?? '',
      }));

      await postOnboarding(payload);
    } catch (e) {
      console.log(e);
    } finally {
      setIsSubmitting(false);
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

        <Button
          label={isLastStep ? 'Receber direção →' : 'Continuar →'}
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

});
