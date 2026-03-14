import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { ArrowLeft, Pill } from 'lucide-react-native';
import { Appointment } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { getAppointmentState, updateAppointmentState, Medicine } from '@/lib/appointment-state';
import { toast } from '@/hooks/use-toast';

interface Props { appointment: Appointment; onBack: () => void; }

export default function PrescriptionPage({ appointment, onBack }: Props) {
    const { role } = useAuth();
    const state = getAppointmentState(appointment.id);
    const [medicines, setMedicines] = useState<Medicine[]>(state.medicines[0]?.name ? state.medicines : [{ name: '', dosage: '', frequency: 'Once daily', duration: '7 days' }]);
    const [notes, setNotes] = useState(state.prescriptionNotes);

    const addMedicine = () => setMedicines([...medicines, { name: '', dosage: '', frequency: 'Once daily', duration: '7 days' }]);
    const updateMedicine = (i: number, field: string, value: string) => setMedicines(medicines.map((m, idx) => idx === i ? { ...m, [field]: value } : m));

    const handleSubmit = () => {
        if (!medicines[0].name.trim()) { toast({ title: 'Please add at least one medicine' }); return; }
        updateAppointmentState(appointment.id, { medicines, prescriptionNotes: notes, currentStep: Math.max(state.currentStep, 2) });
        toast({ title: '✅ Prescription generated' });
        onBack();
    };

    if (role === 'patient') {
        return (
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <TouchableOpacity onPress={onBack} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}><ArrowLeft size={20} color="#334155" /></TouchableOpacity>
                    <View style={{ flex: 1 }}><Text style={{ fontSize: 18, fontWeight: '700', color: '#0284c7' }}>Prescription</Text><Text style={{ fontSize: 12, color: '#64748b' }}>By {appointment.doctorName}</Text></View>
                </View>
                {state.medicines.filter(m => m.name).map((med, i) => (
                    <View key={i} style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}><Pill size={16} color="#16a34a" /><Text style={{ fontWeight: '600', fontSize: 14, color: '#0284c7' }}>{med.name}</Text></View>
                        <View style={{ flexDirection: 'row', gap: 6 }}>
                            {[{ l: 'Dosage', v: med.dosage }, { l: 'Frequency', v: med.frequency }, { l: 'Duration', v: med.duration }].map(({ l, v }) => (
                                <View key={l} style={{ flex: 1, backgroundColor: '#f1f5f9', borderRadius: 8, padding: 8 }}><Text style={{ fontSize: 10, color: '#64748b' }}>{l}</Text><Text style={{ fontSize: 12, fontWeight: '600', color: '#0284c7' }}>{v}</Text></View>
                            ))}
                        </View>
                    </View>
                ))}
                {state.prescriptionNotes ? <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f1f5f9' }}><Text style={{ fontSize: 10, fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Notes</Text><Text style={{ fontSize: 14, color: '#0284c7' }}>{state.prescriptionNotes}</Text></View> : null}
            </ScrollView>
        );
    }

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <TouchableOpacity onPress={onBack} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}><ArrowLeft size={20} color="#334155" /></TouchableOpacity>
                <View><Text style={{ fontSize: 18, fontWeight: '700', color: '#0284c7' }}>Generate Prescription</Text><Text style={{ fontSize: 12, color: '#64748b' }}>Patient: {appointment.patientName}</Text></View>
            </View>
            <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f1f5f9' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}><Pill size={16} color="#16a34a" /><Text style={{ fontWeight: '700', fontSize: 14, color: '#0284c7' }}>Add Medicines</Text></View>
                {medicines.map((med, i) => (
                    <View key={i} style={{ backgroundColor: '#f1f5f9', borderRadius: 12, padding: 12, marginBottom: 8 }}>
                        <Text style={{ fontSize: 10, fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Medicine {i + 1}</Text>
                        <TextInput value={med.name} onChangeText={v => updateMedicine(i, 'name', v)} placeholder="Medicine name" placeholderTextColor="#94a3b8" style={{ width: '100%', borderRadius: 8, backgroundColor: '#fff', padding: 10, fontSize: 14, color: '#0284c7', marginBottom: 6 }} />
                        <View style={{ flexDirection: 'row', gap: 6 }}>
                            <TextInput value={med.dosage} onChangeText={v => updateMedicine(i, 'dosage', v)} placeholder="Dosage" placeholderTextColor="#94a3b8" style={{ flex: 1, borderRadius: 8, backgroundColor: '#fff', padding: 8, fontSize: 12, color: '#0284c7' }} />
                            <TextInput value={med.frequency} onChangeText={v => updateMedicine(i, 'frequency', v)} placeholder="Frequency" placeholderTextColor="#94a3b8" style={{ flex: 1, borderRadius: 8, backgroundColor: '#fff', padding: 8, fontSize: 12, color: '#0284c7' }} />
                            <TextInput value={med.duration} onChangeText={v => updateMedicine(i, 'duration', v)} placeholder="Duration" placeholderTextColor="#94a3b8" style={{ flex: 1, borderRadius: 8, backgroundColor: '#fff', padding: 8, fontSize: 12, color: '#0284c7' }} />
                        </View>
                    </View>
                ))}
                <TouchableOpacity onPress={addMedicine} style={{ width: '100%', paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderStyle: 'dashed', borderColor: '#e2e8f0', alignItems: 'center', marginBottom: 8 }}><Text style={{ fontSize: 12, color: '#64748b', fontWeight: '500' }}>+ Add Another Medicine</Text></TouchableOpacity>
                <TextInput value={notes} onChangeText={setNotes} placeholder="Additional notes..." placeholderTextColor="#94a3b8" multiline style={{ width: '100%', height: 60, borderRadius: 12, backgroundColor: '#f1f5f9', padding: 12, fontSize: 14, color: '#0284c7', marginBottom: 12 }} textAlignVertical="top" />
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity onPress={onBack} style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center' }}><Text style={{ fontSize: 14, fontWeight: '600', color: '#334155' }}>Cancel</Text></TouchableOpacity>
                    <TouchableOpacity onPress={handleSubmit} style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#0ea5e9', alignItems: 'center' }}><Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>Generate</Text></TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}
