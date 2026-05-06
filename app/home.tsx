import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BottomNav from '../components/BottomNav';
import Header from '../components/Header';
import StreakBar from '../components/StreakBar';
import DarkCard from '../components/ui/DarkCard';
import PrimaryButton from '../components/ui/PrimaryButton';
import { colors, spacing } from '../theme';
import { getDaily } from '../services/api';

type CardType = 'conforto' | 'confronto' | 'crescimento';

type DailyResponse = {
  daily_message_id?: string;
  id?: string;
  headline?: string;
  title?: string;
  conforto?: string;
  confronto?: string;
  crescimento?: string;
  cards?: Partial<Record<string, string>>;
};

const CARD_ORDER: CardType[] = ['conforto', 'confronto', 'crescimento'];

const FALLBACK: Record<CardType, string> = {
  conforto: 'Respire fundo. Hoje há cuidado para você no ordinário.',
  confronto: 'Encare com verdade o que precisa mudar dentro de você.',
  crescimento: 'Um passo fiel hoje vale mais que promessas para amanhã.',
};

const LABELS: Record<CardType, string> = {
  conforto: 'CONFORTO',
  confronto: 'CONFRONTO',
  crescimento: 'CRESCIMENTO',
};

export default function HomeScreen() {
  const router = useRouter();
  const pulse = useRef(new Animated.Value(0.3)).current;
  const [isLoading, setIsLoading] = useState(true);
  const [dailyMessageId, setDailyMessageId] = useState<string | undefined>();
  const [headline, setHeadline] = useState('');
  const [cards, setCards] = useState<{ type: CardType; text: string }[]>(
    CARD_ORDER.map((type) => ({ type, text: FALLBACK[type] }))
  );

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.7, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ])
    );
    if (isLoading) anim.start();
    else { pulse.stopAnimation(); pulse.setValue(0.3); anim.stop(); }
    return () => anim.stop();
  }, [isLoading, pulse]);

  useEffect(() => {
    getDaily()
      .then((res) => {
        const data = (res.data ?? {}) as DailyResponse;
        setDailyMessageId(data.daily_message_id ?? data.id);
        setHeadline(data.headline ?? data.title ?? '');
        setCards(
          CARD_ORDER.map((type) => ({
            type,
            text: data[type] ?? data.cards?.[type] ?? FALLBACK[type],
          }))
        );
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const openCard = (type: CardType, text: string) =>
    router.push({ pathname: '/interaction', params: { type, text, daily_message_id: dailyMessageId ?? '' } });

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        onSearchPress={() => router.push('/bible')}
        onBellPress={() => {}}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.caption}>Hoje pra você:</Text>

        {headline ? <Text style={styles.headline}>{headline}</Text> : null}

        {isLoading ? (
          [0, 1, 2].map((i) => (
            <Animated.View key={i} style={[styles.skeleton, { opacity: pulse }]} />
          ))
        ) : (
          <>
            {cards.map((card) => (
              <DarkCard
                key={card.type}
                text={card.text}
                label={LABELS[card.type]}
                onPress={() => openCard(card.type, card.text)}
              />
            ))}
            <StreakBar />
            <PrimaryButton title="Abrir Bíblia" onPress={() => router.push('/bible')} />
          </>
        )}
      </ScrollView>

      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: 24 },
  caption: {
    color: colors.gray,
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginBottom: spacing.sm,
    letterSpacing: 0.3,
  },
  headline: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    marginBottom: spacing.md,
    lineHeight: 34,
  },
  skeleton: {
    backgroundColor: '#E6E2DD',
    borderRadius: 16,
    height: 160,
    marginBottom: 12,
  },
});
