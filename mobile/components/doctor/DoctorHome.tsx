import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Users, Calendar, CheckCircle, Receipt, TrendingUp, Bell, Clock, FileText, Pill, CreditCard, AlertCircle } from 'lucide-react-native';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface DoctorHomeProps { onNavigate: (tab: string) => void; }

export default function DoctorHome({ onNavigate }: DoctorHomeProps) {
    const { userName } = useAuth();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [bills, setBills] = useState<any[]>([]);
    const [prescriptions, setPrescriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [apptsRes, billsRes, presRes] = await Promise.all([
                    api.get('/appointments'),
                    api.get('/bills').catch(() => ({ data: [] })), // Allow partial failures if bills aren't fully implemented yet
                    api.get('/prescriptions').catch(() => ({ data: [] }))
                ]);
                setAppointments(apptsRes.data);
                setBills(billsRes.data);
                setPrescriptions(presRes.data);
            } catch (error) {
                console.error('Failed to fetch doctor dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const todayAppointments = appointments.filter(a => a.status === 'upcoming'); // Real app should check if a.date == today
    const completedAppointments = appointments.filter(a => a.status === 'completed');
    const pendingBills = bills.filter(b => b.status !== 'Paid');
    const totalRevenue = bills.filter(b => b.status === 'Paid').reduce((s, b) => s + b.total, 0);
    const pendingPayments = pendingBills.reduce((s, b) => s + b.total, 0);

    const stats = [
        { icon: Users, label: 'Total Patients', value: '1,240', color: '#0ea5e9', bg: '#f0fdfa', trend: '+12%' },
        { icon: Calendar, label: "Today's Appts", value: String(todayAppointments.length), color: '#ca8a04', bg: '#fef9c3', trend: '' },
        { icon: CheckCircle, label: 'Completed', value: String(completedAppointments.length), color: '#16a34a', bg: '#dcfce7', trend: '' },
        { icon: Receipt, label: 'Revenue', value: `₹${(totalRevenue / 1000).toFixed(1)}K`, color: '#9333ea', bg: '#f3e8ff', trend: '+8%' },
        { icon: CreditCard, label: 'Pending Pay', value: `₹${pendingPayments.toLocaleString()}`, color: '#dc2626', bg: '#fef2f2', trend: '' },
        { icon: Pill, label: 'Prescriptions', value: String(prescriptions.length), color: '#16a34a', bg: '#dcfce7', trend: '' },
    ];

    const quickActions = [
        { icon: Calendar, label: 'Appointments', tab: 'appointments', color: '#0ea5e9', bg: '#f0fdfa' },
        { icon: Users, label: 'Patients', tab: 'patients', color: '#9333ea', bg: '#f3e8ff' },
        { icon: Pill, label: 'Prescriptions', tab: 'prescriptions', color: '#16a34a', bg: '#dcfce7' },
        { icon: FileText, label: 'Reports', tab: 'reports', color: '#ca8a04', bg: '#fef9c3' },
        { icon: Receipt, label: 'Billing', tab: 'billing', color: '#dc2626', bg: '#fef2f2' },
        { icon: TrendingUp, label: 'Analytics', tab: 'analytics', color: '#0ea5e9', bg: '#f0fdfa' },
    ];


    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', height: 200 }}>
                    <ActivityIndicator size="large" color="#0284c7" />
                </View>
            ) : (
                <>
                {/* Header */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Image source={require('../../assets/images/logo.png')} style={{ width: 56, height: 56 }} resizeMode="contain" />
                    <View>
                        <Text style={{ fontSize: 14, color: '#64748b' }}>Welcome back 👋</Text>
                        <Text style={{ fontSize: 22, fontWeight: '700', color: '#0284c7' }}>{userName || 'Doctor'}</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={() => onNavigate('profile')} activeOpacity={0.7} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                    <Bell size={20} color="#0284c7" />
                    <View style={{ position: 'absolute', top: -2, right: -2, width: 10, height: 10, borderRadius: 5, backgroundColor: '#ef4444', borderWidth: 2, borderColor: '#fff' }} />
                </TouchableOpacity>
            </View>

            {/* Stats Grid */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 }}>
                {stats.map(({ icon: Icon, label, value, color, bg, trend }) => (
                    <View key={label} style={{ width: '32%', backgroundColor: '#fff', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 8 }}>
                        <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                            <Icon size={16} color={color} />
                        </View>
                        <Text style={{ fontSize: 16, fontWeight: '700', color: '#0284c7' }}>{value}</Text>
                        <Text style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>{label}</Text>
                        {trend ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 4 }}>
                                <TrendingUp size={10} color="#16a34a" />
                                <Text style={{ fontSize: 9, fontWeight: '600', color: '#16a34a' }}>{trend}</Text>
                            </View>
                        ) : null}
                    </View>
                ))}
            </View>

            {/* Quick Actions */}
            <View style={{ marginBottom: 20 }}>
                <Text style={{ fontWeight: '700', fontSize: 14, color: '#0284c7', marginBottom: 12 }}>Quick Actions</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    {quickActions.map(({ icon: Icon, label, tab, color, bg }) => (
                        <TouchableOpacity key={tab} onPress={() => onNavigate(tab)} activeOpacity={0.7} style={{ width: '32%', backgroundColor: '#fff', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#f1f5f9', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
                                <Icon size={20} color={color} />
                            </View>
                            <Text style={{ fontSize: 10, fontWeight: '600', color: '#0284c7' }}>{label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Pending Payments Alert */}
            {pendingBills.length > 0 && (
                <TouchableOpacity onPress={() => onNavigate('billing')} activeOpacity={0.7} style={{ backgroundColor: '#fefce8', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#fef9c3', flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#fef9c3', alignItems: 'center', justifyContent: 'center' }}>
                        <AlertCircle size={20} color="#ca8a04" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#0284c7' }}>{pendingBills.length} Pending Payments</Text>
                        <Text style={{ fontSize: 12, color: '#64748b' }}>₹{pendingPayments.toLocaleString()} awaiting collection</Text>
                    </View>
                </TouchableOpacity>
            )}

            {/* Today's Appointments */}
            <View style={{ marginBottom: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <Text style={{ fontWeight: '700', fontSize: 14, color: '#0284c7' }}>Today's Appointments</Text>
                    <TouchableOpacity onPress={() => onNavigate('appointments')} activeOpacity={0.7}>
                        <Text style={{ fontSize: 12, fontWeight: '500', color: '#0ea5e9' }}>View all</Text>
                    </TouchableOpacity>
                </View>
                {todayAppointments.slice(0, 3).map((apt) => (
                    <TouchableOpacity key={apt.id} onPress={() => onNavigate('appointments')} activeOpacity={0.7} style={{ backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#f1f5f9', flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <Image source={{ uri: apt.avatar }} style={{ width: 40, height: 40, borderRadius: 12 }} />
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontWeight: '600', fontSize: 12, color: '#0284c7' }}>{apt.patientName}</Text>
                            <Text style={{ fontSize: 10, color: '#64748b' }}>{apt.specialization}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <Clock size={12} color="#0284c7" />
                                <Text style={{ fontSize: 10, fontWeight: '600', color: '#0284c7' }}>{apt.time}</Text>
                            </View>
                            <Text style={{ fontSize: 9, fontWeight: '500', color: '#0ea5e9' }}>{apt.type}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
            </>
            )}
        </ScrollView>
    );
}
