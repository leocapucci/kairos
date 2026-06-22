import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../theme';

type Props = {
  total: number;
  current: number;
};

export default function KairosEditionNavigation({ total, current }: Props) {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === current ? styles.dotActive : styles.dotInactive,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
    paddingBottom: 8,
  },
  dot: {
    borderRadius: 99,
    height: 6,
  },
  dotActive: {
    width: 20,
    backgroundColor: colors.gold,
  },
  dotInactive: {
    width: 6,
    backgroundColor: colors.borderSoft,
  },
});
