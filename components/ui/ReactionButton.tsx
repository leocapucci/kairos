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
      style={[styles.button, selected && styles.selected, disabled && !selected && styles.dimmed]}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#222',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selected: {
    backgroundColor: 'rgba(200,76,76,0.2)',
    borderWidth: 1,
    borderColor: colors.accent,
  },
  dimmed: { opacity: 0.45 },
  emoji: { fontSize: 24, lineHeight: 28 },
  label: {
    color: colors.white,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    flex: 1,
  },
  labelSelected: {
    color: colors.accent,
    fontFamily: 'Inter_700Bold',
  },
});
