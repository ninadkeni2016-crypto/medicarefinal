import React, { useEffect, useRef } from 'react';
import {
    Animated, TouchableWithoutFeedback, ViewStyle, View,
} from 'react-native';
import * as Haptics from 'expo-haptics';

interface AnimatedListItemProps {
    index: number;
    children: React.ReactNode;
    style?: ViewStyle;
    baseDelay?: number;  // ms before stagger starts. Default 0
    staggerMs?: number;  // extra ms per index. Default 55
}

/**
 * Wraps children in a staggered fade-in + slide-up entrance.
 * Use around list items for an elegant reveal.
 */
export function AnimatedListItem({
    index,
    children,
    style,
    baseDelay = 0,
    staggerMs = 55,
}: AnimatedListItemProps) {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        const delay = baseDelay + index * staggerMs;
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 320,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 320,
                delay,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
            {children}
        </Animated.View>
    );
}

/**
 * Full-screen fade + subtle slide-up entrance.
 * Wrap any screen's root view with this for a consistent entrance.
 */
export function ScreenTransition({
    children,
    style,
}: { children: React.ReactNode; style?: ViewStyle }) {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(14)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, { toValue: 1, duration: 260, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: 0, duration: 260, useNativeDriver: true }),
        ]).start();
    }, []);

    return (
        <Animated.View style={[{ flex: 1, opacity, transform: [{ translateY }] }, style]}>
            {children}
        </Animated.View>
    );
}

/**
 * Scale press — wraps children with a spring scale on press.
 * Use for buttons, cards, or any tappable element.
 */
export function ScalePress({
    children,
    onPress,
    style,
    disabled,
    haptic = 'light',
}: { children: React.ReactNode; onPress?: () => void; style?: ViewStyle; disabled?: boolean; haptic?: 'light' | 'medium' | 'heavy' | 'selection' | 'none' }) {
    const scale = useRef(new Animated.Value(1)).current;

    const onPressIn = () => {
        if (disabled) return;
        Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, speed: 60, bounciness: 0 }).start();
        if (haptic === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (haptic === 'medium') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (haptic === 'heavy') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        if (haptic === 'selection') Haptics.selectionAsync();
    };

    const onPressOut = () => {
        if (disabled) return;
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 6 }).start();
    };

    return (
        <TouchableWithoutFeedback onPressIn={onPressIn} onPressOut={onPressOut} onPress={onPress} disabled={disabled}>
            <Animated.View style={[{ transform: [{ scale }] }, style]}>
                {children}
            </Animated.View>
        </TouchableWithoutFeedback>
    );
}
