import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme';

type Props = {
  onBack: () => void;
};

export default function KairosEditionHeader({ onBack }: Props) {
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
        <Text style={styles.subtitle}>Coleção Exclusiva</Text>
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
    paddingVertical: 12,
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
  },
  title: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: colors.gold,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: colors.textTertiary,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  placeholder: {
    width: 36,
  },
});
