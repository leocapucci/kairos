import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { getProfile } from '../services/api';
import { colors, radius, spacing } from '../theme';

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
      <Text style={styles.fire}>🔥</Text>
      <View style={styles.textGroup}>
        <Text style={styles.count}>{streak} dias seguidos</Text>
        <Text style={styles.message}>{streakMessage(streak)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.beige,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  fire: {
    fontSize: 18,
  },
  textGroup: {
    flex: 1,
  },
  count: {
    color: colors.blackSoft,
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    lineHeight: 18,
  },
  message: {
    color: colors.grayOrganic,
    fontSize: 11,
    lineHeight: 16,
    fontFamily: 'Inter_400Regular',
  },
});
