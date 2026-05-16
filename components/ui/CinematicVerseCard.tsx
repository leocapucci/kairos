import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { animation, colors, radius } from '../../theme';
import SaveVerseButton from './SaveVerseButton';

type Props = {
  text: string;
  book: string;
  chapter: number;
  verseNumber: number;
  saved: boolean;
  onSave: () => void;
  onShare: () => void;
  onReadChapter: () => void;
};

const GOLD = colors.gold;
const GOLD_SOFT = colors.goldSoft;
const CARD_BG_TOP = colors.cardWarmTop;
const CARD_BG_BOTTOM = colors.cardWarmBottom;
const SHADOW_COLOR = colors.gold;

// Share icon — upload arrow style
function ShareIcon() {
  return (
    <Svg width={19} height={19} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"
        stroke={colors.textSecondary}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16 6l-4-4-4 4"
        stroke={colors.textSecondary}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 2v13"
        stroke={colors.textSecondary}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function CinematicVerseCard({
  text,
  book,
  chapter,
  verseNumber,
  saved,
  onSave,
  onShare,
  onReadChapter,
}: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: animation.cinematic,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: animation.cinematic,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, translateY]);

  return (
    <Animated.View style={[styles.animWrapper, { opacity: fadeAnim, transform: [{ translateY }] }]}>
      {/* Shadow wrapper — glow dourado ambiente (sem direcionalidade) */}
      <View style={styles.shadowWrapper}>
        <LinearGradient
          colors={[CARD_BG_TOP, CARD_BG_BOTTOM]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.cardSurface}
        >
          {/* Aspas decorativas oversized */}
          <View style={styles.decorativeQuoteWrap} pointerEvents="none">
            <Text style={styles.decorativeQuote}>"</Text>
          </View>

          {/* Label — decoração ✦ + VERSÍCULO DO DIA */}
          <Text style={styles.label}>✦  VERSÍCULO DO DIA</Text>

          {/* Divisor dourado */}
          <View style={styles.goldDivider} />

          {/* Texto do versículo */}
          <Text style={styles.verseText}>{text}</Text>

          {/* Referência bíblica */}
          <Text style={styles.reference}>
            {book} {chapter}:{verseNumber}
          </Text>

          {/* ── Ações — uma linha: coração | share | ... | Ler capítulo */}
          {/* Estrutura fiel à referência: todos os botões em row único */}
          <View style={styles.actions}>
            <SaveVerseButton saved={saved} onPress={onSave} />

            <Pressable
              onPress={onShare}
              style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
              hitSlop={8}
            >
              <ShareIcon />
            </Pressable>

            <View style={styles.actionsSpacer} />

            <Pressable
              onPress={onReadChapter}
              style={({ pressed }) => [styles.readBtn, pressed && styles.pressed]}
            >
              <Text style={styles.readBtnText}>Ler capítulo  ›</Text>
            </Pressable>
          </View>
        </LinearGradient>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  animWrapper: {
    // wrapper existe apenas para hospedar os valores animados
  },

  // Glow dourado ambiente — shadowOffset {0,0} cria halo ao redor do card
  shadowWrapper: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: GOLD_SOFT,
    shadowColor: SHADOW_COLOR,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 22,
    elevation: 10,
    backgroundColor: CARD_BG_TOP,
  },

  cardSurface: {
    borderRadius: 21,
    overflow: 'hidden',
    paddingTop: 18,
    paddingBottom: 16,
    paddingHorizontal: 22,
  },

  decorativeQuoteWrap: {
    position: 'absolute',
    top: 4,
    right: 16,
  },
  decorativeQuote: {
    fontSize: 90,
    lineHeight: 90,
    fontFamily: 'Inter_700Bold',
    color: 'rgba(200, 164, 107, 0.06)',
  },

  // Label com decoração dourada — fiel à referência (✦ VERSÍCULO DO DIA)
  label: {
    color: GOLD,
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 2.5,
    marginBottom: 10,
  },

  goldDivider: {
    height: 1,
    backgroundColor: GOLD_SOFT,
    marginBottom: 14,
  },

  verseText: {
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 25,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.1,
    marginBottom: 10,
  },

  reference: {
    color: GOLD,
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.0,
    marginBottom: 14,
  },

  // ── Ações em linha única — fiel à referência
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconBtn: {
    padding: 6,
    marginLeft: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionsSpacer: {
    flex: 1,
  },

  readBtn: {
    borderWidth: 1,
    borderColor: 'rgba(200, 164, 107, 0.45)',
    borderRadius: radius.full,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  readBtnText: {
    color: GOLD,
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.3,
  },

  pressed: {
    opacity: 0.6,
  },
});
