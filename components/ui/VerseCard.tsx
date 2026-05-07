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
    backgroundColor: colors.beige,
    paddingTop: 40,
    paddingBottom: 36,
    paddingHorizontal: 28,
    marginBottom: 28,
  },
  label: {
    color: colors.sage,
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 3,
    marginBottom: 24,
  },
  text: {
    color: colors.blackSoft,
    fontSize: 20,
    lineHeight: 32,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.1,
    marginBottom: 28,
  },
  reference: {
    color: colors.sage,
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.8,
  },
});
