import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { TrendingUp, Users, Calendar, Clock, DollarSign, Activity, ArrowLeft } from 'lucide-react-native';
import api from '@/lib/api';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/dashboard/data')
            .then(res => setData(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const metrics = [
        { label: 'Total Patients', value: data?.stats?.totalPatients?.toString() || '0', change: '+12%', color: '#0ea5e9', bg: '#f0fdfa', up: true },
        { label: 'Avg. Rating', value: '4.9', change: '+0.2', color: '#ca8a04', bg: '#fef9c3', up: true },
        { label: 'Today Apps', value: data?.stats?.todayAppointments?.toString() || '0', change: '+18%', color: '#16a34a', bg: '#dcfce7', up: true },
        { label: 'Revenue', value: `₹${((data?.stats?.totalRevenue || 0) / 1000).toFixed(1)}K`, change: '+8%', color: '#9333ea', bg: '#f3e8ff', up: true },
    ];

    const weeklyData = data?.charts?.appointmentsPerWeek?.map((d: any) => ({ day: d.day, patients: d.count })) || [
        { day: 'Mon', patients: 12 }, { day: 'Tue', patients: 18 }, { day: 'Wed', patients: 15 },
        { day: 'Thu', patients: 22 }, { day: 'Fri', patients: 20 }, { day: 'Sat', patients: 8 }, { day: 'Sun', patients: 4 },
    ];
    const maxPatients = Math.max(...weeklyData.map((d: any) => d.patients), 1);

    const topConditions = data?.charts?.departmentVisits?.map((d: any) => ({ name: d.name, pct: d.count })) || [
        { name: 'General', pct: 35 }, { name: 'Cardiology', pct: 28 }, { name: 'Dermatology', pct: 15 },
    ];

    if (loading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color="#0284c7" /></View>;

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#0284c7', marginBottom: 4 }}>Analytics</Text>
            <Text style={{ fontSize: 14, color: '#64748b', marginBottom: 16 }}>Practice overview</Text>

            {/* Metrics */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                {metrics.map(({ label, value, change, color, bg, up }) => (
                    <View key={label} style={{ width: (width - 40) / 2, backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#f1f5f9' }}>
                        <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                            <Activity size={16} color={color} />
                        </View>
                        <Text style={{ fontSize: 22, fontWeight: '700', color: '#0284c7' }}>{value}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                            <Text style={{ fontSize: 12, color: '#64748b' }}>{label}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                                <TrendingUp size={10} color="#16a34a" />
                                <Text style={{ fontSize: 10, fontWeight: '600', color: '#16a34a' }}>{change}</Text>
                            </View>
                        </View>
                    </View>
                ))}
            </View>

            {/* Weekly Chart */}
            <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 20 }}>
                <Text style={{ fontWeight: '700', fontSize: 14, color: '#0284c7', marginBottom: 16 }}>Weekly Patients</Text>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 120 }}>
                    {weeklyData.map(({ day, patients }: { day: string; patients: number }) => (
                        <View key={day} style={{ alignItems: 'center', flex: 1 }}>
                            <View style={{ width: 24, height: (patients / maxPatients) * 100, borderRadius: 6, backgroundColor: '#0ea5e9', marginBottom: 6 }} />
                            <Text style={{ fontSize: 10, color: '#64748b', fontWeight: '500' }}>{day}</Text>
                            <Text style={{ fontSize: 10, fontWeight: '600', color: '#0284c7' }}>{patients}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Top Conditions */}
            <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 20 }}>
                <Text style={{ fontWeight: '700', fontSize: 14, color: '#0284c7', marginBottom: 12 }}>Top Conditions</Text>
                {topConditions.map(({ name, pct }: { name: string; pct: number }) => (
                    <View key={name} style={{ marginBottom: 10 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                            <Text style={{ fontSize: 13, color: '#0284c7', fontWeight: '500' }}>{name}</Text>
                            <Text style={{ fontSize: 13, fontWeight: '600', color: '#0ea5e9' }}>{pct}%</Text>
                        </View>
                        <View style={{ height: 6, backgroundColor: '#f1f5f9', borderRadius: 3 }}>
                            <View style={{ height: 6, width: `${pct}%`, backgroundColor: '#0ea5e9', borderRadius: 3 }} />
                        </View>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}
