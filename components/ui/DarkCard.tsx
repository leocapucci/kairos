import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '../../theme';

type DarkCardProps = {
  text: string;
  label: string;
  onPress: () => void;
};

export default function DarkCard({ text, label, onPress }: DarkCardProps) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <Text style={styles.text}>{text}</Text>
      <Text style={styles.kairos}>KAIROS</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
  },
  text: {
    color: colors.white,
    fontSize: 18,
    lineHeight: 24,
    fontFamily: 'Inter_400Regular',
  },
  kairos: {
    color: colors.accent,
    fontSize: 12,
    marginTop: 12,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.5,
  },
});
