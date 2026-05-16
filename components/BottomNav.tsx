import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '../theme';

const ACTIVE = colors.sage;
const INACTIVE = colors.navInactive;

type IconProps = { color: string; size?: number };

function HomeIcon({ color, size = 23 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 22V12h6v10"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function BibleIcon({ color, size = 23 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function DevotionalIcon({ color, size = 23 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ProfileIcon({ color, size = 23 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="1.5" />
    </Svg>
  );
}

const LEFT_TABS = [
  { Icon: HomeIcon, path: '/home', label: 'Home' },
  { Icon: BibleIcon, path: '/bible', label: 'Bíblia' },
] as const;

const RIGHT_TABS = [
  { Icon: DevotionalIcon, path: '/conversations', label: 'Devocional' },
  { Icon: ProfileIcon, path: '/profile', label: 'Perfil' },
] as const;

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.bar}>
      {LEFT_TABS.map((tab) => {
        const isActive = pathname === tab.path;
        const color = isActive ? ACTIVE : INACTIVE;
        return (
          <Pressable
            key={tab.path}
            onPress={() => router.push(tab.path)}
            style={styles.tab}
          >
            <tab.Icon color={color} size={23} />
            <Text style={[styles.tabLabel, { color }]}>{tab.label}</Text>
          </Pressable>
        );
      })}

      {/* Center action button */}
      <Pressable
        onPress={() => router.push('/interaction')}
        style={({ pressed }) => [styles.centerTab, pressed && { opacity: 0.72 }]}
      >
        <View style={styles.centerCircle}>
          <Text style={styles.centerPlus}>+</Text>
        </View>
      </Pressable>

      {RIGHT_TABS.map((tab) => {
        const isActive = pathname === tab.path;
        const color = isActive ? ACTIVE : INACTIVE;
        return (
          <Pressable
            key={tab.path}
            onPress={() => router.push(tab.path)}
            style={styles.tab}
          >
            <tab.Icon color={color} size={23} />
            <Text style={[styles.tabLabel, { color }]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  // Flat bar integrated with the app background — no pill, no card
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSoft,
    paddingTop: 12,
    paddingBottom: 22,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.1,
  },

  // Center + button
  centerTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  centerCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 6,
  },
  centerPlus: {
    color: colors.white,
    fontSize: 26,
    lineHeight: 30,
    fontFamily: 'Inter_700Bold',
    marginTop: -1,
  },
});
