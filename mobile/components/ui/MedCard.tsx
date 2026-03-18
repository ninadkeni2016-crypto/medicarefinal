import React, { useRef } from 'react';
import { ViewStyle, Animated, TouchableOpacity, View } from 'react-native';
import { colors, radius, cardShadow } from '@/lib/theme';

interface MedCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  noPadding?: boolean;
}

export function MedCard({ children, onPress, style, noPadding }: MedCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const base: ViewStyle = {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: noPadding ? 0 : 20,
    ...cardShadow,
  };

  if (onPress) {
    const onPressIn = () => {
      Animated.spring(scale, {
        toValue: 0.97,
        useNativeDriver: true,
        speed: 40,
        bounciness: 4,
      }).start();
    };

    const onPressOut = () => {
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 30,
        bounciness: 6,
      }).start();
    };

    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
      >
        <Animated.View style={[base, style, { transform: [{ scale }] }]}>
          {children}
        </Animated.View>
      </TouchableOpacity>
    );
  }

  return <View style={[base, style]}>{children}</View>;
}
