import React from 'react';
import { View, Text, Platform, ViewStyle } from 'react-native';
import { fonts, Shadows } from '@/lib/theme';

const PALETTE = [
    { bg: '#EAF5F7', text: '#1F4E5F' },   // deep teal
    { bg: '#E8F2FA', text: '#457B9D' },   // steel blue
    { bg: '#EBF8FA', text: '#6EC1C8' },   // cyan
    { bg: '#E8F5EE', text: '#2D7A43' },   // teal-green
    { bg: '#FFF4E6', text: '#B5600E' },   // soft amber
    { bg: '#EFF8FF', text: '#2A6B82' },   // light teal
    { bg: '#FEE8E2', text: '#C0402A' },   // muted red
    { bg: '#F0F9FA', text: '#1F4E5F' },   // aqua-teal
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
 * Renders a coloured initials avatar with a subtle soft shadow ring.
 * Color is deterministic based on the name.
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
                    // Soft shadow ring — avatars feel slightly raised
                    ...Platform.select({
                        ios: {
                            shadowColor: text,
                            shadowOffset: { width: 0, height: 3 },
                            shadowOpacity: 0.15,
                            shadowRadius: 8,
                        },
                        android: { elevation: 3 },
                        web: { boxShadow: `0 3px 8px 0 ${text}26` } as any,
                        default: {},
                    }),
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
