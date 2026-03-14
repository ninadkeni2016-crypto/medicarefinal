import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { ArrowLeft, Receipt } from 'lucide-react-native';
import { Appointment } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { getAppointmentState, updateAppointmentState } from '@/lib/appointment-state';
import { toast } from '@/hooks/use-toast';
import api from '@/lib/api';

interface Props { appointment: Appointment; onBack: () => void; }

const LABELS: Record<string, string> = { consultationFee: 'Consultation Fee', treatmentCost: 'Treatment Cost', labCharges: 'Lab Charges', medicineCost: 'Medicine Cost' };

export default function BillingPage({ appointment, onBack }: Props) {
    const { role } = useAuth();
    const state = getAppointmentState(appointment.id);
    const [billItems, setBillItems] = useState(state.billItems);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const billTotal = Object.values(billItems).reduce((s, v) => s + v, 0);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await api.post('/bills', {
                patientName: appointment.patientName,
                doctorName: appointment.doctorName,
                date: appointment.date,
                consultationFee: billItems.consultationFee,
                treatmentCost: billItems.treatmentCost,
                labCharges: billItems.labCharges,
                medicineCost: billItems.medicineCost,
                total: billTotal,
                status: 'Pending',
            });
            updateAppointmentState(appointment.id, { billItems, currentStep: Math.max(state.currentStep, 4) });
            toast({ title: `✅ Bill of ₹${billTotal} generated remotely!` });
            onBack();
        } catch (error) {
            console.error('Failed to submit bill:', error);
            toast({ title: `❌ Failed to submit bill. Try again.` });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (role === 'patient') {
        const total = Object.values(state.billItems).reduce((s, v) => s + v, 0);
        return (
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <TouchableOpacity onPress={onBack} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}><ArrowLeft size={20} color="#334155" /></TouchableOpacity>
                    <View style={{ flex: 1 }}><Text style={{ fontSize: 18, fontWeight: '700', color: '#0284c7' }}>Bill Details</Text><Text style={{ fontSize: 12, color: '#64748b' }}>From {appointment.doctorName}</Text></View>
                </View>
                <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f1f5f9' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}><Receipt size={20} color="#ca8a04" /><Text style={{ fontWeight: '700', fontSize: 14, color: '#ca8a04' }}>Itemized Bill</Text></View>
                    {Object.entries(state.billItems).map(([key, val]) => (
                        <View key={key} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 12, padding: 12, marginBottom: 6 }}>
                            <Text style={{ fontSize: 12, color: '#0284c7', fontWeight: '500' }}>{LABELS[key]}</Text>
                            <Text style={{ fontSize: 14, fontWeight: '600', color: '#0284c7' }}>₹{val}</Text>
                        </View>
                    ))}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f0fdfa', borderRadius: 12, padding: 12, marginTop: 4 }}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#0284c7' }}>Total</Text>
                        <Text style={{ fontSize: 18, fontWeight: '700', color: '#0ea5e9' }}>₹{total}</Text>
                    </View>
                </View>
            </ScrollView>
        );
    }

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <TouchableOpacity onPress={onBack} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}><ArrowLeft size={20} color="#334155" /></TouchableOpacity>
                <View><Text style={{ fontSize: 18, fontWeight: '700', color: '#0284c7' }}>Generate Bill</Text><Text style={{ fontSize: 12, color: '#64748b' }}>Patient: {appointment.patientName}</Text></View>
            </View>
            <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f1f5f9' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}><Receipt size={16} color="#ca8a04" /><Text style={{ fontWeight: '700', fontSize: 14, color: '#0284c7' }}>Bill Items</Text></View>
                {Object.entries(billItems).map(([key, val]) => (
                    <View key={key} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 12, padding: 12, marginBottom: 6 }}>
                        <Text style={{ fontSize: 12, color: '#0284c7', fontWeight: '500' }}>{LABELS[key]}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Text style={{ fontSize: 12, color: '#64748b' }}>₹</Text>
                            <TextInput value={String(val)} onChangeText={v => setBillItems({ ...billItems, [key]: Number(v) || 0 })} keyboardType="numeric" style={{ width: 70, textAlign: 'right', borderRadius: 8, backgroundColor: '#fff', padding: 8, fontSize: 14, fontWeight: '600', color: '#0284c7' }} />
                        </View>
                    </View>
                ))}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f0fdfa', borderRadius: 12, padding: 12, marginTop: 4, marginBottom: 12 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#0284c7' }}>Total</Text>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#0ea5e9' }}>₹{billTotal}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity onPress={onBack} style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center' }}><Text style={{ fontSize: 14, fontWeight: '600', color: '#334155' }}>Cancel</Text></TouchableOpacity>
                    <TouchableOpacity onPress={handleSubmit} style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#0ea5e9', alignItems: 'center' }}><Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>Generate Bill</Text></TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}
