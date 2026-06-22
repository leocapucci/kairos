import { LinearGradient } from 'expo-linear-gradient';
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
import { KairosCard, KairosImageKey } from '../../data/kairosEdition';
import { colors, radius } from '../../theme';

// Requires estáticos — Metro precisa de paths literais em tempo de bundle
const IMAGES: Record<KairosImageKey, ImageSourcePropType> = {
  bg1: require('../../assets/images/kairosbackground.jpg'),
  bg2: require('../../assets/images/kairosbackground2.png'),
};

type Props = {
  card: KairosCard;
  cardWidth: number;
  cardHeight: number;
};

export default function KairosEditionCard({ card, cardWidth, cardHeight }: Props) {
  const handleShare = () => {
    Share.share({
      message: `"${card.phrase}"\n— ${card.reference}\n\nKairos · Favor sem merecimento`,
    }).catch(Boolean);
  };

  return (
    <View style={[styles.wrapper, { width: cardWidth }]}>
      <View style={[styles.card, { height: cardHeight - 24 }]}>
        {/* Imagem de fundo */}
        <Image
          source={IMAGES[card.imageKey]}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />

        {/* Tint de cor do tema */}
        <View
          style={[StyleSheet.absoluteFillObject, { backgroundColor: card.overlayColor }]}
        />

        {/* Gradiente escuro de baixo para cima — legibilidade */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.92)']}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0.18 }}
          end={{ x: 0, y: 1 }}
        />

        {/* Conteúdo */}
        <View style={styles.content}>
          {/* Marca Kairos — topo esquerdo */}
          <View style={styles.brandArea}>
            <Text style={styles.brandName}>✦ KAIROS</Text>
            <Text style={styles.brandTagline}>Favor sem merecimento</Text>
          </View>

          {/* Área principal — base do card */}
          <View style={styles.mainArea}>
            {/* Tag do tema */}
            <View style={styles.themePill}>
              <Text style={styles.themeLabel}>{card.theme}</Text>
            </View>

            {/* Frase */}
            <Text style={styles.phrase}>"{card.phrase}"</Text>

            {/* Referência bíblica */}
            <Text style={styles.reference}>{card.reference}</Text>

            {/* Botão compartilhar */}
            <Pressable
              onPress={handleShare}
              style={({ pressed }) => [styles.shareBtn, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.shareIcon}>↗</Text>
              <Text style={styles.shareText}>Compartilhar nos Stories</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  card: {
    width: '100%',
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 26,
    justifyContent: 'space-between',
  },

  // ─── Marca ──────────────────────────────────────────────────────────────────
  brandArea: {
    gap: 3,
  },
  brandName: {
    color: colors.gold,
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 2.5,
  },
  brandTagline: {
    color: 'rgba(255,255,255,0.50)',
    fontSize: 9,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.8,
  },

  // ─── Conteúdo principal ─────────────────────────────────────────────────────
  mainArea: {
    gap: 16,
  },
  themePill: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.goldBorder,
    borderRadius: 99,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  themeLabel: {
    color: colors.gold,
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 2.5,
  },
  phrase: {
    color: 'rgba(255,255,255,0.96)',
    fontSize: 20,
    lineHeight: 30,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.2,
  },
  reference: {
    color: colors.gold,
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.6,
  },

  // ─── Botão ──────────────────────────────────────────────────────────────────
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    borderRadius: 99,
    paddingHorizontal: 18,
    paddingVertical: 11,
    marginTop: 4,
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
    letterSpacing: 0.2,
  },
});
