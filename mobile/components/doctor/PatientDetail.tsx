import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { ArrowLeft, User, Phone, Mail, Calendar, Activity, AlertCircle, FileText } from 'lucide-react-native';
import { colors, fonts, typography, cardShadow } from '@/lib/theme';
import { MedCard } from '@/components/ui/MedCard';
import { InitialsAvatar } from '@/components/ui/InitialsAvatar';

export default function PatientDetail({ patient, onBack, onNavigate }: any) {
    const name = patient.fullName || patient.name || 'Unknown Patient';
    const ageGender = [patient.age ? `${patient.age} yrs` : '', patient.gender].filter(Boolean).join(', ');

    return (
        <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24, paddingVertical: 8 }}>
                <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, ...cardShadow }}>
                    <ArrowLeft size={20} color={colors.text} />
                </TouchableOpacity>
                <Text style={[typography.screenTitle, {flex: 1, textAlign: 'center', marginRight: 44}]}>Patient Profile</Text>
            </View>

            {/* Main Info Card */}
            <MedCard style={{ padding: 24, alignItems: 'center', marginBottom: 24 }}>
                <InitialsAvatar name={name} size={90} radius={28} />
                <Text style={{ fontFamily: fonts.bold, fontSize: 24, color: colors.text, marginTop: 16 }}>{name}</Text>
                {!!ageGender && <Text style={{ fontFamily: fonts.medium, fontSize: 15, color: colors.textSecondary, marginTop: 6 }}>{ageGender}</Text>}
                
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 24, width: '100%' }}>
                    <TouchableOpacity onPress={() => onNavigate?.('messages', { patient })} style={{ flex: 1, paddingVertical: 14, backgroundColor: colors.primary, borderRadius: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
                        <Mail size={18} color="#FFF" />
                        <Text style={{ fontFamily: fonts.semiBold, color: '#FFF', fontSize: 15 }}>Message</Text>
                    </TouchableOpacity>
                    {!!patient.phone && (
                        <TouchableOpacity style={{ flex: 1, paddingVertical: 14, backgroundColor: '#EFF6FF', borderRadius: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
                            <Phone size={18} color={colors.primary} />
                            <Text style={{ fontFamily: fonts.semiBold, color: colors.primary, fontSize: 15 }}>Call</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </MedCard>

            {/* Medical Info */}
            <Text style={{ fontFamily: fonts.bold, fontSize: 17, color: colors.text, marginBottom: 18, marginLeft: 4 }}>Medical Status</Text>
            
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                <MedCard style={{ flex: 1, minWidth: '45%', padding: 18, gap: 14 }}>
                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center' }}>
                        <Activity size={20} color="#EF4444" />
                    </View>
                    <View>
                        <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary }}>Condition</Text>
                        <Text style={{ fontFamily: fonts.semiBold, fontSize: 16, color: colors.text, marginTop: 2 }}>{patient.condition || 'Stable'}</Text>
                    </View>
                </MedCard>

                <MedCard style={{ flex: 1, minWidth: '45%', padding: 18, gap: 14 }}>
                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#FFFBEB', alignItems: 'center', justifyContent: 'center' }}>
                        <AlertCircle size={20} color="#F59E0B" />
                    </View>
                    <View>
                        <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary }}>Blood Group</Text>
                        <Text style={{ fontFamily: fonts.semiBold, fontSize: 16, color: colors.text, marginTop: 2 }}>{patient.bloodGroup || 'O+ (Sample)'}</Text>
                    </View>
                </MedCard>

                <MedCard style={{ flex: 1, minWidth: '45%', padding: 18, gap: 14 }}>
                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={20} color="#10B981" />
                    </View>
                    <View>
                        <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary }}>Weight</Text>
                        <Text style={{ fontFamily: fonts.semiBold, fontSize: 16, color: colors.text, marginTop: 2 }}>{patient.weight ? `${patient.weight} kg` : '65 kg'}</Text>
                    </View>
                </MedCard>

                <MedCard style={{ flex: 1, minWidth: '45%', padding: 18, gap: 14 }}>
                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' }}>
                        <Calendar size={20} color="#3B82F6" />
                    </View>
                    <View>
                        <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary }}>Last Visit</Text>
                        <Text style={{ fontFamily: fonts.semiBold, fontSize: 16, color: colors.text, marginTop: 2 }}>{patient.lastVisit || 'No prior visits'}</Text>
                    </View>
                </MedCard>
            </View>

        </ScrollView>
    );
}
