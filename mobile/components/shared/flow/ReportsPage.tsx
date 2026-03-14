import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { ArrowLeft, FileText } from 'lucide-react-native';
import { Appointment } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { getAppointmentState, updateAppointmentState } from '@/lib/appointment-state';
import { toast } from '@/hooks/use-toast';

interface Props { appointment: Appointment; onBack: () => void; }

const reportTypes = ['Blood Test', 'X-Ray', 'MRI', 'Lab Report'];

export default function ReportsPage({ appointment, onBack }: Props) {
    const { role } = useAuth();
    const state = getAppointmentState(appointment.id);
    const [reportName, setReportName] = useState(state.reportName);
    const [reportType, setReportType] = useState(state.reportType);

    const handleSubmit = () => {
        if (!reportName.trim()) { toast({ title: 'Please enter report name' }); return; }
        updateAppointmentState(appointment.id, { reportName, reportType, currentStep: Math.max(state.currentStep, 3) });
        toast({ title: '✅ Reports uploaded' });
        onBack();
    };

    if (role === 'patient') {
        return (
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <TouchableOpacity onPress={onBack} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}><ArrowLeft size={20} color="#334155" /></TouchableOpacity>
                    <View style={{ flex: 1 }}><Text style={{ fontSize: 18, fontWeight: '700', color: '#0284c7' }}>Medical Reports</Text><Text style={{ fontSize: 12, color: '#64748b' }}>By {appointment.doctorName}</Text></View>
                </View>
                <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f1f5f9' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}><FileText size={20} color="#0ea5e9" /><Text style={{ fontWeight: '700', fontSize: 14, color: '#0ea5e9' }}>Report Details</Text></View>
                    <View style={{ backgroundColor: '#f1f5f9', borderRadius: 12, padding: 12, marginBottom: 8 }}><Text style={{ fontSize: 10, fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Report Name</Text><Text style={{ fontSize: 14, color: '#0284c7' }}>{state.reportName || 'Not available yet'}</Text></View>
                    <View style={{ backgroundColor: '#f1f5f9', borderRadius: 12, padding: 12 }}><Text style={{ fontSize: 10, fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Type</Text><Text style={{ fontSize: 14, color: '#0284c7' }}>{state.reportType}</Text></View>
                </View>
            </ScrollView>
        );
    }

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <TouchableOpacity onPress={onBack} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}><ArrowLeft size={20} color="#334155" /></TouchableOpacity>
                <View><Text style={{ fontSize: 18, fontWeight: '700', color: '#0284c7' }}>Upload Reports</Text><Text style={{ fontSize: 12, color: '#64748b' }}>Patient: {appointment.patientName}</Text></View>
            </View>
            <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f1f5f9' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}><FileText size={16} color="#0ea5e9" /><Text style={{ fontWeight: '700', fontSize: 14, color: '#0284c7' }}>Upload Report</Text></View>
                <TextInput value={reportName} onChangeText={setReportName} placeholder="Report name (e.g., Complete Blood Count)" placeholderTextColor="#94a3b8" style={{ width: '100%', borderRadius: 12, backgroundColor: '#f1f5f9', padding: 12, fontSize: 14, color: '#0284c7', marginBottom: 8 }} />
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#0284c7', marginBottom: 6 }}>Report Type</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                    {reportTypes.map(t => (
                        <TouchableOpacity key={t} onPress={() => setReportType(t)} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: reportType === t ? '#0ea5e9' : '#f1f5f9' }}>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: reportType === t ? '#fff' : '#334155' }}>{t}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={{ borderWidth: 2, borderStyle: 'dashed', borderColor: '#e2e8f0', borderRadius: 12, padding: 24, alignItems: 'center', marginBottom: 12 }}>
                    <FileText size={32} color="#94a3b8" />
                    <Text style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>Tap to upload report file</Text>
                    <Text style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>PDF, JPG, PNG (max 10MB)</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity onPress={onBack} style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center' }}><Text style={{ fontSize: 14, fontWeight: '600', color: '#334155' }}>Cancel</Text></TouchableOpacity>
                    <TouchableOpacity onPress={handleSubmit} style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#0ea5e9', alignItems: 'center' }}><Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>Upload</Text></TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}
