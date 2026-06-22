import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme';

type Props = {
  onBack: () => void;
  currentTheme: string;
};

export default function KairosEditionHeader({ onBack, currentTheme }: Props) {
  return (
    <View style={styles.header}>
      <Pressable
        onPress={onBack}
        hitSlop={10}
        style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
      >
        <Text style={styles.backIcon}>‹</Text>
      </Pressable>

      <View style={styles.center}>
        <Text style={styles.title}>KAIROS EDITION</Text>
        <Text style={styles.theme} numberOfLines={1}>{currentTheme}</Text>
      </View>

      <View style={styles.placeholder} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
    backgroundColor: colors.background,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: colors.blackSoft,
    fontSize: 28,
    lineHeight: 32,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  title: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: colors.gold,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  theme: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: colors.textPrimary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  placeholder: {
    width: 36,
  },
});
