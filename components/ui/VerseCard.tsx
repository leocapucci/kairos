import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius } from '../../theme';

type VerseCardProps = {
  text: string;
  reference: string;
  onPress: () => void;
};

export default function VerseCard({ text, reference, onPress }: VerseCardProps) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <Text style={styles.label}>VERSÍCULO DO DIA</Text>
      <Text style={styles.text}>{text}</Text>
      <Text style={styles.reference}>{reference}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    backgroundColor: colors.card,
    paddingTop: 52,
    paddingBottom: 48,
    paddingHorizontal: 28,
    marginBottom: 32,
  },
  label: {
    color: colors.sage,
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 3,
    marginBottom: 28,
  },
  text: {
    color: colors.white,
    fontSize: 22,
    lineHeight: 34,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.05,
    marginBottom: 32,
  },
  reference: {
    color: colors.sage,
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.8,
  },
});
