import React from 'react';
import {
  Image,
  ImageSourcePropType,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { KairosEditionCard as CardType, KairosImageKey } from '../../data/kairosEdition';
import { colors, radius } from '../../theme';

// Requires estáticos — Metro precisa de paths literais em tempo de bundle
const IMAGES: Record<KairosImageKey, ImageSourcePropType> = {
  bg1: require('../../assets/images/kairosbackground.jpg'),
  bg2: require('../../assets/images/kairosbackground2.png'),
};

type Props = {
  card: CardType;
  index: number;
  total: number;
  cardWidth: number;
  cardHeight: number;
};

export default function KairosEditionCard({ card, index, total, cardWidth, cardHeight }: Props) {
  const handleShare = () => {
    Share.share({
      message: `"${card.phrase}"\n— ${card.reference}\n\nKairos Edition`,
    }).catch(Boolean);
  };

  const counterText = `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;

  return (
    <View style={[styles.container, { width: cardWidth, height: cardHeight }]}>
      <View style={[styles.card, { marginHorizontal: 20 }]}>
        <Image source={IMAGES[card.imageKey]} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: card.overlayColor }]} />

        <View style={styles.content}>
          <View style={styles.top}>
            <Text style={styles.counter}>{counterText}</Text>
            <View style={styles.themePill}>
              <Text style={styles.themeText}>{card.theme.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.middle}>
            <Text style={styles.phrase}>"{card.phrase}"</Text>
            <Text style={styles.reference}>{card.reference}</Text>
          </View>

          <View style={styles.bottom}>
            <Pressable
              onPress={handleShare}
              style={({ pressed }) => [styles.shareBtn, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.shareIcon}>↗</Text>
              <Text style={styles.shareText}>Compartilhar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    flex: 1,
    width: '100%',
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginVertical: 12,
  },
  content: {
    flex: 1,
    padding: 28,
    justifyContent: 'space-between',
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  counter: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 1.5,
  },
  themePill: {
    borderWidth: 1,
    borderColor: colors.goldBorder,
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  themeText: {
    color: colors.gold,
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 2,
  },
  middle: {
    gap: 20,
  },
  phrase: {
    color: 'rgba(255,255,255,0.94)',
    fontSize: 22,
    lineHeight: 34,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.3,
  },
  reference: {
    color: colors.gold,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.5,
  },
  bottom: {
    alignItems: 'flex-start',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 99,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  shareIcon: {
    color: 'rgba(255,255,255,0.80)',
    fontSize: 14,
    lineHeight: 18,
  },
  shareText: {
    color: 'rgba(255,255,255,0.80)',
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.3,
  },
});
