import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import React, { useState, useRef } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

import { shareKairos } from '../src/services/api/share';
import { colors, radius, spacing } from '../theme';

const HERO = require('../assets/images/kairosbackground.jpg');

type Phrase = { text: string; source: string };

const PHRASES: Phrase[] = [
  { text: 'Antes do caos, encontre presença.\nAntes da pressa, encontre direção.', source: 'Kairos' },
  { text: 'Ele ainda fala. Ele ainda guia.\nAinda há esperança para o seu caminho.', source: 'Kairos' },
  { text: 'A fé não exige certeza.\nExige presença.', source: 'Kairos' },
  { text: 'Deus não desistiu de você\nno seu pior dia.', source: 'Kairos' },
  { text: 'Você tem força para\no que está diante de você hoje.', source: 'Kairos' },
  { text: 'O Senhor é o meu pastor;\nde nada me faltará.', source: 'Salmos 23:1' },
  { text: 'Não temas, porque eu sou contigo;\nnão te assombres, porque eu sou o teu Deus.', source: 'Isaías 41:10' },
  { text: 'Tudo posso naquele que me fortalece.', source: 'Filipenses 4:13' },
  { text: 'O amor de Deus não depende\ndo seu desempenho.', source: 'Kairos' },
  { text: 'Há graça suficiente\npara hoje.', source: 'Kairos' },
];

export default function ShareScreen() {
  const [index, setIndex] = useState(0);
  const phrase = PHRASES[index];
  const viewShotRef = useRef<ViewShot>(null);
  const [isSharing, setIsSharing] = useState(false);

  const handleNewPhrase = () => {
    setIndex((prev) => (prev + 1) % PHRASES.length);
  };

  const handleShare = async () => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      if (viewShotRef.current?.capture) {
        const uri = await viewShotRef.current.capture();
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/png',
            dialogTitle: 'Compartilhar nos Stories',
          });
          return;
        }
      }
      // Fallback para texto
      await shareKairos(`${phrase.text}\n\n— ${phrase.source}`);
    } catch (err) {
      console.warn('[kairos] erro ao compartilhar imagem:', err);
      // Fallback para texto
      await shareKairos(`${phrase.text}\n\n— ${phrase.source}`);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false, animation: 'slide_from_bottom' }} />
      <SafeAreaView style={s.safe}>

        {/* Topo */}
        <View style={s.topBar}>
          <Pressable onPress={() => router.back()} style={s.backBtn} hitSlop={12}>
            <Text style={s.backIcon}>‹</Text>
          </Pressable>
          <Text style={s.topLabel}>COMPARTILHAR</Text>
        </View>

        {/* Card cinematográfico */}
        <ViewShot ref={viewShotRef} style={s.card} options={{ format: 'png', quality: 0.95 }}>
          <Image source={HERO} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
          <LinearGradient
            colors={['rgba(0,0,0,0.10)', 'rgba(0,0,0,0.62)']}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            pointerEvents="none"
          />
          <View style={s.cardContent}>
            <Text style={s.brandMark}>KAIROS</Text>
            <Text style={s.phraseText}>{phrase.text}</Text>
            <Text style={s.sourceText}>— {phrase.source}</Text>
          </View>
        </ViewShot>

        {/* Ações */}
        <View style={s.actions}>
          <Pressable
            onPress={handleShare}
            disabled={isSharing}
            style={({ pressed }: { pressed: boolean }) => [s.primaryBtn, pressed && { opacity: 0.85 }, isSharing && { opacity: 0.6 }]}
          >
            <Text style={s.primaryBtnText}>Compartilhar nos Stories →</Text>
          </Pressable>
          <Pressable
            onPress={handleNewPhrase}
            style={({ pressed }: { pressed: boolean }) => [s.secondaryBtn, pressed && { opacity: 0.7 }]}
          >
            <Text style={s.secondaryBtnText}>Gerar nova mensagem</Text>
          </Pressable>
        </View>

      </SafeAreaView>
    </>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surfaceDark,
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: spacing.sm,
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  backIcon: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 26,
    lineHeight: 26,
    fontFamily: 'Inter_400Regular',
  },
  topLabel: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 2.5,
  },

  card: {
    flex: 1,
    margin: 20,
    marginTop: 8,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 28,
  },
  brandMark: {
    color: colors.gold,
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 3,
    marginBottom: 20,
  },
  phraseText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontFamily: 'Inter_700Bold',
    lineHeight: 36,
    letterSpacing: -0.3,
    marginBottom: 14,
  },
  sourceText: {
    color: 'rgba(255,255,255,0.50)',
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.4,
  },

  actions: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 8,
    gap: spacing.sm,
  },
  primaryBtn: {
    backgroundColor: colors.sage,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.2,
  },
  secondaryBtn: {
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  secondaryBtnText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
});
