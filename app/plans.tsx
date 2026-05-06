import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef, useState } from 'react';
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
import { useRouter } from 'expo-router';

import { Colors } from '../constants/colors';
import {
  completePlanDay,
  getPlans,
  getPlanProgress,
  postInteraction,
  startPlan,
} from '../services/api';

type Plan = {
  id: string;
  title: string;
  description: string;
  days: number;
  theme: string;
};

type InteractionResponse = {
  response?: string;
  message?: string;
  text?: string;
};

const THEME_COLORS: Record<string, string> = {
  paz: '#5DCAA5',
  clareza: Colors.gold,
  coragem: '#E07B5A',
};

async function resolveDeviceId(): Promise<string> {
  let id = await AsyncStorage.getItem('device_id');
  if (!id) {
    id = `device_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    await AsyncStorage.setItem('device_id', id);
  }
  return id;
}

export default function PlansScreen() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [activePlanId, setActivePlanId] = useState('');
  const [currentDay, setCurrentDay] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [startingPlanId, setStartingPlanId] = useState('');
  const [startError, setStartError] = useState('');
  const [dayReflection, setDayReflection] = useState('');
  const [isLoadingReflection, setIsLoadingReflection] = useState(false);
  const [dayCompleted, setDayCompleted] = useState(false);
  const [isCompletingDay, setIsCompletingDay] = useState(false);
  const reflectionOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const id = await resolveDeviceId();
        setUserId(id);
        console.log('[plans] device_id:', id);

        const [plansRes, progressRes] = await Promise.all([
          getPlans(),
          getPlanProgress(id),
        ]);
        setPlans(plansRes.data as Plan[]);
        const progress = progressRes.data as { plan_id: string | null; current_day: number };
        console.log('[plans] progress:', progress);
        if (progress.plan_id) {
          setActivePlanId(progress.plan_id);
          setCurrentDay(progress.current_day);
        }
      } catch (err: any) {
        console.log('[plans] load error:', err?.response?.data ?? err?.message ?? err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const activePlan = plans.find((p) => p.id === activePlanId) ?? null;
  const progressPct = activePlan
    ? Math.min(((currentDay - 1) / activePlan.days) * 100, 100)
    : 0;
  const planCompleted = activePlan ? currentDay > activePlan.days : false;

  const handleStartPlan = async (planId: string) => {
    setStartingPlanId(planId);
    setStartError('');
    try {
      console.log('[plans] startPlan planId:', planId, 'userId:', userId);
      await startPlan(planId, userId);
      console.log('[plans] startPlan success');
      setActivePlanId(planId);
      setCurrentDay(1);
      setDayReflection('');
      setDayCompleted(false);
    } catch (err: any) {
      const detail = err?.response?.data?.details ?? err?.response?.data?.error ?? err?.message ?? String(err);
      console.log('[plans] startPlan error:', detail);
      setStartError(`Não foi possível iniciar o plano. ${detail}`);
    } finally {
      setStartingPlanId('');
    }
  };

  const handleFetchDayReflection = async () => {
    if (!activePlan || isLoadingReflection) return;
    setIsLoadingReflection(true);
    setDayReflection('');
    try {
      const message = `Dia ${currentDay} do plano ${activePlan.title}: gere uma reflexão de 100 palavras sobre o tema ${activePlan.theme} com um versículo bíblico e uma ação prática para hoje.`;
      const res = await postInteraction('devocional', message);
      const data = (res.data ?? {}) as InteractionResponse;
      const text = data.response ?? data.message ?? data.text ?? 'Sem reflexão disponível.';
      setDayReflection(text);
      reflectionOpacity.setValue(0);
      Animated.timing(reflectionOpacity, { toValue: 1, duration: 320, useNativeDriver: true }).start();
    } catch (err: any) {
      console.log('[plans] fetchDayReflection error:', err?.message ?? err);
      setDayReflection('Não foi possível carregar a reflexão.');
    } finally {
      setIsLoadingReflection(false);
    }
  };

  const handleCompleteDay = async () => {
    if (!activePlan || isCompletingDay) return;
    setIsCompletingDay(true);
    try {
      await completePlanDay(activePlan.id, currentDay, userId);
      console.log('[plans] day completed:', currentDay);
      setCurrentDay((d) => d + 1);
      setDayCompleted(true);
      setDayReflection('');
    } catch (err: any) {
      console.log('[plans] completeDay error:', err?.response?.data ?? err?.message ?? err);
    } finally {
      setIsCompletingDay(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <Text style={styles.title}>PLANOS</Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={Colors.gold} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

            {/* Active plan */}
            {activePlan && (
              <View style={styles.activePlanCard}>
                <View style={styles.activePlanHeader}>
                  <Text style={styles.activePlanLabel}>PLANO ATIVO</Text>
                  <Text style={[styles.themeTag, { color: THEME_COLORS[activePlan.theme] ?? Colors.gold }]}>
                    {activePlan.theme.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.activePlanTitle}>{activePlan.title}</Text>

                <View style={styles.progressRow}>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${progressPct}%` as any }]} />
                  </View>
                  <Text style={styles.progressLabel}>
                    {planCompleted ? 'Concluído ✓' : `Dia ${currentDay} de ${activePlan.days}`}
                  </Text>
                </View>

                {!planCompleted && (
                  <>
                    {!dayReflection && !dayCompleted && (
                      <Pressable
                        onPress={handleFetchDayReflection}
                        disabled={isLoadingReflection}
                        style={styles.dayButton}
                      >
                        {isLoadingReflection ? (
                          <ActivityIndicator color={Colors.gold} />
                        ) : (
                          <Text style={styles.dayButtonText}>Fazer Dia {currentDay}</Text>
                        )}
                      </Pressable>
                    )}

                    {dayReflection ? (
                      <>
                        <Animated.View style={[styles.reflectionBox, { opacity: reflectionOpacity }]}>
                          <Text style={styles.reflectionText}>{dayReflection}</Text>
                        </Animated.View>
                        {!dayCompleted && (
                          <Pressable
                            onPress={handleCompleteDay}
                            disabled={isCompletingDay}
                            style={styles.completeButton}
                          >
                            {isCompletingDay ? (
                              <ActivityIndicator color={Colors.gold} />
                            ) : (
                              <Text style={styles.completeButtonText}>Concluir Dia {currentDay} ✓</Text>
                            )}
                          </Pressable>
                        )}
                      </>
                    ) : null}

                    {dayCompleted && (
                      <Text style={styles.dayDoneText}>Dia {currentDay - 1} concluído! Continue amanhã.</Text>
                    )}
                  </>
                )}

                {planCompleted && (
                  <Text style={styles.dayDoneText}>Você completou o plano! 🎉</Text>
                )}
              </View>
            )}

            {/* Available plans */}
            <Text style={styles.sectionTitle}>
              {activePlan ? 'Outros Planos' : 'Escolha um Plano'}
            </Text>

            {startError ? (
              <Text style={styles.errorText}>{startError}</Text>
            ) : null}

            {plans
              .filter((p) => p.id !== activePlanId)
              .map((plan) => (
                <View key={plan.id} style={styles.planCard}>
                  <View style={styles.planCardHeader}>
                    <Text style={[styles.themeTag, { color: THEME_COLORS[plan.theme] ?? Colors.gold }]}>
                      {plan.theme.toUpperCase()}
                    </Text>
                    <Text style={styles.planDays}>{plan.days} dias</Text>
                  </View>
                  <Text style={styles.planTitle}>{plan.title}</Text>
                  <Text style={styles.planDescription}>{plan.description}</Text>
                  <Pressable
                    onPress={() => handleStartPlan(plan.id)}
                    disabled={!!startingPlanId}
                    style={styles.startButton}
                  >
                    {startingPlanId === plan.id ? (
                      <ActivityIndicator color={Colors.gold} />
                    ) : (
                      <Text style={styles.startButtonText}>Iniciar Plano</Text>
                    )}
                  </Pressable>
                </View>
              ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.surface },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 6, paddingBottom: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, position: 'relative' },
  backButton: { position: 'absolute', left: 0, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: Colors.textPrimary, fontSize: 24, lineHeight: 24 },
  title: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { paddingBottom: 24 },

  activePlanCard: {
    borderRadius: 14,
    backgroundColor: 'rgba(200,76,76,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(200,76,76,0.25)',
    padding: 16,
    marginBottom: 24,
    gap: 10,
  },
  activePlanHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  activePlanLabel: { color: Colors.textTertiary, fontSize: 11, fontWeight: '500', letterSpacing: 0.8, textTransform: 'uppercase' },
  activePlanTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: '600' },
  themeTag: { fontSize: 11, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase' },

  progressRow: { gap: 6 },
  progressTrack: { height: 4, borderRadius: 2, backgroundColor: 'rgba(0,0,0,0.08)', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2, backgroundColor: Colors.gold },
  progressLabel: { color: Colors.textSecondary, fontSize: 13 },

  dayButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.gold,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(200,76,76,0.1)',
    minHeight: 44,
    justifyContent: 'center',
  },
  dayButtonText: { color: Colors.gold, fontSize: 15, fontWeight: '600' },

  reflectionBox: {
    borderRadius: 12,
    backgroundColor: Colors.surfaceDeep,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  reflectionText: { color: Colors.cream, fontSize: 15, lineHeight: 24 },

  completeButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#5DCAA5',
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(93,202,165,0.12)',
    minHeight: 44,
    justifyContent: 'center',
  },
  completeButtonText: { color: '#5DCAA5', fontSize: 15, fontWeight: '600' },
  dayDoneText: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center' },

  sectionTitle: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 12 },
  errorText: { color: '#E07B5A', fontSize: 13, marginBottom: 12, textAlign: 'center' },

  planCard: {
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    padding: 16,
    marginBottom: 12,
    gap: 8,
  },
  planCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planDays: { color: Colors.textTertiary, fontSize: 12 },
  planTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: '600' },
  planDescription: { color: Colors.textSecondary, fontSize: 14, lineHeight: 20 },

  startButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(200,76,76,0.45)',
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(200,76,76,0.08)',
    minHeight: 40,
    justifyContent: 'center',
    marginTop: 4,
  },
  startButtonText: { color: Colors.gold, fontSize: 14, fontWeight: '600' },
});
