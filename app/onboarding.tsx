import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '../constants/colors';
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
      router.replace('/home');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.progressContainer}>
          {progress.map((item) => (
            <View
              key={item.id}
              style={[styles.progressDot, item.active ? styles.progressDotActive : undefined]}
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
                style={[styles.optionButton, isSelected ? styles.optionButtonSelected : undefined]}
              >
                <Text style={[styles.optionText, isSelected ? styles.optionTextSelected : undefined]}>
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
            !selectedValue || isSubmitting ? styles.continueButtonDisabled : undefined,
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator color={Colors.background} />
          ) : (
            <Text style={styles.continueButtonText}>
              {isLastStep ? 'Ver minha direção de hoje' : 'Continuar'}
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
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bgLight,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.bgLight,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 28,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: Colors.textTertiary,
    opacity: 0.35,
  },
  progressDotActive: {
    backgroundColor: Colors.gold,
    opacity: 1,
  },
  questionText: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: '500',
    lineHeight: 30,
    marginBottom: 20,
  },
  optionsContainer: {
    flex: 1,
    gap: 10,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
  optionButtonSelected: {
    borderColor: Colors.gold,
    borderWidth: 1.5,
    backgroundColor: 'rgba(200,76,76,0.08)',
  },
  optionText: {
    color: Colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
  },
  optionTextSelected: {
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  continueButton: {
    height: 50,
    borderRadius: 12,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonDisabled: {
    opacity: 0.45,
  },
  continueButtonText: {
    color: Colors.background,
    fontSize: 15,
    fontWeight: '500',
  },
  infoText: {
    marginTop: 10,
    color: Colors.textSecondary,
    fontSize: 13,
  },
  errorText: {
    marginTop: 4,
    color: Colors.textSecondary,
    fontSize: 13,
    fontStyle: 'italic',
  },
});
