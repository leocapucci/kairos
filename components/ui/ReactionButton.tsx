import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, spacing } from '../../theme';

type ReactionButtonProps = {
  emoji: string;
  label: string;
  onPress: () => void;
  selected?: boolean;
  disabled?: boolean;
};

export default function ReactionButton({ emoji, label, onPress, selected, disabled }: ReactionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, selected && styles.selected, disabled && !selected && styles.dimmed]}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  selected: {
    backgroundColor: 'rgba(200,76,76,0.14)',
    borderColor: colors.accent,
  },
  dimmed: { opacity: 0.3 },
  emoji: { fontSize: 18, lineHeight: 22 },
  label: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    flex: 1,
  },
  labelSelected: {
    color: colors.accent,
    fontFamily: 'Inter_700Bold',
  },
});
