import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    Easing,
} from 'react-native-reanimated';

interface AnimatedListItemProps {
    index: number;
    children: React.ReactNode;
    style?: ViewStyle;
    /** Base delay before stagger starts (ms). Default 0. */
    baseDelay?: number;
    /** Extra ms added per index. Default 60. */
    staggerMs?: number;
}

/**
 * Wraps children with a staggered fade-in + slide-up entrance animation.
 * Use this around list items for elegant staggered reveals.
 */
export function AnimatedListItem({
    index,
    children,
    style,
    baseDelay = 0,
    staggerMs = 60,
}: AnimatedListItemProps) {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(18);

    useEffect(() => {
        const delay = baseDelay + index * staggerMs;
        const cfg = { duration: 350, easing: Easing.out(Easing.cubic) };
        opacity.value = withDelay(delay, withTiming(1, cfg));
        translateY.value = withDelay(delay, withTiming(0, cfg));
    }, []);

    const animStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    return (
        <Animated.View style={[animStyle, style]}>
            {children}
        </Animated.View>
    );
}

/**
 * Full-screen fade + subtle slide-up entrance.
 * Wrap any screen's root view with this.
 */
export function ScreenTransition({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(12);

    useEffect(() => {
        const cfg = { duration: 280, easing: Easing.out(Easing.cubic) };
        opacity.value = withTiming(1, cfg);
        translateY.value = withTiming(0, cfg);
    }, []);

    const animStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    return (
        <Animated.View style={[{ flex: 1 }, animStyle, style]}>
            {children}
        </Animated.View>
    );
}

import { TouchableWithoutFeedback } from 'react-native';

/**
 * Wraps children with a scale-up/down animation on press.
 * Use for buttons, cards, or any interactive element.
 */
export function ScalePress({ children, onPress, style }: { children: React.ReactNode; onPress?: () => void; style?: ViewStyle }) {
    const scale = useSharedValue(1);

    const animStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <TouchableWithoutFeedback
            onPressIn={() => (scale.value = withTiming(0.96, { duration: 100 }))}
            onPressOut={() => (scale.value = withTiming(1, { duration: 100 }))}
            onPress={onPress}
        >
            <Animated.View style={[animStyle, style]}>
                {children}
            </Animated.View>
        </TouchableWithoutFeedback>
    );
}
