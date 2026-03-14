import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { User, Mail, Phone, MapPin, Calendar, Activity, Shield, LogOut, ChevronRight, Settings, Bell, HelpCircle, Edit, Ruler, Weight } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import EditProfileForm from './EditProfileForm';

export default function PatientProfile({ onNavigate }: { onNavigate?: (tab: string) => void }) {
    const { logout, patientProfile, isProfileComplete } = useAuth();
    const [showEdit, setShowEdit] = useState(false);

    if (showEdit) {
        return <EditProfileForm onBack={() => setShowEdit(false)} />;
    }

    if (!isProfileComplete) {
        return (
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
                <Text style={{ fontSize: 20, fontWeight: '700', color: '#0284c7', marginBottom: 16 }}>Profile</Text>
                <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: '#f1f5f9', alignItems: 'center', marginBottom: 16 }}>
                    <View style={{ width: 80, height: 80, borderRadius: 16, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                        <User size={40} color="#64748b" />
                    </View>
                    <Text style={{ fontWeight: '700', fontSize: 18, color: '#0284c7' }}>Welcome!</Text>
                    <Text style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>Complete your profile to get started</Text>
                    <TouchableOpacity onPress={() => setShowEdit(true)} activeOpacity={0.7} style={{ marginTop: 20, width: '100%', backgroundColor: '#0ea5e9', paddingVertical: 14, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <Edit size={16} color="#fff" /><Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>Complete Your Profile</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={logout} activeOpacity={0.7} style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 16, backgroundColor: '#fef2f2' }}>
                    <LogOut size={16} color="#dc2626" /><Text style={{ color: '#dc2626', fontWeight: '600', fontSize: 14 }}>Sign Out</Text>
                </TouchableOpacity>
            </ScrollView>
        );
    }

    const p = patientProfile;
    const age = p.dateOfBirth ? String(new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear()) : '—';

    const menuSections = [
        {
            title: 'Health', items: [
                { icon: Activity, label: 'Health Records', bg: '#dcfce7', color: '#16a34a' },
                { icon: Shield, label: 'Insurance Info', bg: '#f0fdfa', color: '#0ea5e9' },
            ]
        },
        {
            title: 'Preferences', items: [
                { icon: Bell, label: 'Notifications', bg: '#fef9c3', color: '#ca8a04' },
                { icon: Settings, label: 'Settings', bg: '#f3e8ff', color: '#9333ea' },
                { icon: HelpCircle, label: 'Help & Support', bg: '#f1f5f9', color: '#334155' },
            ]
        },
    ];

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <Text style={{ fontSize: 20, fontWeight: '700', color: '#0284c7' }}>Profile</Text>
                <TouchableOpacity onPress={() => setShowEdit(true)} activeOpacity={0.7} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: '#f0fdfa' }}>
                    <Edit size={14} color="#0ea5e9" /><Text style={{ color: '#0ea5e9', fontSize: 12, fontWeight: '600' }}>Edit</Text>
                </TouchableOpacity>
            </View>

            {/* Profile Card */}
            <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#f1f5f9', alignItems: 'center', marginBottom: 16 }}>
                <View style={{ width: 80, height: 80, borderRadius: 16, backgroundColor: '#0ea5e9', alignItems: 'center', justifyContent: 'center', marginBottom: 12, overflow: 'hidden' }}>
                    <Image source={{ uri: p.gender === 'Female' ? 'https://randomuser.me/api/portraits/women/68.jpg' : 'https://randomuser.me/api/portraits/men/32.jpg' }} style={{ width: '100%', height: '100%' }} />
                </View>
                <Text style={{ fontWeight: '700', fontSize: 18, color: '#0284c7' }}>{p.fullName}</Text>
                <Text style={{ fontSize: 14, color: '#64748b' }}>{p.gender || 'Not specified'} • {p.bloodGroup || '—'}</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 16, width: '100%' }}>
                    {[
                        { icon: Calendar, label: 'Age', value: age },
                        { icon: Ruler, label: 'Height', value: p.height ? `${p.height} cm` : '—' },
                        { icon: Weight, label: 'Weight', value: p.weight ? `${p.weight} kg` : '—' },
                    ].map(({ icon: Icon, label, value }) => (
                        <View key={label} style={{ flex: 1, backgroundColor: '#f8fafc', borderRadius: 12, padding: 10, alignItems: 'center' }}>
                            <Icon size={16} color="#64748b" />
                            <Text style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>{label}</Text>
                            <Text style={{ fontSize: 14, fontWeight: '700', color: '#0284c7' }}>{value}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Contact */}
            <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 16 }}>
                {[
                    { icon: Mail, label: p.email || 'No email added' },
                    { icon: Phone, label: p.phone || 'No phone added' },
                    { icon: MapPin, label: [p.address, p.city].filter(Boolean).join(', ') || 'No address added' },
                ].map(({ icon: Icon, label }) => (
                    <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <Icon size={16} color="#64748b" /><Text style={{ fontSize: 14, color: '#0284c7' }}>{label}</Text>
                    </View>
                ))}
            </View>

            {/* Menu Sections */}
            {menuSections.map(section => (
                <View key={section.title} style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 11, fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, paddingLeft: 4 }}>{section.title}</Text>
                    <View style={{ backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9', overflow: 'hidden' }}>
                        {section.items.map(({ icon: Icon, label, bg, color }, i) => (
                            <TouchableOpacity key={label} activeOpacity={0.7} style={{ width: '100%', flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderTopWidth: i > 0 ? 1 : 0, borderTopColor: '#f1f5f9' }}>
                                <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon size={16} color={color} />
                                </View>
                                <Text style={{ flex: 1, fontSize: 14, fontWeight: '500', color: '#0284c7' }}>{label}</Text>
                                <ChevronRight size={16} color="#64748b" />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            ))}

            {/* Logout */}
            <TouchableOpacity onPress={logout} activeOpacity={0.7} style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 16, backgroundColor: '#fef2f2' }}>
                <LogOut size={16} color="#dc2626" /><Text style={{ color: '#dc2626', fontWeight: '600', fontSize: 14 }}>Sign Out</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}
