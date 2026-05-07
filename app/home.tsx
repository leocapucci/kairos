import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BottomNav from '../components/BottomNav';
import StreakBar from '../components/StreakBar';
import DarkCard from '../components/ui/DarkCard';
import { colors, radius, spacing } from '../theme';
import { getDaily } from '../services/api';

type CardType = 'conforto' | 'confronto';

type DailyResponse = {
  daily_message_id?: string;
  id?: string;
  conforto?: string;
  confronto?: string;
  cards?: Partial<Record<string, string>>;
};

type VerseData = { text: string; book: string; chapter: number; verse_number: number };

const FALLBACK: Record<CardType, string> = {
  conforto: 'Respire fundo. Hoje há cuidado para você no ordinário.',
  confronto: 'Encare com verdade o que precisa mudar dentro de você.',
};

const LABELS: Record<CardType, string> = {
  conforto: 'CONFORTO',
  confronto: 'CONFRONTO',
};

const CARD_ORDER: CardType[] = ['conforto', 'confronto'];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia.';
  if (h < 18) return 'Boa tarde.';
  return 'Boa noite.';
}

function getFormattedDate(): string {
  return new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function HomeScreen() {
  const router = useRouter();
  const pulse = useRef(new Animated.Value(0.3)).current;
  const [isLoading, setIsLoading] = useState(true);
  const [dailyMessageId, setDailyMessageId] = useState<string | undefined>();
  const [cards, setCards] = useState<{ type: CardType; text: string }[]>(
    CARD_ORDER.map((type) => ({ type, text: FALLBACK[type] }))
  );
  const [verse, setVerse] = useState<VerseData | null>(null);

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
    fetch('https://kairos-backend-vjdp.onrender.com/bible/verse-of-day')
      .then((r) => r.json())
      .then(setVerse)
      .catch(() => {});
  }, []);

  useEffect(() => {
    getDaily()
      .then((res) => {
        const data = (res.data ?? {}) as DailyResponse;
        setDailyMessageId(data.daily_message_id ?? data.id);
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Greeting */}
        <View style={styles.greetingBlock}>
          <Text style={styles.brandMark}>KAIROS</Text>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.dateText}>{getFormattedDate()}</Text>
        </View>

        {/* Nature image */}
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80' }}
          style={styles.heroImage}
          resizeMode="cover"
        />

        {/* Verse of Day */}
        {verse && (
          <Pressable onPress={() => router.push('/bible')} style={styles.verseCard}>
            <Text style={styles.verseLabel}>VERSÍCULO DO DIA</Text>
            <Text style={styles.verseText}>{verse.text}</Text>
            <Text style={styles.verseRef}>{verse.book} {verse.chapter}:{verse.verse_number}</Text>
          </Pressable>
        )}

        {/* Section label */}
        <Text style={styles.sectionLabel}>Direção para hoje</Text>

        {/* Cards */}
        <View style={styles.cardsContainer}>
          {isLoading ? (
            <View style={styles.skeletonGroup}>
              <Animated.View style={[styles.skeleton, { opacity: pulse }]} />
              <Animated.View style={[styles.skeleton, { opacity: pulse }]} />
            </View>
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
            </>
          )}

          <StreakBar />
        </View>
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
    paddingBottom: 32,
  },

  greetingBlock: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  brandMark: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: colors.grayOrganic,
    letterSpacing: 4,
    marginBottom: 12,
  },
  greeting: {
    fontSize: 40,
    fontFamily: 'Inter_700Bold',
    color: colors.blackSoft,
    letterSpacing: -1,
    lineHeight: 46,
  },
  dateText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: colors.grayOrganic,
    marginTop: 4,
    textTransform: 'capitalize',
  },

  heroImage: {
    width: '100%',
    height: 180,
  },

  verseCard: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: colors.beige,
    borderRadius: radius.md,
    paddingTop: 28,
    paddingBottom: 24,
    paddingHorizontal: 24,
    marginBottom: spacing.md,
  },
  verseLabel: {
    color: colors.sage,
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 2.5,
    marginBottom: 14,
  },
  verseText: {
    color: colors.blackSoft,
    fontSize: 17,
    lineHeight: 27,
    fontFamily: 'Inter_400Regular',
    marginBottom: spacing.sm,
  },
  verseRef: {
    color: colors.sage,
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },

  sectionLabel: {
    color: colors.grayOrganic,
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginHorizontal: 20,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },

  cardsContainer: {
    paddingHorizontal: 20,
  },
  skeletonGroup: {
    gap: 8,
  },
  skeleton: {
    backgroundColor: colors.borderSoft,
    borderRadius: radius.md,
    height: 140,
  },
});
