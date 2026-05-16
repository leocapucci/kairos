import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, EmptyState, Loading } from '../src/design-system';
import { usePlansData } from '../src/query/hooks/usePlans';
import { postInteraction } from '../services/api';
import { animation, colors, radius, spacing } from '../theme';
import { E, track } from '../src/analytics';
import { useScreenTracking } from '../src/hooks/useScreenTracking';

type InteractionResponse = {
  response?: string;
  message?: string;
  text?: string;
};

const THEME_COLORS: Record<string, string> = {
  paz: colors.teal,
  clareza: colors.gold,
  coragem: colors.coral,
};

export default function PlansScreen() {
  const router = useRouter();
  const { plans, progress, isLoading, startPlanMutation, completeDayMutation } = usePlansData();
  const [dayReflection, setDayReflection] = useState('');
  const [dayCompleted, setDayCompleted] = useState(false);
  const reflectionOpacity = useRef(new Animated.Value(0)).current;

  useScreenTracking('plans');

  const activePlanId = progress?.plan_id ?? '';
  const currentDay = progress?.current_day ?? 1;
  const activePlan = plans.find((p) => p.id === activePlanId) ?? null;
  const progressPct = activePlan
    ? Math.min(((currentDay - 1) / activePlan.days) * 100, 100)
    : 0;
  const planCompleted = activePlan ? currentDay > activePlan.days : false;

  const reflectionMutation = useMutation({
    mutationFn: (message: string) => postInteraction('devocional', message),
    onSuccess: (res) => {
      const data = (res as { data: InteractionResponse }).data;
      const text = data.response ?? data.message ?? data.text ?? 'Sem reflexão disponível.';
      setDayReflection(text);
      reflectionOpacity.setValue(0);
      Animated.timing(reflectionOpacity, {
        toValue: 1,
        duration: animation.normal,
        useNativeDriver: true,
      }).start();
    },
    onError: () => {
      setDayReflection('Não foi possível carregar a reflexão.');
    },
  });

  const handleFetchDayReflection = () => {
    if (!activePlan || reflectionMutation.isPending) return;
    track(E.PLAN_DAY_REFLECTION_STARTED, { plan_id: activePlan.id, day: currentDay });
    const message = `Dia ${currentDay} do plano ${activePlan.title}: gere uma reflexão de 100 palavras sobre o tema ${activePlan.theme} com um versículo bíblico e uma ação prática para hoje.`;
    setDayReflection('');
    reflectionMutation.mutate(message);
  };

  const handleCompleteDay = () => {
    if (!activePlan || completeDayMutation.isPending) return;
    completeDayMutation.mutate(
      { planId: activePlan.id, day: currentDay },
      {
        onSuccess: () => {
          track(E.PLAN_DAY_COMPLETED, { plan_id: activePlan.id, day: currentDay });
          setDayCompleted(true);
          setDayReflection('');
        },
      },
    );
  };

  const startError = startPlanMutation.error
    ? startPlanMutation.error instanceof Error
      ? startPlanMutation.error.message
      : 'Erro ao iniciar plano.'
    : '';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <Text style={styles.title}>PLANOS</Text>
        </View>

        {isLoading ? (
          <Loading message="Carregando seus planos..." flex />
        ) : (
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {activePlan && (
              <Card variant="accent" padding="md" style={styles.activePlanCardWrap}>
                <View style={styles.activePlanHeader}>
                  <Text style={styles.activePlanLabel}>PLANO ATIVO</Text>
                  <Text
                    style={[
                      styles.themeTag,
                      { color: THEME_COLORS[activePlan.theme] ?? colors.gold },
                    ]}
                  >
                    {activePlan.theme.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.activePlanTitle}>{activePlan.title}</Text>

                <View style={styles.progressRow}>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${progressPct}%` as `${number}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressLabel}>
                    {planCompleted ? 'Concluído ✓' : `Dia ${currentDay} de ${activePlan.days}`}
                  </Text>
                </View>

                {!planCompleted && (
                  <>
                    {!dayReflection && !dayCompleted && (
                      <Button
                        variant="outline"
                        label={`Fazer Dia ${currentDay}`}
                        onPress={handleFetchDayReflection}
                        disabled={reflectionMutation.isPending}
                        loading={reflectionMutation.isPending}
                      />
                    )}

                    {dayReflection ? (
                      <>
                        <Animated.View
                          style={[styles.reflectionBox, { opacity: reflectionOpacity }]}
                        >
                          <Text style={styles.reflectionText}>{dayReflection}</Text>
                        </Animated.View>
                        {!dayCompleted && (
                          <Button
                            variant="sage"
                            label={`Concluir Dia ${currentDay} ✓`}
                            onPress={handleCompleteDay}
                            disabled={completeDayMutation.isPending}
                            loading={completeDayMutation.isPending}
                          />
                        )}
                      </>
                    ) : null}

                    {dayCompleted && (
                      <Text style={styles.dayDoneText}>
                        Dia {currentDay - 1} concluído! Continue amanhã.
                      </Text>
                    )}
                  </>
                )}

                {planCompleted && (
                  <Text style={styles.dayDoneText}>Você completou o plano! 🎉</Text>
                )}
              </Card>
            )}

            <Text style={styles.sectionTitle}>
              {activePlan ? 'Outros Planos' : 'Escolha um Plano'}
            </Text>

            {startError ? <Text style={styles.errorText}>{startError}</Text> : null}

            {plans.filter((p) => p.id !== activePlanId).length === 0 && (
              <EmptyState
                icon="📖"
                title="Nenhum plano por aqui ainda"
                description="Novos planos chegam em breve. Volte logo."
              />
            )}

            {plans
              .filter((p) => p.id !== activePlanId)
              .map((plan) => (
                <Card key={plan.id} variant="default" padding="md" style={styles.planCardWrap}>
                  <View style={styles.planCardHeader}>
                    <Text
                      style={[
                        styles.themeTag,
                        { color: THEME_COLORS[plan.theme] ?? colors.gold },
                      ]}
                    >
                      {plan.theme.toUpperCase()}
                    </Text>
                    <Text style={styles.planDays}>{plan.days} dias</Text>
                  </View>
                  <Text style={styles.planTitle}>{plan.title}</Text>
                  <Text style={styles.planDescription}>{plan.description}</Text>
                  <Button
                    variant="outline"
                    label="Iniciar Plano"
                    onPress={() =>
                      startPlanMutation.mutate(plan.id, {
                        onSuccess: () =>
                          track(E.PLAN_STARTED, { plan_id: plan.id, theme: plan.theme }),
                      })
                    }
                    disabled={startPlanMutation.isPending}
                    loading={
                      startPlanMutation.isPending && startPlanMutation.variables === plan.id
                    }
                  />
                </Card>
              ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: colors.textPrimary,
    fontSize: 24,
    lineHeight: 24,
    fontFamily: 'Inter_400Regular',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  content: { paddingBottom: spacing.lg },

  activePlanCardWrap: { gap: spacing.sm + 2, marginBottom: spacing.lg },
  activePlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activePlanLabel: {
    color: colors.textTertiary,
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  activePlanTitle: { color: colors.textPrimary, fontSize: 18, fontFamily: 'Inter_700Bold' },
  themeTag: { fontSize: 11, fontFamily: 'Inter_700Bold', letterSpacing: 0.8, textTransform: 'uppercase' },

  progressRow: { gap: spacing.xs + 2 },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 2, backgroundColor: colors.gold },
  progressLabel: { color: colors.textSecondary, fontSize: 13, fontFamily: 'Inter_400Regular' },

  reflectionBox: {
    borderRadius: radius.sm + 4,
    backgroundColor: colors.surfaceDeep,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: 14,
  },
  reflectionText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    lineHeight: 24,
  },
  dayDoneText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },

  sectionTitle: {
    color: colors.grayOrganic,
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: spacing.sm + 4,
  },
  errorText: {
    color: colors.coral,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    marginBottom: spacing.sm + 4,
    textAlign: 'center',
  },

  planCardWrap: { gap: spacing.sm, marginBottom: spacing.sm + 4 },
  planCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planDays: { color: colors.textTertiary, fontSize: 12, fontFamily: 'Inter_400Regular' },
  planTitle: { color: colors.textPrimary, fontSize: 16, fontFamily: 'Inter_700Bold' },
  planDescription: {
    color: colors.textSecondary,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
  },
});
