import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius } from '../../theme';

type DarkCardProps = {
  text: string;
  label: string;
  onPress: () => void;
  hero?: boolean;
};

export default function DarkCard({ text, label, onPress, hero = false }: DarkCardProps) {
  return (
    <Pressable onPress={onPress} style={[styles.card, hero && styles.cardHero]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.text, hero && styles.textHero]}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    paddingTop: 40,
    paddingBottom: 36,
    paddingHorizontal: 24,
    borderRadius: radius.md,
    marginBottom: 8,
  },
  cardHero: {
    paddingTop: 60,
    paddingBottom: 56,
    paddingHorizontal: 28,
  },
  label: {
    color: colors.accent,
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 2.5,
    marginBottom: 24,
  },
  text: {
    color: colors.white,
    fontSize: 20,
    lineHeight: 31,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.05,
  },
  textHero: {
    fontSize: 26,
    lineHeight: 40,
    letterSpacing: -0.2,
  },
});
