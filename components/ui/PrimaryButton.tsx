import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius } from '../../theme';

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export default function PrimaryButton({ title, onPress, loading, disabled }: PrimaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.button, (disabled || loading) && styles.disabled]}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.accent,
    paddingVertical: 22,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  disabled: { opacity: 0.5 },
  text: {
    color: colors.white,
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.8,
  },
});
