import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { ArrowLeft, Download, CheckCircle, Pill, FileText, Receipt } from 'lucide-react-native';
import { Appointment } from '@/lib/mock-data';
import { getAppointmentState } from '@/lib/appointment-state';
import { toast } from '@/hooks/use-toast';

interface Props { appointment: Appointment; onBack: () => void; }

export default function CompletedPage({ appointment, onBack }: Props) {
    const state = getAppointmentState(appointment.id);

    const handleDownload = (type: string) => toast({ title: `📥 ${type} downloaded successfully` });

    const items = [
        { label: 'Prescription', desc: `${state.medicines.filter(m => m.name).length} medicine(s)`, icon: Pill, color: '#16a34a', bg: '#dcfce7' },
        { label: state.reportName || 'Medical Report', desc: state.reportType, icon: FileText, color: '#0ea5e9', bg: '#f0fdfa' },
        { label: 'Invoice', desc: `₹${Object.values(state.billItems).reduce((s, v) => s + v, 0)} paid`, icon: Receipt, color: '#ca8a04', bg: '#fef9c3' },
    ];

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <TouchableOpacity onPress={onBack} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}><ArrowLeft size={20} color="#334155" /></TouchableOpacity>
                <View><Text style={{ fontSize: 18, fontWeight: '700', color: '#0284c7' }}>Downloads</Text><Text style={{ fontSize: 12, color: '#64748b' }}>All your documents</Text></View>
            </View>

            <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: '#f1f5f9', alignItems: 'center', marginBottom: 16 }}>
                <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                    <CheckCircle size={28} color="#16a34a" />
                </View>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#0284c7' }}>Appointment Complete</Text>
                <Text style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>All documents ready for download</Text>
            </View>

            {items.map((item) => (
                <TouchableOpacity key={item.label} onPress={() => handleDownload(item.label)} activeOpacity={0.7} style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f1f5f9', flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: item.bg, alignItems: 'center', justifyContent: 'center' }}>
                        <item.icon size={20} color={item.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#0284c7' }}>{item.label}</Text>
                        <Text style={{ fontSize: 10, color: '#64748b' }}>{item.desc}</Text>
                    </View>
                    <Download size={20} color={item.color} />
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
}
