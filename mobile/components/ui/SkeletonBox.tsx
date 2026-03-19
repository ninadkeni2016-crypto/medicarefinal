import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { colors, radius } from '@/lib/theme';

interface SkeletonBoxProps {
  width?: number | string;
  height: number;
  style?: object;
}

export function SkeletonBox({ width = '100%', height, style }: SkeletonBoxProps) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 600, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: radius.lg,
          backgroundColor: colors.border,
          opacity,
        },
        style,
      ]}
    />
  );
}
