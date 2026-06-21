import Constants from 'expo-constants';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BottomNav from '../components/BottomNav';
import Header from '../components/Header';
import {
  loadLocalOnboardingAnswers,
  useProfileQuery,
} from '../src/query/hooks/useProfileQuery';
import { colors, radius, spacing } from '../theme';
import { useScreenTracking } from '../src/hooks/useScreenTracking';
import { useAuth } from '../src/auth';

type PatternKey = 'conforto' | 'confronto' | 'direcao' | 'duvida';
type OnboardingMap = Record<string, string>;

const QUESTION_LABELS = [
  { key: 'life_phase', label: 'Fase da vida' },
  { key: 'main_struggle', label: 'Maior luta' },
  { key: 'faith_level', label: 'Caminhada espiritual' },
];

// Raw onboarding values → readable PT-BR labels (see app/onboarding.tsx).
const ANSWER_LABELS: Record<string, string> = {
  // life_phase
  adolescente: 'Adolescente',
  jovem_adulto: 'Jovem adulto',
  adulto: 'Adulto',
  maduro: 'Maduro',
  // main_struggle
  ansiedade: 'Ansiedade',
  relacionamento: 'Relacionamentos',
  proposito: 'Propósito',
  fe: 'Fé',
  financeiro: 'Financeiro',
  luto: 'Luto',
  // faith_level
  iniciando: 'Iniciando',
  retomando: 'Retomando',
  crescendo: 'Crescendo',
  firme: 'Firme',
};

// Generic fallback for unknown values: replace "_" with spaces and capitalize.
function formatAnswer(raw?: string): string {
  if (!raw) return 'Ainda não respondido';
  if (ANSWER_LABELS[raw]) return ANSWER_LABELS[raw];
  const spaced = raw.replace(/_/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

const DEFAULT_PATTERNS: Record<PatternKey, number> = {
  conforto: 0,
  confronto: 0,
  direcao: 0,
  duvida: 0,
};

const PATTERN_CONFIG = [
  { key: 'conforto' as PatternKey, emoji: '🙏', label: 'Paz' },
  { key: 'confronto' as PatternKey, emoji: '⚔️', label: 'Confronto' },
  { key: 'direcao' as PatternKey, emoji: '🧭', label: 'Direção' },
  { key: 'duvida' as PatternKey, emoji: '❓', label: 'Dúvida' },
];

const DOMINANT_INSIGHTS: Record<PatternKey, { title: string; insight: string }> = {
  confronto: {
    title: 'Você caminha pelo confronto',
    insight:
      'Você reage mais quando é desafiado. Isso é coragem disfarçada de desconforto — continue enfrentando.',
  },
  direcao: {
    title: 'Você busca direção',
    insight:
      'Mais do que conforto, você quer agir. Esse desejo de movimento é um chamado — siga-o.',
  },
  conforto: {
    title: 'Você encontra paz',
    insight:
      'Você tem recebido mais conforto do que confronto. Cuide para não evitar o que precisa ser enfrentado.',
  },
  duvida: {
    title: 'Você chega com dúvidas',
    insight:
      'Duvidar é honesto. Continue chegando mesmo sem certeza — a fé não exige respostas, exige presença.',
  },
};

export default function ProfileScreen() {
  const { data: profile, isLoading, isError } = useProfileQuery();
  const { signOut } = useAuth();
  const [onboardingAnswers, setOnboardingAnswers] = useState<OnboardingMap>({});
  // Fallback: if the query is still loading after 5s, stop blocking on the
  // spinner and render with default/local data instead of an infinite loader.
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setLoadingTimedOut(false);
      return;
    }
    const t = setTimeout(() => setLoadingTimedOut(true), 5000);
    return () => clearTimeout(t);
  }, [isLoading]);

  // Degraded mode: API errored, or it timed out while still loading.
  const degraded = isError || (isLoading && loadingTimedOut);

  useScreenTracking('profile');

  const appVersion = useMemo(() => Constants.expoConfig?.version ?? '1.0.0', []);

  const patterns: Record<PatternKey, number> = useMemo(
    () => ({
      conforto: profile?.patterns?.conforto ?? DEFAULT_PATTERNS.conforto,
      confronto: profile?.patterns?.confronto ?? DEFAULT_PATTERNS.confronto,
      direcao: profile?.patterns?.direcao ?? DEFAULT_PATTERNS.direcao,
      duvida: profile?.patterns?.duvida ?? DEFAULT_PATTERNS.duvida,
    }),
    [profile],
  );

  const streakDays = profile?.streak_days ?? profile?.streak ?? 0;

  const total = useMemo(
    () => Object.values(patterns).reduce((a, b) => a + b, 0),
    [patterns],
  );

  const dominantKey = useMemo<PatternKey | null>(() => {
    if (total === 0) return null;
    const max = Math.max(...Object.values(patterns));
    const entry = Object.entries(patterns).find(([, v]) => v === max);
    return entry ? (entry[0] as PatternKey) : null;
  }, [patterns, total]);

  // Load onboarding answers from profile API; fall back to local AsyncStorage
  useEffect(() => {
    if (profile?.onboarding_answers) {
      setOnboardingAnswers(profile.onboarding_answers);
      return;
    }
    if (degraded || (profile !== undefined && !profile.onboarding_answers)) {
      loadLocalOnboardingAnswers().then(setOnboardingAnswers);
    }
  }, [profile, degraded]);

  const insight = dominantKey ? DOMINANT_INSIGHTS[dominantKey] : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <View style={styles.container}>
        {isLoading && !loadingTimedOut ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={colors.gold} />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.diagnosticoCard}>
              <Text style={styles.diagnosticoLabel}>DIAGNÓSTICO ESPIRITUAL</Text>
              {insight ? (
                <>
                  <Text style={styles.diagnosticoTitle} numberOfLines={undefined}>
                    {insight.title}
                  </Text>
                  <Text style={styles.diagnosticoInsight}>{insight.insight}</Text>
                </>
              ) : (
                <Text style={styles.diagnosticoEmpty}>
                  Interaja com os versículos para revelar seu padrão espiritual.
                </Text>
              )}
              {total > 0 && (
                <View style={styles.barsContainer}>
                  {PATTERN_CONFIG.map((p) => {
                    const val = patterns[p.key];
                    const pct = Math.round((val / total) * 100);
                    const isDominant = p.key === dominantKey;
                    return (
                      <View key={p.key} style={styles.barRow}>
                        <Text style={styles.barEmoji}>{p.emoji}</Text>
                        <Text
                          style={[styles.barLabel, isDominant && styles.barLabelDominant]}
                        >
                          {p.label}
                        </Text>
                        <View style={styles.barTrack}>
                          <View
                            style={[
                              styles.barFill,
                              { width: `${pct}%` },
                              isDominant && styles.barFillDominant,
                            ]}
                          />
                        </View>
                        <Text style={styles.barPct}>{pct}%</Text>
                      </View>
                    );
                  })}
                </View>
              )}

              {degraded && (
                <Text style={styles.inlineErrorText}>
                  Mostrando dados salvos localmente.
                </Text>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sequência</Text>
              <View style={styles.streakCard}>
                <Text style={styles.streakValue}>{streakDays}</Text>
                <Text style={styles.streakLabel}>dias seguidos</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sobre você</Text>
              <View style={styles.answersList}>
                {QUESTION_LABELS.map((item) => (
                  <View key={item.key} style={styles.answerItem}>
                    <Text style={styles.answerQuestion}>{item.label}</Text>
                    <Text style={styles.answerValue}>
                      {formatAnswer(onboardingAnswers[item.key])}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <Pressable
              onPress={signOut}
              style={({ pressed }) => [styles.signOutBtn, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.signOutText}>Sair da conta</Text>
            </Pressable>
          </ScrollView>
        )}

        <Text style={styles.footerVersion}>Versão {appVersion}</Text>
      </View>
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingBottom: spacing.md, gap: spacing.md },

  diagnosticoCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  diagnosticoLabel: {
    color: colors.gold,
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: spacing.sm + 2,
  },
  diagnosticoTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    marginBottom: spacing.sm,
    lineHeight: 26,
  },
  diagnosticoInsight: {
    color: colors.textSecondary,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  diagnosticoEmpty: {
    color: colors.textSecondary,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  barsContainer: { gap: spacing.sm + 2 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  barEmoji: { fontSize: 14 },
  barLabel: {
    width: 70,
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  barLabelDominant: { color: colors.textPrimary, fontFamily: 'Inter_700Bold' },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: { height: '100%', backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 3 },
  barFillDominant: { backgroundColor: colors.gold },
  barPct: {
    width: 36,
    textAlign: 'right',
    color: colors.textSecondary,
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },

  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    marginBottom: spacing.sm + 2,
  },
  streakCard: {
    backgroundColor: colors.surfaceDeep,
    borderRadius: radius.sm + 4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  streakValue: {
    color: colors.gold,
    fontSize: 38,
    fontFamily: 'Inter_400Regular',
    lineHeight: 42,
  },
  streakLabel: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  answersList: { gap: spacing.sm + 2 },
  answerItem: {
    backgroundColor: colors.surfaceDeep,
    borderRadius: radius.sm + 2,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm + 2,
  },
  answerQuestion: {
    color: colors.textTertiary,
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    marginBottom: spacing.xs,
  },
  answerValue: {
    color: colors.textPrimary,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    lineHeight: 18,
  },
  inlineErrorText: {
    marginTop: spacing.sm + 2,
    color: colors.coral,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  footerVersion: {
    color: colors.textTertiary,
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginTop: spacing.xs + 2,
  },
  signOutBtn: {
    marginTop: 32,
    marginHorizontal: 24,
    marginBottom: 16,
    paddingVertical: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(200,76,76,0.3)',
    alignItems: 'center' as const,
  },
  signOutText: {
    color: colors.coral ?? '#C84C4C',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
});
