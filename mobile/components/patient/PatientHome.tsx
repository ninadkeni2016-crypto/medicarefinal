import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Calendar, FileText, Pill, Bell, ChevronRight, CreditCard, Clock, ShoppingBag, Heart, Activity, Droplets, Scale } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import RazorpayCheckout from '../shared/RazorpayCheckout';
import api from '@/lib/api';
import { colors, spacing, radius, typography, cardShadow, fonts, metricTints } from '@/lib/theme';
import { MedCard } from '@/components/ui/MedCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SkeletonBox } from '@/components/ui/SkeletonBox';
import { InitialsAvatar } from '@/components/ui/InitialsAvatar';
import { QueueStatusCard } from './QueueStatusCard';
import { ScreenTransition, AnimatedListItem, ScalePress } from '@/components/ui/Animations';

interface PatientHomeProps { onNavigate: (tab: string) => void; }

export default function PatientHome({ onNavigate }: PatientHomeProps) {
    const { userName, patientProfile, refreshProfile } = useAuth();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [topDoctors, setTopDoctors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPayment, setShowPayment] = useState(false);
    const [paymentDone, setPaymentDone] = useState(false);
    const [pendingBills, setPendingBills] = useState<any[]>([]);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                // Refresh profile first to get latest vitals
                await refreshProfile().catch(() => {});

                const [apptsRes, notifsRes, docsRes, billsRes] = await Promise.all([
                    api.get('/appointments'),
                    api.get('/notifications').catch(() => ({ data: [] })),
                    api.get('/doctors').catch(() => ({ data: [] })),
                    api.get('/bills').catch(() => ({ data: [] })),
                ]);
                setAppointments(apptsRes.data || []);
                setNotifications(notifsRes.data || []);
                setTopDoctors(docsRes.data || []);
                const bills = billsRes.data || [];
                setPendingBills(bills.filter((b: any) => b.status !== 'Paid'));
            } catch (error) {
                console.error('Failed to load patient dashboard:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    const upcoming = appointments.filter(a => a.status === 'upcoming');
    const completed = appointments.filter(a => a.status === 'completed');
    const nextAppointment = upcoming[0];
    
    const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const todaysAppointment = upcoming.find(a => a.date === todayStr);

    const stats = [
        { label: 'Upcoming', value: upcoming.length },
        { label: 'Total Visits', value: appointments.length },
        { label: 'Completed', value: completed.length },
    ];

    const quickActions = [
        { icon: Calendar, label: 'Book', tab: 'find-doctor' },
        { icon: Pill, label: 'Prescriptions', tab: 'prescriptions' },
        { icon: ShoppingBag, label: 'Pharmacy', tab: 'pharmacy' },
        { icon: CreditCard, label: 'Billing', tab: 'billing' },
    ];

    const hasVitals = patientProfile.vitals && (
        patientProfile.vitals.heartRate || patientProfile.vitals.bloodPressure || 
        patientProfile.vitals.bloodSugar || patientProfile.vitals.weight
    );

    const healthMetrics = [
        { label: 'Heart Rate',      value: patientProfile.vitals?.heartRate      || '--',    Icon: Heart,     bg: metricTints.heartRate.bg,     iconColor: metricTints.heartRate.icon     },
        { label: 'Blood Pressure',  value: patientProfile.vitals?.bloodPressure  || '--',    Icon: Activity,  bg: metricTints.bloodPressure.bg, iconColor: metricTints.bloodPressure.icon },
        { label: 'Blood Sugar',     value: patientProfile.vitals?.bloodSugar     || '--',  Icon: Droplets,  bg: metricTints.bloodSugar.bg,    iconColor: metricTints.bloodSugar.icon    },
        { label: 'Weight',          value: patientProfile.vitals?.weight         || '--',     Icon: Scale,     bg: metricTints.weight.bg,        iconColor: metricTints.weight.icon        },
    ];

    const handleSuccess = () => {
        setPaymentDone(true);
        setShowPayment(false);
    };

    const handleCancel = () => {
        setShowPayment(false);
        toast({ title: 'Payment cancelled', description: 'You can pay anytime from the billing section.' });
    };

    return (
        <ScreenTransition>
            <ScrollView
                style={{ flex: 1, backgroundColor: colors.background }}
                contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xl }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                    <Image
                        source={require('../../assets/images/logo.png')}
                        style={{ width: 60, height: 60 }}
                        resizeMode="contain"
                    />
                    <View>
                        <Text style={[typography.label, { color: colors.textSecondary }]}>Welcome back,</Text>
                        <Text style={[typography.screenTitle, { fontSize: 22 }]}>{userName}</Text>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={() => onNavigate('notifications')}
                    activeOpacity={0.7}
                    style={{
                        width: 44,
                        height: 44,
                        borderRadius: 14,
                        backgroundColor: colors.card,
                        borderWidth: 1,
                        borderColor: colors.border,
                        alignItems: 'center',
                        justifyContent: 'center',
                        ...cardShadow,
                    }}
                >
                    <Bell size={22} color={colors.text} strokeWidth={2} />
                    <View style={{ position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger, borderWidth: 2, borderColor: colors.card }} />
                </TouchableOpacity>
            </View>

            {/* Live Queue Status */}
            {todaysAppointment && (
                <QueueStatusCard 
                    doctorId={(todaysAppointment.doctorId?._id || todaysAppointment.doctorId).toString()} 
                    date={todaysAppointment.date} 
                />
            )}

            {/* Stats */}
            {loading ? (
                <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl }}>
                    {[1, 2, 3].map(i => (
                        <SkeletonBox key={i} height={72} style={{ flex: 1 }} />
                    ))}
                </View>
            ) : (
                <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl }}>
                    {stats.map(s => (
                        <MedCard key={s.label} style={{ flex: 1, padding: spacing.md }}>
                            <Text style={typography.label}>{s.label}</Text>
                            <Text style={[typography.cardValue, { color: colors.primary, marginTop: 4 }]}>{s.value}</Text>
                        </MedCard>
                    ))}
                </View>
            )}

            {/* Next Appointment */}
            {nextAppointment && (
                <MedCard
                    onPress={() => onNavigate('appointments')}
                    style={{
                        marginBottom: spacing.xl,
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                        padding: 20,
                        borderRadius: radius.xl,    // 24px — hero card gets highest radius
                        overflow: 'hidden',
                    }}
                >
                    {/* Decorative Background Patterns */}
                    <View style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.1)' }} />
                    <View style={{ position: 'absolute', bottom: -10, left: -10, width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.05)' }} />

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                        <View>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1 }}>Next Appointment</Text>
                            <Text style={{ fontSize: 20, fontWeight: '700', color: '#fff', marginTop: 4 }}>{nextAppointment.doctorName}</Text>
                            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>{nextAppointment.specialization}</Text>
                        </View>
                        <InitialsAvatar name={nextAppointment.doctorName || ''} size={56} radius={16} />
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: 'rgba(255,255,255,0.15)', padding: 12, borderRadius: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Calendar size={16} color="#fff" />
                            <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>{nextAppointment.date}</Text>
                        </View>
                        <View style={{ width: 1, height: 16, backgroundColor: 'rgba(255,255,255,0.3)' }} />
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Clock size={16} color="#fff" />
                            <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>{nextAppointment.time}</Text>
                        </View>
                    </View>
                </MedCard>
            )}

            {/* Quick actions */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: spacing.xl }}>
                {quickActions.map(({ icon: Icon, label, tab }, i) => (
                    <AnimatedListItem key={label} index={i} style={{ flex: 1 }}>
                        <TouchableOpacity
                            onPress={() => onNavigate(tab)}
                            activeOpacity={0.75}
                            style={{
                                alignItems: 'center',
                                gap: 8,
                                paddingVertical: 16,
                                backgroundColor: colors.card,
                                borderRadius: radius.lg,
                                borderWidth: 1,
                                borderColor: colors.border,
                                ...cardShadow as object,
                            }}
                        >
                            <View style={{
                                width: 44, height: 44,
                                borderRadius: radius.md,
                                backgroundColor: 'rgba(29, 143, 212, 0.10)',
                                alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Icon size={22} color={colors.primary} strokeWidth={2} />
                            </View>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text }}>{label}</Text>
                        </TouchableOpacity>
                    </AnimatedListItem>
                ))}
            </View>

            {/* Pending payment */}
            {!paymentDone && pendingBills.length > 0 && (
                <MedCard onPress={() => setShowPayment(true)} style={{ marginBottom: spacing.xl, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                    <View style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center' }}>
                        <CreditCard size={22} color={colors.danger} strokeWidth={2} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[typography.section, { color: colors.text }]}>Pending payments</Text>
                        <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>{pendingBills.length} bill{pendingBills.length !== 1 ? 's' : ''} awaiting payment</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 15, fontWeight: '600', color: colors.danger }}>₹{pendingBills.reduce((s: number, b: any) => s + (b.total || 0), 0).toLocaleString()}</Text>
                        <Text style={[typography.caption, { color: colors.primary, fontWeight: '500' }]}>Pay</Text>
                    </View>
                </MedCard>
            )}

            {/* Upcoming appointments */}
            {!loading && upcoming.length > 0 && (
                <View style={{ marginBottom: spacing.xl }}>
                    <SectionHeader title="Upcoming appointments" onViewAll={() => onNavigate('appointments')} />
                    {upcoming.slice(0, 3).map(apt => (
                        <MedCard key={apt._id || apt.id} onPress={() => onNavigate('appointments')} style={{ marginBottom: spacing.sm }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                                <InitialsAvatar name={apt.doctorName || ''} size={40} radius={10} />
                                <View style={{ flex: 1 }}>
                                    <Text style={[typography.section, { color: colors.text }]}>{apt.doctorName}</Text>
                                    <Text style={[typography.caption, { color: colors.textSecondary }]}>{apt.specialization}</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 }}>
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
                                <StatusBadge status={apt.status} />
                                <ChevronRight size={16} color={colors.textMuted} />
                            </View>
                        </MedCard>
                    ))}
                </View>
            )}

            {/* Top doctors */}
            <View style={{ marginBottom: spacing.xl }}>
                <SectionHeader title="Recommended Doctors" onViewAll={() => onNavigate('find-doctor')} />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 20 }}>
                    {topDoctors.slice(0, 5).map(doc => (
                        <MedCard key={doc._id || doc.id} onPress={() => onNavigate('find-doctor')} style={{ width: 280, padding: 16 }}>
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <InitialsAvatar name={doc.name || ''} size={64} radius={16} />
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }} numberOfLines={1}>{doc.name}</Text>
                                    <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>{doc.specialization}</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 }}>
                                        <View style={{ backgroundColor: '#FFFBEB', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                                            <Text style={{ fontSize: 12, fontWeight: '700', color: '#B45309' }}>★ {doc.rating}</Text>
                                        </View>
                                        <Text style={{ fontSize: 12, color: colors.textMuted }}>• {doc.experience} exp</Text>
                                    </View>
                                </View>
                            </View>
                        </MedCard>
                    ))}
                </ScrollView>
            </View>

            {/* Notifications */}
            {!loading && notifications.length > 0 && (
                <View style={{ marginBottom: spacing.xl }}>
                    <SectionHeader title="Notifications" onViewAll={() => onNavigate('notifications')} />
                    {notifications.slice(0, 3).map(n => (
                        <MedCard key={n._id} style={{ marginBottom: spacing.sm }}>
                            <Text style={[typography.section, { color: colors.text }]}>{n.title}</Text>
                            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>{n.body}</Text>
                        </MedCard>
                    ))}
                </View>
            )}

            {/* Health summary */}
            <View style={{ marginBottom: spacing.xxl }}>
                <SectionHeader title="Health Vitals" />
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                    {healthMetrics.map(({ label, value, Icon, bg, iconColor }) => (
                        <MedCard key={label} style={{ width: '47.5%', padding: 16, borderLeftWidth: 3, borderLeftColor: iconColor }}>
                            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                                <Icon size={18} color={iconColor} strokeWidth={2} />
                            </View>
                            <Text style={[typography.label, { marginBottom: 4 }]}>{label}</Text>
                            <Text style={[typography.cardValue, { fontSize: 19 }]}>{value}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
                                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: value === '--' ? colors.textMuted : colors.success }} />
                                <Text style={{ fontSize: 11, fontWeight: '600', color: value === '--' ? colors.textMuted : colors.success }}>{value === '--' ? 'Not set' : 'Normal'}</Text>
                            </View>
                        </MedCard>
                    ))}
                </View>
            </View>

            <RazorpayCheckout 
                visible={showPayment} 
                amount={pendingBills.reduce((s: number, b: any) => s + (b.total || 0), 0)} 
                onClose={handleCancel} 
                onCancel={handleCancel} 
                onSuccess={handleSuccess} 
            />
        </ScrollView>
        </ScreenTransition>
    );
}
