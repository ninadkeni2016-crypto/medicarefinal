import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { ArrowLeft, Bell, Shield, Lock, Globe, Moon, ChevronRight, LogOut } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

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
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                    <ArrowLeft size={16} color="#334155" />
                </TouchableOpacity>
                <Text style={{ fontSize: 20, fontWeight: '700', color: '#0284c7' }}>Settings</Text>
            </View>

            {/* Notifications */}
            <Text style={{ fontSize: 11, fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, paddingLeft: 4 }}>Notifications</Text>
            <View style={{ backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9', overflow: 'hidden', marginBottom: 16 }}>
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
            <Text style={{ fontSize: 11, fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, paddingLeft: 4 }}>Security</Text>
            <View style={{ backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9', overflow: 'hidden', marginBottom: 16 }}>
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
            <Text style={{ fontSize: 11, fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, paddingLeft: 4 }}>General</Text>
            <View style={{ backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9', overflow: 'hidden', marginBottom: 16 }}>
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
            <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f1f5f9', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 12, color: '#64748b' }}>MediCare v1.0.0</Text>
                <Text style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>© 2026 MediCare. All rights reserved.</Text>
            </View>

            {/* Logout */}
            <TouchableOpacity onPress={logout} activeOpacity={0.7} style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 16, backgroundColor: '#fef2f2' }}>
                <LogOut size={16} color="#dc2626" /><Text style={{ color: '#dc2626', fontWeight: '600', fontSize: 14 }}>Sign Out</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}
