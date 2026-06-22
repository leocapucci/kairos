import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import { KairosCard, KairosImageKey, KairosCategory } from '../../data/kairosEdition';
import { colors, radius } from '../../theme';

// Mapeamento das imagens oficiais do Kairos Edition por Categoria
const IMAGES: Record<KairosCategory, ImageSourcePropType> = {
  fe:           require('../../assets/images/kairos-edition/faith_master_v1.jpg'),
  esperanca:    require('../../assets/images/kairos-edition/hope_master_v1.jpg'),
  direcao:      require('../../assets/images/kairos-edition/direction_master_v1.jpg'),
  forca:        require('../../assets/images/kairos-edition/strength_master_v1.jpg'),
  gratidao:     require('../../assets/images/kairos-edition/gratitude_master_v1.jpg'),
  descanso:     require('../../assets/images/kairos-edition/rest_master_v1.jpg'),
  confianca:    require('../../assets/images/kairos-edition/trust_master_v1.jpg'),
  coragem:      require('../../assets/images/kairos-edition/courage_master_v1.jpg'),
  proposito:    require('../../assets/images/kairos-edition/purpose_master_v1.jpg'),
  recomeço:     require('../../assets/images/kairos-edition/new_beginning_master_v1.jpg'),

  // Fallbacks temporários para categorias sazonais/secundárias
  amor:         require('../../assets/images/kairosbackground.jpg'),
  paz:          require('../../assets/images/kairosbackground2.png'),
  perseveranca: require('../../assets/images/kairosbackground.jpg'),
  graca:        require('../../assets/images/kairosbackground2.png'),
  renovacao:    require('../../assets/images/kairosbackground.jpg'),
  cura:         require('../../assets/images/kairosbackground2.png'),
  vitoria:      require('../../assets/images/kairosbackground.jpg'),
  alegria:      require('../../assets/images/kairosbackground2.png'),
  especial:     require('../../assets/images/kairosbackground.jpg'),
};

type Props = {
  card: KairosCard;
  cardWidth: number;
  cardHeight: number;
};

export default function KairosEditionCard({ card, cardWidth, cardHeight }: Props) {
  return (
    <View style={[styles.wrapper, { width: cardWidth }]}>
      <View style={[styles.card, { height: cardHeight - 24 }]}>
        {/* Imagem de fundo */}
        <Image
          source={IMAGES[card.category]}
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
          {/* Marca Kairos — topo */}
          <View style={styles.brandArea}>
            <Text style={styles.brandName}>✦ KAIROS</Text>
            <Text style={styles.brandTagline}>Favor sem merecimento</Text>
          </View>

          {/* Frase + referência — base do card */}
          <View style={styles.mainArea}>
            <Text style={styles.phrase}>"{card.phrase}"</Text>
            <Text style={styles.reference}>{card.reference}</Text>
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
    gap: 12,
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
});
