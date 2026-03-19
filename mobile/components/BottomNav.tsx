import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Platform, Animated } from 'react-native';
import { Home, Search, Calendar, MessageSquare, User, Users } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { colors, radius, typography, fonts, Shadows } from '@/lib/theme';

const patientTabs = [
    { key: 'home', label: 'Home', icon: Home },
    { key: 'find-doctor', label: 'Explore', icon: Search },
    { key: 'appointments', label: 'Visits', icon: Calendar },
    { key: 'messages', label: 'Chat', icon: MessageSquare },
    { key: 'profile', label: 'Profile', icon: User },
];

const doctorTabs = [
    { key: 'home', label: 'Home', icon: Home },
    { key: 'patients', label: 'Patients', icon: Users },
    { key: 'appointments', label: 'Schedule', icon: Calendar },
    { key: 'messages', label: 'Chat', icon: MessageSquare },
    { key: 'profile', label: 'Profile', icon: User },
];

function NavItem({
    tabKey, label, icon: Icon, active, onPress,
}: { tabKey: string; label: string; icon: any; active: boolean; onPress: () => void }) {
    const scale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scale, { toValue: 0.88, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 8 }).start();
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
            style={{ alignItems: 'center', justifyContent: 'center', flex: 1, height: '100%' }}
        >
            <Animated.View style={{ transform: [{ scale }], alignItems: 'center' }}>
                {/* Active tab pill background */}
                <View style={{
                    width: 44, height: 44, borderRadius: radius.lg,
                    backgroundColor: active ? 'rgba(31, 78, 95, 0.12)' : 'transparent',
                    alignItems: 'center', justifyContent: 'center', marginBottom: 2,
                    // Subtle inner glow for active state
                    ...Platform.select({
                        ios: active ? {
                            shadowColor: colors.primary,
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.20,
                            shadowRadius: 6,
                        } : {},
                        default: {},
                    }),
                }}>
                    <Icon
                        size={22}
                        color={active ? colors.primary : colors.textMuted}
                        strokeWidth={active ? 2.5 : 2}
                    />
                </View>
                <Text
                    style={{
                        fontFamily: active ? fonts.semiBold : fonts.regular,
                        fontSize: 10,
                        color: active ? colors.primary : colors.textMuted,
                        letterSpacing: 0.2,
                    }}
                    numberOfLines={1}
                >
                    {label}
                </Text>
                {/* Active indicator dot */}
                {active && (
                    <View style={{
                        position: 'absolute', bottom: -4,
                        width: 4, height: 4, borderRadius: 2,
                        backgroundColor: colors.primary,
                    }} />
                )}
            </Animated.View>
        </TouchableOpacity>
    );
}

export default function BottomNav({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) {
    const { role } = useAuth();
    const tabs = role === 'doctor' ? doctorTabs : patientTabs;

    return (
        <View style={{
            position: 'absolute',
            bottom: Platform.OS === 'ios' ? 32 : 20,
            left: 16, right: 16, height: 72,
            // Glassmorphic floating nav — Layer 2
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            borderRadius: radius.xl,           // 24px — fully rounded pill shape
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-around',
            // Glass top-edge highlight
            borderWidth: 1.5,
            borderColor: 'rgba(255, 255, 255, 0.80)',
            paddingHorizontal: 12,
            // High elevation — floating element tier
            ...(Shadows.lg as object),
            // Web: backdrop blur for genuine glassmorphism
            ...Platform.select({
                web: { backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' } as any,
                default: {},
            }),
        }}>
            {tabs.map(({ key, label, icon }) => (
                <NavItem
                    key={key}
                    tabKey={key}
                    label={label}
                    icon={icon}
                    active={activeTab === key}
                    onPress={() => onTabChange(key)}
                />
            ))}
        </View>
    );
}
