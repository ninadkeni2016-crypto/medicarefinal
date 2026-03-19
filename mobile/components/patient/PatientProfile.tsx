import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Platform, Dimensions } from 'react-native';
import { 
    User, Mail, Phone, MapPin, Calendar, Activity, 
    Shield, LogOut, ChevronRight, Settings, Bell, 
    HelpCircle, Ruler, Weight
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import EditProfileForm from './EditProfileForm';

import { MedCard } from '../ui/MedCard';
import { colors, spacing, radius, typography, cardShadow, fonts } from '@/lib/theme';
import { SectionHeader } from '../ui/SectionHeader';

const { width } = Dimensions.get('window');

export default function PatientProfile({ onNavigate }: { onNavigate?: (tab: string) => void }) {
    const { logout, patientProfile, isProfileComplete } = useAuth();
    const [showEdit, setShowEdit] = useState(false);

    if (showEdit) {
        return <EditProfileForm onBack={() => setShowEdit(false)} />;
    }

    if (!isProfileComplete) {
        return (
            <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 20, justifyContent: 'center', minHeight: '100%' }}>
                <MedCard style={{ padding: 32, alignItems: 'center' }}>
                    <View style={{ width: 100, height: 100, borderRadius: 32, backgroundColor: 'rgba(99, 102, 241, 0.05)', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                        <User size={48} color={colors.textMuted} />
                    </View>
                    <Text style={[typography.screenTitle, { textAlign: 'center' }]}>Setup Your Profile</Text>
                    <Text style={[typography.body, { textAlign: 'center', marginTop: 8 }]}>Complete your profile to unlock personalized health tracking and doctor bookings.</Text>
                    
                    <TouchableOpacity 
                        onPress={() => setShowEdit(true)}
                        style={{ marginTop: 32, width: '100%', height: 56, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', ...cardShadow }}
                    >
                        <Text style={{ color: '#FFF', fontFamily: fonts.bold, fontSize: 16 }}>CREATE PROFILE</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={logout} style={{ marginTop: 24 }}>
                        <Text style={{ fontFamily: fonts.semiBold, color: colors.danger, fontSize: 14 }}>Sign Out</Text>
                    </TouchableOpacity>
                </MedCard>
            </ScrollView>
        );
    }

    const p = patientProfile;
    const age = p.dateOfBirth ? String(new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear()) : '—';

    const menuSections = [
        {
            title: 'Health Management', items: [
                { icon: Activity, label: 'Medical Records',   bg: 'rgba(107, 203, 119, 0.10)', color: colors.success  },
                { icon: Shield,   label: 'Insurance Details', bg: 'rgba(31, 78, 95, 0.10)',    color: colors.primary  },
            ]
        },
        {
            title: 'Account Settings', items: [
                { icon: Bell,       label: 'Notifications', bg: 'rgba(244, 162, 97, 0.10)',  color: colors.warning  },
                { icon: Settings,   label: 'Preferences',  bg: 'rgba(31, 78, 95, 0.10)',    color: colors.primary  },
                { icon: HelpCircle, label: 'Support & FAQ', bg: 'rgba(148, 163, 184, 0.10)', color: colors.textSecondary },
            ]
        },
    ];

    return (
        <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                <Text style={typography.screenTitle}>My Profile</Text>
                <TouchableOpacity 
                    onPress={() => setShowEdit(true)}
                    activeOpacity={0.8}
                    style={{ paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, backgroundColor: 'rgba(31, 78, 95, 0.08)', borderWidth: 1, borderColor: 'rgba(31, 78, 95, 0.15)' }}
                >
                    <Text style={{ fontFamily: fonts.semiBold, color: colors.primary, fontSize: 14 }}>Edit Profile</Text>
                </TouchableOpacity>
            </View>

            {/* Profile Card */}
            <MedCard style={{ padding: 24, alignItems: 'center', marginBottom: 32 }}>
                <View style={{ marginBottom: 20 }}>
                    <View style={{
                        width: 100, height: 100, borderRadius: 32,
                        backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center',
                        borderWidth: 3, borderColor: colors.border, ...cardShadow,
                    }}>
                        <Text style={{ fontFamily: fonts.bold, fontSize: 34, color: colors.primary }}>
                            {p.fullName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
                        </Text>
                    </View>
                </View>

                <Text style={{ fontFamily: fonts.bold, fontSize: 22, color: colors.text }}>{p.fullName}</Text>
                <Text style={{ fontFamily: fonts.medium, fontSize: 14, color: colors.textSecondary, marginTop: 4 }}>{p.gender || 'Not specified'} · {p.bloodGroup || '—'} Group</Text>
                
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 28, width: '100%' }}>
                    {[
                        // Age — teal tint
                        { icon: Calendar, label: 'Age',    value: `${age} yr`,                     color: colors.primary, bg: 'rgba(31, 78, 95, 0.08)' },
                        // Height — teal-green tint
                        { icon: Ruler,    label: 'Height', value: p.height ? `${p.height} cm` : '—', color: colors.success, bg: 'rgba(107, 203, 119, 0.10)' },
                        // Weight — soft orange tint
                        { icon: Weight,   label: 'Weight', value: p.weight ? `${p.weight} kg` : '—', color: colors.warning, bg: 'rgba(244, 162, 97, 0.10)' },
                    ].map((item) => (
                        <View key={item.label} style={{ flex: 1, backgroundColor: colors.background, borderRadius: 18, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.border }}>
                            <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: item.bg, alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                                <item.icon size={16} color={item.color} />
                            </View>
                            <Text style={{ fontFamily: fonts.semiBold, fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.label}</Text>
                            <Text style={{ fontFamily: fonts.bold, fontSize: 15, color: colors.text, marginTop: 2 }}>{item.value}</Text>
                        </View>
                    ))}
                </View>
            </MedCard>

            {/* Contact Info */}
            <View style={{ marginBottom: 32 }}>
                <SectionHeader title="Contact Information" />
                <MedCard style={{ padding: 20 }}>
                    {[
                        { icon: Mail,   label: p.email || 'No email added',                                         color: colors.primary,   bg: 'rgba(31, 78, 95, 0.08)'     },
                        { icon: Phone,  label: p.phone || 'No phone added',                                         color: colors.success,   bg: 'rgba(107, 203, 119, 0.08)' },
                        { icon: MapPin, label: [p.address, p.city].filter(Boolean).join(', ') || 'No address added', color: colors.danger,    bg: 'rgba(231, 111, 81, 0.08)'  },
                    ].map((item, i) => (
                        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: i === 2 ? 0 : 20 }}>
                            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border }}>
                                <item.icon size={18} color={item.color} />
                            </View>
                            <Text style={{ fontFamily: fonts.medium, fontSize: 14, color: colors.textSecondary, flex: 1 }}>{item.label}</Text>
                        </View>
                    ))}
                </MedCard>
            </View>

            {/* Menu Sections */}
            {menuSections.map(section => (
                <View key={section.title} style={{ marginBottom: 32 }}>
                    <SectionHeader title={section.title} />
                    <MedCard style={{ padding: 0, overflow: 'hidden' }}>
                        {section.items.map((item, i) => (
                            <TouchableOpacity key={item.label} activeOpacity={0.7} style={{ flexDirection: 'row', alignItems: 'center', gap: 16, padding: 18, borderBottomWidth: i === section.items.length - 1 ? 0 : 1, borderBottomColor: colors.border }}>
                                <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: item.bg, alignItems: 'center', justifyContent: 'center' }}>
                                    <item.icon size={20} color={item.color} />
                                </View>
                                <Text style={{ flex: 1, fontFamily: fonts.semiBold, fontSize: 15, color: colors.text }}>{item.label}</Text>
                                <ChevronRight size={20} color={colors.textMuted} />
                            </TouchableOpacity>
                        ))}
                    </MedCard>
                </View>
            ))}

            {/* Logout */}
            <TouchableOpacity 
                onPress={logout}
                activeOpacity={0.8}
                style={{ height: 60, borderRadius: 20, backgroundColor: 'rgba(239, 68, 68, 0.08)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 8, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.1)' }}
            >
                <LogOut size={22} color={colors.danger} />
                <Text style={{ fontFamily: fonts.semiBold, color: colors.danger, fontSize: 16 }}>Sign Out</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}
