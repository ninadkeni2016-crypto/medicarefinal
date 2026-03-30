import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { Pill, Calendar } from 'lucide-react-native';
import { Prescription } from '@/lib/mock-data';
import api from '@/lib/api';

export default function PrescriptionsList() {
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPrescriptions = async () => {
        try {
            const res = await api.get('/prescriptions');
            setPrescriptions(res.data || []);
        } catch (error) {
            console.error('Failed to fetch prescriptions:', error);
            setPrescriptions([]); // Empty state on error
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
                <ActivityIndicator size="large" color="#0284c7" />
            </View>
        );
    }

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#0284c7', marginBottom: 4 }}>Prescriptions</Text>
            <Text style={{ fontSize: 14, color: '#64748b', marginBottom: 16 }}>{prescriptions.length} prescriptions</Text>

            {prescriptions.map((rx) => (
                <View key={rx.id} style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center' }}>
                            <Pill size={20} color="#16a34a" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontWeight: '600', fontSize: 14, color: '#0284c7' }}>{rx.doctorName}</Text>
                            <Text style={{ fontSize: 12, color: '#64748b' }}>{rx.patientName}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Calendar size={12} color="#64748b" />
                            <Text style={{ fontSize: 11, color: '#64748b' }}>{rx.date}</Text>
                        </View>
                    </View>
                    {rx.medicines.map((med, i) => (
                        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f8fafc', borderRadius: 10, padding: 10, marginBottom: 4 }}>
                            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#16a34a' }} />
                            <Text style={{ flex: 1, fontSize: 13, fontWeight: '500', color: '#0284c7' }}>{med.name}</Text>
                            <Text style={{ fontSize: 11, color: '#64748b' }}>{med.dosage} • {med.frequency}</Text>
                        </View>
                    ))}
                    {rx.notes && <Text style={{ fontSize: 12, color: '#64748b', marginTop: 8, fontStyle: 'italic' }}>📝 {rx.notes}</Text>}
                </View>
            ))}
        </ScrollView>
    );
}
