import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '../../theme';

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
      style={[styles.button, disabled && !selected && styles.dimmed]}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 22,
    gap: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  dimmed: { opacity: 0.3 },
  emoji: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
  },
  label: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    flex: 1,
    letterSpacing: 0.1,
  },
  labelSelected: {
    color: colors.accent,
    fontFamily: 'Inter_700Bold',
  },
});
