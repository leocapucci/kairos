import { Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { Button } from '../src/design-system';

const HERO_IMG = require('../assets/images/kairosbackground.jpg');

export default function Index() {
  return (
    <>
      <Stack.Screen options={{ animation: 'none', headerShown: false }} />

      <SafeAreaView style={s.safe}>

        {/* Hero — imagem confinada em View com overflow:hidden, sem leakage */}
        <View style={s.hero}>
          <Image
            source={HERO_IMG}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
          {/* Gradiente fade para o background sólido abaixo — sem semitransparência no meio */}
          <LinearGradient
            colors={['transparent', colors.background]}
            start={{ x: 0, y: 0.55 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFillObject}
            pointerEvents="none"
          />
        </View>

        {/* Conteúdo — fundo sólido, sem layers adicionais */}
        <View style={s.content}>

          <View style={s.brandBlock}>
            <Text style={s.brandName}>KAIROS</Text>
            <Text style={s.brandTagline}>FAVOR SEM MERECIMENTO</Text>
            <View style={s.accentLine} />
          </View>

          <View style={s.textBlock}>
            <Text style={s.headline}>
              {'Sua direção\ndiária com '}
              <Text style={s.headlineGold}>Deus.</Text>
            </Text>
            <Text style={s.sub}>
              {'Reflexões profundas e clareza espiritual\npara sua caminhada.'}
            </Text>
          </View>

          <View style={s.ctaBlock}>
            <Button
              variant="sage"
              label="Começar jornada →"
              onPress={() => router.push('/onboarding')}
            />
            <View style={s.secondaryWrap}>
              <Button
                variant="ghost"
                label="Já tenho uma conta"
                onPress={() => router.push('/home')}
              />
            </View>
          </View>

        </View>
      </SafeAreaView>
    </>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Hero: flex:3 — confinado, imagem não vaza para fora
  hero: {
    flex: 3,
    overflow: 'hidden',
  },

  // Conteúdo: flex:4 — fundo sólido, sem overlays
  content: {
    flex: 4,
    backgroundColor: colors.background,
    paddingHorizontal: 28,
    paddingTop: 12,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },

  brandBlock: {},
  brandName: {
    fontSize: 14,
    letterSpacing: 5,
    fontFamily: 'Inter_700Bold',
    color: colors.gold,
  },
  brandTagline: {
    fontSize: 10,
    letterSpacing: 3,
    color: colors.grayOrganic,
    marginTop: 4,
    fontFamily: 'Inter_400Regular',
  },
  accentLine: {
    width: 32,
    height: 2,
    backgroundColor: colors.gold,
    marginTop: 8,
  },

  textBlock: {},
  headline: {
    fontSize: 36,
    fontFamily: 'Inter_300Light',
    color: colors.blackSoft,
    lineHeight: 44,
    letterSpacing: -0.5,
  },
  headlineGold: {
    color: colors.gold,
    fontStyle: 'italic',
    fontFamily: 'Inter_300Light',
  },
  sub: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    lineHeight: 22,
    color: colors.grayOrganic,
  },

  ctaBlock: {},
  secondaryWrap: {
    marginTop: 8,
  },
});
