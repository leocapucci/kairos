import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '../../theme';

type DarkCardProps = {
  text: string;
  label: string;
  onPress: () => void;
};

export default function DarkCard({ text, label, onPress }: DarkCardProps) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.quote}>{'"'}</Text>
      </View>
      <Text style={styles.text}>{text}</Text>
      <Text style={styles.cta}>Aprofundar →</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radius.md,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 24,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  label: {
    color: colors.grayOrganic,
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 2,
  },
  quote: {
    color: colors.sage,
    fontSize: 28,
    lineHeight: 28,
    fontFamily: 'Inter_700Bold',
  },
  text: {
    color: colors.blackSoft,
    fontSize: 18,
    lineHeight: 28,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.1,
    marginBottom: spacing.md,
  },
  cta: {
    color: colors.sage,
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },
});
