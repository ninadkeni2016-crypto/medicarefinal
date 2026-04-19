import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { ArrowLeft, Stethoscope, Activity, Thermometer, Heart, FileText, Zap, Check } from 'lucide-react-native';
import { Appointment } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { AppointmentFlowState } from '@/lib/appointment-state';
import api from '@/lib/api';

interface Props { 
    appointment: Appointment; 
    onBack: () => void; 
    clinicalData: AppointmentFlowState;
}

const COMMON_SYMPTOMS = ['Fever', 'Headache', 'Cough', 'Fatigue', 'Body Ache', 'Nausea', 'Dizziness', 'Chills'];

export default function ConsultationPage({ appointment, onBack, clinicalData }: Props) {
    const { role } = useAuth();
    const [notes, setNotes] = useState(clinicalData.consultationNotes);
    const [diagnosis, setDiagnosis] = useState(clinicalData.diagnosis);
    const [vitals, setVitals] = useState(clinicalData.vitals || { bp: '', hr: '', temp: '', weight: '' });
    const [symptoms, setSymptoms] = useState<string[]>(clinicalData.symptoms || []);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const toggleSymptom = (sym: string) => {
        setSymptoms(prev => prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]);
    };

    const handleGenerateSummary = () => {
        setIsGenerating(true);
        setTimeout(() => {
            const symText = symptoms.length > 0 ? `Patient presents with ${symptoms.join(', ')}. ` : '';
            const vitalsText = `Vitals: BP ${vitals.bp || 'N/A'}, HR ${vitals.hr || 'N/A'} bpm, Temp ${vitals.temp || 'N/A'}°F, Wt ${vitals.weight || 'N/A'}kg. `;
            setNotes(`${symText}${vitalsText}Patient appears stable and advises rest and hydration.`);
            setIsGenerating(false);
            toast({ title: '✨ AI Summary Generated' });
        }, 1500);
    };

    const handleSubmit = async () => {
        if (!notes.trim() && !diagnosis.trim()) {
            toast({ title: 'Please add diagnosis or notes before saving.' });
            return;
        }
        setIsSaving(true);
        const id = (appointment as any)._id || appointment.id;
        try {
            await api.patch(`/appointments/${id}/clinical-data`, {
                consultationNotes: notes,
                diagnosis,
                vitals,
                symptoms,
                currentStep: Math.max(clinicalData.currentStep, 1),
            });
            toast({ title: '✅ Consultation saved successfully' });
            onBack();
        } catch (error: any) {
            const msg = error?.response?.data?.message || error?.message || 'Unknown error';
            console.error('Consultation save failed:', msg, error?.response?.status);
            toast({ title: '❌ Save failed', description: msg });
        } finally {
            setIsSaving(false);
        }
    };

    if (role === 'patient') {
        return (
            <ScrollView style={{ flex: 1, backgroundColor: '#F8FAFC' }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
                {/* Header */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                    <TouchableOpacity onPress={onBack} style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 }}>
                        <ArrowLeft size={20} color="#0F172A" />
                    </TouchableOpacity>
                    <View>
                        <Text style={{ fontSize: 20, fontWeight: '700', color: '#0F172A' }}>Consultation Details</Text>
                        <Text style={{ fontSize: 13, color: '#64748B', fontWeight: '500' }}>By {appointment.doctorName}</Text>
                    </View>
                </View>

                {/* Vitals */}
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 12, marginLeft: 4 }}>Recorded Vitals</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
                    {[
                        { label: 'Blood Pressure', value: vitals.bp || '--', unit: 'mmHg', icon: Activity, color: '#EF4444', bg: '#FEF2F2' },
                        { label: 'Heart Rate', value: vitals.hr || '--', unit: 'bpm', icon: Heart, color: '#EC4899', bg: '#FDF2F8' },
                        { label: 'Temperature', value: vitals.temp || '--', unit: '°F', icon: Thermometer, color: '#F59E0B', bg: '#FFFBEB' },
                        { label: 'Weight', value: vitals.weight || '--', unit: 'kg', icon: Activity, color: '#3B82F6', bg: '#EFF6FF' },
                    ].map((v, i) => (
                        <View key={i} style={{ flex: 1, minWidth: '45%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#F1F5F9' }}>
                            <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: v.bg, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                                <v.icon size={16} color={v.color} />
                            </View>
                            <Text style={{ fontSize: 12, color: '#64748B', fontWeight: '600' }}>{v.label}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
                                <Text style={{ fontSize: 18, fontWeight: '700', color: '#0F172A' }}>{v.value}</Text>
                                <Text style={{ fontSize: 12, color: '#94A3B8', fontWeight: '500' }}>{v.unit}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Diagnosis & Notes */}
                <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                        <Stethoscope size={20} color="#2563EB" />
                        <Text style={{ fontWeight: '700', fontSize: 16, color: '#0F172A' }}>Clinical Diagnosis</Text>
                    </View>
                    
                    {symptoms.length > 0 && (
                        <View style={{ marginBottom: 16 }}>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748B', textTransform: 'uppercase', marginBottom: 8 }}>Symptoms</Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                {symptoms.map(s => (
                                    <View key={s} style={{ backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#DBEAFE' }}>
                                        <Text style={{ fontSize: 13, color: '#2563EB', fontWeight: '500' }}>{s}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {diagnosis ? (
                        <View style={{ marginBottom: 16 }}>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748B', textTransform: 'uppercase', marginBottom: 6 }}>Diagnosis</Text>
                            <View style={{ backgroundColor: '#F8FAFC', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9' }}>
                                <Text style={{ fontSize: 15, color: '#0F172A', fontWeight: '500' }}>{diagnosis}</Text>
                            </View>
                        </View>
                    ) : null}
                    
                    <View>
                        <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748B', textTransform: 'uppercase', marginBottom: 6 }}>Doctor's Notes</Text>
                        <View style={{ backgroundColor: '#F8FAFC', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9' }}>
                            <Text style={{ fontSize: 15, color: '#334155', lineHeight: 22 }}>{notes || 'No detailed notes provided yet.'}</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        );
    }

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#F8FAFC' }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <TouchableOpacity onPress={onBack} style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 }}>
                    <ArrowLeft size={20} color="#0F172A" />
                </TouchableOpacity>
                <View>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: '#0F172A' }}>Consultation</Text>
                    <Text style={{ fontSize: 13, color: '#64748B', fontWeight: '500' }}>Patient: {appointment.patientName}</Text>
                </View>
            </View>

            {/* Vitals Section */}
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 16 }}>Patient Vitals</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                    {[
                        { icon: Activity, placeholder: 'BP (mmHg)', val: vitals.bp, key: 'bp', color: '#EF4444' },
                        { icon: Heart, placeholder: 'HR (bpm)', val: vitals.hr, key: 'hr', color: '#EC4899' },
                        { icon: Thermometer, placeholder: 'Temp (°F)', val: vitals.temp, key: 'temp', color: '#F59E0B' },
                        { icon: Activity, placeholder: 'Weight (kg)', val: vitals.weight, key: 'weight', color: '#3B82F6' },
                    ].map((v, i) => (
                        <View key={i} style={{ flex: 1, minWidth: '45%' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, paddingHorizontal: 12, height: 48, borderWidth: 1, borderColor: '#E2E8F0' }}>
                                <View style={{ marginRight: 8 }}><v.icon size={16} color={v.color} /></View>
                                <TextInput 
                                    style={{ flex: 1, fontSize: 14, color: '#0F172A', fontWeight: '600' }} 
                                    placeholder={v.placeholder} 
                                    placeholderTextColor="#94A3B8" 
                                    value={v.val} 
                                    onChangeText={text => setVitals({...vitals, [v.key]: text})} 
                                />
                            </View>
                        </View>
                    ))}
                </View>
            </View>

            {/* Symptoms Tags */}
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 12 }}>Common Symptoms</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {COMMON_SYMPTOMS.map(sym => {
                        const isSelected = symptoms.includes(sym);
                        return (
                            <TouchableOpacity 
                                key={sym} 
                                onPress={() => toggleSymptom(sym)}
                                style={{ 
                                    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, 
                                    backgroundColor: isSelected ? '#2563EB' : '#F8FAFC',
                                    borderWidth: 1, borderColor: isSelected ? '#2563EB' : '#E2E8F0',
                                    flexDirection: 'row', alignItems: 'center', gap: 6
                                }}
                            >
                                {isSelected && <Check size={14} color="#FFF" />}
                                <Text style={{ fontSize: 13, fontWeight: '600', color: isSelected ? '#FFF' : '#475569' }}>{sym}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* Clinical Notes */}
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <FileText size={20} color="#2563EB" />
                    <Text style={{ fontWeight: '700', fontSize: 16, color: '#0F172A' }}>Clinical Details</Text>
                </View>
                
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#64748B', marginBottom: 8, marginLeft: 4 }}>Primary Diagnosis</Text>
                <TextInput 
                    value={diagnosis} 
                    onChangeText={setDiagnosis} 
                    placeholder="E.g., Upper respiratory tract infection" 
                    placeholderTextColor="#94A3B8" 
                    style={{ width: '100%', borderRadius: 12, backgroundColor: '#F8FAFC', padding: 16, fontSize: 15, color: '#0F172A', marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' }} 
                />
                
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, marginLeft: 4 }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#64748B' }}>Clinical Notes</Text>
                    <TouchableOpacity onPress={handleGenerateSummary} disabled={isGenerating} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FEF2F2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                        {isGenerating ? <ActivityIndicator size="small" color="#EF4444" /> : <Zap size={12} color="#EF4444" />}
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#EF4444' }}>{isGenerating ? 'Generating...' : 'AI Assist'}</Text>
                    </TouchableOpacity>
                </View>
                
                <TextInput 
                    value={notes} 
                    onChangeText={setNotes} 
                    placeholder="Enter detailed observations, plan, and advices..." 
                    placeholderTextColor="#94A3B8" 
                    multiline 
                    numberOfLines={6} 
                    textAlignVertical="top" 
                    style={{ width: '100%', height: 140, borderRadius: 12, backgroundColor: '#F8FAFC', padding: 16, fontSize: 15, color: '#0F172A', borderWidth: 1, borderColor: '#E2E8F0' }} 
                />
            </View>

            {/* Actions */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
                <TouchableOpacity onPress={onBack} style={{ flex: 1, height: 52, borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: '#475569' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSubmit} disabled={isSaving} style={{ flex: 1.5, height: 52, borderRadius: 12, backgroundColor: isSaving ? '#93C5FD' : '#2563EB', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }}>
                    {isSaving ? <ActivityIndicator size="small" color="#FFFFFF" /> : null}
                    <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFFFFF' }}>{isSaving ? 'Saving...' : 'Save Consultation'}</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}
