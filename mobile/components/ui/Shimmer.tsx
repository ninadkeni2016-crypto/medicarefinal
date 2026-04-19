import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

interface ShimmerProps {
    width?: number | string;
    height?: number | string;
    borderRadius?: number;
    style?: ViewStyle;
}

export function Shimmer({ width = '100%', height = 20, borderRadius = 4, style }: ShimmerProps) {
    const shimmerValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(shimmerValue, {
                toValue: 1,
                duration: 1500,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    const translateX = shimmerValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-200, 200],
    });

    return (
        <View style={[{ width, height, borderRadius, backgroundColor: '#E2E8F0', overflow: 'hidden' }, style]}>
            <AnimatedGradient
                colors={['#E2E8F0', '#F1F5F9', '#E2E8F0']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={[
                    StyleSheet.absoluteFill,
                    {
                        transform: [{ translateX }],
                    },
                ]}
            />
        </View>
    );
}

export function CardSkeleton() {
    return (
        <View style={{ padding: 16, backgroundColor: '#FFF', borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9' }}>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <Shimmer width={48} height={48} borderRadius={24} />
                <View style={{ flex: 1, gap: 8 }}>
                    <Shimmer width="60%" height={14} />
                    <Shimmer width="40%" height={10} />
                </View>
            </View>
        </View>
    );
}
