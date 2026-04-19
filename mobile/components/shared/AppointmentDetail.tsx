import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { 
    ArrowLeft, Calendar, Clock, CheckCircle2, 
    Stethoscope, Pill, FileText, Receipt, CreditCard, Download, 
    MessageSquare, ChevronRight, Activity, ShieldCheck, User,
    Droplets, AlertCircle, HeartPulse, History
} from 'lucide-react-native';
import { Appointment } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { getAppointmentState } from '@/lib/appointment-state';

import ConsultationPage from '@/components/shared/flow/ConsultationPage';
import PrescriptionPage from '@/components/shared/flow/PrescriptionPage';
import ReportsPage from '@/components/shared/flow/ReportsPage';
import BillingPage from '@/components/shared/flow/BillingPage';
import PaymentPage from '@/components/shared/flow/PaymentPage';
import CompletedPage from '@/components/shared/flow/CompletedPage';
import { InitialsAvatar } from '@/components/ui/InitialsAvatar';
import { useEffect } from 'react';


interface AppointmentDetailProps {
    appointment: Appointment;
    onBack: () => void;
    onChat: () => void;
}

const STEPS = [
    { key: 'consultation', label: 'Doctor Consultation', icon: Stethoscope, step: 1, color: '#2563EB' },
    { key: 'prescription', label: 'Generate Prescription', icon: Pill, step: 2, color: '#2563EB' },
    { key: 'reports', label: 'Upload Medical Reports', icon: FileText, step: 3, color: '#2563EB' },
    { key: 'billing', label: 'Generate Invoice', icon: Receipt, step: 4, color: '#2563EB' },
    { key: 'payment', label: 'Payment Status', icon: CreditCard, step: 5, color: '#2563EB' },
    { key: 'completed', label: 'Download Documents', icon: Download, step: 6, color: '#2563EB' },
];

export default function AppointmentDetail({ appointment: initialAppointment, onBack, onChat }: AppointmentDetailProps) {
    const { role } = useAuth();
    const [appointment, setAppointment] = useState<any>(initialAppointment);
    const [activeFlow, setActiveFlow] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [completing, setCompleting] = useState(false);

    const fetchAppointmentDetails = async () => {
        const id = (appointment as any)._id || appointment.id;
        try {
            const res = await api.get(`/appointments/${id}`);
            setAppointment(res.data);
        } catch (error) {
            console.error('Failed to fetch appointment details:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointmentDetails();
    }, []);

    const handleComplete = async () => {
        const id = (appointment as any)._id || appointment.id;
        setCompleting(true);
        try {
             await api.put(`/appointments/${id}`, { status: 'completed' });
             toast({ title: 'Success', description: 'Appointment marked as completed successfully.' });
             onBack(); // Go back after completion
        } catch (error: any) {
             toast({ title: 'Error', description: error.response?.data?.message || 'Failed to complete appointment', variant: 'destructive' });
        } finally {
             setCompleting(false);
        }
    };

    const handleFlowBack = () => {
        setActiveFlow(null);
        fetchAppointmentDetails(); // Refresh when coming back from a sub-page
    };

    // Use default values if clinicalData is missing (new appointments)
    const clinicalData = appointment.clinicalData || {
        currentStep: 0,
        vitals: { bp: '', hr: '', temp: '', weight: '' },
        symptoms: [],
        consultationNotes: '',
        diagnosis: '',
        medicines: [],
        prescriptionNotes: '',
        reportName: '',
        reportType: '',
        reportDate: '',
        labName: '',
        reportRemarks: '',
        billItems: { consultationFee: 500, treatmentCost: 0, labCharges: 0, medicineCost: 0, otherCharges: 0 },
        discount: 0,
        gst: 18,
        paymentDone: false,
        paymentMethod: ''
    };

    if (loading) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' }}>
                <ActivityIndicator size="large" color="#2563EB" />
                <Text style={{ marginTop: 12, color: '#64748B', fontWeight: '500' }}>Loading clinical data...</Text>
            </View>
        );
    }

    if (activeFlow) {
        switch (activeFlow) {
            case 'consultation': return <ConsultationPage appointment={appointment} onBack={handleFlowBack} clinicalData={clinicalData} />;
            case 'prescription': return <PrescriptionPage appointment={appointment} onBack={handleFlowBack} clinicalData={clinicalData} />;
            case 'reports': return <ReportsPage appointment={appointment} onBack={handleFlowBack} clinicalData={clinicalData} />;
            case 'billing': return <BillingPage appointment={appointment} onBack={handleFlowBack} clinicalData={clinicalData} />;
            case 'payment': return <PaymentPage appointment={appointment} onBack={handleFlowBack} clinicalData={clinicalData} />;
            case 'completed': return <CompletedPage appointment={appointment} onBack={handleFlowBack} clinicalData={clinicalData} />;
        }
    }

    const { currentStep } = clinicalData;
    const progressText = `Visit Progress: ${currentStep} / 6 Completed`;
    const progressPercent = (currentStep / 6) * 100;

    // Use mock values for demonstration
    const age = '34';
    const gender = 'Male';
    const patientId = `P-${String((appointment as any)._id || appointment.id).slice(-4).toUpperCase()}`;
    const bloodGroup = 'O+';
    const allergies = 'Penicillin';
    const chronicCondition = 'None';
    const lastVisit = 'Jul 12, 2025';

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            {/* Header */}
            <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                paddingHorizontal: 20, 
                paddingVertical: 16,
                backgroundColor: '#FFFFFF',
                borderBottomWidth: 1,
                borderBottomColor: '#F1F5F9'
            }}>
                <TouchableOpacity onPress={onBack} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' }}>
                    <ArrowLeft size={20} color="#334155" />
                </TouchableOpacity>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#0F172A' }}>Visit Summary</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView 
                style={{ flex: 1 }} 
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }} 
                showsVerticalScrollIndicator={false}
            >
                {/* Modern Patient/Doctor Card */}
                <View style={{ 
                    backgroundColor: '#FFFFFF', 
                    borderRadius: 16, 
                    padding: 20, 
                    marginBottom: 20,
                    shadowColor: '#64748B',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.05,
                    shadowRadius: 10,
                    elevation: 2,
                    borderWidth: 1,
                    borderColor: '#F1F5F9'
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 16 }}>
                        <InitialsAvatar
                            name={role === 'doctor' ? (appointment.patientName || '') : (appointment.doctorName || '')}
                            size={64}
                            radius={20}
                        />
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 20, fontWeight: '700', color: '#0F172A' }}>
                                {role === 'doctor' ? appointment.patientName : appointment.doctorName}
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                <ShieldCheck size={14} color="#2563EB" />
                                <Text style={{ fontSize: 13, color: '#64748B', fontWeight: '500' }}>{appointment.specialization || 'Clinical Visit'}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
                                <Text style={{ fontSize: 12, color: '#94A3B8', fontWeight: '500' }}>Patient ID: {patientId}</Text>
                                <Text style={{ fontSize: 12, color: '#94A3B8' }}>•</Text>
                                <Text style={{ fontSize: 12, color: '#94A3B8', fontWeight: '500' }}>{age} yrs, {gender}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Quick Actions */}
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 16 }}>
                        <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 22, backgroundColor: '#F8FAFC' }}>
                            <User size={20} color="#64748B" />
                        </TouchableOpacity>
                        <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 22, backgroundColor: '#F8FAFC' }}>
                            <History size={20} color="#64748B" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onChat} style={{ alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 22, backgroundColor: '#EFF6FF' }}>
                            <MessageSquare size={20} color="#2563EB" fill="#EFF6FF" />
                        </TouchableOpacity>
                    </View>

                    {/* Appointment Details */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Calendar size={16} color="#2563EB" />
                            <Text style={{ fontSize: 13, color: '#334155', fontWeight: '600' }}>{appointment.date}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Clock size={16} color="#2563EB" />
                            <Text style={{ fontSize: 13, color: '#334155', fontWeight: '600' }}>{appointment.time}</Text>
                        </View>

                </View>

                {/* Patient Quick Stats Grid */}
                {role === 'doctor' && (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
                        <View style={{ flex: 1, minWidth: '45%', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <Calendar size={14} color="#64748B" />
                                <Text style={{ fontSize: 12, color: '#64748B', fontWeight: '600' }}>Last Visit</Text>
                            </View>
                            <Text style={{ fontSize: 14, color: '#0F172A', fontWeight: '700' }}>{lastVisit}</Text>
                        </View>
                        <View style={{ flex: 1, minWidth: '45%', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <Droplets size={14} color="#EF4444" />
                                <Text style={{ fontSize: 12, color: '#64748B', fontWeight: '600' }}>Blood Group</Text>
                            </View>
                            <Text style={{ fontSize: 14, color: '#0F172A', fontWeight: '700' }}>{bloodGroup}</Text>
                        </View>
                        <View style={{ flex: 1, minWidth: '45%', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <AlertCircle size={14} color="#F59E0B" />
                                <Text style={{ fontSize: 12, color: '#64748B', fontWeight: '600' }}>Allergies</Text>
                            </View>
                            <Text style={{ fontSize: 14, color: '#0F172A', fontWeight: '700' }}>{allergies}</Text>
                        </View>
                        <View style={{ flex: 1, minWidth: '45%', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <HeartPulse size={14} color="#8B5CF6" />
                                <Text style={{ fontSize: 12, color: '#64748B', fontWeight: '600' }}>Conditions</Text>
                            </View>
                            <Text style={{ fontSize: 14, color: '#0F172A', fontWeight: '700' }}>{chronicCondition}</Text>
                        </View>
                    </View>
                )}

                {/* Treatment Timeline Section */}
                <View style={{ 
                    backgroundColor: '#FFFFFF', 
                    borderRadius: 16, 
                    padding: 20, 
                    borderWidth: 1, 
                    borderColor: '#F1F5F9',
                    marginBottom: 24,
                    shadowColor: '#64748B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Activity size={20} color="#2563EB" />
                            <Text style={{ fontSize: 18, fontWeight: '700', color: '#0F172A' }}>Treatment Workflow</Text>
                        </View>
                    </View>

                    {/* Progress Bar */}
                    <View style={{ marginBottom: 24 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                            <Text style={{ fontSize: 13, color: '#64748B', fontWeight: '600' }}>{progressText}</Text>
                            <Text style={{ fontSize: 13, color: '#2563EB', fontWeight: '700' }}>{Math.round(progressPercent)}%</Text>
                        </View>
                        <View style={{ height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' }}>
                            <View style={{ height: '100%', width: `${progressPercent}%`, backgroundColor: '#16A34A', borderRadius: 3 }} />
                        </View>
                    </View>

                    {STEPS.map((step, index) => {
                        const isDone = currentStep >= step.step;
                        const isNext = currentStep === step.step - 1;
                        const isLast = index === STEPS.length - 1;

                        const getStatusColor = () => {
                            if (isDone) return '#16A34A'; // Green for Completed
                            if (isNext) return '#2563EB'; // Blue for Active
                            return '#94A3B8'; // Gray for Pending
                        };

                        const getStatusText = () => {
                            if (isDone) return 'Completed';
                            if (isNext) return 'Active';
                            return 'Pending';
                        };
                        
                        const statusColor = getStatusColor();

                        return (
                            <View key={step.key} style={{ flexDirection: 'row', opacity: (!isDone && !isNext) ? 0.6 : 1 }}>
                                {/* Timeline Infrastructure */}
                                <View style={{ alignItems: 'center', width: 28, marginRight: 16 }}>
                                    <View style={{ 
                                        width: 28, 
                                        height: 28, 
                                        borderRadius: 14, 
                                        backgroundColor: isDone ? '#DCFCE7' : isNext ? '#EFF6FF' : '#F8FAFC',
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        borderWidth: 1,
                                        borderColor: isDone ? '#16A34A' : isNext ? '#2563EB' : '#E2E8F0',
                                        zIndex: 1
                                    }}>
                                        {isDone ? <CheckCircle2 size={16} color="#16A34A" /> : <step.icon size={14} color={statusColor} />}
                                    </View>
                                    {!isLast && (
                                        <View style={{ 
                                            flex: 1, 
                                            width: 2, 
                                            backgroundColor: isDone ? '#16A34A' : '#E2E8F0',
                                            marginVertical: 4
                                        }} />
                                    )}
                                </View>

                                {/* Event Item */}
                                <TouchableOpacity 
                                    onPress={() => setActiveFlow(step.key)}
                                    activeOpacity={0.7}
                                    style={{ flex: 1, marginBottom: 24, justifyContent: 'center' }}
                                >
                                    <View style={{ 
                                        padding: 16,
                                        borderRadius: 12,
                                        backgroundColor: isNext ? '#FFFFFF' : '#F8FAFC',
                                        borderWidth: 1,
                                        borderColor: isNext ? '#2563EB' : isDone ? '#DCFCE7' : '#F1F5F9',
                                        shadowColor: isNext ? '#2563EB' : '#000',
                                        shadowOffset: { width: 0, height: isNext ? 4 : 2 },
                                        shadowOpacity: isNext ? 0.1 : 0.02,
                                        shadowRadius: isNext ? 8 : 4,
                                        elevation: isNext ? 3 : 1,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}>
                                        <View>
                                            <Text style={{ fontSize: 16, fontWeight: '700', color: isNext ? '#0F172A' : '#334155' }}>
                                                {step.label}
                                            </Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: statusColor }} />
                                                <Text style={{ fontSize: 12, color: statusColor, fontWeight: '600', textTransform: 'uppercase' }}>
                                                    {getStatusText()}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: isNext ? '#EFF6FF' : '#FFF', alignItems: 'center', justifyContent: 'center' }}>
                                            <ChevronRight size={18} color={isNext ? '#2563EB' : '#94A3B8'} />
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        );
                    })}
                </View>

                {/* Final Completion Button for Doctors - Only shown when workflow is complete */}
                {role === 'doctor' && appointment.status !== 'completed' && (
                    <TouchableOpacity
                        onPress={handleComplete}
                        disabled={completing}
                        style={{
                            marginTop: 32,
                            height: 56,
                            borderRadius: 12,
                            backgroundColor: '#16A34A',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 10,
                            shadowColor: '#16A34A',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.2,
                            shadowRadius: 8,
                            elevation: 4
                        }}
                    >
                        {completing ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <>
                                <CheckCircle2 size={20} color="#FFFFFF" />
                                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16 }}>Complete Appointment</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
