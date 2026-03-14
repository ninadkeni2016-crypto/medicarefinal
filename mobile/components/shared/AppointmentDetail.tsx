import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { ArrowLeft, Calendar, Clock, Video, MapPin, CheckCircle, Stethoscope, Pill, FileText, Receipt, CreditCard, Download, MessageSquare, ChevronRight } from 'lucide-react-native';
import { Appointment } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { getAppointmentState } from '@/lib/appointment-state';

import ConsultationPage from '@/components/shared/flow/ConsultationPage';
import PrescriptionPage from '@/components/shared/flow/PrescriptionPage';
import ReportsPage from '@/components/shared/flow/ReportsPage';
import BillingPage from '@/components/shared/flow/BillingPage';
import PaymentPage from '@/components/shared/flow/PaymentPage';
import CompletedPage from '@/components/shared/flow/CompletedPage';

interface AppointmentDetailProps {
    appointment: Appointment;
    onBack: () => void;
    onChat: () => void;
    onVideoCall?: () => void;
}

const STEPS = [
    { key: 'consultation', label: 'Doctor Consultation', icon: Stethoscope, step: 1 },
    { key: 'prescription', label: 'Prescription', icon: Pill, step: 2 },
    { key: 'reports', label: 'Reports', icon: FileText, step: 3 },
    { key: 'billing', label: 'Billing', icon: Receipt, step: 4 },
    { key: 'payment', label: 'Payment', icon: CreditCard, step: 5 },
    { key: 'completed', label: 'Downloads', icon: Download, step: 6 },
];

export default function AppointmentDetail({ appointment, onBack, onChat, onVideoCall }: AppointmentDetailProps) {
    const { role } = useAuth();
    const [activeFlow, setActiveFlow] = useState<string | null>(null);
    const [, forceUpdate] = useState(0);
    const state = getAppointmentState(appointment.id);

    const handleFlowBack = () => {
        setActiveFlow(null);
        forceUpdate(n => n + 1);
    };

    if (activeFlow) {
        switch (activeFlow) {
            case 'consultation': return <ConsultationPage appointment={appointment} onBack={handleFlowBack} />;
            case 'prescription': return <PrescriptionPage appointment={appointment} onBack={handleFlowBack} />;
            case 'reports': return <ReportsPage appointment={appointment} onBack={handleFlowBack} />;
            case 'billing': return <BillingPage appointment={appointment} onBack={handleFlowBack} />;
            case 'payment': return <PaymentPage appointment={appointment} onBack={handleFlowBack} />;
            case 'completed': return <CompletedPage appointment={appointment} onBack={handleFlowBack} />;
        }
    }

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                    <ArrowLeft size={20} color="#334155" />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#0284c7' }}>Appointment Details</Text>
                    <Text style={{ fontSize: 12, color: '#64748b' }}>Track your appointment journey</Text>
                </View>
            </View>

            {/* Appointment Info Card */}
            <View style={{ backgroundColor: '#0ea5e9', borderRadius: 16, padding: 20, marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <Image source={{ uri: appointment.avatar }} style={{ width: 56, height: 56, borderRadius: 12, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' }} />
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: '700', fontSize: 18, color: '#fff' }}>
                            {role === 'doctor' ? appointment.patientName : appointment.doctorName}
                        </Text>
                        <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>{appointment.specialization}</Text>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 16, marginBottom: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><Calendar size={16} color="#fff" /><Text style={{ fontSize: 14, color: '#fff' }}>{appointment.date}</Text></View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><Clock size={16} color="#fff" /><Text style={{ fontSize: 14, color: '#fff' }}>{appointment.time}</Text></View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>{appointment.type === 'Video Call' ? <Video size={16} color="#fff" /> : <MapPin size={16} color="#fff" />}<Text style={{ fontSize: 14, color: '#fff' }}>{appointment.type}</Text></View>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    {appointment.type === 'Video Call' && state.currentStep < 2 && (
                        <TouchableOpacity onPress={onVideoCall} activeOpacity={0.7} style={{ flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            <Video size={16} color="#fff" /><Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Join Call</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={onChat} activeOpacity={0.7} style={{ flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <MessageSquare size={16} color="#fff" /><Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Chat</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <Text style={{ fontSize: 14, fontWeight: '700', color: '#0284c7', marginBottom: 12 }}>Appointment Journey</Text>
            {STEPS.map((step) => {
                const StepIcon = step.icon;
                const isDone = state.currentStep >= step.step;
                const isNext = state.currentStep === step.step - 1;
                const isLocked = false;
                const canNavigate = true;

                let statusText = '';
                if (isDone) statusText = 'Completed';
                else if (role === 'doctor' && step.key === 'payment' && isNext) statusText = 'Waiting for patient';
                else if (isNext && role === 'doctor') statusText = 'Action required';
                else if (isNext && role === 'patient' && step.key === 'payment') statusText = 'Pay now';
                else statusText = 'Pending';

                return (
                    <TouchableOpacity key={step.key} onPress={() => canNavigate && setActiveFlow(step.key)} disabled={!canNavigate} activeOpacity={0.7} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, marginBottom: 8, backgroundColor: canNavigate ? '#fff' : '#f8fafc', borderWidth: 1, borderColor: canNavigate ? '#f1f5f9' : '#f8fafc', opacity: isLocked ? 0.5 : 1 }}>
                        <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: isDone ? '#16a34a' : isNext ? '#0ea5e9' : '#e2e8f0' }}>
                            {isDone ? <CheckCircle size={16} color="#fff" /> : <StepIcon size={16} color={isNext ? '#fff' : '#64748b'} />}
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 14, fontWeight: '600', color: isDone ? '#16a34a' : isNext ? '#0284c7' : '#94a3b8' }}>{step.label}</Text>
                            <Text style={{ fontSize: 10, color: '#64748b' }}>{statusText}</Text>
                        </View>
                        {canNavigate && <ChevronRight size={16} color="#64748b" />}
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
}
