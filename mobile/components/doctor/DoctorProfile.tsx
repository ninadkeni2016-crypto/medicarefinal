import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Mail, Phone, MapPin, Award, Users, Star, LogOut, ChevronRight, Settings } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import EditDoctorProfileForm from './EditDoctorProfileForm';

export default function DoctorProfile({ onNavigate }: { onNavigate?: (tab: string) => void }) {
    const { logout } = useAuth();
    const [isEditing, setIsEditing] = useState(false);

    const menuItems = [
        { icon: Award, label: 'Certifications', bg: '#f0fdfa', color: '#0ea5e9' },
        { icon: Users, label: 'My Patients', bg: '#dcfce7', color: '#16a34a', tab: 'patients' },
        { icon: Star, label: 'Reviews', bg: '#fef9c3', color: '#ca8a04' },
        { icon: Settings, label: 'Settings', bg: '#f3e8ff', color: '#9333ea', tab: 'settings' },
    ];

    if (isEditing) {
        return <EditDoctorProfileForm onBack={() => setIsEditing(false)} />;
    }

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#0284c7', marginBottom: 16 }}>Profile</Text>

            <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#f1f5f9', alignItems: 'center', marginBottom: 16 }}>
                <View style={{ width: 80, height: 80, borderRadius: 16, marginBottom: 12, backgroundColor: '#e0f2fe', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 28, fontWeight: '800', color: '#0284c7' }}>SM</Text>
                </View>
                <Text style={{ fontWeight: '700', fontSize: 18, color: '#0284c7' }}>Dr. Sameer Mahadik</Text>
                <Text style={{ fontSize: 14, color: '#0ea5e9', fontWeight: '500' }}>Cardiologist</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 16, width: '100%' }}>
                    {[
                        { label: 'Experience', value: '12 yrs' },
                        { label: 'Patients', value: '1,240' },
                        { label: 'Rating', value: '4.9 ⭐' },
                    ].map(({ label, value }) => (
                        <View key={label} style={{ flex: 1, backgroundColor: '#f8fafc', borderRadius: 12, padding: 10, alignItems: 'center' }}>
                            <Text style={{ fontSize: 10, color: '#64748b' }}>{label}</Text>
                            <Text style={{ fontSize: 14, fontWeight: '700', color: '#0284c7' }}>{value}</Text>
                        </View>
                    ))}
                </View>
                <TouchableOpacity onPress={() => setIsEditing(true)} activeOpacity={0.7} style={{ width: '100%', marginTop: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center' }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#0284c7' }}>Edit Profile</Text>
                </TouchableOpacity>
            </View>

            <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 16 }}>
                {[
                    { icon: Mail, label: 'sameer.mahadik@medicare.com' },
                    { icon: Phone, label: '+91 98765 43210' },
                    { icon: MapPin, label: 'Apollo Hospital, Mumbai' },
                ].map(({ icon: Icon, label }) => (
                    <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <Icon size={16} color="#64748b" /><Text style={{ fontSize: 14, color: '#0284c7' }}>{label}</Text>
                    </View>
                ))}
            </View>

            <View style={{ backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9', overflow: 'hidden', marginBottom: 16 }}>
                {menuItems.map(({ icon: Icon, label, bg, color, tab }, i) => (
                    <TouchableOpacity key={label} onPress={() => tab && onNavigate?.(tab)} activeOpacity={0.7} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderTopWidth: i > 0 ? 1 : 0, borderTopColor: '#f1f5f9' }}>
                        <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
                            <Icon size={16} color={color} />
                        </View>
                        <Text style={{ flex: 1, fontSize: 14, fontWeight: '500', color: '#0284c7' }}>{label}</Text>
                        <ChevronRight size={16} color="#64748b" />
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity onPress={logout} activeOpacity={0.7} style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 16, backgroundColor: '#fef2f2' }}>
                <LogOut size={16} color="#dc2626" /><Text style={{ color: '#dc2626', fontWeight: '600', fontSize: 14 }}>Sign Out</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}
