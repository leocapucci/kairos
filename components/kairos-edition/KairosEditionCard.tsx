import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import { KairosCard, KairosImageKey } from '../../data/kairosEdition';
import { colors, radius } from '../../theme';

// Requires estáticos — Metro precisa de paths literais em tempo de bundle
// Chaves semânticas mapeadas para os assets disponíveis (placeholder até novas imagens chegarem)
const IMAGES: Record<KairosImageKey, ImageSourcePropType> = {
  aurora_manha:   require('../../assets/images/kairosbackground.jpg'),
  ceu_dourado:    require('../../assets/images/kairosbackground.jpg'),
  montanhas:      require('../../assets/images/kairosbackground.jpg'),
  estrada:        require('../../assets/images/kairosbackground.jpg'),
  campo_aberto:   require('../../assets/images/kairosbackground.jpg'),
  floresta:       require('../../assets/images/kairosbackground.jpg'),
  luz_arvores:    require('../../assets/images/kairosbackground.jpg'),
  pedra_firme:    require('../../assets/images/kairosbackground.jpg'),
  janela_luz:     require('../../assets/images/kairosbackground.jpg'),
  nuvens_luz:     require('../../assets/images/kairosbackground2.png'),
  ceu_noite:      require('../../assets/images/kairosbackground2.png'),
  lago_sereno:    require('../../assets/images/kairosbackground2.png'),
  vale_verde:     require('../../assets/images/kairosbackground2.png'),
  horizonte_mar:  require('../../assets/images/kairosbackground2.png'),
  chuva_suave:    require('../../assets/images/kairosbackground2.png'),
  deserto_arido:  require('../../assets/images/kairosbackground2.png'),
  caminho_sombra: require('../../assets/images/kairosbackground2.png'),
  jardim_verde:   require('../../assets/images/kairosbackground2.png'),
  cidade_manha:   require('../../assets/images/kairosbackground2.png'),
  por_do_sol:     require('../../assets/images/kairosbackground2.png'),
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
