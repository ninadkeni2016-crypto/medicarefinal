import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { ArrowLeft, Stethoscope } from 'lucide-react-native';
import { Appointment } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { getAppointmentState, updateAppointmentState } from '@/lib/appointment-state';
import { toast } from '@/hooks/use-toast';

interface Props { appointment: Appointment; onBack: () => void; }

export default function ConsultationPage({ appointment, onBack }: Props) {
    const { role } = useAuth();
    const state = getAppointmentState(appointment.id);
    const [notes, setNotes] = useState(state.consultationNotes);
    const [diagnosis, setDiagnosis] = useState(state.diagnosis);

    const handleSubmit = () => {
        if (!notes.trim()) { toast({ title: 'Please add consultation notes' }); return; }
        updateAppointmentState(appointment.id, { consultationNotes: notes, diagnosis, currentStep: Math.max(state.currentStep, 1) });
        toast({ title: '✅ Consultation completed' });
        onBack();
    };

    if (role === 'patient') {
        return (
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <TouchableOpacity onPress={onBack} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                        <ArrowLeft size={20} color="#334155" />
                    </TouchableOpacity>
                    <View><Text style={{ fontSize: 18, fontWeight: '700', color: '#0284c7' }}>Consultation Notes</Text><Text style={{ fontSize: 12, color: '#64748b' }}>By {appointment.doctorName}</Text></View>
                </View>
                <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f1f5f9' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}><Stethoscope size={20} color="#0ea5e9" /><Text style={{ fontWeight: '700', fontSize: 14, color: '#0ea5e9' }}>Diagnosis & Notes</Text></View>
                    {state.diagnosis ? <View style={{ backgroundColor: '#f1f5f9', borderRadius: 12, padding: 12, marginBottom: 8 }}><Text style={{ fontSize: 10, fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Diagnosis</Text><Text style={{ fontSize: 14, color: '#0284c7' }}>{state.diagnosis}</Text></View> : null}
                    <View style={{ backgroundColor: '#f1f5f9', borderRadius: 12, padding: 12 }}><Text style={{ fontSize: 10, fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Notes</Text><Text style={{ fontSize: 14, color: '#0284c7' }}>{state.consultationNotes || 'No notes yet'}</Text></View>
                </View>
            </ScrollView>
        );
    }

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <TouchableOpacity onPress={onBack} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                    <ArrowLeft size={20} color="#334155" />
                </TouchableOpacity>
                <View><Text style={{ fontSize: 18, fontWeight: '700', color: '#0284c7' }}>Consultation</Text><Text style={{ fontSize: 12, color: '#64748b' }}>Patient: {appointment.patientName}</Text></View>
            </View>
            <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f1f5f9' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}><Stethoscope size={16} color="#0ea5e9" /><Text style={{ fontWeight: '700', fontSize: 14, color: '#0284c7' }}>Consultation Notes</Text></View>
                <TextInput value={diagnosis} onChangeText={setDiagnosis} placeholder="Diagnosis (e.g., Upper respiratory infection)" placeholderTextColor="#94a3b8" style={{ width: '100%', borderRadius: 12, backgroundColor: '#f1f5f9', padding: 12, fontSize: 14, color: '#0284c7', marginBottom: 8 }} />
                <TextInput value={notes} onChangeText={setNotes} placeholder="Enter symptoms, treatment plan..." placeholderTextColor="#94a3b8" multiline numberOfLines={5} textAlignVertical="top" style={{ width: '100%', height: 120, borderRadius: 12, backgroundColor: '#f1f5f9', padding: 12, fontSize: 14, color: '#0284c7', marginBottom: 12 }} />
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity onPress={onBack} style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center' }}><Text style={{ fontSize: 14, fontWeight: '600', color: '#334155' }}>Cancel</Text></TouchableOpacity>
                    <TouchableOpacity onPress={handleSubmit} style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#0ea5e9', alignItems: 'center' }}><Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>Complete</Text></TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}
