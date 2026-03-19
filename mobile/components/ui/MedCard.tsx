import React, { useRef } from 'react';
import { ViewStyle, Animated, TouchableOpacity, View, Platform } from 'react-native';
import { colors, radius, Shadows } from '@/lib/theme';

interface MedCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  noPadding?: boolean;
}

export function MedCard({ children, onPress, style, noPadding }: MedCardProps) {
  const scale = useRef(new Animated.Value(1)).current;
  // Animate shadow via opacity on a "raised" layer (shadow can't be directly animated
  // in RN native driver, so we animate a helper overlay opacity instead)
  const pressDepth = useRef(new Animated.Value(1)).current;

  const base: ViewStyle = {
    backgroundColor: colors.card,
    borderRadius: radius.lg,          // 20px — softer, premium feel
    borderWidth: 1,
    borderColor: colors.border,
    padding: noPadding ? 0 : 20,
    // Top-left highlight edge for subtle neumorphic depth
    ...Platform.select({
      ios: (Shadows.md as ViewStyle),
      android: (Shadows.md as ViewStyle),
      web: (Shadows.md as ViewStyle),
      default: {},
    }),
  };

  if (onPress) {
    const onPressIn = () => {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 0.97,
          useNativeDriver: true,
          speed: 40,
          bounciness: 4,
        }),
        Animated.timing(pressDepth, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
      ]).start();
    };

    const onPressOut = () => {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 30,
          bounciness: 6,
        }),
        Animated.timing(pressDepth, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    };

    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
      >
        <Animated.View
          style={[
            base,
            style,
            {
              transform: [{ scale }],
              // Fade shadow on press to simulate reduced elevation
              opacity: Animated.add(0.88, Animated.multiply(pressDepth, 0.12)) as any,
            },
          ]}
        >
          {children}
        </Animated.View>
      </TouchableOpacity>
    );
  }

  return <View style={[base, style]}>{children}</View>;
}
