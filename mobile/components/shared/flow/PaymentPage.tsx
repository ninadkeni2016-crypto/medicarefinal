import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { ArrowLeft, CreditCard, Clock, CheckCircle2, ShieldCheck, Wallet, Smartphone, Banknote, Receipt } from 'lucide-react-native';
import { Appointment } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import RazorpayCheckout from '../RazorpayCheckout';

import { AppointmentFlowState } from '@/lib/appointment-state';

interface Props { 
    appointment: Appointment; 
    onBack: () => void; 
    clinicalData: AppointmentFlowState;
}

const PAYMENT_METHODS = [
    { id: 'upi', label: 'UPI / QR Code', icon: Smartphone, color: '#16A34A' },
    { id: 'card', label: 'Credit / Debit Card', icon: CreditCard, color: '#2563EB' },
    { id: 'netbanking', label: 'Net Banking', icon: Wallet, color: '#8B5CF6' },
    { id: 'cash', label: 'Pay at Clinic', icon: Banknote, color: '#F59E0B' },
];

export default function PaymentPage({ appointment, onBack, clinicalData }: Props) {
    const { role } = useAuth();
    const [showRazorpay, setShowRazorpay] = useState(false);
    const [loadingOrder, setLoadingOrder] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState('upi');

    // Calculate total from bill items and adjustments
    const subtotal = Object.values(clinicalData.billItems || {}).reduce((s, v) => s + (Number(v) || 0), 0);
    const totalAfterDiscount = Math.max(0, subtotal - (Number(clinicalData.discount) || 0));
    const gstAmount = (totalAfterDiscount * (Number(clinicalData.gst) || 0)) / 100;
    const finalTotal = totalAfterDiscount + gstAmount;

    const invoiceId = `INV-${String(appointment.id).padStart(5, '0')}`;

    const handleSuccess = async () => {
        const id = (appointment as any)._id || appointment.id;
        try {
            await api.patch(`/appointments/${id}/clinical-data`, { 
                paymentDone: true, 
                paymentMethod: selectedMethod,
                currentStep: Math.max(clinicalData.currentStep, 5) 
            });
            setShowRazorpay(false);
            toast({ title: 'Payment Successful! ✅', description: `₹${finalTotal.toFixed(2)} paid successfully` });
            onBack();
        } catch (error) {
            console.error('Payment save failed', error);
            toast({ title: '❌ Error', description: 'Failed to update payment status' });
        }
    };

    const initiatePayment = async () => {
        setLoadingOrder(true);
        setTimeout(() => {
            setLoadingOrder(false);
            if (selectedMethod === 'cash') {
                handleSuccess();
            } else {
                setShowRazorpay(true);
            }
        }, 800);
    };

    const handleCancel = () => {
        setShowRazorpay(false);
        toast({ title: 'Payment cancelled', description: 'You can retry payment anytime.' });
    };

    const PaymentTimelineItem = ({ title, desc, done, isLast = false, time = '' }: { title: string, desc: string, done: boolean, isLast?: boolean, time?: string }) => (
        <View style={{ flexDirection: 'row', opacity: done ? 1 : 0.5 }}>
            <View style={{ alignItems: 'center', width: 24, marginRight: 16 }}>
                <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: done ? '#16A34A' : '#E2E8F0', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                    <CheckCircle2 size={14} color="#FFFFFF" />
                </View>
                {!isLast && <View style={{ flex: 1, width: 2, backgroundColor: done ? '#16A34A' : '#E2E8F0', marginVertical: 4 }} />}
            </View>
            <View style={{ flex: 1, paddingBottom: isLast ? 0 : 20 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#0F172A' }}>{title}</Text>
                <Text style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>{desc}</Text>
            </View>
            {time && done ? <Text style={{ fontSize: 12, color: '#94A3B8', fontWeight: '500' }}>{time}</Text> : null}
        </View>
    );

    // Doctor View
    if (role === 'doctor') {
        return (
            <ScrollView style={{ flex: 1, backgroundColor: '#F8FAFC' }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                    <TouchableOpacity onPress={onBack} style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 }}><ArrowLeft size={20} color="#0F172A" /></TouchableOpacity>
                    <View><Text style={{ fontSize: 20, fontWeight: '700', color: '#0F172A' }}>Payment Status</Text><Text style={{ fontSize: 13, color: '#64748B', fontWeight: '500' }}>Patient: {appointment.patientName}</Text></View>
                </View>

                {clinicalData.paymentDone ? (
                    <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 32, borderWidth: 1, borderColor: '#F1F5F9', alignItems: 'center', shadowColor: '#64748B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 }}>
                        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center', marginBottom: 20, borderWidth: 4, borderColor: '#F0FDF4' }}>
                            <CheckCircle2 size={40} color="#16A34A" />
                        </View>
                        <Text style={{ fontSize: 24, fontWeight: '800', color: '#0F172A' }}>Payment Received</Text>
                        <View style={{ backgroundColor: '#F8FAFC', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginTop: 12, borderWidth: 1, borderColor: '#E2E8F0' }}>
                            <Text style={{ fontSize: 18, color: '#16A34A', fontWeight: '700' }}>₹{finalTotal.toFixed(2)}</Text>
                        </View>
                        <View style={{ width: '100%', height: 1, backgroundColor: '#E2E8F0', borderStyle: 'dashed', marginVertical: 24 }} />
                        <View style={{ width: '100%', gap: 12 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ color: '#64748B', fontSize: 13 }}>Invoice ID</Text><Text style={{ color: '#0F172A', fontWeight: '600', fontSize: 13 }}>{invoiceId}</Text></View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ color: '#64748B', fontSize: 13 }}>Date</Text><Text style={{ color: '#0F172A', fontWeight: '600', fontSize: 13 }}>{appointment.date}</Text></View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ color: '#64748B', fontSize: 13 }}>Method</Text><Text style={{ color: '#0F172A', fontWeight: '600', fontSize: 13, textTransform: 'capitalize' }}>{clinicalData.paymentMethod || 'Online'}</Text></View>
                        </View>
                    </View>
                ) : (
                    <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 32, borderWidth: 1, borderColor: '#F1F5F9', alignItems: 'center', shadowColor: '#64748B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16 }}>
                        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#FEF9C3', alignItems: 'center', justifyContent: 'center', marginBottom: 20, borderWidth: 4, borderColor: '#FEF08A' }}>
                            <Clock size={40} color="#CA8A04" />
                        </View>
                        <Text style={{ fontSize: 24, fontWeight: '800', color: '#0F172A' }}>Awaiting Payment</Text>
                        <Text style={{ fontSize: 15, color: '#64748B', marginTop: 8, textAlign: 'center', lineHeight: 22 }}>Patient has been notified to pay the invoice amount.</Text>
                        
                        <View style={{ backgroundColor: '#F8FAFC', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, marginTop: 24, borderWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <Receipt size={20} color="#2563EB" />
                            <View>
                                <Text style={{ fontSize: 12, color: '#64748B', fontWeight: '500' }}>Requested Amount</Text>
                                <Text style={{ fontSize: 18, color: '#2563EB', fontWeight: '700' }}>₹{finalTotal.toFixed(2)}</Text>
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EFF6FF', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginTop: 24, borderWidth: 1, borderColor: '#DBEAFE' }}>
                            <ActivityIndicator size="small" color="#2563EB" />
                            <Text style={{ fontSize: 13, color: '#2563EB', fontWeight: '600' }}>Listening for payment update...</Text>
                        </View>
                    </View>
                )}
            </ScrollView>
        );
    }

    // Patient View
    if (clinicalData.paymentDone) {
        return (
            <ScrollView style={{ flex: 1, backgroundColor: '#F8FAFC' }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                    <TouchableOpacity onPress={onBack} style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 }}><ArrowLeft size={20} color="#0F172A" /></TouchableOpacity>
                    <View><Text style={{ fontSize: 20, fontWeight: '700', color: '#0F172A' }}>Payment Receipt</Text><Text style={{ fontSize: 13, color: '#64748B', fontWeight: '500' }}>To {appointment.doctorName}</Text></View>
                </View>

                <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 32, borderWidth: 1, borderColor: '#F1F5F9', alignItems: 'center', shadowColor: '#64748B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16 }}>
                    <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center', marginBottom: 20, borderWidth: 4, borderColor: '#F0FDF4' }}>
                        <CheckCircle2 size={40} color="#16A34A" />
                    </View>
                    <Text style={{ fontSize: 24, fontWeight: '800', color: '#0F172A' }}>Payment Complete</Text>
                    <View style={{ backgroundColor: '#F8FAFC', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginTop: 12, borderWidth: 1, borderColor: '#E2E8F0' }}>
                        <Text style={{ fontSize: 18, color: '#16A34A', fontWeight: '700' }}>₹{finalTotal.toFixed(2)}</Text>
                    </View>
                    <View style={{ width: '100%', height: 1.5, backgroundColor: '#E2E8F0', borderStyle: 'dashed', marginVertical: 24 }} />
                    <View style={{ width: '100%', gap: 16, paddingHorizontal: 8 }}>
                        <PaymentTimelineItem title="Invoice Generated" desc={`Bill ${invoiceId} created`} done={true} time="10:05 AM" />
                        <PaymentTimelineItem title="Payment Initiated" desc="Secure gateway opened" done={true} time="10:07 AM" />
                        <PaymentTimelineItem title="Transaction Complete" desc={`Paid via ${clinicalData.paymentMethod || 'Online'}`} done={true} isLast={true} time="10:08 AM" />
                    </View>
                </View>
            </ScrollView>
        );
    }

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#F8FAFC' }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <TouchableOpacity onPress={onBack} style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 }}><ArrowLeft size={20} color="#0F172A" /></TouchableOpacity>
                <View><Text style={{ fontSize: 20, fontWeight: '700', color: '#0F172A' }}>Checkout</Text><Text style={{ fontSize: 13, color: '#64748B', fontWeight: '500' }}>{appointment.doctorName}</Text></View>
            </View>

            {/* Bill Summary */}
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: '#0F172A' }}>Amount to Pay</Text>
                    <View style={{ backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }}><Text style={{ fontSize: 12, color: '#2563EB', fontWeight: '700' }}>{invoiceId}</Text></View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                    <Text style={{ fontSize: 36, fontWeight: '800', color: '#2563EB' }}>₹{finalTotal.toFixed(2)}</Text>
                    <Text style={{ fontSize: 14, color: '#64748B', fontWeight: '500' }}>incl. taxes</Text>
                </View>
            </View>

            {/* Payment Options */}
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 16, marginLeft: 4 }}>Select Payment Method</Text>
            <View style={{ gap: 12, marginBottom: 32 }}>
                {PAYMENT_METHODS.map((method) => {
                    const isSelected = selectedMethod === method.id;
                    return (
                        <TouchableOpacity 
                            key={method.id} 
                            onPress={() => setSelectedMethod(method.id)}
                            style={{ 
                                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                                backgroundColor: isSelected ? '#F8FAFC' : '#FFFFFF', 
                                borderRadius: 16, padding: 16, 
                                borderWidth: 2, borderColor: isSelected ? '#2563EB' : '#F1F5F9',
                                shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isSelected ? 0.05 : 0, shadowRadius: 4
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: `${method.color}15`, alignItems: 'center', justifyContent: 'center' }}>
                                    <method.icon size={22} color={method.color} />
                                </View>
                                <Text style={{ fontSize: 16, fontWeight: isSelected ? '700' : '600', color: '#0F172A' }}>{method.label}</Text>
                            </View>
                            <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: isSelected ? '#2563EB' : '#CBD5E1', alignItems: 'center', justifyContent: 'center', backgroundColor: isSelected ? '#2563EB' : 'transparent' }}>
                                {isSelected && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#FFFFFF' }} />}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Trust Badges */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 24 }}>
                <ShieldCheck size={16} color="#16A34A" />
                <Text style={{ fontSize: 13, color: '#64748B', fontWeight: '500' }}>100% Secure Encrypted Payment</Text>
            </View>

            {/* Action */}
            <TouchableOpacity onPress={initiatePayment} disabled={loadingOrder} style={{ width: '100%', height: 56, borderRadius: 16, backgroundColor: loadingOrder ? '#94A3B8' : '#0F172A', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }}>
                {loadingOrder ? <ActivityIndicator size="small" color="#FFFFFF" /> : <ShieldCheck size={20} color="#FFFFFF" />}
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16 }}>
                    {loadingOrder ? 'Processing...' : `Pay ₹${finalTotal.toFixed(2)} Securely`}
                </Text>
            </TouchableOpacity>

            <RazorpayCheckout visible={showRazorpay} amount={finalTotal} onClose={handleCancel} onCancel={handleCancel} onSuccess={handleSuccess} />
        </ScrollView>
    );
}
