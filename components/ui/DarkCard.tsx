import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius } from '../../theme';

type DarkCardProps = {
  text: string;
  label: string;
  onPress: () => void;
};

export default function DarkCard({ text, label, onPress }: DarkCardProps) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <Text style={styles.quote}>{'“'}</Text>
      <Text style={styles.text}>{text}</Text>
      <Text style={styles.kairos}>KAIROS</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    padding: 24,
    borderRadius: radius.md,
    marginBottom: 8,
  },
  quote: {
    color: colors.accent,
    fontSize: 40,
    lineHeight: 40,
    fontFamily: 'Inter_700Bold',
    marginBottom: 4,
  },
  text: {
    color: colors.white,
    fontSize: 20,
    lineHeight: 30,
    fontFamily: 'Inter_700Bold',
  },
  kairos: {
    color: colors.accent,
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 2.5,
    marginTop: 20,
  },
});
