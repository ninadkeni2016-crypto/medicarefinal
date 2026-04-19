import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Users, Calendar, Receipt, Bell, Clock, FileText, Pill, CreditCard, MessageSquare, ChevronRight, AlertCircle } from 'lucide-react-native';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { colors, spacing, radius, typography, cardShadow, fonts, Shadows } from '@/lib/theme';
import { MedCard } from '@/components/ui/MedCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SkeletonBox } from '@/components/ui/SkeletonBox';
import { InitialsAvatar } from '@/components/ui/InitialsAvatar';
import { ScreenTransition, AnimatedListItem, ScalePress } from '@/components/ui/Animations';

interface DoctorHomeProps { onNavigate: (tab: string) => void; }

interface DashboardData {
  demoData?: boolean;
  stats?: { totalPatients: number; todayAppointments: number; pendingReports: number; totalRevenue: number };
  charts?: {
    appointmentsPerWeek?: { day: string; count: number }[];
    patientRegistrations?: { month: string; count: number }[];
    departmentVisits?: { name: string; count: number }[];
  };
  recentPatients?: any[];
  upcomingAppointments?: any[];
  notifications?: any[];
  recentReports?: any[];
  messages?: { participantName: string; lastMessage: string; unreadCount?: number }[];
}

function BarChart({ data, labelKey, valueKey, height = 80 }: { data: any[]; labelKey: string; valueKey: string; height?: number }) {
  const values = data.map((d: any) => d[valueKey]);
  const max = Math.max(...values, 1);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height, paddingVertical: 8 }}>
      {data.map((item: any, i: number) => (
        <View key={i} style={{ alignItems: 'center', flex: 1 }}>
          <View style={{ width: 20, height: Math.max(4, (item[valueKey] / max) * (height - 24)), backgroundColor: colors.secondary, borderRadius: 6, marginBottom: 4 }} />
          <Text style={[typography.caption, { color: colors.textSecondary, fontSize: 10 }]} numberOfLines={1}>{item[labelKey]}</Text>
        </View>
      ))}
    </View>
  );
}

function DonutChart({ data }: { data: { name: string; count: number }[] }) {
  const total = data.reduce((s, d) => s + d.count, 0) || 1;
  const colors_list = [colors.primary, colors.success, colors.warning, '#7C3AED', '#DB2777'];
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
      {data.slice(0, 5).map((item, i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors_list[i % colors_list.length] }} />
          <Text style={[typography.caption, { color: colors.textSecondary }]} numberOfLines={1}>{item.name} ({item.count})</Text>
        </View>
      ))}
    </View>
  );
}

export default function DoctorHome({ onNavigate }: DoctorHomeProps) {
    const { userName } = useAuth();
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [demoData, setDemoData] = useState(false);
    const [fallback, setFallback] = useState<{ appointments: any[]; bills: any[]; patientsCount: number }>({ appointments: [], bills: [], patientsCount: 0 });

    const loadDashboard = useCallback(async () => {
        setLoading(true);
        let dashboardData: any = null;
        let dashboardRes: any = null;
        
        try {
            dashboardRes = await api.get('/dashboard/data').catch(() => null);
            if (dashboardRes?.data) {
                dashboardData = dashboardRes.data;
                setDemoData(!!dashboardRes.data.demoData || dashboardRes.headers?.['x-demo-data'] === 'true');
            }
        } catch (_) {}
        
        try {
            const [apptsRes, billsRes, patientsRes] = await Promise.all([
                api.get('/appointments').catch(() => ({ data: [] })),
                api.get('/bills').catch(() => ({ data: [] })),
                api.get('/patients').catch(() => ({ data: [] })),
            ]);
            
            const appointments = apptsRes?.data || [];
            const bills = billsRes?.data || [];
            const patients = patientsRes?.data || [];
            
            setFallback({ appointments, bills, patientsCount: Array.isArray(patients) ? patients.length : 0 });
            
            const built = {
                ...(dashboardData || {}),
                stats: {
                    totalPatients: Array.isArray(patients) ? patients.length : 0,
                    todayAppointments: (appointments || []).filter((a: any) => ['upcoming', 'confirmed', 'rescheduled'].includes(a.status)).length,
                    pendingReports: dashboardData?.stats?.pendingReports || 0,
                    totalRevenue: (bills || []).filter((b: any) => b.status === 'Paid').reduce((s: number, b: any) => s + (b.total || 0), 0),
                },
                recentPatients: (patients || []).slice(0, 5),
                upcomingAppointments: (appointments || []).filter((a: any) => ['upcoming', 'confirmed', 'rescheduled'].includes(a.status)).slice(0, 5),
                notifications: dashboardData?.notifications || [],
                recentReports: dashboardData?.recentReports || [],
                messages: dashboardData?.messages || [],
                charts: dashboardData?.charts || {
                    appointmentsPerWeek: [],
                    patientRegistrations: [],
                    departmentVisits: [],
                },
            };
            
            setDashboard(built as DashboardData);
            setDemoData(dashboardRes?.headers?.['x-demo-data'] === 'true');
            
        } catch (e) {
            console.error('Failed to load fallback data', e);
        } finally {
            setLoading(false);
        }
    }, [userName]);

    useFocusEffect(
        useCallback(() => {
            loadDashboard();
        }, [loadDashboard])
    );

    const stats = dashboard?.stats ?? {
        totalPatients: fallback.patientsCount,
        todayAppointments: fallback.appointments.filter(a => ['upcoming', 'confirmed', 'rescheduled'].includes(a.status)).length,
        pendingReports: 0,
        totalRevenue: fallback.bills.filter((b: any) => b.status === 'Paid').reduce((s: number, b: any) => s + (b.total || 0), 0),
    };
    const pendingBills = fallback.bills.filter((b: any) => b.status !== 'Paid');
    const pendingPayments = pendingBills.reduce((s: number, b: any) => s + (b.total || 0), 0);
    const recentPatients = dashboard?.recentPatients ?? [];
    const upcomingAppointments = dashboard?.upcomingAppointments ?? fallback.appointments.filter((a: any) => ['upcoming', 'confirmed', 'rescheduled'].includes(a.status)).slice(0, 5);
    const notifications = dashboard?.notifications ?? [];
    const recentReports = dashboard?.recentReports ?? [];
    const messages = dashboard?.messages ?? [];
    const charts = dashboard?.charts;

    const handleVisitAction = async (id: string, action: string) => {
        try {
            await api.put(`/appointments/${id}/${action}`);
            toast({ title: 'Success', description: `Appointment updated: ${action.split('-').join(' ')}` });
            loadDashboard();
        } catch (err) {
            console.error('Visit action failed:', err);
            toast({ title: 'Error', description: 'Failed to update visit status', variant: 'destructive' });
        }
    };

    const quickActions = [
        { icon: Calendar, label: 'Schedule', tab: 'appointments' },
        { icon: Users, label: 'Patients', tab: 'patients' },
        { icon: Pill, label: 'Prescriptions', tab: 'prescriptions' },
        { icon: FileText, label: 'Reports', tab: 'reports' },
        { icon: CreditCard, label: 'Billing', tab: 'billing' },
    ];

    return (
        <ScreenTransition>
            <ScrollView
                style={{ flex: 1, backgroundColor: colors.background }}
                contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={loadDashboard} colors={[colors.primary]} />
                }
            >
            {demoData && (
                <View style={{
                    backgroundColor: '#EBF5FF',
                    paddingVertical: 10, paddingHorizontal: spacing.md,
                    borderRadius: radius.lg,
                    marginBottom: spacing.md,
                    flexDirection: 'row', alignItems: 'center', gap: 10,
                    borderLeftWidth: 3, borderLeftColor: colors.primary,
                    ...Shadows.sm as object,
                }}>
                    <AlertCircle size={18} color={colors.primary} />
                    <Text style={[typography.caption, { color: colors.primary, fontWeight: '600' }]}>Sample Data Loaded</Text>
                </View>
            )}

            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xl }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                    <Image source={require('../../assets/images/logo.png')} style={{ width: 84, height: 84 }} resizeMode="contain" />
                    <View>
                        <Text style={[typography.label, { color: colors.textSecondary }]}>Welcome back</Text>
                        <Text style={[typography.screenTitle, { marginTop: 2 }]}>{userName || 'Doctor'}</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={() => onNavigate('notifications')} activeOpacity={0.7} style={{ width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', ...cardShadow }}>
                    <Bell size={20} color={colors.secondary} />
                </TouchableOpacity>
            </View>

            {/* Stats */}
            {loading ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl }}>
                    {[1, 2, 3, 4].map(i => <SkeletonBox key={i} width="48%" height={88} />)}
                </View>
            ) : (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: spacing.xl }}>
                    {[
                        { icon: Users, label: 'Total Patients', value: String(stats.totalPatients) },
                        { icon: Calendar, label: "Today's Appointments", value: String(stats.todayAppointments) },
                        { icon: FileText, label: 'Pending Reports', value: String(stats.pendingReports) },
                        { icon: Receipt, label: 'Total Revenue', value: `₹${Number(stats.totalRevenue).toLocaleString()}` },
                    ].map(({ icon: Icon, label, value }) => (
                        <MedCard key={label} style={{ width: '48%', marginBottom: spacing.sm, padding: spacing.md }}>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={[typography.cardValue, { color: colors.text }]}>{value}</Text>
                                    <Text style={[typography.label, { color: colors.textSecondary, marginTop: 4 }]}>{label}</Text>
                                </View>
                                <View style={{
                                    width: 38, height: 38, borderRadius: radius.md,
                                    backgroundColor: 'rgba(29, 143, 212, 0.10)',
                                    alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Icon size={18} color={colors.primary} strokeWidth={2} />
                                </View>
                            </View>
                        </MedCard>
                    ))}
                </View>
            )}

            {/* Charts */}
            {!loading && charts?.appointmentsPerWeek && charts.appointmentsPerWeek.length > 0 && (
                <MedCard style={{ marginBottom: spacing.xl }}>
                    <Text style={[typography.section, { color: colors.text, marginBottom: spacing.sm }]}>Appointments per week</Text>
                    <BarChart data={charts.appointmentsPerWeek} labelKey="day" valueKey="count" />
                </MedCard>
            )}
            {!loading && charts?.departmentVisits && charts.departmentVisits.length > 0 && (
                <MedCard style={{ marginBottom: spacing.xl }}>
                    <Text style={[typography.section, { color: colors.text }]}>Department visits</Text>
                    <DonutChart data={charts.departmentVisits} />
                </MedCard>
            )}

            {/* Quick actions */}
            <View style={{ marginBottom: spacing.xl }}>
                <Text style={[typography.section, { color: colors.text, marginBottom: spacing.md }]}>Quick actions</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                    {quickActions.map(({ icon: Icon, label, tab }) => (
                        <TouchableOpacity key={tab} onPress={() => onNavigate(tab)} activeOpacity={0.75} style={{
                            width: '31%', backgroundColor: colors.card,
                            borderRadius: radius.lg,
                            padding: spacing.md,
                            borderWidth: 1, borderColor: colors.border,
                            alignItems: 'center', gap: spacing.sm,
                            ...cardShadow as object,
                        }}>
                            <View style={{
                                width: 42, height: 42, borderRadius: radius.md,
                                backgroundColor: 'rgba(29, 143, 212, 0.10)',
                                alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Icon size={20} color={colors.primary} strokeWidth={2} />
                            </View>
                            <Text style={[typography.caption, { color: colors.text, fontWeight: '500' }]}>{label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Pending payments */}
            {!loading && pendingBills.length > 0 && (
                <MedCard onPress={() => onNavigate('billing')} style={{ marginBottom: spacing.xl, flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }}>
                    <View style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center' }}>
                        <AlertCircle size={22} color={colors.warning} strokeWidth={2} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[typography.section, { color: colors.text }]}>{pendingBills.length} pending payments</Text>
                        <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>₹{pendingPayments.toLocaleString()} awaiting collection</Text>
                    </View>
                    <ChevronRight size={18} color={colors.textMuted} />
                </MedCard>
            )}

            {/* Recent Patients */}
            <View style={{ marginBottom: spacing.xl }}>
                <SectionHeader title="Recent patients" onViewAll={() => onNavigate('patients')} />
                {loading ? [1, 2].map(i => <SkeletonBox key={i} height={56} style={{ marginBottom: spacing.sm }} />) : recentPatients.length === 0 ? (
                    <MedCard><Text style={[typography.body, { color: colors.textSecondary }]}>No recent patients.</Text></MedCard>
                ) : (
                    recentPatients.slice(0, 4).map((p: any) => (
                        <MedCard key={p._id || p.fullName} onPress={() => onNavigate('patients')} style={{ marginBottom: spacing.sm }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                                <InitialsAvatar name={p.fullName || p.name || ''} size={40} radius={10} />
                                <View style={{ flex: 1 }}>
                                    <Text style={[typography.section, { color: colors.text }]}>{p.fullName || p.name}</Text>
                                    <Text style={[typography.caption, { color: colors.textSecondary }]}>{p.condition || p.gender || p.email}</Text>
                                </View>
                                <ChevronRight size={16} color={colors.textMuted} />
                            </View>
                        </MedCard>
                    ))
                )}
            </View>

            {/* Upcoming Appointments */}
            <View style={{ marginBottom: spacing.xl }}>
                <SectionHeader title="Upcoming appointments" onViewAll={() => onNavigate('appointments')} />
                {loading ? [1, 2].map(i => <SkeletonBox key={i} height={72} style={{ marginBottom: spacing.sm }} />) : upcomingAppointments.length === 0 ? (
                    <MedCard><Text style={[typography.body, { color: colors.textSecondary }]}>No upcoming appointments.</Text></MedCard>
                ) : (
                    upcomingAppointments.slice(0, 4).map((apt: any) => (
                        <MedCard key={apt._id || apt.patientName} onPress={() => onNavigate('appointments')} style={{ marginBottom: spacing.sm }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                                <InitialsAvatar name={apt.patientName || ''} size={40} radius={10} />
                                <View style={{ flex: 1 }}>
                                    <Text style={[typography.section, { color: colors.text }]}>{apt.patientName}</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                                        <Text style={[typography.caption, { color: colors.textSecondary }]}>{apt.specialization}</Text>
                                        <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.textMuted }} />
                                        <Text style={[typography.caption, { color: colors.primary, fontWeight: '600' }]}>{apt.visitStatus || 'upcoming'}</Text>
                                    </View>
                                </View>
                                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                        <Clock size={14} color={colors.primary} />
                                        <Text style={[typography.caption, { color: colors.primary, fontWeight: '600' }]}>{apt.time}</Text>
                                    </View>
                                    
                                    {/* Visit Actions */}
                                    {apt.visitStatus === 'pending' || !apt.visitStatus ? (
                                        <TouchableOpacity 
                                            onPress={() => handleVisitAction(apt._id, 'start-consultation')}
                                            style={{ backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}
                                        >
                                            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>Start Visit</Text>
                                        </TouchableOpacity>
                                    ) : apt.visitStatus === 'in-consultation' ? (
                                        <TouchableOpacity 
                                            onPress={() => handleVisitAction(apt._id, 'complete-consultation')}
                                            style={{ backgroundColor: colors.success, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}
                                        >
                                            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>Complete</Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <ChevronRight size={16} color={colors.textMuted} />
                                    )}
                                </View>
                            </View>
                        </MedCard>
                    ))
                )}
            </View>

            {/* Patient Messages */}
            {messages.length > 0 && (
                <View style={{ marginBottom: spacing.xl }}>
                    <SectionHeader title="Patient messages" onViewAll={() => onNavigate('messages')} />
                    {messages.slice(0, 3).map((m: any, i: number) => (
                        <MedCard key={m._id || i} onPress={() => onNavigate('messages')} style={{ marginBottom: spacing.sm }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
                                    <MessageSquare size={20} color={colors.primary} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[typography.section, { color: colors.text }]}>{m.participantName}</Text>
                                    <Text style={[typography.caption, { color: colors.textSecondary }]} numberOfLines={1}>{m.lastMessage}</Text>
                                </View>
                                {m.unreadCount > 0 && (
                                    <View style={{ backgroundColor: colors.primary, borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={{ fontSize: 10, color: '#fff', fontWeight: '600' }}>{m.unreadCount}</Text>
                                    </View>
                                )}
                                <ChevronRight size={16} color={colors.textMuted} />
                            </View>
                        </MedCard>
                    ))}
                </View>
            )}

            {/* Recent Medical Reports */}
            {recentReports.length > 0 && (
                <View style={{ marginBottom: spacing.xl }}>
                    <SectionHeader title="Recent medical reports" onViewAll={() => onNavigate('reports')} />
                    {recentReports.slice(0, 3).map((r: any) => (
                        <MedCard key={r._id} onPress={() => onNavigate('reports')} style={{ marginBottom: spacing.sm }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                                <View style={{ width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
                                    <FileText size={20} color={colors.primary} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[typography.section, { color: colors.text }]}>{r.name}</Text>
                                    <Text style={[typography.caption, { color: colors.textSecondary }]}>{r.type} · {r.patientName || r.date}</Text>
                                </View>
                                <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.sm, backgroundColor: r.status === 'Ready' ? '#F0FDF4' : '#FEF3C7' }}>
                                    <Text style={[typography.caption, { color: r.status === 'Ready' ? colors.success : colors.warning, fontWeight: '500' }]}>{r.status}</Text>
                                </View>
                            </View>
                        </MedCard>
                    ))}
                </View>
            )}

        </ScrollView>
        </ScreenTransition>
    );
}
