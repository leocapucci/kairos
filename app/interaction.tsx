import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useReducer, useRef, useState } from 'react';
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
import {
  INITIAL_STATE,
  InteractionAction,
  interactionReducer,
  isError,
  isRevealed,
  isSubmitting,
} from '../src/reducers/interaction';
import { postInteraction } from '../services/api';
import { shareKairos } from '../src/services/api/share';
import { parseUnknownError } from '../src/utils/errors';
import { animation, colors, dark, radius, spacing } from '../theme';
import { E, track } from '../src/analytics';
import { ONBOARDING_ANSWERS_KEY } from './onboarding';
import { useScreenTracking } from '../src/hooks/useScreenTracking';

const LAST_FOLLOWUP_KEY = 'kairos_last_followup_v1';

type CardType = 'conforto' | 'confronto' | 'crescimento' | 'devocional';

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

function extractText(data: { response?: string; message?: string; text?: string }): string {
  return stripMarkdown(data.response ?? data.message ?? data.text ?? 'Sem resposta no momento.');
}

export default function InteractionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string; text?: string; daily_message_id?: string }>();

  const [state, dispatch] = useReducer(interactionReducer, INITIAL_STATE);
  const [onboardingContext, setOnboardingContext] = useState<string | undefined>(undefined);
  useScreenTracking('interaction');

  // Load onboarding context once — injected into Claude calls for personalization
  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_ANSWERS_KEY).then((raw) => {
      if (!raw) return;
      try {
        const answers = JSON.parse(raw) as Record<string, string>;
        const parts: string[] = [];
        if (answers.main_struggle) parts.push(`luta principal: ${answers.main_struggle}`);
        if (answers.life_phase) parts.push(`fase da vida: ${answers.life_phase}`);
        if (answers.faith_level) parts.push(`caminhada espiritual: ${answers.faith_level}`);
        if (parts.length > 0) setOnboardingContext(parts.join(', '));
      } catch {}
    }).catch(() => {});
  }, []);

  // Single AbortController — cancelled on new request or unmount
  const abortRef = useRef<AbortController | null>(null);
  // Timestamp of the last REACT dispatch — used to compute latency
  const reactStartRef = useRef(0);

  // Animated values — driven by state, never drive state
  const replyOpacity = useRef(new Animated.Value(0)).current;
  const deepOpacity = useRef(new Animated.Value(0)).current;

  // Cancel in-flight request on unmount
  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  // Animate reply in when phase first becomes 'revealed'
  useEffect(() => {
    if (state.phase !== 'revealed') return;
    replyOpacity.setValue(0);
    Animated.timing(replyOpacity, {
      toValue: 1,
      duration: animation.normal,
      useNativeDriver: false,
    }).start();
  }, [state.phase, replyOpacity]);

  // Animate deep reply in when deep phase becomes 'revealed'
  const deepPhase = isRevealed(state) ? state.deep.phase : 'idle';
  useEffect(() => {
    if (deepPhase !== 'revealed') return;
    deepOpacity.setValue(0);
    Animated.timing(deepOpacity, {
      toValue: 1,
      duration: animation.normal,
      useNativeDriver: false,
    }).start();
  }, [deepPhase, deepOpacity]);

  const cardType: CardType = (() => {
    const raw = params.type ?? 'conforto';
    return raw === 'conforto' || raw === 'confronto' || raw === 'crescimento' || raw === 'devocional'
      ? raw : 'conforto';
  })();

  const cardText = (() => {
    const t = typeof params.text === 'string' ? params.text.trim() : '';
    return t || FALLBACK_BY_TYPE[cardType];
  })();

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleReaction = useCallback(async (btn: typeof REACTION_BUTTONS[number]) => {
    dispatch({ type: 'REACT', buttonId: btn.id } as InteractionAction);
    reactStartRef.current = Date.now();
    track(E.INTERACTION_STARTED, { card_type: cardType, button_id: btn.id });

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await postInteraction(
        cardType,
        `${btn.message} Conteúdo: "${cardText}"`,
        ctrl.signal,
        onboardingContext,
      );
      if (ctrl.signal.aborted) {
        track(E.INTERACTION_ABORTED, { card_type: cardType, button_id: btn.id });
        return;
      }
      dispatch({ type: 'REACT_SUCCESS', text: extractText(res.data) });
      track(E.INTERACTION_COMPLETED, {
        card_type: cardType,
        button_id: btn.id,
        latency_ms: Date.now() - reactStartRef.current,
      });
    } catch (err) {
      if (ctrl.signal.aborted) {
        track(E.INTERACTION_ABORTED, { card_type: cardType, button_id: btn.id });
        return;
      }
      dispatch({ type: 'REACT_ERROR', message: parseUnknownError(err) });
      track(E.INTERACTION_FAILED, { card_type: cardType, button_id: btn.id, error: String(err) });
    }
  }, [cardType, cardText, onboardingContext]);

  const handleDeep = useCallback(async (btn: typeof DEEP_BUTTONS[number]) => {
    if (!isRevealed(state)) return;
    const replyText = state.replyText;

    dispatch({ type: 'DEEP', buttonId: btn.id });
    const deepStart = Date.now();
    track(E.DEEP_REFLECTION_STARTED, { button_id: btn.id, card_type: cardType });

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const message = `${btn.prompt} Contexto: "${cardText}". Resposta anterior: "${replyText}". Sem perguntas ao usuário.`;
      const res = await postInteraction('devocional', message, ctrl.signal);
      if (ctrl.signal.aborted) return;
      dispatch({ type: 'DEEP_SUCCESS', text: extractText(res.data) });
      track(E.DEEP_REFLECTION_COMPLETED, {
        button_id: btn.id,
        latency_ms: Date.now() - deepStart,
      });
    } catch (err) {
      if (ctrl.signal.aborted) return;
      dispatch({ type: 'DEEP_ERROR', message: parseUnknownError(err) });
      track(E.DEEP_REFLECTION_FAILED, { button_id: btn.id, error: String(err) });
    }
  }, [state, cardText, cardType]);

  const handleShare = useCallback(() => {
    if (!isRevealed(state)) return;
    track(E.INTERACTION_SHARED, { card_type: cardType });
    shareKairos(state.replyText);
  }, [state, cardType]);

  const handleReset = useCallback(() => {
    abortRef.current?.abort();
    dispatch({ type: 'RESET' });
  }, []);

  // ─── Render ──────────────────────────────────────────────────────────────────

  const showReactions = state.phase === 'idle' || state.phase === 'error' || state.phase === 'submitting';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <Text style={styles.typeTag}>{cardType.toUpperCase()}</Text>
        </View>

        {showReactions ? (
          <>
            <Text style={styles.cardText}>{cardText}</Text>

            <View style={styles.reactionsContainer}>
              {REACTION_BUTTONS.map((btn) => (
                <View key={btn.id} style={styles.reactionWrapper}>
                  <ReactionButton
                    emoji={btn.emoji}
                    label={btn.label}
                    onPress={() => handleReaction(btn)}
                    selected={isSubmitting(state) || isError(state) ? state.buttonId === btn.id : false}
                    disabled={isSubmitting(state)}
                    dark
                  />
                </View>
              ))}
            </View>

            {isSubmitting(state) && (
              <View style={styles.loader}>
                <ActivityIndicator color={colors.sage} />
              </View>
            )}
            {isError(state) && (
              <>
                <Text style={styles.errorText}>{state.message}</Text>
                <Pressable onPress={() => dispatch({ type: 'RETRY' })} style={styles.retryBtn}>
                  <Text style={styles.retryBtnText}>Tentar novamente</Text>
                </Pressable>
              </>
            )}
          </>
        ) : isRevealed(state) ? (
          <Animated.View style={[styles.replyContainer, { opacity: replyOpacity }]}>
            <ScrollView
              style={styles.replyScroll}
              contentContainerStyle={styles.replyScrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.replyText}>{state.replyText}</Text>

              <Pressable onPress={handleShare} style={styles.shareBtn}>
                <Text style={styles.shareBtnText}>Compartilhar</Text>
              </Pressable>

              {/* Deep follow-up buttons — hidden once a deep button is chosen */}
              {state.deep.phase === 'idle' && (
                <View style={styles.deepBtns}>
                  {DEEP_BUTTONS.map((btn) => (
                    <Pressable key={btn.id} onPress={() => handleDeep(btn)} style={styles.deepBtn}>
                      <Text style={styles.deepBtnText}>{btn.label}</Text>
                    </Pressable>
                  ))}
                </View>
              )}

              {state.deep.phase === 'loading' && (
                <View style={styles.loader}>
                  <ActivityIndicator color={colors.sage} />
                </View>
              )}

              {state.deep.phase === 'revealed' && (
                <Animated.View style={{ opacity: deepOpacity }}>
                  <Text style={styles.deepReplyText}>{state.deep.text}</Text>
                </Animated.View>
              )}

              {state.deep.phase === 'error' && (
                <Text style={styles.errorText}>{state.deep.message}</Text>
              )}

              {/* Follow-up commitment */}
              {!state.followUp && (
                <View style={styles.followUpContainer}>
                  <Text style={styles.followUpLabel}>O que você quer fazer com isso?</Text>
                  <Pressable
                    onPress={() => {
                      dispatch({ type: 'FOLLOW_UP', choice: 'hoje' });
                      track(E.FOLLOW_UP_CHOSEN, { choice: 'hoje', card_type: cardType });
                      const today = new Date().toISOString().slice(0, 10);
                      AsyncStorage.setItem(
                        LAST_FOLLOWUP_KEY,
                        JSON.stringify({ choice: 'hoje', date: today, cardType })
                      ).catch(() => {});
                    }}
                    style={({ pressed }) => [
                      styles.followUpBtnHoje,
                      pressed && { opacity: 0.85 },
                    ]}
                  >
                    <Text style={styles.followUpTextHoje}>Hoje 🔥</Text>
                    <Text style={styles.followUpHojeSubtitle}>Vou colocar em prática agora</Text>
                  </Pressable>
                  <View style={styles.followUpRow}>
                    <Pressable
                      onPress={() => {
                        dispatch({ type: 'FOLLOW_UP', choice: 'depois' });
                        track(E.FOLLOW_UP_CHOSEN, { choice: 'depois', card_type: cardType });
                      }}
                      style={styles.followUpBtn}
                    >
                      <Text style={styles.followUpText}>Depois ⏰</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => router.back()}
                      style={[styles.followUpBtn, styles.followUpIgnore]}
                    >
                      <Text style={[styles.followUpText, styles.followUpIgnoreText]}>Ignorar</Text>
                    </Pressable>
                  </View>
                </View>
              )}
              {state.followUp === 'hoje' && (
                <Text style={styles.followUpFeedback}>
                  🔥 Você decidiu agir — que isso se torne realidade hoje.
                </Text>
              )}
              {state.followUp === 'depois' && (
                <Text style={styles.followUpFeedback}>
                  Combinado. Volte quando estiver pronto.
                </Text>
              )}

              <Pressable onPress={handleReset} style={styles.resetBtn}>
                <Text style={styles.resetBtnText}>Voltar</Text>
              </Pressable>
            </ScrollView>
          </Animated.View>
        ) : null}
      </View>

      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surfaceDark,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    height: 40,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: dark.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  backIcon: {
    color: dark.textWeak,
    fontSize: 22,
    lineHeight: 22,
    marginTop: -2,
    fontFamily: 'Inter_400Regular',
  },
  typeTag: {
    color: colors.sage,
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 2,
  },

  cardText: {
    color: dark.textStrong,
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
    marginTop: spacing.xl + spacing.lg,
    lineHeight: 44,
    letterSpacing: -0.5,
  },
  reactionsContainer: {
    marginTop: spacing.xl + spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  reactionWrapper: {
    width: '48%',
  },
  loader: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  errorText: {
    color: colors.coral,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  retryBtn: {
    alignSelf: 'center',
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: dark.border,
  },
  retryBtnText: {
    color: dark.textWeak,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },

  replyContainer: {
    flex: 1,
  },
  replyScroll: {
    flex: 1,
  },
  replyScrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  replyText: {
    color: dark.text,
    fontSize: 20,
    lineHeight: 32,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.1,
    marginTop: spacing.lg,
  },
  shareBtn: {
    alignSelf: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  shareBtnText: {
    color: dark.textGhost,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  deepBtns: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  deepBtn: {
    backgroundColor: dark.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: dark.borderSoft,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  deepBtnText: {
    color: dark.textWeak,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  deepReplyText: {
    color: dark.textMid,
    fontSize: 17,
    lineHeight: 28,
    fontFamily: 'Inter_400Regular',
    borderTopWidth: 1,
    borderTopColor: dark.borderSoft,
    paddingTop: spacing.md,
  },
  followUpContainer: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  followUpLabel: {
    color: dark.textWeak,
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  followUpBtnHoje: {
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.sage,
    backgroundColor: dark.sageSurface,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: 2,
  },
  followUpTextHoje: {
    color: colors.sage,
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.2,
  },
  followUpHojeSubtitle: {
    color: colors.sage,
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    opacity: 0.7,
  },
  followUpRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  followUpBtn: {
    flex: 1,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: dark.border,
    backgroundColor: dark.surface,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  followUpText: {
    color: dark.textWeak,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  followUpIgnore: {
    borderColor: dark.borderSoft,
    backgroundColor: 'transparent',
  },
  followUpIgnoreText: {
    color: dark.textFaint,
  },
  followUpFeedback: {
    color: colors.sage,
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
  resetBtn: {
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: dark.border,
    backgroundColor: dark.surface,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  resetBtnText: {
    color: dark.textWeak,
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
});
