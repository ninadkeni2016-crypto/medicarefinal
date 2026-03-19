import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { ArrowLeft, Bell, Shield, Lock, Globe, Moon, ChevronRight, LogOut } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { colors, radius, typography, fonts, Shadows } from '@/lib/theme';

interface SettingsScreenProps { onBack: () => void; }

export default function SettingsScreen({ onBack }: SettingsScreenProps) {
    const { role, logout } = useAuth();
    const [notifications, setNotifications] = useState(true);
    const [appointmentReminders, setAppointmentReminders] = useState(true);
    const [chatNotifications, setChatNotifications] = useState(true);
    const [biometric, setBiometric] = useState(false);

    const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
        <TouchableOpacity onPress={() => onChange(!value)} activeOpacity={0.7}>
            <View style={{ width: 44, height: 24, borderRadius: 12, backgroundColor: value ? '#0ea5e9' : '#e2e8f0', justifyContent: 'center', paddingHorizontal: 2 }}>
                <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', alignSelf: value ? 'flex-end' : 'flex-start' }} />
            </View>
        </TouchableOpacity>
    );

    return (
        <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={{ width: 36, height: 36, borderRadius: radius.md, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, ...Shadows.sm as object }}>
                    <ArrowLeft size={16} color={colors.text} />
                </TouchableOpacity>
                <Text style={[typography.screenTitle, { fontSize: 20 }]}>Settings</Text>
            </View>

            {/* Notifications */}
            <Text style={[typography.overline, { marginBottom: 8, paddingLeft: 4 }]}>Notifications</Text>
            <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', marginBottom: 20, ...Shadows.md as object }}>
                {[
                    { label: 'Push Notifications', desc: 'Receive push notifications', value: notifications, onChange: setNotifications },
                    { label: 'Appointment Reminders', desc: 'Get reminded before appointments', value: appointmentReminders, onChange: setAppointmentReminders },
                    { label: 'Chat Messages', desc: 'New message notifications', value: chatNotifications, onChange: setChatNotifications },
                ].map(({ label, desc, value, onChange }, i) => (
                    <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderTopWidth: i > 0 ? 1 : 0, borderTopColor: '#f1f5f9' }}>
                        <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: '#fef9c3', alignItems: 'center', justifyContent: 'center' }}>
                            <Bell size={16} color="#ca8a04" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 14, fontWeight: '500', color: '#0284c7' }}>{label}</Text>
                            <Text style={{ fontSize: 10, color: '#64748b' }}>{desc}</Text>
                        </View>
                        <Toggle value={value} onChange={onChange} />
                    </View>
                ))}
            </View>

            {/* Security */}
            <Text style={[typography.overline, { marginBottom: 8, paddingLeft: 4 }]}>Security</Text>
            <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', marginBottom: 20, ...Shadows.md as object }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 }}>
                    <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: '#f0fdfa', alignItems: 'center', justifyContent: 'center' }}>
                        <Shield size={16} color="#0ea5e9" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: '500', color: '#0284c7' }}>Biometric Login</Text>
                        <Text style={{ fontSize: 10, color: '#64748b' }}>Use fingerprint or face to login</Text>
                    </View>
                    <Toggle value={biometric} onChange={setBiometric} />
                </View>
                <TouchableOpacity activeOpacity={0.7} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9' }}>
                    <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: '#f3e8ff', alignItems: 'center', justifyContent: 'center' }}>
                        <Lock size={16} color="#9333ea" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: '500', color: '#0284c7' }}>Change Password</Text>
                        <Text style={{ fontSize: 10, color: '#64748b' }}>Update your account password</Text>
                    </View>
                    <ChevronRight size={16} color="#64748b" />
                </TouchableOpacity>
            </View>

            {/* General */}
            <Text style={[typography.overline, { marginBottom: 8, paddingLeft: 4 }]}>General</Text>
            <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', marginBottom: 20, ...Shadows.md as object }}>
                <TouchableOpacity activeOpacity={0.7} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 }}>
                    <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                        <Globe size={16} color="#334155" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: '500', color: '#0284c7' }}>Language</Text>
                        <Text style={{ fontSize: 10, color: '#64748b' }}>English</Text>
                    </View>
                    <ChevronRight size={16} color="#64748b" />
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.7} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9' }}>
                    <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                        <Moon size={16} color="#334155" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: '500', color: '#0284c7' }}>Appearance</Text>
                        <Text style={{ fontSize: 10, color: '#64748b' }}>Light mode</Text>
                    </View>
                    <ChevronRight size={16} color="#64748b" />
                </TouchableOpacity>
            </View>

            {/* App Info */}
            <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: colors.border, alignItems: 'center', marginBottom: 20, ...Shadows.sm as object }}>
                <Text style={[typography.label, { color: colors.textSecondary }]}>MediCare v1.0.0</Text>
                <Text style={[typography.label, { color: colors.textMuted, marginTop: 2 }]}>© 2026 MediCare. All rights reserved.</Text>
            </View>

            {/* Logout */}
            <TouchableOpacity onPress={logout} activeOpacity={0.8} style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: radius.lg, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', ...Shadows.sm as object }}>
                <LogOut size={16} color={colors.danger} /><Text style={{ color: colors.danger, fontWeight: '600', fontSize: 14 }}>Sign Out</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}
