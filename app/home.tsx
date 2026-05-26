import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { usePathname, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import HERO from '../assets/images/kairosbackground.jpg';
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

const SCREEN_W = Dimensions.get('window').width;

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
  conforto: 'Para acalmar o coração cansado',
  confronto: 'Para saber os próximos passos',
  forca: 'Para enfrentar o que vier',
};

const CARD_ICONS: Record<CardType, string> = {
  conforto: '🌿',
  confronto: '🏔️',
  forca: '+',
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

// ─── Tab bar colors ───────────────────────────────────────────────────────────

const TAB_ACTIVE   = '#7A9E7E';
const TAB_INACTIVE = '#AAAAAA';

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

function HeartIcon({ saved }: { saved: boolean }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        fill={saved ? '#E74C3C' : 'none'}
        stroke={saved ? '#E74C3C' : '#888888'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ShareIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" stroke="#888888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M16 6l-4-4-4 4" stroke="#888888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 2v13" stroke="#888888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// Tab bar icons
function HomeTabIcon({ color, filled }: { color: string; filled?: boolean }) {
  return (
    <Svg width={23} height={23} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 22V12h6v10"
        stroke={filled ? '#F7F5F2' : color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function BibleTabIcon({ color }: { color: string }) {
  return (
    <Svg width={23} height={23} viewBox="0 0 24 24" fill="none">
      <Path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function DevotionalTabIcon({ color }: { color: string }) {
  return (
    <Svg width={23} height={23} viewBox="0 0 24 24" fill="none">
      <Path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ProfileTabIcon({ color }: { color: string }) {
  return (
    <Svg width={23} height={23} viewBox="0 0 24 24" fill="none">
      <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="1.5" />
    </Svg>
  );
}

// ─── Verse card ───────────────────────────────────────────────────────────────

function VerseCard({
  text, book, chapter, verseNumber, saved, onSave, onShare, onReadChapter,
}: {
  text: string; book: string; chapter: number; verseNumber: number;
  saved: boolean; onSave: () => void; onShare: () => void; onReadChapter: () => void;
}) {
  return (
    <View style={vc.card}>
      <Text style={vc.quote} pointerEvents="none">"</Text>
      <Text style={vc.label}>☀️  VERSÍCULO DO DIA</Text>
      <Text style={vc.verseText}>{text}</Text>
      <Text style={vc.reference}>{book} {chapter}:{verseNumber}</Text>
      <View style={vc.actions}>
        <Pressable
          onPress={onSave}
          style={({ pressed }: { pressed: boolean }) => [vc.iconBtn, pressed && { opacity: 0.6 }]}
        >
          <HeartIcon saved={saved} />
        </Pressable>
        <Pressable
          onPress={onShare}
          style={({ pressed }: { pressed: boolean }) => [vc.iconBtn, pressed && { opacity: 0.6 }]}
        >
          <ShareIcon />
        </Pressable>
        <View style={{ flex: 1 }} />
        <Pressable
          onPress={onReadChapter}
          style={({ pressed }: { pressed: boolean }) => [vc.readBtn, pressed && { opacity: 0.7 }]}
        >
          <Text style={vc.readBtnText}>Ler versículo →</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Tab bar ──────────────────────────────────────────────────────────────────

function HomeTabBar() {
  const router = useRouter();
  const pathname = usePathname();

  const homeActive = pathname === '/home';
  const bibleActive = pathname === '/bible';
  const devActive = pathname === '/conversations';
  const profActive = pathname === '/profile';

  return (
    <View style={ts.bar}>
      <Pressable onPress={() => router.push('/home')} style={ts.tab}>
        <HomeTabIcon color={homeActive ? TAB_ACTIVE : TAB_INACTIVE} filled={homeActive} />
        <Text style={[ts.tabLabel, { color: homeActive ? TAB_ACTIVE : TAB_INACTIVE }]}>Início</Text>
      </Pressable>

      <Pressable onPress={() => router.push('/bible')} style={ts.tab}>
        <BibleTabIcon color={bibleActive ? TAB_ACTIVE : TAB_INACTIVE} />
        <Text style={[ts.tabLabel, { color: bibleActive ? TAB_ACTIVE : TAB_INACTIVE }]}>Bíblia</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push('/share')}
        style={({ pressed }: { pressed: boolean }) => [ts.centerTab, pressed && { opacity: 0.72 }]}
      >
        <View style={ts.centerCircle}>
          <Text style={ts.centerPlus}>+</Text>
        </View>
      </Pressable>

      <Pressable onPress={() => router.push('/conversations')} style={ts.tab}>
        <DevotionalTabIcon color={devActive ? TAB_ACTIVE : TAB_INACTIVE} />
        <Text style={[ts.tabLabel, { color: devActive ? TAB_ACTIVE : TAB_INACTIVE }]}>Devocional</Text>
      </Pressable>

      <Pressable onPress={() => router.push('/profile')} style={ts.tab}>
        <ProfileTabIcon color={profActive ? TAB_ACTIVE : TAB_INACTIVE} />
        <Text style={[ts.tabLabel, { color: profActive ? TAB_ACTIVE : TAB_INACTIVE }]}>Perfil</Text>
      </Pressable>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const router = useRouter();
  const { data: verseData } = useVerseOfDay();
  const { data: dailyResult } = useDaily();
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
      } catch (e) { console.warn('[kairos] followup parse', e); }
    }).catch((e) => { console.warn('[kairos] followup load', e); });

    AsyncStorage.getItem(ONBOARDING_ANSWERS_KEY).then((raw) => {
      if (!raw) return;
      try {
        const answers = JSON.parse(raw) as Record<string, string>;
        const label = STRUGGLE_LABELS[answers.main_struggle];
        if (label) setStruggleLabel(label);
      } catch (e) { console.warn('[kairos] onboarding parse', e); }
    }).catch((e) => { console.warn('[kairos] onboarding load', e); });
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

      {/* ── HERO (header + overlay + card do versículo) ──────────────────── */}
      <ImageBackground source={HERO} resizeMode="cover" style={s.hero}>
        <LinearGradient
          colors={['transparent', '#F7F5F2']}
          start={{ x: 0, y: 0.50 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />
        <View style={s.header}>
          <Text style={s.headerTitle}>Kairos</Text>
          <Text style={s.headerSubtitle}>{continuityMsg ?? 'Favor sem merecimento'}</Text>
          <View style={s.bellWrapper}>
            <BellIcon />
            <View style={s.bellDot} />
          </View>
        </View>
        <View style={s.heroOverlay} pointerEvents="none">
          <Text style={s.heroTop}>Hoje é dia</Text>
          <Text style={s.heroMain}>de ouvir Deus.</Text>
          <View style={s.heroLine} />
          <Text style={s.heroSub}>Ainda existe direção no silêncio.</Text>
        </View>
        {/* ── VERSÍCULO DO DIA — sobre a imagem, acima do gradiente ──────── */}
        <View style={s.verseSection}>
          <VerseCard
            text={activeVerse.text}
            book={activeVerse.book}
            chapter={activeVerse.chapter}
            verseNumber={activeVerse.verse_number}
            saved={isVerseSaved(verseKey)}
            onSave={handleSaveVerse}
            onShare={() => shareKairos(activeVerse.text)}
            onReadChapter={() => router.push({
              pathname: '/verse-experience',
              params: {
                book: activeVerse.book,
                chapter: String(activeVerse.chapter),
                verse: String(activeVerse.verse_number),
                text: activeVerse.text,
              },
            })}
          />
        </View>
      </ImageBackground>

      <View style={s.root}>

        {/* ── DIREÇÃO PARA HOJE ────────────────────────────────────────────── */}
        <View style={s.direction}>
          <Text style={s.dirTitle}>Direção para hoje</Text>
          <Text style={s.dirSub}>Escolha o que o seu coração precisa.</Text>
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
                  <View style={[
                    s.cardThumbIcon,
                    card.type === 'forca' && { backgroundColor: '#C9A84C' },
                  ]}>
                    <Text style={[
                      s.cardThumbIconText,
                      card.type === 'forca' && { color: '#FFFFFF', fontFamily: 'Inter_700Bold' },
                    ]}>
                      {CARD_ICONS[card.type]}
                    </Text>
                  </View>
                </View>
                <Text style={s.cardLabel}>{LABELS[card.type]}</Text>
                <Text style={s.cardSub} numberOfLines={2}>{SUBTITLES[card.type]}</Text>
                <Text style={s.cardArrow}>→</Text>
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

      </View>

      <HomeTabBar />
    </SafeAreaView>
  );
}

// ─── Screen styles ────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F5F2' },
  root: { flex: 1, backgroundColor: '#F7F5F2' },

  // ── Hero — contém header + overlay + card versículo; zIndex: 1 garante que o card fique sobre s.root
  hero: { height: 370, zIndex: 1 },
  heroOverlay: {},

  // ── Header (dentro do ImageBackground)
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 36,
    fontFamily: 'serif',
    color: '#2C3E1F',
    fontWeight: '400',
    lineHeight: 40,
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#B59744',
    marginTop: 2,
  },
  bellWrapper: {
    position: 'absolute',
    top: 8,
    right: 20,
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

  // ── Hero overlay — fluxo normal abaixo do header
  heroTop: {
    fontSize: 21,
    fontFamily: 'Inter_400Regular',
    color: '#1C1C1C',
    marginLeft: 20,
    marginTop: 16,
  },
  heroMain: {
    fontSize: 29,
    fontFamily: 'serif',
    fontStyle: 'italic',
    color: '#1C1C1C',
    lineHeight: 36,
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
    fontStyle: 'italic',
    color: '#1C1C1C',
    marginLeft: 20,
    marginTop: 10,
  },

  // ── Versículo — flutua -28px sobre o hero (via root marginTop)
  verseSection: { marginHorizontal: 16, marginTop: 12, marginBottom: 20 },

  // ── Direção para hoje
  direction: { overflow: 'hidden' },
  dirTitle: {
    fontSize: 18,
    fontFamily: 'serif',
    color: '#1C1C1C',
    fontWeight: '600',
    marginLeft: 20,
    marginTop: 9,
    lineHeight: 24,
  },
  dirSub: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#888888',
    marginTop: 2,
    marginLeft: 20,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 4,
  },
  card: {
    flex: 1,
    height: 150,
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
    height: 70,
    overflow: 'hidden',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardThumbImg: { width: '100%', height: '100%' },
  cardThumbIcon: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#7A9E7E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardThumbIconText: { fontSize: 12, color: '#FFFFFF', lineHeight: 15 },
  cardLabel: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: '#1C1C1C',
    paddingHorizontal: 6,
    marginTop: 6,
  },
  cardSub: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: '#888888',
    paddingHorizontal: 6,
    marginTop: 2,
    lineHeight: 14,
  },
  cardArrow: {
    fontSize: 12,
    color: '#C9A84C',
    paddingHorizontal: 6,
    marginTop: 2,
    marginBottom: 6,
  },

  // ── Banner sequência
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: '#3D5A3E',
    borderRadius: 14,
    height: 56,
    paddingHorizontal: 14,
  },
  streakIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#C9A84C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakIconEmoji: { fontSize: 16 },
  streakInfo: { flex: 1, marginLeft: 10 },
  streakLabel: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
  },
  streakValue: {
    fontSize: 10,
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

// ─── Verse card styles ────────────────────────────────────────────────────────

const vc = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowColor: '#EDCF6A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 18,
    elevation: 6,
  },
  quote: {
    position: 'absolute',
    top: 4,
    right: 12,
    fontSize: 64,
    color: '#C9A84C',
    opacity: 0.15,
    fontFamily: 'serif',
    lineHeight: 72,
  },
  label: {
    fontSize: 11,
    color: '#C9A84C',
    letterSpacing: 1,
    fontFamily: 'Inter_700Bold',
  },
  verseText: {
    fontSize: 16,
    fontFamily: 'serif',
    color: '#1C1C1C',
    lineHeight: 24,
    marginTop: 8,
  },
  reference: {
    fontSize: 13,
    color: '#C9A84C',
    fontFamily: 'Inter_700Bold',
    marginTop: 6,
  },
  divider: {
    height: 0.5,
    backgroundColor: '#E0DDD8',
    marginTop: 10,
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 0.5,
    borderColor: '#E0DDD8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  readBtn: {
    height: 30,
    borderRadius: 15,
    borderWidth: 0.5,
    borderColor: '#C9A84C',
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readBtnText: {
    fontSize: 13,
    color: '#C9A84C',
    fontFamily: 'Inter_400Regular',
  },
});

// ─── Tab bar styles ───────────────────────────────────────────────────────────

const ts = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.5,
    borderTopColor: '#E0DDD8',
    paddingTop: 8,
    paddingBottom: 22,
    paddingHorizontal: 8,
    height: 60,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.1,
  },
  centerTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#C9A84C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerPlus: {
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 24,
    fontFamily: 'Inter_700Bold',
    marginTop: -1,
  },
});
