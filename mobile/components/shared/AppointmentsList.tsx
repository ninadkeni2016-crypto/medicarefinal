import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Calendar, Clock, Video, MapPin, ChevronRight } from 'lucide-react-native';
import { mockAppointments, Appointment } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { colors, spacing, radius, typography } from '@/lib/theme';
import { MedCard } from '@/components/ui/MedCard';
import { AnimatedListItem } from '@/components/ui/Animations';
import { InitialsAvatar } from '@/components/ui/InitialsAvatar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SkeletonBox } from '@/components/ui/SkeletonBox';

interface Props { onSelectAppointment?: (apt: Appointment) => void; }

const FILTERS = ['all', 'upcoming', 'confirmed', 'completed', 'cancelled'] as const;

export default function AppointmentsList({ onSelectAppointment }: Props) {
    const { role } = useAuth();
    const [filter, setFilter] = useState<string>('all');
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAppointments = async () => {
        try {
            const res = await api.get('/appointments');
            setAppointments(res.data);
        } catch (error) {
            console.error('Failed to fetch appointments:', error);
            setAppointments(mockAppointments);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.lg }}>
                <SkeletonBox height={24} width={160} style={{ marginBottom: spacing.sm }} />
                <SkeletonBox height={36} width="100%" style={{ marginBottom: spacing.xl }} />
                {[1, 2, 3].map(i => (
                    <SkeletonBox key={i} height={80} style={{ marginBottom: spacing.sm }} />
                ))}
            </View>
        );
    }

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: colors.background }}
            contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
        >
            <View style={{ marginBottom: spacing.lg }}>
                <Text style={[typography.title, { color: colors.text }]}>Appointments</Text>
                <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>{appointments.length} total</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.lg }}>
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                    {FILTERS.map(f => (
                        <TouchableOpacity
                            key={f}
                            onPress={() => setFilter(f)}
                            activeOpacity={0.7}
                            style={{
                                paddingHorizontal: spacing.lg,
                                paddingVertical: spacing.sm,
                                borderRadius: radius.md,
                                backgroundColor: filter === f ? colors.primary : colors.card,
                                borderWidth: 1,
                                borderColor: filter === f ? colors.primary : colors.border,
                            }}
                        >
                            <Text
                                style={[
                                    typography.label,
                                    {
                                        color: filter === f ? '#fff' : colors.textSecondary,
                                        textTransform: 'capitalize',
                                    },
                                ]}
                            >
                                {f}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {filtered.map((apt, idx) => {
                const updateStatus = async (status: string) => {
                    try {
                        await api.put(`/appointments/${apt._id || apt.id}`, { status });
                        fetchAppointments();
                    } catch (error) {
                        console.error('Failed to update appointment status:', error);
                    }
                };

                return (
                    <AnimatedListItem key={apt._id || apt.id} index={idx} staggerMs={55}>
                    <MedCard
                        onPress={() => onSelectAppointment?.(apt)}
                        style={{ marginBottom: spacing.sm }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                            <InitialsAvatar
                                name={role === 'doctor' ? (apt.patientName || '') : (apt.doctorName || '')}
                                size={48}
                                radius={12}
                            />
                            <View style={{ flex: 1 }}>
                                <Text style={[typography.section, { color: colors.text }]}>
                                    {role === 'doctor' ? apt.patientName : apt.doctorName}
                                </Text>
                                <Text style={[typography.caption, { color: colors.textSecondary }]}>{apt.specialization}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 6 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                        <Calendar size={12} color={colors.textMuted} />
                                        <Text style={[typography.caption, { color: colors.textSecondary }]}>{apt.date}</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                        <Clock size={12} color={colors.textMuted} />
                                        <Text style={[typography.caption, { color: colors.textSecondary }]}>{apt.time}</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={{ alignItems: 'flex-end', gap: 6 }}>
                                <StatusBadge status={apt.status} />
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                    {apt.type === 'Video Call' ? (
                                        <Video size={12} color={colors.textMuted} />
                                    ) : (
                                        <MapPin size={12} color={colors.textMuted} />
                                    )}
                                    <Text style={[typography.caption, { color: colors.textSecondary }]}>{apt.type}</Text>
                                </View>
                                {role === 'doctor' && (apt.status === 'upcoming' || apt.status === 'confirmed') && (
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                                        {apt.status === 'upcoming' && (
                                            <TouchableOpacity onPress={() => updateStatus('confirmed')} activeOpacity={0.7} style={{ paddingVertical: 4, paddingHorizontal: 8, borderRadius: radius.sm, backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: colors.border }}>
                                                <Text style={[typography.caption, { color: colors.primary, fontWeight: '600' }]}>Approve</Text>
                                            </TouchableOpacity>
                                        )}
                                        <TouchableOpacity onPress={() => updateStatus('completed')} activeOpacity={0.7} style={{ paddingVertical: 4, paddingHorizontal: 8, borderRadius: radius.sm, backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: colors.border }}>
                                            <Text style={[typography.caption, { color: colors.success, fontWeight: '600' }]}>Complete</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => updateStatus('cancelled')} activeOpacity={0.7} style={{ paddingVertical: 4, paddingHorizontal: 8, borderRadius: radius.sm, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: colors.border }}>
                                            <Text style={[typography.caption, { color: colors.danger, fontWeight: '600' }]}>Cancel</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                                <ChevronRight size={16} color={colors.textMuted} />
                            </View>
                        </View>
                    </MedCard>
                    </AnimatedListItem>
                );
            })}
        </ScrollView>
    );
}
