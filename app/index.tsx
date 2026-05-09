import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { colors } from '../theme';
import { Card, Button } from '../src/design-system';

export default function Index() {
  return (
    <ImageBackground
      source={require('../assets/images/splash-bg.jpg')}
      style={styles.bg}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(246,241,232,0.0)', 'rgba(246,241,232,0.5)', 'rgba(246,241,232,0.93)']}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.container}>

        <View style={styles.top}>
          <Text style={styles.brand}>KAIROS</Text>
          <Text style={styles.tagline}>FAVOR SEM MERECIMENTO</Text>
          <View style={styles.accentLine} />
        </View>

        <View style={styles.mid}>
          <Text style={styles.headline}>
            {'Sua direção\ndiária com '}
            <Text style={styles.headlineGold}>Deus.</Text>
          </Text>
          <Text style={styles.sub}>
            {'Reflexões profundas, presença e clareza\nespiritual para sua caminhada.'}
          </Text>

          <View style={styles.btnWrap}>
            <Button
              variant="sage"
              label="Começar jornada →"
              onPress={() => router.push('/onboarding')}
            />
          </View>

          <View style={styles.linkWrap}>
            <Button
              variant="ghost"
              label="Já tenho uma conta"
              onPress={() => router.push('/home')}
            />
          </View>
        </View>

        <Card variant="default" style={styles.card}>
          <Text style={styles.cardIcon}>🌿</Text>
          <Text style={styles.cardText}>
            {'Antes do caos, encontre presença.\nAntes da pressa, encontre direção.'}
          </Text>
        </Card>

      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 72,
    paddingBottom: 44,
    justifyContent: 'space-between',
  },

  top: {},
  brand: {
    fontSize: 15,
    letterSpacing: 5,
    fontWeight: '600',
    color: colors.gold,
  },
  tagline: {
    fontSize: 11,
    letterSpacing: 3,
    color: colors.grayOrganic,
    marginTop: 6,
    fontWeight: '500',
  },
  accentLine: {
    width: 36,
    height: 2.5,
    backgroundColor: colors.accent,
    marginTop: 10,
  },

  mid: {},
  headline: {
    fontSize: 46,
    fontWeight: '300',
    color: colors.blackSoft,
    lineHeight: 54,
    letterSpacing: -0.5,
  },
  headlineGold: {
    color: colors.gold,
    fontStyle: 'italic',
    fontWeight: '300',
  },
  sub: {
    marginTop: 16,
    fontSize: 15,
    lineHeight: 24,
    color: colors.grayOrganic,
    letterSpacing: 0.1,
  },

  btnWrap: {
    marginTop: 32,
  },
  linkWrap: {
    marginTop: 12,
  },

  card: {
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardIcon: { fontSize: 22 },
  cardText: {
    flex: 1,
    fontSize: 14,
    color: colors.blackSoft,
    lineHeight: 22,
  },
});
