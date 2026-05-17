import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef, useMemo, useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import HERO_IMAGE from '../assets/images/kairosbackground.jpg';
import BottomNav from '../components/BottomNav';
import CinematicVerseCard from '../components/ui/CinematicVerseCard';
import { colors, radius } from '../theme';
import { useDaily, useProfile, useVerseOfDay } from '../src/hooks/useHomeData';
import { saveVerseAction } from '../src/services/api/action';
import { shareKairos } from '../src/services/api/share';
import { formatVerseRef } from '../src/utils/formatVerseRef';
import { getDistinctId, trackPerf } from '../src/analytics';
import { ONBOARDING_ANSWERS_KEY } from './onboarding';
import { useScreenTracking } from '../src/hooks/useScreenTracking';
import { useTimeMark } from '../src/hooks/useTimeMark';
import { usePushToken } from '../src/hooks/usePushToken';

const LAST_FOLLOWUP_KEY = 'kairos_last_followup_v1';

const STRUGGLE_LABELS: Record<string, string> = {
  ansiedade: 'ansiedade e medo do futuro',
  relacionamento: 'relacionamentos difíceis',
  proposito: 'falta de propósito ou direção',
  fe: 'dúvidas sobre a fé',
  financeiro: 'pressão financeira',
  luto: 'luto e perda',
};

// ─── Types ────────────────────────────────────────────────────────────────────

type CardType = 'conforto' | 'confronto' | 'forca';

type DailyResponse = {
  daily_message_id?: string;
  id?: string;
  conforto?: string;
  confronto?: string;
  forca?: string;
  cards?: Partial<Record<string, string>>;
};

type VerseData = {
  text: string;
  book: string;
  chapter: number;
  verse_number: number;
};

// ─── Static data ─────────────────────────────────────────────────────────────

const CARD_ORDER: CardType[] = ['conforto', 'confronto', 'forca'];

const FALLBACK: Record<CardType, string> = {
  conforto: 'Respire fundo. Hoje há cuidado para você no ordinário.',
  confronto: 'Encare com verdade o que precisa mudar dentro de você.',
  forca: 'Você tem força para o que está diante de você hoje.',
};

const LABELS: Record<CardType, string> = {
  conforto: 'Conforto',
  confronto: 'Direção',
  forca: 'Força',
};

const SUBTITLES: Record<CardType, string> = {
  conforto: 'Para aquecer o coração cansado',
  confronto: 'Para os próximos passos',
  forca: 'Para enfrentar o que vem',
};

// Tint por card — usa a mesma imagem hero com humor de cor diferente
const CARD_TINTS: Record<CardType, string> = {
  conforto: 'rgba(122, 158, 126, 0.28)',  // sage — descanso, conforto
  confronto: 'rgba(200, 164, 107, 0.22)', // dourado — clareza, direção
  forca: 'rgba(180, 100, 55, 0.20)',      // âmbar quente — energia, força
};

const FALLBACK_VERSE: VerseData = {
  text: 'O Senhor é o meu pastor; de nada me faltará.',
  book: 'Salmos',
  chapter: 23,
  verse_number: 1,
};

// Hero: ~26% da altura da tela — fiel às proporções da referência.
// resizeMode="cover" + height:'100%' → crop central automático exibe
// o nascer do sol dourado + pedras + névoa (seção central da foto).
const HERO_H = Math.round(Dimensions.get('window').height * 0.26);

const BG = colors.background as string;

// ─── Icons ────────────────────────────────────────────────────────────────────

function BellIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
        stroke={colors.textTertiary}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13.73 21a2 2 0 0 1-3.46 0"
        stroke={colors.textTertiary}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const router = useRouter();
  const { data: verseData, isError: verseError } = useVerseOfDay();
  const { data: dailyResult, isError: dailyError } = useDaily();
  const { data: profileResult } = useProfile();
  const isSavingVerse = useRef(false);

  useScreenTracking('home');
  useTimeMark('home_loaded', verseData !== undefined && dailyResult !== undefined);
  usePushToken(getDistinctId());

  const [continuityMsg, setContinuityMsg] = useState<string | null>(null);
  const [struggleLabel, setStruggleLabel] = useState<string | null>(null);

  useEffect(() => {
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

    AsyncStorage.getItem(LAST_FOLLOWUP_KEY).then((raw) => {
      if (!raw) return;
      try {
        const data = JSON.parse(raw) as { choice: string; date: string };
        if (data.choice === 'hoje' && data.date === yesterday) {
          setContinuityMsg('Ontem você decidiu agir. Como foi?');
        }
      } catch {}
    }).catch(() => {});

    AsyncStorage.getItem(ONBOARDING_ANSWERS_KEY).then((raw) => {
      if (!raw) return;
      try {
        const answers = JSON.parse(raw) as Record<string, string>;
        const label = STRUGGLE_LABELS[answers.main_struggle];
        if (label) setStruggleLabel(label);
      } catch {}
    }).catch(() => {});
  }, []);

  const verse = verseData ?? null;
  const dailyMessageId =
    (dailyResult?.data as DailyResponse | null)?.daily_message_id ??
    (dailyResult?.data as DailyResponse | null)?.id;
  const cards = useMemo((): { type: CardType; text: string }[] => {
    const d = (dailyResult?.data as DailyResponse | null) ?? {};
    const dd = d as Record<string, string | undefined>;
    return CARD_ORDER.map((type) => ({
      type,
      text: dd[type] ?? (d as DailyResponse).cards?.[type] ?? FALLBACK[type],
    }));
  }, [dailyResult]);
  const streak = useMemo(() => {
    const d = profileResult?.data as { streak_days?: number; streak?: number } | undefined;
    return d?.streak_days ?? d?.streak ?? 0;
  }, [profileResult]);

  const openCard = (type: CardType, text: string) =>
    router.push({
      pathname: '/interaction',
      params: { type, text, daily_message_id: dailyMessageId ?? '' },
    });

  const handleSaveVerse = async (
    book: string,
    chapter: number,
    verseNumber: number
  ) => {
    const verseRef = formatVerseRef(book, chapter, verseNumber);
    if (!verseRef || isSavingVerse.current) return;
    isSavingVerse.current = true;
    try {
      await saveVerseAction('anon', verseRef, 'verse_save', 'save');
    } catch {
      // verse save failed — non-critical, no user-visible error
    } finally {
      isSavingVerse.current = false;
    }
  };

  const activeVerse = verse ?? FALLBACK_VERSE;
  const streakDots = Math.min(Math.max(streak, 0), 7);

  // Perf mark for hero image visibility
  const heroStartRef = useRef(Date.now());

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* ── Header ─────────────────────────────────────────────────────── */}
        {/*
          "Kairos" em Inter_400Regular (~34pt) recria o peso editorial leve
          da referência — peso 700 era pesado demais e perdia a elegância.
          Brand e bell no mesmo row, tagline abaixo do nome.
        */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandTitle}>Kairos</Text>
            <Text style={styles.brandSubtitle}>Favor sem merecimento</Text>
          </View>
          <Pressable hitSlop={12} style={styles.bellBtn} onPress={() => router.push('/profile')}>
            <BellIcon />
          </Pressable>
        </View>

        {/* ── Hero cinematográfico ─────────────────────────────────────────── */}
        {/*
          Container HERO_H (26% da tela) + resizeMode="cover" → crop central.
          A imagem (828×1242px portrait) renderizada a 390pt de largura fica com
          585pt de altura; o container (~215pt) enquadra a seção central dourada:
          nascer do sol, pedras em névoa — sem gradiente creme no topo para
          preservar a vivacidade da imagem original.
        */}
        <View style={styles.heroWrap}>
          <Image
            source={HERO_IMAGE}
            style={styles.heroImage}
            resizeMode="cover"
            onLoad={() => trackPerf('hero_image_loaded', Date.now() - heroStartRef.current)}
          />

          {/* Dissolução bottom: transparent→background a partir de 50% */}
          <LinearGradient
            colors={['transparent', BG]}
            start={{ x: 0, y: 0.50 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFillObject}
            pointerEvents="none"
          />

          {/* Texto editorial sobreposto na parte inferior do hero */}
          <View style={styles.heroOverlay} pointerEvents="none">
            <Text style={styles.heroIntro}>Hoje é dia</Text>
            <Text style={styles.heroTitle}>de ouvir Deus.</Text>
            <View style={styles.heroAccent} />
            <Text style={styles.heroSub}>
              Há direção até nos dias silenciosos.
            </Text>
          </View>
        </View>

        {/* ── Versículo do dia ───────────────────────────────────────────── */}
        <View style={styles.verseSection}>
          <CinematicVerseCard
            text={activeVerse.text}
            book={activeVerse.book}
            chapter={activeVerse.chapter}
            verseNumber={activeVerse.verse_number}
            saved={false}
            onSave={() =>
              handleSaveVerse(activeVerse.book, activeVerse.chapter, activeVerse.verse_number)
            }
            onShare={() => shareKairos(activeVerse.text)}
            onReadChapter={() => router.push('/bible')}
          />
        </View>

        {/* ── Continuidade emocional ─────────────────────────────────────── */}
        {continuityMsg && (
          <View style={styles.continuityBanner}>
            <Text style={styles.continuityText}>{continuityMsg}</Text>
          </View>
        )}

        {/* ── Direção para hoje ──────────────────────────────────────────── */}
        <View style={styles.directionSection}>
          <Text style={styles.sectionTitle}>Direção para hoje</Text>
          <Text style={styles.sectionSubtitle}>
            {struggleLabel
              ? `Para você que está enfrentando ${struggleLabel}.`
              : 'Escolha o que o seu coração precisa.'}
          </Text>
          <View style={styles.directionRow}>
            {cards.map((card) => (
              <Pressable
                key={card.type}
                onPress={() => openCard(card.type, card.text)}
                style={({ pressed }) => [
                  styles.directionCardOuter,
                  pressed && { opacity: 0.80, transform: [{ scale: 0.97 }] },
                ]}
              >
                <View style={styles.directionCardInner}>
                  {/* Miniatura fotográfica com tint de humor por card */}
                  <View style={styles.directionThumbWrap}>
                    <Image
                      source={HERO_IMAGE}
                      style={styles.directionThumb}
                      resizeMode="cover"
                    />
                    <View
                      style={[
                        StyleSheet.absoluteFillObject,
                        { backgroundColor: CARD_TINTS[card.type] },
                      ]}
                    />
                  </View>

                  <View style={styles.directionBody}>
                    <Text style={styles.directionTitle}>{LABELS[card.type]}</Text>
                    <Text style={styles.directionSub} numberOfLines={2}>
                      {SUBTITLES[card.type]}
                    </Text>
                    <Text style={styles.directionArrow}>→</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── Sequência espiritual (conteúdo secundário) ─────────────────── */}
        <Pressable
          style={styles.streakPill}
          onPress={() => router.push('/profile')}
        >
          <Text style={styles.streakLeaf}>🌿</Text>
          <View style={styles.streakMid}>
            <Text style={styles.streakLabel}>Sequência de hoje</Text>
            <Text style={styles.streakTitle}>
              {streak > 0 ? `${streak} dias com Deus` : '7 dias com Deus'}
            </Text>
          </View>
          <View style={styles.streakDots}>
            {Array.from({ length: 7 }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.streakDot,
                  i < streakDots && styles.streakDotFilled,
                ]}
              />
            ))}
          </View>
          <Text style={styles.streakChevron}>›</Text>
        </Pressable>

        {(verseError || dailyError) && (
          <Text style={styles.offlineNote}>Conteúdo offline — verifique sua conexão.</Text>
        )}

      </ScrollView>

      <BottomNav />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 80,
  },

  // ── Header — separado da imagem, fiel à referência
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 10,
  },
  brandTitle: {
    // Inter_400Regular recria o peso editorial leve da referência (~34pt)
    fontSize: 34,
    fontFamily: 'Inter_400Regular',
    color: colors.textPrimary,
    letterSpacing: -0.3,
    lineHeight: 40,
  },
  brandSubtitle: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: colors.gold,
    letterSpacing: 0.4,
    marginTop: 2,
  },
  bellBtn: {
    marginTop: 10,
    padding: 4,
  },

  // ── Hero
  heroWrap: {
    width: '100%',
    height: HERO_H,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },

  heroOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingLeft: 24,
    paddingRight: 80,
    paddingBottom: 18,
  },
  heroIntro: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: colors.textPrimary,
    letterSpacing: 0.3,
    opacity: 0.58,
    marginBottom: 2,
  },
  heroTitle: {
    fontSize: 30,
    fontFamily: 'Inter_700Bold',
    color: colors.textPrimary,
    letterSpacing: -0.8,
    lineHeight: 36,
  },
  heroAccent: {
    width: 26,
    height: 1.5,
    backgroundColor: colors.gold,
    marginTop: 10,
    marginBottom: 8,
    borderRadius: 1,
    opacity: 0.8,
  },
  heroSub: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
    lineHeight: 17,
    letterSpacing: 0.1,
    opacity: 0.82,
  },

  // ── Verse
  verseSection: {
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 14,
  },

  // ── Direction
  directionSection: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: colors.textPrimary,
    letterSpacing: 0.1,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: colors.textTertiary,
    lineHeight: 16,
    marginBottom: 10,
  },
  directionRow: {
    flexDirection: 'row',
    gap: 9,
  },
  directionCardOuter: {
    flex: 1,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  directionCardInner: {
    flex: 1,
    borderRadius: radius.md - 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },

  // Miniatura fotográfica — usa o hero com tint de humor
  directionThumbWrap: {
    width: '100%',
    height: 50,
  },
  directionThumb: {
    width: '100%',
    height: '100%',
  },

  directionBody: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 9,
  },
  directionTitle: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: colors.textPrimary,
    letterSpacing: 0.1,
    marginBottom: 2,
  },
  directionSub: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: colors.textTertiary,
    lineHeight: 14,
    marginBottom: 7,
  },
  directionArrow: {
    fontSize: 11,
    color: colors.gold,
    opacity: 0.9,
  },

  // ── Streak pill
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSoft,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  streakLeaf: { fontSize: 16 },
  streakMid: { flex: 1 },
  streakLabel: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    color: colors.textTertiary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  streakTitle: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: colors.textPrimary,
    letterSpacing: -0.1,
  },
  streakDots: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  streakDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.borderSoft,
  },
  streakDotFilled: {
    backgroundColor: colors.sage,
  },
  streakChevron: {
    fontSize: 18,
    color: colors.textTertiary,
    lineHeight: 22,
  },

  // ── Continuity banner
  continuityBanner: {
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSoft,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  continuityText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
    lineHeight: 19,
    fontStyle: 'italic',
  },
  offlineNote: {
    textAlign: 'center',
    color: colors.textTertiary,
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginTop: 4,
  },
});
