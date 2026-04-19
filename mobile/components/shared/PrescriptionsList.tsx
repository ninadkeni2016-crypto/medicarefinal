import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { Pill, Calendar, Heart } from 'lucide-react-native';
import { Prescription } from '@/lib/mock-data';
import api from '@/lib/api';
import { colors, fonts, spacing, radius, typography, Shadows } from '@/lib/theme';
import { MedCard } from '../ui/MedCard';
import { ScreenTransition, AnimatedListItem } from '../ui/Animations';

export default function PrescriptionsList() {
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPrescriptions = async () => {
        try {
            const res = await api.get('/prescriptions');
            setPrescriptions(res.data || []);
        } catch (error) {
            console.error('Failed to fetch prescriptions:', error);
            setPrescriptions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrescriptions();
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <ScreenTransition>
            <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                <View style={{ marginBottom: 24 }}>
                    <Text style={[typography.screenTitle, { color: colors.text }]}>Prescriptions</Text>
                    <Text style={[typography.body, { color: colors.textSecondary, marginTop: 4 }]}>{prescriptions.length} Active Records</Text>
                </View>

                {prescriptions.length === 0 ? (
                    <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                        <Pill size={48} color={colors.border} />
                        <Text style={{ marginTop: 16, color: colors.textMuted, fontFamily: fonts.medium }}>No prescriptions found</Text>
                    </View>
                ) : prescriptions.map((rx, idx) => (
                    <AnimatedListItem key={rx.id || idx} index={idx} staggerMs={40}>
                        <MedCard style={{ marginBottom: 12, padding: 16 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(107, 203, 119, 0.1)', alignItems: 'center', justifyContent: 'center' }}>
                                    <Pill size={22} color={colors.success} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontFamily: fonts.bold, fontSize: 16, color: colors.text }}>Dr. {rx.doctorName}</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                                        <Calendar size={12} color={colors.textSecondary} />
                                        <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: colors.textSecondary }}>{rx.date}</Text>
                                    </View>
                                </View>
                                <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: 'rgba(31, 78, 95, 0.05)' }}>
                                    <Text style={{ fontFamily: fonts.semiBold, fontSize: 11, color: colors.primary }}>Active</Text>
                                </View>
                            </View>

                            <View style={{ gap: 8 }}>
                                {rx.medicines.map((med, i) => (
                                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.background, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.border }}>
                                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success }} />
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontFamily: fonts.semiBold, fontSize: 14, color: colors.text }}>{med.name}</Text>
                                            <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>{med.dosage} • {med.frequency}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>

                            {rx.notes && (
                                <View style={{ marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border }}>
                                    <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, fontStyle: 'italic', lineHeight: 20 }}>
                                        " {rx.notes} "
                                    </Text>
                                </View>
                            )}
                        </MedCard>
                    </AnimatedListItem>
                ))}
            </ScrollView>
        </ScreenTransition>
    );
}
