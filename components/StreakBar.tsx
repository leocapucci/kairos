import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { getProfile } from '../services/api';
import { colors, spacing } from '../theme';

function streakMessage(streak: number): string {
  if (streak === 0) return 'Comece hoje.';
  if (streak <= 3) return 'Você está começando a prestar atenção.';
  return 'Você está construindo um hábito.';
}

export default function StreakBar() {
  const [streak, setStreak] = useState<number | null>(null);

  useEffect(() => {
    getProfile()
      .then((res) => {
        const data = res.data as { streak_days?: number; streak?: number };
        setStreak(data.streak_days ?? data.streak ?? 0);
      })
      .catch(() => setStreak(0));
  }, []);

  if (streak === null) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {'🔥 '}
        <Text style={styles.count}>{streak} dias seguidos</Text>
        {' — '}
        {streakMessage(streak)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
    paddingHorizontal: 0,
  },
  text: {
    color: colors.gray,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'Inter_400Regular',
  },
  count: {
    color: colors.text,
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
  },
});
