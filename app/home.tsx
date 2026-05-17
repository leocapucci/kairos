import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import HERO from '../assets/images/kairosbackground.jpg';
import BottomNav from '../components/BottomNav';
import CinematicVerseCard from '../components/ui/CinematicVerseCard';
import { colors, radius } from '../theme';
import { useDaily, useProfile, useVerseOfDay } from '../src/hooks/useHomeData';
import { useSavedVerses } from '../src/hooks/useSavedVerses';
import { saveVerseAction } from '../src/services/api/action';
import { shareKairos } from '../src/services/api/share';
import { formatVerseRef } from '../src/utils/formatVerseRef';
import { getDistinctId } from '../src/analytics';
import { ONBOARDING_ANSWERS_KEY } from './onboarding';
import { useScreenTracking } from '../src/hooks/useScreenTracking';
import { useTimeMark } from '../src/hooks/useTimeMark';
import { usePushToken } from '../src/hooks/usePushToken';


// ─── Constants ────────────────────────────────────────────────────────────────

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

// ─── Static data ──────────────────────────────────────────────────────────────

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
  conforto: 'Para aquecer o\ncoração cansado',
  confronto: 'Para os\npróximos passos',
  forca: 'Para enfrentar\no que vem',
};

const CARD_TINTS: Record<CardType, string> = {
  conforto:  'rgba(122, 158, 126, 0.30)',
  confronto: 'rgba(200, 164, 107, 0.25)',
  forca:     'rgba(180, 100,  55, 0.22)',
};

const FALLBACK_VERSE: VerseData = {
  text: 'O Senhor é o meu pastor; de nada me faltará.',
  book: 'Salmos',
  chapter: 23,
  verse_number: 1,
};

const BG = colors.background as string;

// ─── Icons ────────────────────────────────────────────────────────────────────

function BellIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
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
  const { isVerseSaved, saveVerse, removeSavedVerse } = useSavedVerses();
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
        const d = JSON.parse(raw) as { choice: string; date: string };
        if (d.choice === 'hoje' && d.date === yesterday) {
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

  const activeVerse = verseData ?? FALLBACK_VERSE;
  const verseKey = formatVerseRef(
    activeVerse.book,
    activeVerse.chapter,
    activeVerse.verse_number,
  );

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

  const streakDots = Math.min(Math.max(streak, 0), 7);

  const openCard = (type: CardType, text: string) =>
    router.push({
      pathname: '/interaction',
      params: { type, text, daily_message_id: dailyMessageId ?? '' },
    });

  const handleSaveVerse = async () => {
    if (isSavingVerse.current) return;
    isSavingVerse.current = true;
    const alreadySaved = isVerseSaved(verseKey);
    if (alreadySaved) {
      removeSavedVerse(verseKey);
    } else {
      saveVerse({
        reference: verseKey,
        text: activeVerse.text,
        book: activeVerse.book,
        chapter: activeVerse.chapter,
        verse: activeVerse.verse_number,
      });
    }
    try {
      await saveVerseAction('anon', verseKey, 'verse_save', alreadySaved ? 'unsave' : 'save');
    } catch {
      // non-critical — AsyncStorage já persiste o estado
    } finally {
      isSavingVerse.current = false;
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.root}>

        {/* ── HEADER ───────────────────────────────────────────────────────── */}
        <View style={s.header}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={s.brand}>Kairos</Text>
            <Text style={s.tagline} numberOfLines={1}>
              {continuityMsg ?? 'Favor sem merecimento'}
            </Text>
          </View>
          <Pressable hitSlop={12} style={s.bell} onPress={() => router.push('/profile')}>
            <BellIcon />
          </Pressable>
        </View>

        {/* ── HERO — imagem única com texto editorial sobreposto ───────────── */}
        {/*
          Image com absoluteFillObject preenche o container flex.
          LinearGradient apaga o rodapé da imagem suavemente em direção ao bg.
          Texto posicionado absolutamente no rodapé do hero.
          Sem ImageBackground. Sem layers duplicados.
        */}
        <View style={s.hero}>
          <Image source={HERO} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
          <LinearGradient
            colors={['transparent', BG]}
            start={{ x: 0, y: 0.42 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFillObject}
            pointerEvents="none"
          />
          <View style={s.heroOverlay} pointerEvents="none">
            <Text style={s.heroIntro}>Hoje é dia</Text>
            <Text style={s.heroTitle}>de ouvir Deus.</Text>
            <View style={s.heroLine} />
            <Text style={s.heroSub}>
              {struggleLabel
                ? `Para você que enfrenta ${struggleLabel}.`
                : 'Ele ainda fala. Ele ainda guia.'}
            </Text>
          </View>
        </View>

        {/* ── VERSÍCULO DO DIA ─────────────────────────────────────────────── */}
        {/*
          verseSection com flex:3 e justifyContent:center centraliza o card
          verticalmente no espaço disponível.
          overflow:hidden impede que verses longas vazem para fora.
        */}
        <View style={s.verseSection}>
          <CinematicVerseCard
            text={activeVerse.text}
            book={activeVerse.book}
            chapter={activeVerse.chapter}
            verseNumber={activeVerse.verse_number}
            saved={isVerseSaved(verseKey)}
            onSave={handleSaveVerse}
            onShare={() => shareKairos(activeVerse.text)}
            onReadChapter={() => router.push({
              pathname: '/verses',
              params: { book: activeVerse.book, chapter: String(activeVerse.chapter) },
            })}
          />
        </View>

        {/* ── DIREÇÃO PARA HOJE ────────────────────────────────────────────── */}
        <View style={s.direction}>
          <Text style={s.dirTitle}>Direção para hoje</Text>
          <Text style={s.dirSub} numberOfLines={1}>
            {'Escolha o que o seu coração precisa.'}
          </Text>
          <View style={s.cardsRow}>
            {cards.map((card: { type: CardType; text: string }) => (
              <Pressable
                key={card.type}
                onPress={() => openCard(card.type, card.text)}
                style={({ pressed }: { pressed: boolean }) => [
                  s.card,
                  pressed && { opacity: 0.75, transform: [{ scale: 0.97 }] },
                ]}
              >
                <View style={s.cardThumb}>
                  <Image source={HERO} style={s.cardThumbImg} resizeMode="cover" />
                  <View style={[StyleSheet.absoluteFillObject, { backgroundColor: CARD_TINTS[card.type] }]} />
                </View>
                <View style={s.cardBody}>
                  <Text style={s.cardLabel}>{LABELS[card.type]}</Text>
                  <Text style={s.cardSub} numberOfLines={2}>{SUBTITLES[card.type]}</Text>
                  <Text style={s.cardArrow}>→</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── SEQUÊNCIA ESPIRITUAL ─────────────────────────────────────────── */}
        <Pressable style={s.streak} onPress={() => router.push('/profile')}>
          <Text style={s.streakLeaf}>🌿</Text>
          <View style={s.streakInfo}>
            <Text style={s.streakLabel}>SEQUÊNCIA DE HOJE</Text>
            <Text style={s.streakValue}>
              {streak > 0 ? `${streak} dias com Deus` : 'Comece hoje'}
            </Text>
          </View>
          <View style={s.dots}>
            {Array.from({ length: 7 }).map((_, i) => (
              <View key={i} style={[s.dot, i < streakDots && s.dotOn]} />
            ))}
          </View>
          <Text style={s.streakChev}>›</Text>
        </Pressable>

        {(verseError || dailyError) && (
          <Text style={s.offline}>Conteúdo offline — verifique sua conexão.</Text>
        )}

      </View>

      <BottomNav />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
//
// Arquitetura de flex:
//   root (flex:1) distribui espaço entre hero + verseSection + direction.
//   Elementos fixos (header, streak, diag, BottomNav) não participam do flex.
//
//   Flex units:  hero=3  verse=3  direction=2  → 8 unidades
//   iPhone 13 (706px útil - ~137px fixos = ~569px flex):
//     hero  ≈ 213px   verse ≈ 213px   direction ≈ 142px

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // ── Header — altura fixa, não participa do flex
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
  },
  brand: {
    fontSize: 40,
    fontFamily: 'Inter_400Regular',
    color: colors.textPrimary,
    letterSpacing: -1,
    lineHeight: 44,
  },
  tagline: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: colors.gold,
    letterSpacing: 0.3,
    marginTop: 2,
  },
  bell: {
    marginTop: 10,
    padding: 4,
  },

  // ── Hero — flex:3, maior seção visual
  // overflow:hidden contém a imagem absolutePosition dentro do container flex
  hero: {
    flex: 3,
    overflow: 'hidden',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  heroIntro: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: colors.textPrimary,
    opacity: 0.60,
    letterSpacing: 0.2,
  },
  heroTitle: {
    fontSize: 30,
    fontFamily: 'Inter_700Bold',
    color: colors.textPrimary,
    letterSpacing: -0.8,
    lineHeight: 36,
    marginTop: 2,
  },
  heroLine: {
    width: 24,
    height: 1.5,
    backgroundColor: colors.gold,
    marginTop: 8,
    marginBottom: 6,
    opacity: 0.8,
  },
  heroSub: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
    lineHeight: 16,
    opacity: 0.85,
  },

  // ── Versículo — flex:3, card centralizado verticalmente
  // overflow:hidden impede vazar se CinematicVerseCard exceder altura disponível
  verseSection: {
    flex: 3,
    paddingHorizontal: 20,
    justifyContent: 'center',
    overflow: 'hidden',
  },

  // ── Direção para hoje — flex:2
  direction: {
    flex: 2,
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  dirTitle: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: colors.textPrimary,
    letterSpacing: 0.1,
    marginBottom: 2,
  },
  dirSub: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: colors.textTertiary,
    marginBottom: 7,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  card: {
    flex: 1,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSoft,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardThumb: {
    width: '100%',
    height: 44,
  },
  cardThumbImg: {
    width: '100%',
    height: '100%',
  },
  cardBody: {
    flex: 1,
    paddingHorizontal: 9,
    paddingTop: 7,
    paddingBottom: 7,
  },
  cardLabel: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: colors.textPrimary,
    letterSpacing: 0.1,
    marginBottom: 2,
  },
  cardSub: {
    fontSize: 9,
    fontFamily: 'Inter_400Regular',
    color: colors.textTertiary,
    lineHeight: 13,
    flex: 1,
  },
  cardArrow: {
    fontSize: 11,
    color: colors.gold,
    opacity: 0.9,
  },

  // ── Streak — altura fixa, não participa do flex
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 6,
    marginBottom: 8,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSoft,
    paddingVertical: 9,
    paddingHorizontal: 14,
    gap: 8,
  },
  streakLeaf: { fontSize: 14 },
  streakInfo: { flex: 1 },
  streakLabel: {
    fontSize: 8,
    fontFamily: 'Inter_700Bold',
    color: colors.textTertiary,
    letterSpacing: 1.5,
    marginBottom: 1,
  },
  streakValue: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: colors.textPrimary,
    letterSpacing: -0.1,
  },
  dots: {
    flexDirection: 'row',
    gap: 3,
    alignItems: 'center',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.borderSoft,
  },
  dotOn: {
    backgroundColor: colors.sage,
  },
  streakChev: {
    fontSize: 18,
    color: colors.textTertiary,
    lineHeight: 22,
  },

  offline: {
    textAlign: 'center',
    color: colors.textTertiary,
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    paddingVertical: 4,
    paddingHorizontal: 20,
  },
});
