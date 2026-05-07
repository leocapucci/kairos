import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BottomNav from '../components/BottomNav';
import Header from '../components/Header';
import StreakBar from '../components/StreakBar';
import DarkCard from '../components/ui/DarkCard';
import PrimaryButton from '../components/ui/PrimaryButton';
import { colors, radius, spacing } from '../theme';
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
        Animated.timing(pulse, { toValue: 0.55, duration: 1000, useNativeDriver: false }),
        Animated.timing(pulse, { toValue: 0.15, duration: 1000, useNativeDriver: false }),
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.caption}>Hoje pra você</Text>
          {headline ? (
            <Text style={styles.headline}>{headline}</Text>
          ) : null}
        </View>

        {/* Cards */}
        {isLoading ? (
          <View style={styles.skeletonGroup}>
            <Animated.View style={[styles.skeletonHero, { opacity: pulse }]} />
            <View style={styles.skeletonRow}>
              <Animated.View style={[styles.skeletonSecondary, { opacity: pulse }]} />
              <Animated.View style={[styles.skeletonSecondary, { opacity: pulse }]} />
            </View>
          </View>
        ) : (
          <>
            <View style={styles.cardsGroup}>
              <DarkCard
                key={cards[0].type}
                text={cards[0].text}
                label={LABELS[cards[0].type]}
                onPress={() => openCard(cards[0].type, cards[0].text)}
                hero
              />
              {cards.slice(1).map((card) => (
                <DarkCard
                  key={card.type}
                  text={card.text}
                  label={LABELS[card.type]}
                  onPress={() => openCard(card.type, card.text)}
                />
              ))}
            </View>

            <StreakBar />

            <View style={styles.ctaWrapper}>
              <PrimaryButton
                title="Abrir Bíblia"
                onPress={() => router.push('/bible')}
              />
            </View>
          </>
        )}
      </ScrollView>

      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 64,
  },

  hero: {
    marginBottom: 56,
  },
  caption: {
    color: colors.gray,
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 2,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  headline: {
    color: colors.text,
    fontSize: 44,
    fontFamily: 'Inter_700Bold',
    lineHeight: 52,
    letterSpacing: -1,
  },

  cardsGroup: {
    marginBottom: 4,
  },
  skeletonGroup: {
    gap: 8,
  },
  skeletonHero: {
    backgroundColor: colors.softGray,
    borderRadius: radius.md,
    height: 200,
    marginBottom: 8,
  },
  skeletonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  skeletonSecondary: {
    flex: 1,
    backgroundColor: colors.softGray,
    borderRadius: radius.md,
    height: 140,
  },

  ctaWrapper: {
    marginTop: 52,
  },
});
