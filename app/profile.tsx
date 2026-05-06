import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BottomNav from '../components/BottomNav';
import Header from '../components/Header';
import { Colors } from '../constants/colors';
import { getProfile } from '../services/api';

type PatternKey = 'conforto' | 'confronto' | 'direcao' | 'duvida';
type OnboardingMap = Record<string, string>;

type ProfileResponse = {
  streak_days?: number;
  streak?: number;
  patterns?: Partial<Record<PatternKey, number>>;
  onboarding_answers?: OnboardingMap;
};

const QUESTION_LABELS = [
  { key: 'life_phase', label: 'Fase da vida' },
  { key: 'main_struggle', label: 'Maior luta' },
  { key: 'faith_level', label: 'Caminhada espiritual' },
];

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
    insight: 'Você reage mais quando é desafiado. Isso é coragem disfarçada de desconforto — continue enfrentando.',
  },
  direcao: {
    title: 'Você busca direção',
    insight: 'Mais do que conforto, você quer agir. Esse desejo de movimento é um chamado — siga-o.',
  },
  conforto: {
    title: 'Você encontra paz',
    insight: 'Você tem recebido mais conforto do que confronto. Cuide para não evitar o que precisa ser enfrentado.',
  },
  duvida: {
    title: 'Você chega com dúvidas',
    insight: 'Duvidar é honesto. Continue chegando mesmo sem certeza — a fé não exige respostas, exige presença.',
  },
};

export default function ProfileScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [patterns, setPatterns] = useState<Record<PatternKey, number>>(DEFAULT_PATTERNS);
  const [streakDays, setStreakDays] = useState(0);
  const [onboardingAnswers, setOnboardingAnswers] = useState<OnboardingMap>({});
  const [profileErrorMessage, setProfileErrorMessage] = useState('');

  const appVersion = useMemo(() => Constants.expoConfig?.version ?? '1.0.0', []);

  const total = useMemo(
    () => Object.values(patterns).reduce((a, b) => a + b, 0),
    [patterns]
  );

  const dominantKey = useMemo<PatternKey | null>(() => {
    if (total === 0) return null;
    const max = Math.max(...Object.values(patterns));
    const entry = Object.entries(patterns).find(([, v]) => v === max);
    return entry ? (entry[0] as PatternKey) : null;
  }, [patterns, total]);

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const response = await getProfile();
        const data = (response.data ?? {}) as ProfileResponse;
        setPatterns({
          conforto: data.patterns?.conforto ?? 0,
          confronto: data.patterns?.confronto ?? 0,
          direcao: data.patterns?.direcao ?? 0,
          duvida: data.patterns?.duvida ?? 0,
        });
        setStreakDays(data.streak_days ?? data.streak ?? 0);
        if (data.onboarding_answers) {
          setOnboardingAnswers(data.onboarding_answers);
        } else {
          const local = await AsyncStorage.getItem('onboarding_answers');
          setOnboardingAnswers(local ? JSON.parse(local) : {});
        }
      } catch {
        const local = await AsyncStorage.getItem('onboarding_answers');
        setOnboardingAnswers(local ? JSON.parse(local) : {});
        setProfileErrorMessage('Erro ao carregar perfil. Mostrando dados salvos localmente.');
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);

  const insight = dominantKey ? DOMINANT_INSIGHTS[dominantKey] : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <View style={styles.container}>
        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={Colors.gold} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

            <View style={styles.diagnosticoCard}>
              <Text style={styles.diagnosticoLabel}>DIAGNÓSTICO ESPIRITUAL</Text>
              {insight ? (
                <>
                  <Text style={styles.diagnosticoTitle} numberOfLines={undefined}>{insight.title}</Text>
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
                        <Text style={[styles.barLabel, isDominant && styles.barLabelDominant]}>
                          {p.label}
                        </Text>
                        <View style={styles.barTrack}>
                          <View style={[styles.barFill, { width: `${pct}%` }, isDominant && styles.barFillDominant]} />
                        </View>
                        <Text style={styles.barPct}>{pct}%</Text>
                      </View>
                    );
                  })}
                </View>
              )}

              {profileErrorMessage ? (
                <Text style={styles.inlineErrorText}>{profileErrorMessage}</Text>
              ) : null}
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
                      {onboardingAnswers[item.key] ?? 'Ainda não respondido'}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

          </ScrollView>
        )}

        <Text style={styles.footerVersion}>Versão {appVersion}</Text>
      </View>
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 10,
  },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingBottom: 20, gap: 16 },
  diagnosticoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  diagnosticoLabel: {
    color: Colors.gold,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  diagnosticoTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 26,
  },
  diagnosticoInsight: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  diagnosticoEmpty: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  barsContainer: { gap: 10 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barEmoji: { fontSize: 14 },
  barLabel: { width: 70, color: Colors.textSecondary, fontSize: 12 },
  barLabelDominant: { color: Colors.textPrimary, fontWeight: '600' },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: { height: '100%', backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 3 },
  barFillDominant: { backgroundColor: Colors.gold },
  barPct: { width: 36, textAlign: 'right', color: Colors.textSecondary, fontSize: 11 },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: { color: Colors.textPrimary, fontSize: 14, fontWeight: '500', marginBottom: 10 },
  streakCard: {
    backgroundColor: Colors.surfaceDeep,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  streakValue: { color: Colors.goldLight, fontSize: 38, fontWeight: '500', lineHeight: 42 },
  streakLabel: { marginTop: 4, color: Colors.textSecondary, fontSize: 12 },
  answersList: { gap: 10 },
  answerItem: {
    backgroundColor: Colors.surfaceDeep,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  answerQuestion: { color: Colors.textTertiary, fontSize: 11, marginBottom: 4 },
  answerValue: { color: Colors.textPrimary, fontSize: 13, lineHeight: 18 },
  inlineErrorText: {
    marginTop: 10,
    color: Colors.textSecondary,
    fontSize: 13,
  },
  footerVersion: { color: Colors.textTertiary, fontSize: 11, textAlign: 'center', marginTop: 6 },
});
