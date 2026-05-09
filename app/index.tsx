import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

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

          <Pressable
            style={({ pressed }) => [styles.btn, pressed && { opacity: 0.85 }]}
            onPress={() => router.push('/onboarding')}
          >
            <Text style={styles.btnText}>Começar jornada</Text>
            <Text style={styles.btnArrow}>→</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.link, pressed && { opacity: 0.5 }]}
            onPress={() => router.push('/home')}
          >
            <Text style={styles.linkText}>Já tenho uma conta</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardIcon}>🌿</Text>
          <Text style={styles.cardText}>
            {'Antes do caos, encontre presença.\nAntes da pressa, encontre direção.'}
          </Text>
        </View>

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
    color: '#C8A46B',
  },
  tagline: {
    fontSize: 11,
    letterSpacing: 3,
    color: '#6E675F',
    marginTop: 6,
    fontWeight: '500',
  },
  accentLine: {
    width: 36,
    height: 2.5,
    backgroundColor: '#C84C4C',
    marginTop: 10,
  },

  mid: {},
  headline: {
    fontSize: 46,
    fontWeight: '300',
    color: '#2D261F',
    lineHeight: 54,
    letterSpacing: -0.5,
  },
  headlineGold: {
    color: '#C8A46B',
    fontStyle: 'italic',
    fontWeight: '300',
  },
  sub: {
    marginTop: 16,
    fontSize: 15,
    lineHeight: 24,
    color: '#6E675F',
    letterSpacing: 0.1,
  },

  btn: {
    height: 62,
    marginTop: 32,
    backgroundColor: '#7A9E7E',
    borderRadius: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  btnArrow: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },

  link: {
    marginTop: 20,
    alignSelf: 'center',
    paddingVertical: 8,
  },
  linkText: {
    fontSize: 15,
    color: '#6E675F',
    borderBottomWidth: 1,
    borderBottomColor: '#6E675F',
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
    color: '#2D261F',
    lineHeight: 22,
  },
});
