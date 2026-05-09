import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { color, font, radius, space } from '../tokens';

/**
 * Variants observed across app screens:
 * - primary   → continueButton (onboarding) — solid accent fill
 * - sage      → sendBtn (conversations), searchBtn (bible) — solid sage fill
 * - outline   → dayButton (plans), startButton (plans) — bordered, light fill
 * - ghost     → linkText (index), planBtn (bible) — no background, text only
 */
export type ButtonVariant = 'primary' | 'sage' | 'outline' | 'ghost';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = true,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? color.gold : color.white} />
      ) : (
        <Text style={[styles.label, labelStyles[variant]]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    paddingVertical: 18,
    paddingHorizontal: space.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  primary: {
    backgroundColor: color.accent,
  },
  sage: {
    backgroundColor: color.sage,
  },
  outline: {
    borderWidth: 1,
    borderColor: color.gold,
    backgroundColor: 'rgba(200,76,76,0.07)',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.82,
  },
  label: {
    fontSize: font.size.md,
    fontFamily: font.bold,
    letterSpacing: 0.3,
  },
});

const labelStyles = StyleSheet.create({
  primary: { color: color.white },
  sage:    { color: color.white },
  outline: { color: color.gold },
  ghost:   { color: color.textSecondary },
});
