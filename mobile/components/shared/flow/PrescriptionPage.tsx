import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { ArrowLeft, Pill, Plus, Trash2, ShieldAlert, Utensils } from 'lucide-react-native';
import { Appointment } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { getAppointmentState, updateAppointmentState, Medicine } from '@/lib/appointment-state';
import { toast } from '@/hooks/use-toast';

interface Props { appointment: Appointment; onBack: () => void; }

const SUGGESTIONS = ['Paracetamol', 'Amoxicillin', 'Azithromycin', 'Cetirizine', 'Pantoprazole'];

export default function PrescriptionPage({ appointment, onBack }: Props) {
    const { role } = useAuth();
    const state = getAppointmentState(appointment.id);
    const [medicines, setMedicines] = useState<Medicine[]>(state.medicines[0]?.name ? state.medicines : [{ name: '', dosage: '', frequency: 'Once daily', duration: '7 days', beforeFood: false, notes: '' }]);
    const [notes, setNotes] = useState(state.prescriptionNotes);
    const [showSuggestions, setShowSuggestions] = useState<number | null>(null);

    const addMedicine = () => setMedicines([...medicines, { name: '', dosage: '', frequency: 'Once daily', duration: '7 days', beforeFood: false, notes: '' }]);
    const removeMedicine = (index: number) => setMedicines(medicines.filter((_, i) => i !== index));
    const updateMedicine = (i: number, field: string, value: string | boolean) => setMedicines(medicines.map((m, idx) => idx === i ? { ...m, [field]: value } : m));

    const handleSubmit = () => {
        if (!medicines.some(m => m.name.trim())) { toast({ title: 'Please add at least one medicine' }); return; }
        updateAppointmentState(appointment.id, { medicines: medicines.filter(m => m.name.trim()), prescriptionNotes: notes, currentStep: Math.max(state.currentStep, 2) });
        toast({ title: '✅ Prescription generated' });
        onBack();
    };

    if (role === 'patient') {
        const validMedicines = state.medicines.filter(m => m.name);
        return (
            <ScrollView style={{ flex: 1, backgroundColor: '#F8FAFC' }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
                {/* Header */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                    <TouchableOpacity onPress={onBack} style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 }}><ArrowLeft size={20} color="#0F172A" /></TouchableOpacity>
                    <View style={{ flex: 1 }}><Text style={{ fontSize: 20, fontWeight: '700', color: '#0F172A' }}>Digital Prescription</Text><Text style={{ fontSize: 13, color: '#64748B', fontWeight: '500' }}>By {appointment.doctorName}</Text></View>
                </View>

                {/* Patient Medicines */}
                <View style={{ marginBottom: 20 }}>
                    {validMedicines.length === 0 ? (
                         <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' }}>
                             <Pill size={40} color="#CBD5E1" />
                             <Text style={{ marginTop: 12, fontSize: 15, color: '#64748B', fontWeight: '500' }}>No medicines prescribed yet.</Text>
                         </View>
                    ) : validMedicines.map((med, i) => (
                        <View key={i} style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 12, shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' }}>
                                        <Pill size={20} color="#2563EB" />
                                    </View>
                                    <View>
                                        <Text style={{ fontWeight: '700', fontSize: 16, color: '#0F172A' }}>{med.name}</Text>
                                        <Text style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>{med.dosage}</Text>
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: med.beforeFood ? '#FEF2F2' : '#F0FDF4', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
                                    <Utensils size={12} color={med.beforeFood ? '#EF4444' : '#16A34A'} />
                                    <Text style={{ fontSize: 11, fontWeight: '700', color: med.beforeFood ? '#EF4444' : '#16A34A' }}>{med.beforeFood ? 'Before Food' : 'After Food'}</Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', gap: 8, backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12 }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase' }}>Frequency</Text>
                                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#0F172A', marginTop: 4 }}>{med.frequency}</Text>
                                </View>
                                <View style={{ width: 1, backgroundColor: '#E2E8F0' }} />
                                <View style={{ flex: 1, paddingLeft: 8 }}>
                                    <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase' }}>Duration</Text>
                                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#0F172A', marginTop: 4 }}>{med.duration}</Text>
                                </View>
                            </View>
                            {med.notes ? <Text style={{ fontSize: 13, color: '#475569', marginTop: 12, fontStyle: 'italic' }}>Note: {med.notes}</Text> : null}
                        </View>
                    ))}
                </View>

                {state.prescriptionNotes ? (
                     <View style={{ backgroundColor: '#FFFBEB', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#FEF3C7' }}>
                         <Text style={{ fontSize: 12, fontWeight: '700', color: '#D97706', textTransform: 'uppercase', marginBottom: 8 }}>Doctor's Advice</Text>
                         <Text style={{ fontSize: 15, color: '#92400E', lineHeight: 22 }}>{state.prescriptionNotes}</Text>
                     </View>
                ) : null}
            </ScrollView>
        );
    }

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#F8FAFC' }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <TouchableOpacity onPress={onBack} style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 }}><ArrowLeft size={20} color="#0F172A" /></TouchableOpacity>
                <View><Text style={{ fontSize: 20, fontWeight: '700', color: '#0F172A' }}>Create Prescription</Text><Text style={{ fontSize: 13, color: '#64748B', fontWeight: '500' }}>Patient: {appointment.patientName}</Text></View>
            </View>

            {/* AI Warning Banner (Mocked) */}
            <View style={{ flexDirection: 'row', backgroundColor: '#F0FDF4', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#BBF7D0', marginBottom: 20, alignItems: 'center', gap: 10 }}>
                <ShieldAlert size={20} color="#16A34A" />
                <View style={{ flex: 1 }}><Text style={{ fontSize: 13, fontWeight: '600', color: '#15803D' }}>Safe to Prescribe</Text><Text style={{ fontSize: 12, color: '#166534' }}>No known drug interactions found with patient's active allergies.</Text></View>
            </View>

            {/* Prescribe Medicines */}
            <View style={{ marginBottom: 24 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingHorizontal: 4 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Pill size={18} color="#2563EB" /><Text style={{ fontWeight: '700', fontSize: 16, color: '#0F172A' }}>Medication List</Text></View>
                </View>

                {medicines.map((med, i) => (
                    <View key={i} style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <Text style={{ fontSize: 13, fontWeight: '700', color: '#2563EB', textTransform: 'uppercase' }}>Medicine {i + 1}</Text>
                            {medicines.length > 1 && (
                                <TouchableOpacity onPress={() => removeMedicine(i)} style={{ padding: 4 }}><Trash2 size={16} color="#EF4444" /></TouchableOpacity>
                            )}
                        </View>

                        <View style={{ zIndex: 10 - i }}>
                            <TextInput 
                                value={med.name} 
                                onChangeText={v => { updateMedicine(i, 'name', v); setShowSuggestions(v.length > 1 ? i : null); }} 
                                placeholder="Search medicine name..." 
                                placeholderTextColor="#94A3B8" 
                                style={{ width: '100%', height: 48, borderRadius: 12, backgroundColor: '#F8FAFC', paddingHorizontal: 16, fontSize: 15, color: '#0F172A', borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 12 }} 
                            />
                            {showSuggestions === i && (
                                <View style={{ position: 'absolute', top: 52, left: 0, right: 0, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5, zIndex: 100 }}>
                                    {SUGGESTIONS.map(s => (
                                        <TouchableOpacity key={s} onPress={() => { updateMedicine(i, 'name', s); setShowSuggestions(null); }} style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}><Text style={{ fontSize: 14, color: '#334155' }}>{s}</Text></TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>

                        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748B', marginBottom: 6, marginLeft: 4 }}>Dosage</Text>
                                <TextInput value={med.dosage} onChangeText={v => updateMedicine(i, 'dosage', v)} placeholder="E.g. 500mg" placeholderTextColor="#94A3B8" style={{ width: '100%', height: 44, borderRadius: 10, backgroundColor: '#F8FAFC', paddingHorizontal: 16, fontSize: 14, color: '#0F172A', borderWidth: 1, borderColor: '#E2E8F0' }} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748B', marginBottom: 6, marginLeft: 4 }}>Frequency</Text>
                                <TextInput value={med.frequency} onChangeText={v => updateMedicine(i, 'frequency', v)} placeholder="E.g. Twice daily" placeholderTextColor="#94A3B8" style={{ width: '100%', height: 44, borderRadius: 10, backgroundColor: '#F8FAFC', paddingHorizontal: 16, fontSize: 14, color: '#0F172A', borderWidth: 1, borderColor: '#E2E8F0' }} />
                            </View>
                        </View>
                        
                        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748B', marginBottom: 6, marginLeft: 4 }}>Duration</Text>
                                <TextInput value={med.duration} onChangeText={v => updateMedicine(i, 'duration', v)} placeholder="E.g. 5 days" placeholderTextColor="#94A3B8" style={{ width: '100%', height: 44, borderRadius: 10, backgroundColor: '#F8FAFC', paddingHorizontal: 16, fontSize: 14, color: '#0F172A', borderWidth: 1, borderColor: '#E2E8F0' }} />
                            </View>
                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748B', marginBottom: 10, marginLeft: 4 }}>Intake Time</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8FAFC', height: 44, borderRadius: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: '#E2E8F0' }}>
                                    <Text style={{ fontSize: 13, color: '#475569', fontWeight: '500' }}>{med.beforeFood ? 'Before Food' : 'After Food'}</Text>
                                    <Switch trackColor={{ false: '#94A3B8', true: '#2563EB' }} thumbColor="#FFFFFF" ios_backgroundColor="#94A3B8" onValueChange={v => updateMedicine(i, 'beforeFood', v)} value={med.beforeFood} style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }} />
                                </View>
                            </View>
                        </View>

                        <TextInput value={med.notes || ''} onChangeText={v => updateMedicine(i, 'notes', v)} placeholder="Specific instructions for this medicine..." placeholderTextColor="#94A3B8" style={{ width: '100%', height: 44, borderRadius: 10, backgroundColor: '#F8FAFC', paddingHorizontal: 16, fontSize: 14, color: '#0F172A', borderWidth: 1, borderColor: '#E2E8F0' }} />
                    </View>
                ))}

                <TouchableOpacity onPress={addMedicine} style={{ width: '100%', height: 52, borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#CBD5E1', backgroundColor: '#F8FAFC', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Plus size={18} color="#64748B" />
                    <Text style={{ fontSize: 14, color: '#64748B', fontWeight: '700' }}>Add Another Medicine</Text>
                </TouchableOpacity>
            </View>

            {/* General Instructions */}
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 30, borderWidth: 1, borderColor: '#F1F5F9' }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 12 }}>General Diet & Advice</Text>
                <TextInput value={notes} onChangeText={setNotes} placeholder="E.g., Drink plenty of water, avoid spicy food..." placeholderTextColor="#94A3B8" multiline style={{ width: '100%', height: 100, borderRadius: 12, backgroundColor: '#F8FAFC', padding: 16, fontSize: 15, color: '#0F172A', borderWidth: 1, borderColor: '#E2E8F0' }} textAlignVertical="top" />
            </View>

            {/* Actions */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity onPress={onBack} style={{ flex: 1, height: 56, borderRadius: 16, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' }}><Text style={{ fontSize: 16, fontWeight: '700', color: '#475569' }}>Cancel</Text></TouchableOpacity>
                <TouchableOpacity onPress={handleSubmit} style={{ flex: 1.5, height: 56, borderRadius: 16, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }}><Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF' }}>Issue Prescription</Text></TouchableOpacity>
            </View>
        </ScrollView>
    );
}
