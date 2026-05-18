import { ImageBackground, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { useAuth } from '../src/auth';

const HERO_IMG = require('../assets/images/kairosbackground2.png');

function LeafIcon() {
  return (
    <Text style={{ fontSize: 28, color: '#3D5A3E', textAlign: 'center', marginBottom: 2 }}>🌿</Text>
  );
}

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  // Sessão persistente: se já autenticado, vai direto para home
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/home');
    }
  }, [isAuthenticated, isLoading]);

  return (
    <>
      <Stack.Screen options={{ animation: 'none', headerShown: false }} />

      <ImageBackground source={HERO_IMG} style={s.root} resizeMode="cover">
        <LinearGradient
          colors={[
            'rgba(255,255,255,0.0)',
            'rgba(255,255,255,0.35)',
            'rgba(255,255,255,0.70)',
          ]}
          locations={[0, 0.5, 1]}
          start={{ x: 0, y: 0.55 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />

        <SafeAreaView style={s.safe}>
          {/* LOGO BLOCK */}
          <View style={s.logoBlock}>
            <LeafIcon />
            <View style={s.ornamentRow}>
              <View style={s.ornamentLine} />
              <Text style={s.ornamentStar}>✦</Text>
              <View style={s.ornamentLine} />
            </View>
            <Text style={s.brandName}>KAIROS</Text>
            <Text style={s.brandTagline}>FAVOR SEM MERECIMENTO</Text>
            <View style={s.ornamentRow}>
              <View style={s.ornamentLine} />
              <Text style={s.ornamentStar}>✦</Text>
              <View style={s.ornamentLine} />
            </View>
          </View>

          {/* HEADLINE BLOCK */}
          <View style={s.textBlock}>
            <Text style={s.headline}>
              {'Sua direção\ndiária com '}
              <Text style={s.headlineGold}>{'Deus.'}</Text>
            </Text>
            <View style={s.headlineUnderline} />
            <Text style={s.sub}>
              {'Reflexões profundas, presença,\nsilêncio e clareza espiritual\npara sua caminhada.'}
            </Text>
          </View>

          {/* CTA BLOCK */}
          <View style={s.ctaBlock}>
            <TouchableOpacity
              style={s.primaryBtn}
              activeOpacity={0.85}
              onPress={() => router.push('/onboarding')}
            >
              <Text style={s.primaryBtnIcon}>🌿</Text>
              <Text style={s.primaryBtnLabel}>Começar jornada  →</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.secondaryBtn}
              activeOpacity={0.7}
              onPress={() => router.push('/login')}
            >
              <Text style={s.secondaryBtnText}>
                {'Já tem uma conta? '}
                <Text style={s.secondaryBtnLink}>Entrar →</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* CARD CAROUSEL PLACEHOLDER */}
          <View style={s.card}>
            <View style={s.cardAvatar}>
              <Text style={{ fontSize: 22 }}>🌿</Text>
            </View>
            <View style={s.cardText}>
              <Text style={s.cardTitle}>Antes do caos,{'\n'}encontre presença.</Text>
              <Text style={s.cardSub}>Antes da pressa,{'\n'}encontre direção.</Text>
            </View>
            <Text style={s.cardArrow}>›</Text>
          </View>

          {/* DOTS */}
          <View style={s.dotsRow}>
            <View style={[s.dot, s.dotActive]} />
            <View style={s.dot} />
            <View style={s.dot} />
          </View>
        </SafeAreaView>
      </ImageBackground>
    </>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16, justifyContent: 'space-between' },

  // Logo
  logoBlock: { alignItems: 'center', marginTop: 0 },
  ornamentRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  ornamentLine: { flex: 1, height: 1, backgroundColor: '#B8860B', opacity: 0.6 },
  ornamentStar: { color: '#B8860B', fontSize: 10, marginHorizontal: 6 },
  brandName: { fontFamily: 'serif', fontSize: 28, fontWeight: '700', letterSpacing: 6, color: '#2C3E1F', marginTop: 4 },
  brandTagline: { fontSize: 11, fontWeight: '300', letterSpacing: 3, color: '#8B7355', marginTop: 2 },

  // Headline
  textBlock: { paddingTop: 0, marginTop: 60 },
  headline: { fontFamily: 'serif', fontSize: 26, fontWeight: '600', color: '#1C2B0E', lineHeight: 34 },
  headlineGold: { fontStyle: 'italic', color: '#B8860B' },
  headlineUnderline: { width: 40, height: 2, backgroundColor: '#B8860B', marginTop: 8, marginBottom: 12 },
  sub: { fontSize: 14, color: '#5C5040', lineHeight: 22 },

  // CTA
  ctaBlock: { gap: 14, marginTop: 56 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3D5A3E',
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
    alignSelf: 'flex-start',
    width: 187,
  },
  primaryBtnIcon: { fontSize: 16 },
  primaryBtnLabel: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  secondaryBtn: { alignItems: 'flex-start', alignSelf: 'flex-start' },
  secondaryBtnText: { fontSize: 14, color: '#3D3020' },
  secondaryBtnLink: { color: '#3D5A3E', textDecorationLine: 'underline', fontWeight: '500' },

  // Card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20,
    padding: 16,
    gap: 12,
    marginBottom: 0,
    marginTop: 'auto',
  },
  cardAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1C2B0E', lineHeight: 20 },
  cardSub: { fontSize: 13, color: '#4A3F30', marginTop: 2 },
  cardArrow: { fontSize: 24, color: '#3D5A3E', fontWeight: '300' },

  // Dots
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(80,80,80,0.35)' },
  dotActive: { backgroundColor: '#3D5A3E' },
});
