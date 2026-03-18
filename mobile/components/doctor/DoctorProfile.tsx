import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import {
    Mail, Phone, MapPin, Award, Settings, Camera,
    Shield, Bell, HelpCircle, ChevronRight, LogOut, Stethoscope, Star, Users
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import EditDoctorProfileForm from './EditDoctorProfileForm';
import { MedCard } from '@/components/ui/MedCard';
import { colors, cardShadow, radius, typography, fonts } from '@/lib/theme';

function getInitials(name: string): string {
    return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function DoctorProfile({ onNavigate }: { onNavigate?: (tab: string) => void }) {
    const { logout, userName, patientProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);

    const doctorName = userName || 'Doctor';
    const initials = getInitials(doctorName);
    const email = patientProfile?.email || 'doctor@medicare.com';

    const menuItems = [
        { icon: Award, label: 'Professional Certifications', bg: '#EFF6FF', color: '#2563EB' },
        { icon: Shield, label: 'Medical License & Privacy', bg: '#ECFDF5', color: '#059669' },
        { icon: Bell, label: 'Push Notifications', bg: '#FFFBEB', color: '#D97706' },
        { icon: Settings, label: 'Account Settings', bg: '#F5F3FF', color: '#7C3AED', tab: 'settings' },
        { icon: HelpCircle, label: 'Help & Support Center', bg: '#F7F8FA', color: colors.textSecondary },
    ];

    if (isEditing) {
        return <EditDoctorProfileForm onBack={() => setIsEditing(false)} />;
    }

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: colors.background }}
            contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View style={{ marginBottom: 28 }}>
                <Text style={typography.screenTitle}>My Profile</Text>
                <Text style={[typography.body, { color: colors.textSecondary, marginTop: 4 }]}>
                    Manage your professional details
                </Text>
            </View>

            {/* Profile Card */}
            <MedCard style={{ padding: 24, alignItems: 'center', marginBottom: 20 }}>
                {/* Avatar with initials */}
                <View style={{ position: 'relative', marginBottom: 16 }}>
                    <View style={{
                        width: 96, height: 96, borderRadius: 32,
                        backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center',
                        borderWidth: 3, borderColor: colors.border,
                    }}>
                        <Text style={{ fontFamily: fonts.bold, fontSize: 32, color: colors.primary }}>
                            {initials}
                        </Text>
                    </View>
                    <TouchableOpacity style={{
                        position: 'absolute', bottom: -4, right: -4,
                        width: 30, height: 30, borderRadius: 10,
                        backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
                        borderWidth: 2, borderColor: '#FFF',
                    }}>
                        <Camera size={14} color="#FFF" />
                    </TouchableOpacity>
                </View>

                <Text style={{ fontFamily: fonts.bold, fontSize: 22, color: colors.text }}>
                    Dr. {doctorName}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <Stethoscope size={14} color={colors.primary} />
                    <Text style={{ fontFamily: fonts.medium, fontSize: 14, color: colors.primary }}>
                        Senior Physician
                    </Text>
                </View>

                {/* Stats Row */}
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 24, width: '100%' }}>
                    {[
                        { icon: Star, label: 'Rating', value: '4.9', bg: '#FFFBEB', color: '#D97706' },
                        { icon: Users, label: 'Patients', value: '1.2k+', bg: '#ECFDF5', color: '#059669' },
                        { icon: Award, label: 'Experience', value: '12 yr', bg: '#EFF6FF', color: '#2563EB' },
                    ].map((item) => (
                        <View key={item.label} style={{
                            flex: 1, backgroundColor: item.bg, borderRadius: 16,
                            padding: 12, alignItems: 'center', gap: 4,
                        }}>
                            <item.icon size={16} color={item.color} />
                            <Text style={{ fontFamily: fonts.bold, fontSize: 15, color: item.color }}>
                                {item.value}
                            </Text>
                            <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.textSecondary }}>
                                {item.label}
                            </Text>
                        </View>
                    ))}
                </View>

                <TouchableOpacity
                    onPress={() => setIsEditing(true)}
                    style={{
                        marginTop: 20, width: '100%', height: 52, borderRadius: 16,
                        backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
                        ...cardShadow,
                    }}
                >
                    <Text style={{ fontFamily: fonts.semiBold, fontSize: 15, color: '#FFF' }}>
                        Edit Profile Details
                    </Text>
                </TouchableOpacity>
            </MedCard>

            {/* Contact Information */}
            <View style={{ marginBottom: 20 }}>
                <Text style={{
                    fontFamily: fonts.semiBold, fontSize: 11, color: colors.textMuted,
                    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10,
                }}>
                    Contact Information
                </Text>
                <MedCard style={{ padding: 20 }}>
                    {[
                        { icon: Mail, label: email, color: colors.primary },
                        { icon: Phone, label: '+91 98765 43210', color: colors.success },
                        { icon: MapPin, label: 'Apollo Hospital, Mumbai', color: colors.danger },
                    ].map((item, i) => (
                        <View key={item.label} style={{
                            flexDirection: 'row', alignItems: 'center', gap: 14,
                            marginBottom: i === 2 ? 0 : 16,
                        }}>
                            <View style={{
                                width: 38, height: 38, borderRadius: 12,
                                backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center',
                                borderWidth: 1, borderColor: colors.border,
                            }}>
                                <item.icon size={16} color={item.color} />
                            </View>
                            <Text style={{ fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary, flex: 1 }}>
                                {item.label}
                            </Text>
                        </View>
                    ))}
                </MedCard>
            </View>

            {/* Menu */}
            <View style={{ marginBottom: 28 }}>
                <Text style={{
                    fontFamily: fonts.semiBold, fontSize: 11, color: colors.textMuted,
                    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10,
                }}>
                    Settings & Actions
                </Text>
                <MedCard style={{ padding: 0, overflow: 'hidden' }}>
                    {menuItems.map((item, i) => (
                        <TouchableOpacity
                            key={item.label}
                            onPress={() => item.tab && onNavigate?.(item.tab)}
                            activeOpacity={0.7}
                            style={{
                                flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16,
                                borderBottomWidth: i === menuItems.length - 1 ? 0 : 1,
                                borderBottomColor: colors.border,
                            }}
                        >
                            <View style={{
                                width: 40, height: 40, borderRadius: 12,
                                backgroundColor: item.bg, alignItems: 'center', justifyContent: 'center',
                            }}>
                                <item.icon size={18} color={item.color} />
                            </View>
                            <Text style={{ flex: 1, fontFamily: fonts.medium, fontSize: 15, color: colors.text }}>
                                {item.label}
                            </Text>
                            <ChevronRight size={16} color={colors.border} />
                        </TouchableOpacity>
                    ))}
                </MedCard>
            </View>

            {/* Logout */}
            <TouchableOpacity
                onPress={logout}
                activeOpacity={0.8}
                style={{
                    height: 56, borderRadius: 18, backgroundColor: '#FEF2F2',
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                    gap: 10, borderWidth: 1, borderColor: '#FECACA',
                }}
            >
                <LogOut size={20} color={colors.danger} />
                <Text style={{ fontFamily: fonts.semiBold, fontSize: 16, color: colors.danger }}>
                    Sign Out
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}
