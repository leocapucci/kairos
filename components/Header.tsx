import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '../theme';

type HeaderProps = {
  onSearchPress?: () => void;
  onBellPress?: () => void;
};

function SearchIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="8" stroke={colors.grayOrganic} strokeWidth="1.5" />
      <Path d="M21 21l-4.35-4.35" stroke={colors.grayOrganic} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

function BellIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={colors.grayOrganic} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={colors.grayOrganic} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function Header({ onSearchPress, onBellPress }: HeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.brand}>KAIROS</Text>
      <View style={styles.actions}>
        <Pressable onPress={onSearchPress} style={styles.iconButton}>
          <SearchIcon />
        </Pressable>
        <Pressable onPress={onBellPress} style={styles.iconButton}>
          <BellIcon />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  brand: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: colors.blackSoft,
    letterSpacing: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 4,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
