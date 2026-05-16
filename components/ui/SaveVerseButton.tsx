import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';

type Props = {
  saved: boolean;
  onPress: () => void;
};

export default function SaveVerseButton({ saved, onPress }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const prevSaved = useRef(saved);

  useEffect(() => {
    if (!prevSaved.current && saved) {
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.25, duration: 100, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1.0, duration: 150, useNativeDriver: true }),
      ]).start();
    }
    prevSaved.current = saved;
  }, [saved, scale]);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
      hitSlop={8}
    >
      <Animated.Text style={[styles.icon, { transform: [{ scale }] }]}>
        {saved ? '💛' : '🤍'}
      </Animated.Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.65,
  },
  icon: {
    fontSize: 20,
  },
});
