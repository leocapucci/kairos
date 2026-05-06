import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BottomNav from '../components/BottomNav';
import ReactionButton from '../components/ui/ReactionButton';
import { colors } from '../theme';
import { postInteraction } from '../services/api';
import { shareKairos } from '../services/share';

type CardType = 'conforto' | 'confronto' | 'crescimento' | 'devocional';

type InteractionResponse = {
  interaction_id?: string;
  id?: string;
  response?: string;
  message?: string;
  text?: string;
};

const FALLBACK_BY_TYPE: Record<CardType, string> = {
  conforto: 'Respire. Deus continua presente no seu agora.',
  confronto: 'Existe um ajuste importante que você pode escolher hoje.',
  crescimento: 'Um passo de obediência pode iniciar uma nova fase.',
  devocional: 'Pare por um instante e entregue o restante do dia a Deus.',
};

const DEEP_BUTTONS = [
  { id: 'direct',  label: 'Seja mais direto 🎯',      prompt: 'Seja mais direto e objetivo.' },
  { id: 'step',    label: 'Me dê um passo claro 👣',  prompt: 'Me dê um único passo prático que posso fazer hoje.' },
  { id: 'explain', label: 'Quero entender melhor 🧠', prompt: 'Explique de forma mais simples e clara.' },
] as const;

const REACTION_BUTTONS = [
  { id: 'peace',      emoji: '🙏',  label: 'Me trouxe paz',      message: 'Esse conteúdo me trouxe paz.' },
  { id: 'confronted', emoji: '⚔️',  label: 'Me confrontou',       message: 'Esse conteúdo me confrontou.' },
  { id: 'direction',  emoji: '🧭',  label: 'Preciso de direção',  message: 'Preciso de direção sobre isso.' },
  { id: 'confused',   emoji: '❓',  label: 'Não entendi',          message: 'Não entendi esse conteúdo.' },
] as const;

function stripMarkdown(text: string) {
  return text.replace(/^#{1,6}\s*/gm, '').replace(/\*\*/g, '').trim();
}

export default function InteractionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string; text?: string; daily_message_id?: string }>();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBtn, setSelectedBtn] = useState('');
  const [replyText, setReplyText] = useState('');
  const replyOpacity = useRef(new Animated.Value(0)).current;

  const [followUpChosen, setFollowUpChosen] = useState<'hoje' | 'depois' | ''>('');
  const [isLoadingDeep, setIsLoadingDeep] = useState(false);
  const [deepReply, setDeepReply] = useState('');
  const [deepError, setDeepError] = useState('');
  const [selectedDeepBtn, setSelectedDeepBtn] = useState('');
  const deepOpacity = useRef(new Animated.Value(0)).current;
  const [errorMessage, setErrorMessage] = useState('');

  const cardType = useMemo<CardType>(() => {
    const raw = params.type ?? 'conforto';
    return (raw === 'conforto' || raw === 'confronto' || raw === 'crescimento' || raw === 'devocional')
      ? raw : 'conforto';
  }, [params.type]);

  const cardText = useMemo(() => {
    const t = typeof params.text === 'string' ? params.text.trim() : '';
    return t || FALLBACK_BY_TYPE[cardType];
  }, [cardType, params.text]);

  const cleanReply = useMemo(() => stripMarkdown(replyText), [replyText]);

  const handleReaction = async (btn: typeof REACTION_BUTTONS[number]) => {
    if (isSubmitting) return;
    setSelectedBtn(btn.id);
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const res = await postInteraction(cardType, `${btn.message} Conteúdo: "${cardText}"`);
      const data = (res.data ?? {}) as InteractionResponse;
      setReplyText(data.response ?? data.message ?? data.text ?? 'Sem resposta no momento.');
      replyOpacity.setValue(0);
      Animated.timing(replyOpacity, { toValue: 1, duration: 320, useNativeDriver: true }).start();
    } catch {
      setErrorMessage('Não foi possível enviar sua reação agora.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeep = async (btn: typeof DEEP_BUTTONS[number]) => {
    if (isLoadingDeep) return;
    setSelectedDeepBtn(btn.id);
    setIsLoadingDeep(true);
    setDeepReply('');
    setDeepError('');
    deepOpacity.setValue(0);
    try {
      const message = `${btn.prompt} Contexto: "${cardText}". Resposta anterior: "${cleanReply}". Sem perguntas ao usuário.`;
      const res = await postInteraction('devocional', message);
      const data = (res.data ?? {}) as InteractionResponse;
      setDeepReply(stripMarkdown(data.response ?? data.message ?? data.text ?? 'Sem resposta.'));
      Animated.timing(deepOpacity, { toValue: 1, duration: 320, useNativeDriver: true }).start();
    } catch {
      setDeepError('Não foi possível carregar a resposta.');
    } finally {
      setIsLoadingDeep(false);
    }
  };

  const handleReset = () => {
    setReplyText('');
    setSelectedBtn('');
    setFollowUpChosen('');
    setDeepReply('');
    setDeepError('');
    setSelectedDeepBtn('');
    setErrorMessage('');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <Text style={styles.typeTag}>{cardType.toUpperCase()}</Text>
        </View>

        {!replyText ? (
          <>
            <Text style={styles.cardText}>{cardText}</Text>
            <View style={styles.reactionsContainer}>
              {REACTION_BUTTONS.map((btn) => (
                <ReactionButton
                  key={btn.id}
                  emoji={btn.emoji}
                  label={btn.label}
                  onPress={() => handleReaction(btn)}
                  selected={selectedBtn === btn.id}
                  disabled={isSubmitting}
                />
              ))}
            </View>
            {isSubmitting && (
              <View style={styles.loader}>
                <ActivityIndicator color={colors.accent} />
              </View>
            )}
            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
          </>
        ) : (
          <Animated.View style={[styles.replyContainer, { opacity: replyOpacity }]}>
            <ScrollView
              style={styles.replyScroll}
              contentContainerStyle={styles.replyScrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.replyText}>{cleanReply}</Text>

              <Pressable onPress={() => shareKairos(cleanReply)} style={styles.shareBtn}>
                <Text style={styles.shareBtnText}>Compartilhar 🔗</Text>
              </Pressable>

              {!selectedDeepBtn && !isLoadingDeep && (
                <View style={styles.deepBtns}>
                  {DEEP_BUTTONS.map((btn) => (
                    <Pressable key={btn.id} onPress={() => handleDeep(btn)} style={styles.deepBtn}>
                      <Text style={styles.deepBtnText}>{btn.label}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
              {isLoadingDeep && (
                <View style={styles.loader}>
                  <ActivityIndicator color={colors.accent} />
                </View>
              )}
              {deepReply ? (
                <Animated.View style={{ opacity: deepOpacity }}>
                  <Text style={styles.deepReplyText}>{deepReply}</Text>
                </Animated.View>
              ) : null}
              {deepError ? <Text style={styles.errorText}>{deepError}</Text> : null}

              {!followUpChosen && (
                <View style={styles.followUpRow}>
                  <Pressable onPress={() => setFollowUpChosen('hoje')} style={styles.followUpBtn}>
                    <Text style={styles.followUpText}>Hoje 🔥</Text>
                  </Pressable>
                  <Pressable onPress={() => setFollowUpChosen('depois')} style={styles.followUpBtn}>
                    <Text style={styles.followUpText}>Depois ⏰</Text>
                  </Pressable>
                  <Pressable onPress={() => router.back()} style={[styles.followUpBtn, styles.followUpIgnore]}>
                    <Text style={[styles.followUpText, styles.followUpIgnoreText]}>Ignorar</Text>
                  </Pressable>
                </View>
              )}
              {followUpChosen === 'hoje' && (
                <Text style={styles.followUpFeedback}>🔥 Você decidiu agir — que isso se torne realidade hoje.</Text>
              )}
              {followUpChosen === 'depois' && (
                <Text style={styles.followUpFeedback}>Combinado. Volte quando estiver pronto.</Text>
              )}

              <Pressable onPress={handleReset} style={styles.resetBtn}>
                <Text style={styles.resetBtnText}>Voltar</Text>
              </Pressable>
            </ScrollView>
          </Animated.View>
        )}
      </View>

      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0b0b0b' },
  container: { flex: 1, padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, height: 40 },
  backButton: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  backIcon: { color: colors.white, fontSize: 20, lineHeight: 20, marginTop: -2 },
  typeTag: { color: colors.accent, fontSize: 10, fontWeight: '500', letterSpacing: 1.2, textTransform: 'uppercase' },
  cardText: {
    color: colors.white,
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
    marginTop: 40,
    lineHeight: 40,
  },
  reactionsContainer: { marginTop: 40 },
  loader: { paddingVertical: 12, alignItems: 'center' },
  errorText: { color: '#E07B5A', fontSize: 13, textAlign: 'center', marginTop: 8 },
  replyContainer: { flex: 1 },
  replyScroll: { flex: 1 },
  replyScrollContent: { flexGrow: 1, paddingBottom: 40, gap: 12 },
  replyText: { color: colors.white, fontSize: 16, lineHeight: 26, fontFamily: 'Inter_400Regular' },
  shareBtn: { alignSelf: 'center', paddingVertical: 8, paddingHorizontal: 16 },
  shareBtnText: { color: colors.gray, fontSize: 13 },
  deepBtns: { gap: 8 },
  deepBtn: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  deepBtnText: { color: colors.white, fontSize: 14, fontFamily: 'Inter_400Regular' },
  deepReplyText: {
    color: colors.white, fontSize: 15, lineHeight: 24, fontFamily: 'Inter_400Regular',
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 12,
  },
  followUpRow: { flexDirection: 'row', gap: 8 },
  followUpBtn: {
    flex: 1, borderRadius: 10, borderWidth: 1,
    borderColor: 'rgba(200,76,76,0.45)', backgroundColor: 'rgba(200,76,76,0.15)',
    paddingVertical: 12, alignItems: 'center',
  },
  followUpText: { color: colors.accent, fontSize: 13, fontWeight: '600' },
  followUpIgnore: { borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.08)' },
  followUpIgnoreText: { color: colors.gray },
  followUpFeedback: { color: colors.accent, fontSize: 14, textAlign: 'center', fontWeight: '600' },
  resetBtn: {
    borderRadius: 10, borderWidth: 1,
    borderColor: 'rgba(200,76,76,0.45)', backgroundColor: 'rgba(200,76,76,0.15)',
    paddingVertical: 12, alignItems: 'center',
  },
  resetBtnText: { color: colors.accent, fontSize: 14, fontWeight: '600' },
});
