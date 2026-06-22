import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme';

type Props = {
  current: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
};

export default function KairosEditionNavigation({ current, total, onPrev, onNext }: Props) {
  const isFirst = current === 0;
  const isLast = current === total - 1;

  return (
    <View style={styles.container}>
      <Pressable
        onPress={onPrev}
        disabled={isFirst}
        hitSlop={12}
        style={({ pressed }) => [
          styles.arrowBtn,
          isFirst && styles.arrowDisabled,
          pressed && !isFirst && { opacity: 0.6 },
        ]}
      >
        <Text style={[styles.arrow, isFirst && styles.arrowTextDisabled]}>◀</Text>
      </Pressable>

      <Text style={styles.counter}>
        <Text style={styles.counterCurrent}>{current + 1}</Text>
        <Text style={styles.counterSep}> de </Text>
        <Text style={styles.counterTotal}>{total}</Text>
      </Text>

      <Pressable
        onPress={onNext}
        disabled={isLast}
        hitSlop={12}
        style={({ pressed }) => [
          styles.arrowBtn,
          isLast && styles.arrowDisabled,
          pressed && !isLast && { opacity: 0.6 },
        ]}
      >
        <Text style={[styles.arrow, isLast && styles.arrowTextDisabled]}>▶</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    paddingVertical: 12,
    backgroundColor: colors.background,
  },
  arrowBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowDisabled: {
    opacity: 0.25,
  },
  arrow: {
    color: colors.textPrimary,
    fontSize: 15,
  },
  arrowTextDisabled: {
    color: colors.textTertiary,
  },
  counter: {
    minWidth: 80,
    textAlign: 'center',
  },
  counterCurrent: {
    color: colors.textPrimary,
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
  counterSep: {
    color: colors.textSecondary,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  counterTotal: {
    color: colors.textSecondary,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
});
