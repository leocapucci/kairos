import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

export default function SplashScreenPage() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require('../assets/images/splash-bg.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="dark-content" />

      {/* OVERLAY CLARO ORGÂNICO */}
      <LinearGradient
        colors={[
          'rgba(246,241,232,0.0)',
          'rgba(246,241,232,0.5)',
          'rgba(246,241,232,0.92)',
        ]}
        style={styles.overlay}
      />

      {/* CONTEÚDO */}
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.smallText}>
            Hoje para você.
          </Text>

          <Text style={styles.title}>
            {'Você já sabe\no que precisa fazer.\nSó não quer fazer.'}
          </Text>

          <View style={styles.line} />

          <View style={styles.brandContainer}>
            <Text style={styles.logo}>
              KAIROS
            </Text>

            <Text style={styles.subtitle}>
              FAVOR SEM MERECIMENTO
            </Text>
          </View>
        </View>

        {/* BOTÃO */}
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.85}
          onPress={() => router.replace('/onboarding')}
        >
          <Text style={styles.buttonText}>
            Receber direção
          </Text>

          <Text style={styles.arrow}>
            →
          </Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#F6F1E8',
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
  },

  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingTop: 90,
    paddingBottom: 50,
  },

  content: {
    marginTop: 40,
  },

  smallText: {
    color: '#6E675F',
    fontSize: 14,
    letterSpacing: 2,
    marginBottom: 28,
    opacity: 0.9,
    fontFamily: 'Inter_600SemiBold',
  },

  title: {
    color: '#2D261F',
    fontSize: 42,
    lineHeight: 52,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -1.4,
    maxWidth: '92%',
  },

  line: {
    width: 60,
    height: 2,
    backgroundColor: 'rgba(45,38,31,0.18)',
    marginTop: 30,
    marginBottom: 36,
    borderRadius: 10,
  },

  brandContainer: {
    gap: 10,
  },

  logo: {
    color: '#2D261F',
    fontSize: 32,
    letterSpacing: 12,
    fontFamily: 'Inter_700Bold',
  },

  subtitle: {
    color: '#C84C4C',
    fontSize: 12,
    letterSpacing: 4,
    fontFamily: 'Inter_700Bold',
  },

  button: {
    height: 62,
    backgroundColor: '#FFFFFF',
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
    color: '#2D261F',
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
  },

  arrow: {
    color: '#2D261F',
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
  },
});
