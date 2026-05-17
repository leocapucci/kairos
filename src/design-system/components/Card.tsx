import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { color, radius, space } from '../tokens';

/**
 * Variants observed across app screens:
 * - beige   → verseCard (home), planCard (bible) — warm beige surface
 * - outline → historyItem (conversations) — white with soft border
 * - accent  → activePlanCard (plans) — subtle red-tinted surface
 * - default → neutral white surface
 */
export type CardVariant = 'default' | 'beige' | 'outline' | 'accent';

type CardProps = ViewProps & {
  variant?: CardVariant;
  padding?: 'sm' | 'md' | 'lg';
};

export function Card({
  variant = 'default',
  padding = 'md',
  style,
  children,
  ...props
}: CardProps) {
  return (
    <View
      style={[styles.base, styles[variant], paddingStyles[padding], style]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  default: {
    backgroundColor: color.surface,
  },
  beige: {
    backgroundColor: color.beige,
  },
  outline: {
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.borderSoft,
  },
  accent: {
    backgroundColor: 'rgba(200,164,107,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(200,164,107,0.30)',
  },
});

const paddingStyles = StyleSheet.create({
  sm: { padding: space.sm },
  md: { padding: space.md },
  lg: { paddingVertical: space.lg, paddingHorizontal: space.lg },
});
