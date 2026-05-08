import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

export default function SplashScreen() {
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_600SemiBold, Inter_700Bold });

  if (!fontsLoaded) return null;

  return (
    <ImageBackground
      source={require('../assets/images/splash-bg.jpg')}
      style={{ flex: 1, width: '100%', height: '100%' }}
      resizeMode="cover"
    >
      <LinearGradient
        colors={[
          'rgba(246,241,232,0.0)',
          'rgba(246,241,232,0.4)',
          'rgba(246,241,232,0.88)',
        ]}
        style={styles.overlay}
      />

      <View style={styles.container}>

        {/* BLOCO 1 — topo */}
        <View>
          <Text style={styles.brandName}>KAIROS</Text>
          <Text style={styles.brandTagline}>FAVOR SEM MERECIMENTO</Text>
          <View style={styles.accentLine} />
        </View>

        {/* BLOCO 2 — meio */}
        <View>
          <Text style={styles.headline}>
            {'Sua direção\ndiária com '}
            <Text style={styles.headlineGold}>Deus.</Text>
          </Text>
          <Text style={styles.subtext}>
            {'Reflexões profundas, presença,\nsilêncio e clareza espiritual\npara sua caminhada.'}
          </Text>
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.85}
            onPress={() => router.replace('/onboarding')}
          >
            <Text style={styles.buttonText}>Começar jornada</Text>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.link}
            activeOpacity={0.7}
            onPress={() => router.push('/home')}
          >
            <Text style={styles.linkText}>Já tenho uma conta</Text>
          </TouchableOpacity>
        </View>

        {/* BLOCO 3 — rodapé */}
        <View style={styles.glassCard}>
          <Text style={styles.glassIcon}>🌿</Text>
          <Text style={styles.glassText}>
            {'Antes do caos, encontre presença.\nAntes da pressa, encontre direção.'}
          </Text>
        </View>

      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
  },

  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 72,
    paddingBottom: 44,
  },

  brandName: {
    marginTop: 0,
    fontSize: 15,
    letterSpacing: 5,
    fontWeight: '600',
    color: '#C8A46B',
  },

  brandTagline: {
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

  headline: {
    marginTop: 48,
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

  subtext: {
    marginTop: 16,
    fontSize: 15,
    lineHeight: 24,
    color: '#6E675F',
    fontWeight: '400',
    letterSpacing: 0.1,
  },

  glassCard: {
    position: 'absolute',
    bottom: 44,
    left: 28,
    right: 28,
    backgroundColor: 'rgba(255,255,255,0.50)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  glassIcon: {
    fontSize: 22,
  },

  glassText: {
    flex: 1,
    fontSize: 14,
    color: '#2D261F',
    lineHeight: 22,
    fontWeight: '400',
  },

  button: {
    height: 62,
    marginTop: 32,
    backgroundColor: '#8A9776',
    borderRadius: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },

  arrow: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },

  link: {
    marginTop: 20,
    alignSelf: 'center',
  },

  linkText: {
    fontSize: 15,
    color: '#6E675F',
    borderBottomWidth: 1,
    borderBottomColor: '#6E675F',
  },
});
