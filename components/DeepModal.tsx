import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { animation, colors, dark, radius, spacing } from '../theme';
import { postDeep } from '../services/api';
import { shareKairos } from '../src/services/api/share';

type DeepModalProps = {
  visible: boolean;
  onClose: () => void;
  interactionId: string;
  question: string;
  userChoice: string;
};

type DeepResponse = {
  response?: string;
  message?: string;
  text?: string;
};

export default function DeepModal({
  visible,
  onClose,
  interactionId,
  question,
  userChoice,
}: DeepModalProps) {
  const slide = useRef(new Animated.Value(320)).current;
  const [isLoading, setIsLoading] = useState(false);
  const [deepText, setDeepText] = useState('');
  const [deepErrorMessage, setDeepErrorMessage] = useState('');

  const choiceLabel = useMemo(
    () => (userChoice === 'direct' ? 'Seja direto comigo' : 'Quero refletir mais'),
    [userChoice]
  );

  // Slide animation
  useEffect(() => {
    if (!visible) {
      setDeepText('');
      setDeepErrorMessage('');
      return;
    }
    Animated.timing(slide, {
      toValue: 0,
      duration: animation.modalIn,
      useNativeDriver: true,
    }).start();
  }, [slide, visible]);

  // Data fetch with AbortController to prevent race conditions
  useEffect(() => {
    if (!visible || !interactionId || !userChoice) return;

    const ctrl = new AbortController();
    setIsLoading(true);
    setDeepText('');
    setDeepErrorMessage('');

    postDeep(interactionId, userChoice, ctrl.signal)
      .then((response) => {
        if (ctrl.signal.aborted) return;
        const data = response.data as DeepResponse;
        setDeepText(data.response ?? data.message ?? data.text ?? 'Sem resposta no momento.');
      })
      .catch(() => {
        if (ctrl.signal.aborted) return;
        setDeepErrorMessage('Não foi possível carregar a resposta aprofundada.');
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setIsLoading(false);
      });

    return () => ctrl.abort();
  }, [interactionId, userChoice, visible]);

  const handleClose = () => {
    Animated.timing(slide, {
      toValue: 320,
      duration: animation.modalOut,
      useNativeDriver: true,
    }).start(onClose);
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropTouch} onPress={handleClose} />
        <Animated.View style={[styles.sheet, { transform: [{ translateY: slide }] }]}>
          <Pressable onPress={handleClose} style={styles.closeButton} hitSlop={8}>
            <Text style={styles.closeIcon}>✕</Text>
          </Pressable>

          <Text style={styles.sectionLabel}>PERGUNTA</Text>
          <Text style={styles.questionText}>{question}</Text>

          <Text style={styles.sectionLabel}>ESCOLHA</Text>
          <Text style={styles.choiceText}>{choiceLabel}</Text>

          <Text style={styles.sectionLabel}>RESPOSTA</Text>
          {isLoading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={colors.gold} />
            </View>
          ) : (
            <>
              <Text style={styles.answerText}>{deepText}</Text>
              {deepText ? (
                <Pressable
                  onPress={() => shareKairos(deepText)}
                  style={styles.shareButton}
                  hitSlop={4}
                >
                  <Text style={styles.shareButtonText}>Compartilhar</Text>
                </Pressable>
              ) : null}
            </>
          )}

          {deepErrorMessage ? (
            <Text style={styles.errorText}>{deepErrorMessage}</Text>
          ) : null}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: dark.backdrop,
    justifyContent: 'flex-end',
  },
  backdropTouch: { flex: 1 },
  sheet: {
    backgroundColor: colors.surfaceDeep,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.md + 2,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg + 2,
    minHeight: 330,
  },
  closeButton: {
    alignSelf: 'flex-end',
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    color: colors.textSecondary,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
  sectionLabel: {
    color: colors.textTertiary,
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing.xs + 2,
  },
  questionText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  choiceText: {
    color: colors.gold,
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    marginBottom: spacing.md,
  },
  answerText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    lineHeight: 22,
  },
  shareButton: {
    alignSelf: 'center',
    marginTop: spacing.sm + 2,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  shareButtonText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  loadingWrap: {
    paddingVertical: 18,
    alignItems: 'flex-start',
  },
  errorText: {
    marginTop: spacing.sm + 2,
    color: colors.textSecondary,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
});
