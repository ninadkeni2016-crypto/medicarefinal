import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { fonts } from '@/lib/theme';

const PALETTE = [
    { bg: '#EFF6FF', text: '#2563EB' },
    { bg: '#F0FDF4', text: '#16A34A' },
    { bg: '#FDF4FF', text: '#9333EA' },
    { bg: '#FFF7ED', text: '#EA580C' },
    { bg: '#F0FDFA', text: '#0D9488' },
    { bg: '#FFFBEB', text: '#D97706' },
    { bg: '#FEF2F2', text: '#DC2626' },
    { bg: '#F5F3FF', text: '#7C3AED' },
];

export function getInitials(name: string): string {
    if (!name) return '?';
    return name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function pickColor(name: string) {
    if (!name) return PALETTE[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return PALETTE[Math.abs(hash) % PALETTE.length];
}

interface InitialsAvatarProps {
    name: string;
    size?: number;
    radius?: number;
    fontSize?: number;
    style?: ViewStyle;
}

/**
 * Renders a coloured initials avatar — no images, no external URLs.
 * Color is deterministic based on the name, so the same person always
 * gets the same colour across screens.
 */
export function InitialsAvatar({
    name,
    size = 48,
    radius: r,
    fontSize,
    style,
}: InitialsAvatarProps) {
    const { bg, text } = pickColor(name);
    const initials = getInitials(name);
    const borderRadius = r ?? size * 0.35;
    const fSize = fontSize ?? size * 0.38;

    return (
        <View
            style={[
                {
                    width: size,
                    height: size,
                    borderRadius,
                    backgroundColor: bg,
                    alignItems: 'center',
                    justifyContent: 'center',
                },
                style,
            ]}
        >
            <Text style={{ fontFamily: fonts.bold, fontSize: fSize, color: text, letterSpacing: 0.5 }}>
                {initials}
            </Text>
        </View>
    );
}
