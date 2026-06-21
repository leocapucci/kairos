import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';

import { colors, radius, spacing } from '../../theme';

type ReactionButtonProps = {
  emoji: string;
  label: string;
  onPress: () => void;
  selected?: boolean;
  disabled?: boolean;
  dark?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function ReactionButton({ emoji, label, onPress, selected, disabled, dark, style }: ReactionButtonProps) {
  const buttonStyle = dark
    ? [styles.button, styles.buttonDark, selected && styles.selectedDark, disabled && !selected && styles.dimmed]
    : [styles.button, styles.buttonLight, selected && styles.selectedLight, disabled && !selected && styles.dimmed];

  const labelStyle = dark
    ? [styles.label, styles.labelDark, selected && styles.labelSelectedDark]
    : [styles.label, styles.labelLight, selected && styles.labelSelectedLight];

  return (
    <Pressable onPress={onPress} disabled={disabled} style={[buttonStyle, style]}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={labelStyle}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
  },
  buttonLight: {
    backgroundColor: colors.white,
    borderColor: colors.borderSoft,
  },
  buttonDark: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  selectedLight: {
    backgroundColor: 'rgba(122,158,126,0.08)',
    borderColor: colors.sage,
  },
  selectedDark: {
    backgroundColor: 'rgba(200,76,76,0.14)',
    borderColor: colors.accent,
  },
  dimmed: { opacity: 0.35 },
  emoji: { fontSize: 18, lineHeight: 22 },
  label: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    flex: 1,
  },
  labelLight: {
    color: colors.blackSoft,
  },
  labelDark: {
    color: 'rgba(255,255,255,0.8)',
  },
  labelSelectedLight: {
    color: colors.sageDeep,
    fontFamily: 'Inter_700Bold',
  },
  labelSelectedDark: {
    color: colors.accent,
    fontFamily: 'Inter_700Bold',
  },
});
