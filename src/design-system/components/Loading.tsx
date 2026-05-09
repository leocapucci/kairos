import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { color, font, space } from '../tokens';

type LoadingProps = {
  message?: string;
  flex?: boolean;
};

/**
 * Standardized loading state — matches pattern established across:
 * conversations.tsx ("Buscando conversas...")
 * plans.tsx ("Carregando seus planos...")
 * bible.tsx ("Carregando planos...")
 * home.tsx ("Preparando sua direção...")
 */
export function Loading({ message = 'Carregando...', flex = false }: LoadingProps) {
  return (
    <View style={[styles.wrap, flex && styles.flex]}>
      <ActivityIndicator color={color.sage} />
      {message ? <Text style={styles.hint}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: space.xl,
    gap: space.sm,
  },
  flex: {
    flex: 1,
    justifyContent: 'center',
  },
  hint: {
    color: color.textTertiary,
    fontSize: font.size.sm,
    fontFamily: font.regular,
  },
});
