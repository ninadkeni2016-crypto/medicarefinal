import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Platform, Animated } from 'react-native';
import { Home, Search, Calendar, MessageSquare, User, Users } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { colors, radius, typography, fonts } from '@/lib/theme';

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
    const iconScale = useRef(new Animated.Value(active ? 1.1 : 1)).current;

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
            <Animated.View style={{
                transform: [{ scale }],
                alignItems: 'center',
            }}>
                <View style={{
                    width: 44, height: 44, borderRadius: radius.lg,
                    backgroundColor: active ? 'rgba(58, 190, 249, 0.12)' : 'transparent',
                    alignItems: 'center', justifyContent: 'center', marginBottom: 2,
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
            left: 20, right: 20, height: 72,
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            borderRadius: radius.xl,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-around',
            borderWidth: 1,
            borderColor: 'rgba(232, 235, 240, 0.9)',
            paddingHorizontal: 12,
            ...Platform.select({
                ios: {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.10,
                    shadowRadius: 16,
                },
                android: { elevation: 8 },
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
