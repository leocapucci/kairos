import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { color, font, space } from '../tokens';

type EmptyStateProps = {
  icon?: string;
  title: string;
  description?: string;
};

/**
 * Standardized empty state — matches pattern established across:
 * conversations.tsx (💬 + title + desc)
 * plans.tsx (📖 + title + desc)
 * bible.tsx Salvos tab (🔖 + title + desc)
 * bible.tsx Planos tab (📖 + title + desc)
 */
export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <View style={styles.wrap}>
      {icon ? <Text style={styles.icon}>{icon}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.desc}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: space.xl,
    gap: space.xs,
  },
  icon: {
    fontSize: 36,
    marginBottom: space.xs,
  },
  title: {
    color: color.textPrimary,
    fontSize: font.size.body,
    fontFamily: font.bold,
    textAlign: 'center',
  },
  desc: {
    color: color.textTertiary,
    fontSize: font.size.sm,
    fontFamily: font.regular,
    textAlign: 'center',
    lineHeight: 20,
  },
});
