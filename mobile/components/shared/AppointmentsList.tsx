import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Modal, Platform } from 'react-native';
import { Calendar, Clock, MapPin, ChevronRight, X, AlertCircle } from 'lucide-react-native';
import { Appointment } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { colors, spacing, radius, typography, Shadows } from '@/lib/theme';
import { MedCard } from '@/components/ui/MedCard';
import { ScreenTransition, AnimatedListItem } from '@/components/ui/Animations';
import { InitialsAvatar } from '@/components/ui/InitialsAvatar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SkeletonBox } from '@/components/ui/SkeletonBox';
import { toast } from '@/hooks/use-toast';
import { CalendarPicker } from '@/components/ui/CalendarPicker';

interface Props { onSelectAppointment?: (apt: Appointment) => void; }

const FILTERS = ['all', 'upcoming', 'rescheduled', 'completed', 'cancelled'] as const;

const generateDates = () => {
    const dats = [];
    const today = new Date();
    for (let i = 0; i < 5; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
        const value = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        dats.push({ label, value });
    }
    return dats;
};
const dates = generateDates();

export default function AppointmentsList({ onSelectAppointment }: Props) {
    const { role } = useAuth();
    const [filter, setFilter] = useState<string>('upcoming');
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Reschedule State
    const [rescheduleModalVisible, setRescheduleModalVisible] = useState(false);
    const [reschedulingApt, setReschedulingApt] = useState<any | null>(null);
    const [selectedDate, setSelectedDate] = useState(dates[0].value);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [availableSlots, setAvailableSlots] = useState<{time: string, available: boolean}[]>([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [reschedulingLoader, setReschedulingLoader] = useState(false);

    const fetchAppointments = useCallback(async () => {
        try {
            const res = await api.get('/appointments');
            setAppointments(res.data || []);
        } catch (error) {
            console.error('Failed to fetch appointments:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Polling setup for "Real-time" effect
    useEffect(() => {
        fetchAppointments();
        const interval = setInterval(fetchAppointments, 5000); // 5s polling
        return () => clearInterval(interval);
    }, [fetchAppointments]);

    // Fetch slots when rescheduling
    useEffect(() => {
        const fetchAvailableSlots = async () => {
            if (!reschedulingApt) return;
            setSlotsLoading(true);
            try {
                const docId = reschedulingApt.doctorId?._id || reschedulingApt.doctorId;
                if (!docId) return;
                const res = await api.get('/appointments/available-slots', {
                    params: { doctorId: docId, date: selectedDate }
                });
                setAvailableSlots(res.data || []);
            } catch (err) {
                console.error('Failed to fetchSlots:', err);
            } finally {
                setSlotsLoading(false);
            }
        };
        if (rescheduleModalVisible) {
            fetchAvailableSlots();
        }
    }, [reschedulingApt, selectedDate, rescheduleModalVisible]);

    const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

    const updateStatus = async (id: string, status: string) => {
        try {
            await api.put(`/appointments/${id}`, { status });
            fetchAppointments();
            if (status === 'completed') toast({ title: 'Completed', description: 'Appointment marked as completed.' });
            if (status === 'cancelled') toast({ title: 'Cancelled', description: 'Appointment was cancelled.' });
        } catch (error: any) {
            toast({ title: 'Error', description: error.response?.data?.message || 'Failed to update', variant: 'destructive' });
        }
    };

    const handleReschedule = async () => {
        const aptId = reschedulingApt?._id || reschedulingApt?.id;
        if (!aptId || !selectedSlot) return;
        setReschedulingLoader(true);
        try {
             await api.patch(`/appointments/${aptId}/reschedule`, {
                 date: selectedDate,
                 time: selectedSlot
             });
             toast({ title: 'Rescheduled! 🔄', description: `Appointment moved to ${selectedDate} at ${selectedSlot}.` });
             setRescheduleModalVisible(false);
             fetchAppointments();
        } catch (err: any) {
             toast({ title: 'Reschedule Failed', description: err.response?.data?.message || 'Double booking error', variant: 'destructive' });
        } finally {
             setReschedulingLoader(false);
        }
    };

    const openRescheduleModal = (apt: any) => {
        setReschedulingApt(apt);
        setRescheduleModalVisible(true);
        setSelectedDate(apt.date || dates[0].value);
        setSelectedSlot('');
    };

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.lg }}>
                <SkeletonBox height={24} width={160} style={{ marginBottom: spacing.sm }} />
                <SkeletonBox height={36} width="100%" style={{ marginBottom: spacing.xl }} />
                {[1, 2, 3].map(i => (
                    <SkeletonBox key={i} height={120} style={{ marginBottom: spacing.sm }} />
                ))}
            </View>
        );
    }

    return (
        <ScreenTransition>
            <ScrollView
                style={{ flex: 1, backgroundColor: colors.background }}
            contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
        >
            <View style={{ marginBottom: spacing.lg }}>
                <Text style={[typography.title, { color: colors.text }]}>Appointments</Text>
                <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>Manage your schedules in real-time</Text>
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
                                    { color: filter === f ? '#fff' : colors.textSecondary, textTransform: 'capitalize' },
                                ]}
                            >
                                {f}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {filtered.length === 0 ? (
                <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                     <Calendar size={48} color={colors.border} />
                     <Text style={{ marginTop: 12, color: colors.textMuted, fontFamily: typography.bodyMedium.fontFamily }}>No appointments found</Text>
                </View>
            ) : filtered.map((apt: any, idx) => {
                const id = apt._id || apt.id;
                const isActive = apt.status === 'upcoming' || apt.status === 'confirmed' || apt.status === 'rescheduled';

                return (
                    <AnimatedListItem key={id} index={idx} staggerMs={40}>
                    <MedCard
                        onPress={() => onSelectAppointment?.(apt)}
                        style={{ marginBottom: spacing.sm }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md }}>
                            <InitialsAvatar
                                name={role === 'doctor' ? (apt.patientName || 'Patient') : (apt.doctorName || 'Doctor')}
                                size={52}
                                radius={14}
                            />
                            <View style={{ flex: 1 }}>
                                <Text style={[typography.section, { color: colors.text }]}>
                                    {role === 'doctor' ? apt.patientName : apt.doctorName}
                                </Text>
                                <Text style={[typography.caption, { color: colors.textSecondary }]}>{apt.specialization}</Text>
                                
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 8 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                        <Calendar size={13} color={colors.textMuted} />
                                        <Text style={[typography.caption, { color: colors.primary, fontFamily: typography.bodyMedium.fontFamily }]}>{apt.date}</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                        <Clock size={13} color={colors.textMuted} />
                                        <Text style={[typography.caption, { color: colors.primary, fontFamily: typography.bodyMedium.fontFamily }]}>{apt.time}</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={{ alignItems: 'flex-end', gap: 6 }}>
                                <StatusBadge status={apt.status} />
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                    <MapPin size={12} color={colors.textMuted} />
                                    <Text style={[typography.caption, { color: colors.textSecondary }]}>{apt.type || 'In-Person'}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Extra Info: Notes, Cancelled By, Rescheduled */}
                        {apt.notes && apt.status !== 'cancelled' ? (
                            <View style={{ backgroundColor: '#F8FAFC', padding: 8, borderRadius: 8, marginTop: 12 }}>
                                <Text style={{ fontSize: 12, color: colors.textSecondary, fontStyle: 'italic' }}>"{apt.notes}"</Text>
                            </View>
                        ) : null}

                        {apt.status === 'rescheduled' && apt.rescheduledFrom && (
                             <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center', backgroundColor: '#FDF4FF', padding: 8, borderRadius: 8, marginTop: 12 }}>
                                 <AlertCircle size={14} color="#C026D3" />
                                 <Text style={{ fontSize: 12, color: '#C026D3' }}>Moved from {apt.rescheduledFrom.date} at {apt.rescheduledFrom.time}</Text>
                             </View>
                        )}

                        {apt.status === 'cancelled' && apt.cancelledBy && (
                             <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center', backgroundColor: '#FEF2F2', padding: 8, borderRadius: 8, marginTop: 12 }}>
                                 <AlertCircle size={14} color={colors.danger} />
                                 <Text style={{ fontSize: 12, color: colors.danger }}>Cancelled by {apt.cancelledBy}</Text>
                             </View>
                        )}

                        {/* Action Buttons */}
                        {isActive && (
                            <View style={{ flexDirection: 'row', gap: 8, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border }}>
                                {role === 'doctor' && (
                                    <>
                                        <TouchableOpacity onPress={() => onSelectAppointment?.(apt)} activeOpacity={0.7} style={{ flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: radius.md, backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0' }}>
                                            <Text style={[typography.button, { color: colors.success, fontSize: 13 }]}>Complete</Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                                
                                <TouchableOpacity onPress={() => openRescheduleModal(apt)} activeOpacity={0.7} style={{ flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: radius.md, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: colors.border }}>
                                    <Text style={[typography.button, { color: colors.text, fontSize: 13 }]}>Reschedule</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => updateStatus(id, 'cancelled')} activeOpacity={0.7} style={{ flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: radius.md, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECDD3' }}>
                                    <Text style={[typography.button, { color: colors.danger, fontSize: 13 }]}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </MedCard>
                    </AnimatedListItem>
                );
            })}

            {/* Reschedule Native Modal */}
            <Modal
                visible={rescheduleModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setRescheduleModalVisible(false)}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                     <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, ...Shadows.lg }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                               <Text style={typography.title}>Reschedule</Text>
                               <TouchableOpacity onPress={() => setRescheduleModalVisible(false)}>
                                   <X size={24} color={colors.textSecondary} />
                               </TouchableOpacity>
                          </View>

                          {/* Professional Calendar Grid */}
                          <Text style={[typography.section, { marginBottom: 12 }]}>Select New Date</Text>
                          <View style={{ marginBottom: 20 }}>
                              <CalendarPicker 
                                  selectedDate={selectedDate} 
                                  onDateSelect={(date) => setSelectedDate(date)} 
                              />
                          </View>

                          {/* Time Selection with real slots */}
                          <Text style={[typography.section, { marginBottom: 12 }]}>Select New Time</Text>
                          {slotsLoading ? (
                               <ActivityIndicator size="small" color={colors.primary} style={{ padding: 20 }} />
                          ) : availableSlots.length === 0 ? (
                               <View style={{ padding: 16, backgroundColor: colors.background, borderRadius: 12, alignItems: 'center', marginBottom: 20 }}>
                                    <Text style={{ color: colors.textMuted, fontSize: 13 }}>No available slots for this date</Text>
                               </View>
                          ) : (
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 30 }}>
                                    {availableSlots.map(slot => {
                                        const isSelected = selectedSlot === slot.time;
                                        const isAvailable = slot.available;

                                        const slotBg = isSelected 
                                            ? colors.primary 
                                            : isAvailable 
                                                ? 'rgba(107, 203, 119, 0.12)'
                                                : 'rgba(231, 111, 81, 0.08)';
                                        
                                        const slotBorder = isSelected 
                                            ? colors.primary 
                                            : isAvailable 
                                                ? 'rgba(107, 203, 119, 0.3)' 
                                                : 'rgba(231, 111, 81, 0.2)';

                                        const textColor = isSelected 
                                            ? '#FFF' 
                                            : isAvailable 
                                                ? '#2D7A43'
                                                : colors.danger;

                                        return (
                                            <TouchableOpacity 
                                                key={slot.time} 
                                                disabled={!isAvailable}
                                                onPress={() => setSelectedSlot(slot.time)}
                                                activeOpacity={isAvailable ? 0.7 : 1}
                                                style={{ 
                                                    paddingHorizontal: 16, 
                                                    paddingVertical: 10, 
                                                    borderRadius: 12, 
                                                    backgroundColor: slotBg,
                                                    borderWidth: 1.5,
                                                    borderColor: slotBorder,
                                                    minWidth: '30%',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <Text style={{ 
                                                    fontSize: 13, 
                                                    fontFamily: typography.bodyMedium.fontFamily, 
                                                    color: textColor,
                                                    opacity: isAvailable || isSelected ? 1 : 0.6,
                                                    textDecorationLine: isAvailable ? 'none' : 'line-through'
                                                }}>
                                                    {slot.time}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                          )}

                          <TouchableOpacity
                              onPress={handleReschedule}
                              disabled={reschedulingLoader || !selectedSlot}
                              style={{
                                  backgroundColor: selectedSlot && !reschedulingLoader ? colors.primary : colors.border,
                                  height: 54,
                                  borderRadius: radius.md,
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexDirection: 'row',
                                  gap: 8
                              }}
                          >
                                {reschedulingLoader ? <ActivityIndicator color="#FFF" /> : (
                                     <>
                                        <Calendar size={18} color={selectedSlot ? '#FFF' : colors.textMuted} />
                                        <Text style={{ color: selectedSlot ? '#FFF' : colors.textMuted, fontSize: 16, fontFamily: typography.bodyMedium.fontFamily }}>Confirm Reschedule</Text>
                                     </>
                                )}
                          </TouchableOpacity>
                     </View>
                </View>
            </Modal>
        </ScrollView>
        </ScreenTransition>
    );
}
