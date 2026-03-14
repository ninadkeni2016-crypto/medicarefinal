import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { ArrowLeft, CreditCard, Clock, CheckCircle } from 'lucide-react-native';
import { Appointment } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { getAppointmentState, updateAppointmentState } from '@/lib/appointment-state';
import { toast } from '@/hooks/use-toast';
import api from '@/lib/api';
import RazorpayCheckout from '../RazorpayCheckout';

interface Props { appointment: Appointment; onBack: () => void; }

const LABELS: Record<string, string> = { consultationFee: 'Consultation Fee', treatmentCost: 'Treatment Cost', labCharges: 'Lab Charges', medicineCost: 'Medicine Cost' };

export default function PaymentPage({ appointment, onBack }: Props) {
    const { role } = useAuth();
    const state = getAppointmentState(appointment.id);
    const [showRazorpay, setShowRazorpay] = useState(false);
    const [loadingOrder, setLoadingOrder] = useState(false);
    const [razorpayOrderId, setRazorpayOrderId] = useState('');
    const billTotal = Object.values(state.billItems).reduce((s, v) => s + v, 0);

    const handleSuccess = async (paymentId?: string, signature?: string) => {
        try {
            // In a real app we'd verify the signature here via /api/payments/verify
            // but for now we'll just optimistically update since we don't have bill ID 
            // easily accessible in this mock flow. The order creation is real though.
            updateAppointmentState(appointment.id, { paymentDone: true, currentStep: Math.max(state.currentStep, 5) });
            setShowRazorpay(false);
            toast({ title: 'Payment Successful! ✅', description: `₹${billTotal} paid via Razorpay` });
            onBack();
        } catch (error) {
            console.error(error);
            toast({ title: 'Payment Failed', description: 'Could not verify payment' });
        }
    };

    const initiatePayment = async () => {
        setLoadingOrder(true);
        try {
            // We create a dummy order for the amount on the backend
            // In a real flow, this would pass the actual Bill object ID 
            // but since this UI is driven by local mock state, we'll
            // just hardcode it or use the backend's create-order logic.
            // (Assuming backend create-order temporarily allows no billId)
            const res = await api.post('/payments/create-order', { billId: appointment.id });
            setRazorpayOrderId(res.data.id);
            setShowRazorpay(true);
        } catch (error) {
            console.warn('Backend order creation failed, falling back to local flow for testing');
            // Fallback for UI testing
            setShowRazorpay(true);
        } finally {
            setLoadingOrder(false);
        }
    };
    const handleCancel = () => {
        setShowRazorpay(false);
        toast({ title: 'Payment cancelled', description: 'You can retry payment anytime.' });
    };

    if (role === 'doctor') {
        return (
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <TouchableOpacity onPress={onBack} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}><ArrowLeft size={20} color="#334155" /></TouchableOpacity>
                    <View><Text style={{ fontSize: 18, fontWeight: '700', color: '#0284c7' }}>Payment Status</Text><Text style={{ fontSize: 12, color: '#64748b' }}>Patient: {appointment.patientName}</Text></View>
                </View>
                <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 32, borderWidth: 1, borderColor: '#f1f5f9', alignItems: 'center' }}>
                    {state.paymentDone ? (
                        <><View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}><CheckCircle size={32} color="#16a34a" /></View><Text style={{ fontSize: 18, fontWeight: '700', color: '#0284c7' }}>Payment Received</Text><Text style={{ fontSize: 14, color: '#64748b', marginTop: 8 }}>₹{billTotal} paid by the patient</Text></>
                    ) : (
                        <><View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#fef9c3', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}><Clock size={32} color="#ca8a04" /></View><Text style={{ fontSize: 18, fontWeight: '700', color: '#0284c7' }}>Waiting for Payment</Text><Text style={{ fontSize: 14, color: '#64748b', marginTop: 8, textAlign: 'center' }}>Patient has been notified to pay ₹{billTotal}</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f1f5f9', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, marginTop: 12 }}><ActivityIndicator size="small" color="#64748b" /><Text style={{ fontSize: 12, color: '#64748b' }}>Awaiting payment...</Text></View></>
                    )}
                </View>
            </ScrollView>
        );
    }

    if (state.paymentDone) {
        return (
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <TouchableOpacity onPress={onBack} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}><ArrowLeft size={20} color="#334155" /></TouchableOpacity>
                    <View><Text style={{ fontSize: 18, fontWeight: '700', color: '#0284c7' }}>Payment</Text><Text style={{ fontSize: 12, color: '#64748b' }}>Transaction complete</Text></View>
                </View>
                <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 32, borderWidth: 1, borderColor: '#f1f5f9', alignItems: 'center' }}>
                    <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}><CheckCircle size={32} color="#16a34a" /></View>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#0284c7' }}>Payment Complete</Text>
                    <Text style={{ fontSize: 14, color: '#64748b', marginTop: 8 }}>₹{billTotal} paid via Razorpay</Text>
                </View>
            </ScrollView>
        );
    }

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <TouchableOpacity onPress={onBack} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}><ArrowLeft size={20} color="#334155" /></TouchableOpacity>
                <View><Text style={{ fontSize: 18, fontWeight: '700', color: '#0284c7' }}>Payment</Text><Text style={{ fontSize: 12, color: '#64748b' }}>Pay via Razorpay</Text></View>
            </View>
            <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f1f5f9' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}><CreditCard size={20} color="#0ea5e9" /><Text style={{ fontWeight: '700', fontSize: 14, color: '#0284c7' }}>Payment Summary</Text></View>
                {Object.entries(state.billItems).map(([key, val]) => (
                    <View key={key} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text style={{ fontSize: 14, color: '#64748b' }}>{LABELS[key]}</Text>
                        <Text style={{ fontSize: 14, color: '#0284c7', fontWeight: '500' }}>₹{val}</Text>
                    </View>
                ))}
                <View style={{ borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 12, marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#0284c7' }}>Total Amount</Text>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: '#0ea5e9' }}>₹{billTotal}</Text>
                </View>
                <TouchableOpacity onPress={initiatePayment} disabled={loadingOrder} style={{ width: '100%', paddingVertical: 14, borderRadius: 12, backgroundColor: loadingOrder ? '#94a3b8' : '#0ea5e9', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    {loadingOrder ? <ActivityIndicator size="small" color="#fff" /> : <CreditCard size={16} color="#fff" />}
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>{loadingOrder ? 'Initializing...' : `Pay ₹${billTotal} via Razorpay`}</Text>
                </TouchableOpacity>
                <Text style={{ fontSize: 10, color: '#94a3b8', textAlign: 'center', marginTop: 8 }}>Secured by Razorpay • 256-bit SSL</Text>
            </View>
            <RazorpayCheckout visible={showRazorpay} amount={billTotal} onClose={handleCancel} onCancel={handleCancel} onSuccess={handleSuccess} />
        </ScrollView>
    );
}
