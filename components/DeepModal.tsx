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

import { Colors } from '../constants/colors';
import { postDeep } from '../services/api';
import { shareKairos } from '../services/share';

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

  useEffect(() => {
    if (!visible) {
      setDeepText('');
      return;
    }

    Animated.timing(slide, {
      toValue: 0,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [slide, visible]);

  useEffect(() => {
    if (!visible || !interactionId || !userChoice) return;

    const loadDeep = async () => {
      setIsLoading(true);
      try {
        const response = await postDeep(interactionId, userChoice);
        const data = (response.data ?? {}) as DeepResponse;
        setDeepText(data.response ?? data.message ?? data.text ?? 'Sem resposta no momento.');
        setDeepErrorMessage('');
      } catch {
        setDeepErrorMessage('Não foi possível carregar a resposta aprofundada.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDeep();
  }, [interactionId, userChoice, visible]);

  const handleClose = () => {
    Animated.timing(slide, {
      toValue: 320,
      duration: 220,
      useNativeDriver: true,
    }).start(onClose);
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropTouch} onPress={handleClose} />
        <Animated.View style={[styles.sheet, { transform: [{ translateY: slide }] }]}>
          <Pressable onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeIcon}>X</Text>
          </Pressable>

          <Text style={styles.questionLabel}>PERGUNTA</Text>
          <Text style={styles.questionText}>{question}</Text>

          <Text style={styles.choiceLabel}>ESCOLHA</Text>
          <Text style={styles.choiceText}>{choiceLabel}</Text>

          <Text style={styles.answerLabel}>RESPOSTA</Text>
          {isLoading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={Colors.gold} />
            </View>
          ) : (
            <>
              <Text style={styles.answerText}>{deepText}</Text>
              {deepText ? (
                <Pressable onPress={() => shareKairos(deepText)} style={styles.shareButton}>
                  <Text style={styles.shareButtonText}>Compartilhar 🔗</Text>
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
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  backdropTouch: {
    flex: 1,
  },
  sheet: {
    backgroundColor: Colors.surfaceDeep,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 26,
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
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '500',
  },
  questionLabel: {
    color: Colors.textTertiary,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  questionText: {
    color: Colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 14,
  },
  choiceLabel: {
    color: Colors.textTertiary,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  choiceText: {
    color: Colors.goldLight,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 14,
  },
  answerLabel: {
    color: Colors.textTertiary,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  answerText: {
    color: Colors.textPrimary,
    fontSize: 14,
    lineHeight: 22,
  },
  shareButton: { alignSelf: 'center', marginTop: 10, paddingVertical: 8, paddingHorizontal: 16 },
  shareButtonText: { color: Colors.textSecondary, fontSize: 13 },
  loadingWrap: {
    paddingVertical: 18,
    alignItems: 'flex-start',
  },
  errorText: {
    marginTop: 10,
    color: Colors.textSecondary,
    fontSize: 13,
  },
});
