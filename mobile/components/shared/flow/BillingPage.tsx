import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { ArrowLeft, Receipt, CheckCircle, Plus, Percent, HeartHandshake } from 'lucide-react-native';
import { Appointment } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { getAppointmentState, updateAppointmentState } from '@/lib/appointment-state';
import { toast } from '@/hooks/use-toast';
import api from '@/lib/api';

interface Props { appointment: Appointment; onBack: () => void; }

const LABELS: Record<string, { label: string, icon: React.ElementType, color: string }> = { 
    consultationFee: { label: 'Consultation Fee', icon: Receipt, color: '#2563EB' }, 
    treatmentCost: { label: 'Treatment Charges', icon: HeartHandshake, color: '#8B5CF6' }, 
    labCharges: { label: 'Lab & Diagnostics', icon: Plus, color: '#16A34A' }, 
    medicineCost: { label: 'Pharmacy/Medicines', icon: Plus, color: '#F59E0B' },
    otherCharges: { label: 'Other Charges', icon: Plus, color: '#64748B' }
};

export default function BillingPage({ appointment, onBack }: Props) {
    const { role } = useAuth();
    const state = getAppointmentState(appointment.id);
    const [billItems, setBillItems] = useState(state.billItems || { consultationFee: 500, treatmentCost: 0, labCharges: 0, medicineCost: 0, otherCharges: 0 });
    const [discount, setDiscount] = useState(state.discount || 0);
    const [gstPercentage, setGstPercentage] = useState(state.gst ?? 18);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const subtotal = Object.values(billItems).reduce((s, v) => s + (Number(v) || 0), 0);
    const totalAfterDiscount = Math.max(0, subtotal - (Number(discount) || 0));
    const gstAmount = (totalAfterDiscount * (Number(gstPercentage) || 0)) / 100;
    const finalTotal = totalAfterDiscount + gstAmount;

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await api.post('/bills', {
                patientName: appointment.patientName,
                doctorName: appointment.doctorName,
                date: appointment.date,
                ...billItems,
                discount,
                gst: gstPercentage,
                total: finalTotal,
                status: 'Pending',
            });
            
            updateAppointmentState(appointment.id, { 
                billItems, discount, gst: gstPercentage, 
                currentStep: Math.max(state.currentStep, 4) 
            });
            toast({ title: `✅ Invoice generated for ₹${finalTotal.toFixed(2)}` });
            onBack();
        } catch (error) {
            console.error('Failed to submit bill:', error);
            toast({ title: 'Failed to generate invoice', variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (role === 'patient') {
        return (
            <ScrollView style={{ flex: 1, backgroundColor: '#F8FAFC' }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                    <TouchableOpacity onPress={onBack} style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 }}><ArrowLeft size={20} color="#0F172A" /></TouchableOpacity>
                    <View style={{ flex: 1 }}><Text style={{ fontSize: 20, fontWeight: '700', color: '#0F172A' }}>Visit Invoice</Text><Text style={{ fontSize: 13, color: '#64748B', fontWeight: '500' }}>Issued by {appointment.doctorName}</Text></View>
                </View>

                {/* Patient Invoice View */}
                <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 5 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                        <View>
                            <Text style={{ fontSize: 24, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5 }}>INVOICE</Text>
                            <Text style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>INV-{String(appointment.id).padStart(5, '0')}</Text>
                        </View>
                        <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' }}>
                            <Receipt size={24} color="#2563EB" />
                        </View>
                    </View>

                    <View style={{ height: 1, backgroundColor: '#F1F5F9', marginBottom: 20 }} />

                    {/* Itemized List */}
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 0.5 }}>Itemized Charges</Text>
                    
                    {Object.entries(state.billItems).filter(([_, val]) => Number(val) > 0).map(([key, val]) => (
                        <View key={key} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <Text style={{ fontSize: 14, color: '#334155', fontWeight: '500' }}>{LABELS[key]?.label || key}</Text>
                            <Text style={{ fontSize: 15, fontWeight: '600', color: '#0F172A' }}>₹{Number(val).toFixed(2)}</Text>
                        </View>
                    ))}

                    <View style={{ height: 1.5, backgroundColor: '#E2E8F0', borderStyle: 'dashed', marginVertical: 16 }} />

                    {/* Calculations */}
                    <View style={{ gap: 8 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ fontSize: 13, color: '#64748B' }}>Subtotal</Text>
                            <Text style={{ fontSize: 13, fontWeight: '600', color: '#334155' }}>₹{subtotal.toFixed(2)}</Text>
                        </View>
                        {Number(state.discount) > 0 && (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ fontSize: 13, color: '#16A34A' }}>Discount</Text>
                                <Text style={{ fontSize: 13, fontWeight: '600', color: '#16A34A' }}>- ₹{Number(state.discount).toFixed(2)}</Text>
                            </View>
                        )}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ fontSize: 13, color: '#64748B' }}>Taxes (GST {state.gst}%)</Text>
                            <Text style={{ fontSize: 13, fontWeight: '600', color: '#334155' }}>+ ₹{gstAmount.toFixed(2)}</Text>
                        </View>
                    </View>

                    {/* Final Total */}
                    <View style={{ backgroundColor: '#F8FAFC', borderRadius: 12, padding: 16, marginTop: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' }}>
                        <Text style={{ fontSize: 16, fontWeight: '700', color: '#0F172A' }}>Total Amount</Text>
                        <Text style={{ fontSize: 24, fontWeight: '800', color: '#2563EB' }}>₹{finalTotal.toFixed(2)}</Text>
                    </View>
                </View>
            </ScrollView>
        );
    }

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#F8FAFC' }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <TouchableOpacity onPress={onBack} style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 }}><ArrowLeft size={20} color="#0F172A" /></TouchableOpacity>
                <View><Text style={{ fontSize: 20, fontWeight: '700', color: '#0F172A' }}>Generate Invoice</Text><Text style={{ fontSize: 13, color: '#64748B', fontWeight: '500' }}>Patient: {appointment.patientName}</Text></View>
            </View>

            {/* Billing Items Entry */}
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 16, marginLeft: 4 }}>Bill Breakdown</Text>
                
                <View style={{ gap: 16 }}>
                    {Object.entries(billItems).map(([key, val]) => {
                        const info = LABELS[key] || { label: key, icon: Plus, color: '#94A3B8' };
                        const Icon = info.icon;
                        return (
                            <View key={key}>
                                <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748B', marginBottom: 8, marginLeft: 4 }}>{info.label}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, paddingHorizontal: 16, height: 52, borderWidth: 1, borderColor: '#E2E8F0' }}>
                                    <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: `${info.color}15`, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                                        <Icon size={14} color={info.color} />
                                    </View>
                                    <Text style={{ fontSize: 16, color: '#94A3B8', fontWeight: '500', marginRight: 4 }}>₹</Text>
                                    <TextInput 
                                        value={String(val)} 
                                        onChangeText={v => setBillItems({ ...billItems, [key]: v ? Number(v) : 0 })} 
                                        keyboardType="numeric" 
                                        placeholder="0" 
                                        placeholderTextColor="#CBD5E1" 
                                        style={{ flex: 1, fontSize: 16, fontWeight: '600', color: '#0F172A' }} 
                                    />
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* Separator */}
                <View style={{ height: 1, backgroundColor: '#E2E8F0', marginVertical: 24, borderStyle: 'dashed' }} />

                {/* Adjustments (Discount & Taxes) */}
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 16, marginLeft: 4 }}>Adjustments & Taxes</Text>
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 8 }}>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748B', marginBottom: 8, marginLeft: 4 }}>Discount</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', borderRadius: 12, paddingHorizontal: 16, height: 52, borderWidth: 1, borderColor: '#FECACA' }}>
                            <Text style={{ fontSize: 16, color: '#EF4444', fontWeight: '500', marginRight: 4 }}>- ₹</Text>
                            <TextInput 
                                value={String(discount)} 
                                onChangeText={v => setDiscount(v ? Number(v) : 0)} 
                                keyboardType="numeric" 
                                placeholder="0" 
                                placeholderTextColor="#F87171" 
                                style={{ flex: 1, fontSize: 16, fontWeight: '600', color: '#991B1B' }} 
                            />
                        </View>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748B', marginBottom: 8, marginLeft: 4 }}>Tax (GST %)</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, paddingHorizontal: 16, height: 52, borderWidth: 1, borderColor: '#E2E8F0' }}>
                            <View style={{ marginRight: 8 }}><Percent size={16} color="#64748B" /></View>
                            <TextInput 
                                value={String(gstPercentage)} 
                                onChangeText={v => setGstPercentage(v ? Number(v) : 0)} 
                                keyboardType="numeric" 
                                placeholder="18" 
                                placeholderTextColor="#94A3B8" 
                                style={{ flex: 1, fontSize: 16, fontWeight: '600', color: '#0F172A' }} 
                            />
                        </View>
                    </View>
                </View>
            </View>

            {/* Preview Card */}
            <View style={{ backgroundColor: '#2563EB', borderRadius: 16, padding: 24, marginBottom: 30, shadowColor: '#2563EB', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 8 }}>
                <Text style={{ fontSize: 13, textTransform: 'uppercase', color: '#93C5FD', fontWeight: '700', letterSpacing: 0.5, marginBottom: 16 }}>Live Bill Preview</Text>
                
                <View style={{ gap: 8, borderBottomWidth: 1, borderBottomColor: '#3B82F6', paddingBottom: 16, marginBottom: 16, borderStyle: 'dashed' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 14, color: '#DBEAFE' }}>Subtotal</Text>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#FFFFFF' }}>₹{subtotal.toFixed(2)}</Text>
                    </View>
                    {discount > 0 && (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ fontSize: 14, color: '#93C5FD' }}>Discount</Text>
                            <Text style={{ fontSize: 14, fontWeight: '600', color: '#FFFFFF' }}>- ₹{Number(discount).toFixed(2)}</Text>
                        </View>
                    )}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 14, color: '#DBEAFE' }}>Taxes ({gstPercentage}%)</Text>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#FFFFFF' }}>+ ₹{gstAmount.toFixed(2)}</Text>
                    </View>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, color: '#FFFFFF', fontWeight: '500' }}>Final Amount</Text>
                    <Text style={{ fontSize: 32, fontWeight: '800', color: '#FFFFFF' }}>₹{finalTotal.toFixed(2)}</Text>
                </View>
            </View>

            {/* Actions */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity onPress={onBack} style={{ flex: 1, height: 56, borderRadius: 16, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' }}><Text style={{ fontSize: 16, fontWeight: '700', color: '#475569' }}>Cancel</Text></TouchableOpacity>
                <TouchableOpacity onPress={handleSubmit} disabled={isSubmitting} style={{ flex: 1.5, height: 56, borderRadius: 16, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }}>
                    {isSubmitting ? <ActivityIndicator size="small" color="#FFFFFF" /> : <CheckCircle size={20} color="#FFFFFF" />}
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF' }}>{isSubmitting ? 'Processing...' : 'Issue Invoice'}</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}
