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

// ─── Icons ────────────────────────────────────────────────────────────────────

function BellIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
        stroke="#2C3E1F"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13.73 21a2 2 0 0 1-3.46 0"
        stroke="#2C3E1F"
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
            <View>
              <BellIcon />
              <View style={s.bellDot} />
            </View>
          </Pressable>
        </View>

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <View style={s.hero}>
          <Image source={HERO} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
          <LinearGradient
            colors={['transparent', '#F7F5F2']}
            start={{ x: 0, y: 0.55 }}
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
                : 'Ele ainda fala.\nEle ainda guia.'}
            </Text>
          </View>
        </View>

        {/* ── VERSÍCULO DO DIA ─────────────────────────────────────────────── */}
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
                  <View style={s.cardThumbIcon} />
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
          <View style={s.streakIconWrap}>
            <Text style={s.streakIconEmoji}>💧</Text>
          </View>
          <View style={s.streakInfo}>
            <Text style={s.streakLabel}>Sequência de hoje</Text>
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

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F7F5F2',
  },
  root: {
    flex: 1,
    backgroundColor: '#F7F5F2',
  },

  // ── Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  brand: {
    fontSize: 36,
    fontFamily: 'serif',
    color: '#2C3E1F',
    fontWeight: '700',
    lineHeight: 40,
  },
  tagline: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#C9A84C',
    letterSpacing: 0.3,
    marginTop: 2,
  },
  bell: {
    marginTop: 6,
    padding: 4,
  },
  bellDot: {
    position: 'absolute',
    top: 1,
    right: 1,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#C9A84C',
  },

  // ── Hero — altura fixa; texto ancorado no topo
  hero: {
    height: 240,
    overflow: 'hidden',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  heroIntro: {
    fontSize: 28,
    fontFamily: 'Inter_400Regular',
    color: '#1C1C1C',
    marginLeft: 20,
    marginTop: 36,
  },
  heroTitle: {
    fontSize: 36,
    fontFamily: 'serif',
    fontStyle: 'italic',
    color: '#1C1C1C',
    lineHeight: 44,
    marginLeft: 20,
  },
  heroLine: {
    width: 48,
    height: 2,
    backgroundColor: '#C9A84C',
    marginTop: 8,
    marginLeft: 20,
  },
  heroSub: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: '#1C1C1C',
    opacity: 0.85,
    lineHeight: 20,
    marginLeft: 20,
    marginTop: 8,
  },

  // ── Versículo — flutua sobre o hero com margem negativa
  verseSection: {
    marginHorizontal: 16,
    marginTop: -32,
  },

  // ── Direção para hoje — flex:1 para preencher espaço restante
  direction: {
    flex: 1,
    overflow: 'hidden',
  },
  dirTitle: {
    fontSize: 20,
    fontFamily: 'serif',
    color: '#1C1C1C',
    fontWeight: '600',
    marginLeft: 20,
    marginTop: 20,
    lineHeight: 26,
  },
  dirSub: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#888888',
    marginTop: 2,
    marginLeft: 20,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    marginTop: 12,
    flex: 1,
    marginBottom: 4,
  },
  card: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#F7F5F2',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardThumb: {
    width: '100%',
    height: 56,
  },
  cardThumbImg: {
    width: '100%',
    height: '100%',
  },
  cardThumbIcon: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#7A9E7E',
  },
  cardBody: {
    flex: 1,
    paddingHorizontal: 8,
  },
  cardLabel: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: '#1C1C1C',
    marginTop: 8,
    letterSpacing: 0.1,
  },
  cardSub: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: '#888888',
    lineHeight: 15,
    marginTop: 2,
    flex: 1,
  },
  cardArrow: {
    fontSize: 13,
    color: '#C9A84C',
    marginTop: 4,
    marginBottom: 8,
  },

  // ── Banner sequência
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: '#3D5A3E',
    borderRadius: 16,
    height: 64,
    paddingHorizontal: 16,
  },
  streakIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#C9A84C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakIconEmoji: {
    fontSize: 18,
  },
  streakInfo: {
    flex: 1,
    marginLeft: 12,
  },
  streakLabel: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    letterSpacing: 0.1,
  },
  streakValue: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
  },
  dots: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    marginRight: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  dotOn: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C9A84C',
  },
  streakChev: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 20,
  },

  offline: {
    textAlign: 'center',
    color: '#888888',
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    paddingVertical: 4,
    paddingHorizontal: 20,
  },
});
