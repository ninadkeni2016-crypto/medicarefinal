import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, ActivityIndicator, Image } from 'react-native';
import { Calendar, FileText, Pill, Bell, ChevronRight, CreditCard, CheckCircle, X, Clock, ShoppingBag } from 'lucide-react-native';
import { mockAppointments, mockDoctors } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import RazorpayCheckout from '../shared/RazorpayCheckout';

interface PatientHomeProps { onNavigate: (tab: string) => void; }

export default function PatientHome({ onNavigate }: PatientHomeProps) {
    const { userName, patientProfile } = useAuth();
    const nextAppointment = mockAppointments.find(a => a.status === 'upcoming');
    const [showPayment, setShowPayment] = useState(false);
    const [paymentDone, setPaymentDone] = useState(false);

    const handleSuccess = () => {
        setPaymentDone(true);
        setShowPayment(false);
    };

    const handleCancel = () => {
        setShowPayment(false);
        toast({ title: 'Payment cancelled', description: 'You can pay anytime from the billing section.' });
    };

    const quickActions = [
        { icon: Calendar, label: 'Book', iconColor: '#0ea5e9', bg: '#f0fdfa', tab: 'find-doctor' },
        { icon: Pill, label: 'Rx', iconColor: '#16a34a', bg: '#dcfce7', tab: 'prescriptions' },
        { icon: ShoppingBag, label: 'Store', iconColor: '#9333ea', bg: '#f3e8ff', tab: 'pharmacy' },
        { icon: CreditCard, label: 'Billing', iconColor: '#dc2626', bg: '#fef2f2', tab: 'billing' },
    ];

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Image source={require('../../assets/images/logo.png')} style={{ width: 56, height: 56 }} resizeMode="contain" />
                    <View>
                        <Text style={{ fontSize: 14, color: '#64748b' }}>Good morning 👋</Text>
                        <Text style={{ fontSize: 22, fontWeight: '700', color: '#0284c7' }}>{userName}</Text>
                    </View>
                </View>
                <TouchableOpacity activeOpacity={0.7} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                    <Bell size={20} color="#0284c7" />
                    <View style={{ position: 'absolute', top: -2, right: -2, width: 10, height: 10, borderRadius: 5, backgroundColor: '#ef4444', borderWidth: 2, borderColor: '#fff' }} />
                </TouchableOpacity>
            </View>

            {nextAppointment && (
                <TouchableOpacity onPress={() => onNavigate('appointments')} activeOpacity={0.7} style={{ backgroundColor: '#0284c7', borderRadius: 16, padding: 20, marginBottom: 20 }}>
                    <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>Next Appointment</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <Image source={{ uri: nextAppointment.avatar }} style={{ width: 40, height: 40, borderRadius: 10, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' }} />
                        <View>
                            <Text style={{ fontWeight: '700', fontSize: 18, color: '#fff' }}>{nextAppointment.doctorName}</Text>
                            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>{nextAppointment.specialization}</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><Calendar size={14} color="#fff" /><Text style={{ fontSize: 14, color: '#fff' }}>{nextAppointment.date}</Text></View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><Clock size={14} color="#fff" /><Text style={{ fontSize: 14, color: '#fff' }}>{nextAppointment.time}</Text></View>
                    </View>
                    <View style={{ alignSelf: 'flex-start', marginTop: 12, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)' }}>
                        <Text style={{ fontSize: 12, color: '#fff', fontWeight: '500' }}>{nextAppointment.type}</Text>
                    </View>
                </TouchableOpacity>
            )}

            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
                {quickActions.map(({ icon: Icon, label, iconColor, bg, tab }) => (
                    <TouchableOpacity key={label} onPress={() => onNavigate(tab)} activeOpacity={0.7} style={{ flex: 1, alignItems: 'center', gap: 8, padding: 14, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9' }}>
                        <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
                            <Icon size={20} color={iconColor} />
                        </View>
                        <Text style={{ fontSize: 12, fontWeight: '600', color: '#0284c7' }}>{label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {!paymentDone && (
                <TouchableOpacity onPress={() => setShowPayment(true)} activeOpacity={0.7} style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f1f5f9', flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center' }}>
                        <CreditCard size={24} color="#dc2626" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: '600', fontSize: 14, color: '#0284c7' }}>Pending Payments</Text>
                        <Text style={{ fontSize: 12, color: '#64748b' }}>2 bills awaiting payment</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontWeight: '700', fontSize: 16, color: '#dc2626' }}>₹2,800</Text>
                        <Text style={{ fontSize: 10, fontWeight: '500', color: '#0284c7' }}>Pay Now →</Text>
                    </View>
                </TouchableOpacity>
            )}

            <View style={{ marginBottom: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#0284c7' }}>Top Doctors</Text>
                    <TouchableOpacity onPress={() => onNavigate('find-doctor')} activeOpacity={0.7} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 14, fontWeight: '500', color: '#0284c7' }}>See all</Text>
                        <ChevronRight size={16} color="#0284c7" />
                    </TouchableOpacity>
                </View>
                {mockDoctors.slice(0, 3).map((doc) => (
                    <TouchableOpacity key={doc.id} onPress={() => onNavigate('find-doctor')} activeOpacity={0.7} style={{ backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#f1f5f9', flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <Image source={{ uri: doc.avatar }} style={{ width: 48, height: 48, borderRadius: 12 }} />
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontWeight: '600', fontSize: 14, color: '#0284c7' }} numberOfLines={1}>{doc.name}</Text>
                            <Text style={{ fontSize: 12, color: '#64748b' }}>{doc.specialization}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={{ fontSize: 14, fontWeight: '600', color: '#0284c7' }}>⭐ {doc.rating}</Text>
                            <Text style={{ fontSize: 12, color: '#64748b' }}>{doc.distance}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#0284c7', marginBottom: 12 }}>Health Summary</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    {[
                        { label: 'Heart Rate', value: patientProfile.vitals?.heartRate || '72 bpm', icon: '❤️', trend: 'Normal' },
                        { label: 'Blood Pressure', value: patientProfile.vitals?.bloodPressure || '120/80', icon: '🩺', trend: 'Normal' },
                        { label: 'Blood Sugar', value: patientProfile.vitals?.bloodSugar || '95 mg/dL', icon: '🩸', trend: 'Normal' },
                        { label: 'Weight', value: patientProfile.vitals?.weight || '72 kg', icon: '⚖️', trend: 'Stable' },
                    ].map(({ label, value, icon, trend }) => (
                        <View key={label} style={{ width: '48%', backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 8 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <Text style={{ fontSize: 18 }}>{icon}</Text>
                                <Text style={{ fontSize: 12, color: '#64748b' }}>{label}</Text>
                            </View>
                            <Text style={{ fontSize: 18, fontWeight: '700', color: '#0284c7' }}>{value}</Text>
                            <Text style={{ fontSize: 12, color: '#16a34a', fontWeight: '500', marginTop: 4 }}>{trend}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <RazorpayCheckout visible={showPayment} amount={2800} onClose={handleCancel} onCancel={handleCancel} onSuccess={handleSuccess} />
        </ScrollView>
    );
}
