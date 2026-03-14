import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Home, Search, Calendar, MessageSquare, User, Users, BarChart3 } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

const patientTabs = [
    { key: 'home', label: 'Home', icon: Home },
    { key: 'find-doctor', label: 'Doctors', icon: Search },
    { key: 'appointments', label: 'Appts', icon: Calendar },
    { key: 'messages', label: 'Chat', icon: MessageSquare },
    { key: 'profile', label: 'Profile', icon: User },
];

const doctorTabs = [
    { key: 'home', label: 'Home', icon: Home },
    { key: 'patients', label: 'Patients', icon: Users },
    { key: 'appointments', label: 'Appts', icon: Calendar },
    { key: 'messages', label: 'Chat', icon: MessageSquare },
    { key: 'profile', label: 'Profile', icon: User },
];

export default function BottomNav({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) {
    const { role } = useAuth();
    const tabs = role === 'doctor' ? doctorTabs : patientTabs;

    return (
        <View style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9',
            flexDirection: 'row', paddingBottom: Platform.OS === 'ios' ? 20 : 8, paddingTop: 8,
            shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: -2 }, shadowRadius: 8,
            elevation: 8,
        }}>
            {tabs.map(({ key, label, icon: Icon }) => {
                const active = activeTab === key;
                return (
                    <TouchableOpacity
                        key={key}
                        onPress={() => onTabChange(key)}
                        activeOpacity={0.7}
                        style={{ flex: 1, alignItems: 'center', paddingVertical: 4 }}
                    >
                        <View style={{
                            width: 40, height: 28, borderRadius: 14,
                            backgroundColor: active ? '#f0fdfa' : 'transparent',
                            alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Icon size={20} color={active ? '#0ea5e9' : '#94a3b8'} />
                        </View>
                        <Text style={{ fontSize: 10, fontWeight: active ? '600' : '500', color: active ? '#0ea5e9' : '#94a3b8', marginTop: 2 }}>{label}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}
