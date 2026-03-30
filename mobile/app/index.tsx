import React, { useState, useRef, useEffect } from 'react';
import { View, SafeAreaView, StatusBar, Platform, Animated } from 'react-native';
import { colors } from '@/lib/theme';
import { useAuth } from '@/contexts/AuthContext';
import { Conversation } from '@/lib/chat-data';
import { Doctor, Appointment } from '@/lib/mock-data';
import api from '@/lib/api';

// Login
import LoginPage from '@/components/LoginPage';

// Patient components
import PatientHome from '@/components/patient/PatientHome';
import FindDoctor from '@/components/patient/FindDoctor';
import DoctorDetail from '@/components/patient/DoctorDetail';
import PatientProfile from '@/components/patient/PatientProfile';
import AIAssistant from '@/components/patient/AIAssistant';
import PharmacyStore from '@/components/patient/PharmacyStore';

// Doctor components
import DoctorHome from '@/components/doctor/DoctorHome';
import PatientsList from '@/components/doctor/PatientsList';
import AnalyticsScreen from '@/components/doctor/AnalyticsScreen';
import DoctorProfile from '@/components/doctor/DoctorProfile';
import PatientDetail from '@/components/doctor/PatientDetail';

// Shared components
import AppointmentsList from '@/components/shared/AppointmentsList';
import AppointmentDetail from '@/components/shared/AppointmentDetail';
import PrescriptionsList from '@/components/shared/PrescriptionsList';
import ReportsList from '@/components/shared/ReportsList';
import BillingList from '@/components/shared/BillingList';
import ChatList from '@/components/shared/ChatList';
import ChatConversation from '@/components/shared/ChatConversation';
import SettingsScreen from '@/components/shared/SettingsScreen';
import VideoCall from '@/components/shared/VideoCall';
import BottomNav from '@/components/BottomNav';

export default function Index() {
    const { isLoggedIn, role, userName } = useAuth();
    const [activeTab, setActiveTab] = useState('home');
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [showAI, setShowAI] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [showSettings, setShowSettings] = useState(false);
    const [showVideoCall, setShowVideoCall] = useState(false);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;

    const animateTransition = (callback: () => void) => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 8, duration: 120, useNativeDriver: true }),
        ]).start(() => {
            callback();
            slideAnim.setValue(-8);
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
            ]).start();
        });
    };

    if (!isLoggedIn) {
        return <LoginPage />;
    }

    if (showSettings) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
                <SafeAreaView style={{ flex: 1 }}>
                    <SettingsScreen onBack={() => setShowSettings(false)} />
                </SafeAreaView>
            </View>
        );
    }

    if (showVideoCall) {
        return <VideoCall onEndCall={() => setShowVideoCall(false)} patientName={role === 'doctor' ? selectedAppointment?.patientName : userName} doctorName={selectedAppointment?.doctorName} isDoctor={role === 'doctor'} />;
    }

    const handleTabChange = (tab: string, data?: any) => {
        if (tab === 'settings') { setShowSettings(true); return; }
        animateTransition(() => {
            if (tab !== 'messages') { setActiveConversation(null); setShowAI(false); }
            if (tab !== 'find-doctor') setSelectedDoctor(null);
            if (tab !== 'patient-detail') setSelectedPatient(null);
            if (tab !== 'appointments') setSelectedAppointment(null);
            
            if (tab === 'patient-detail' && data?.patient) {
                setSelectedPatient(data.patient);
            }
            
            if (tab === 'messages' && (data?.patient || data?.doctor)) {
                const target = data.patient || data.doctor;
                const roleType = data.doctor ? 'doctor' : 'patient';
                const id = target._id || target.id;
                setActiveConversation({ 
                    id: 'new-' + Date.now(), 
                    participantName: target.fullName || target.name || 'Unknown', 
                    participantAvatar: target.avatar || '', 
                    lastMessage: '', 
                    lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
                    unreadCount: 0, 
                    online: true,
                    participantRole: roleType,
                    participantId: id
                } as any);
            }
            setActiveTab(tab);
        });
    };

    const renderChatScreen = () => {
        if (showAI) return <AIAssistant onBack={() => setShowAI(false)} />;
        if (activeConversation) {
            return (
                <ChatConversation
                    conversation={activeConversation}
                    onBack={() => setActiveConversation(null)}
                    onViewProfile={async () => {
                        if (activeConversation.participantRole === 'doctor') {
                            try {
                                const res = await api.get('/doctors');
                                const doctor = res.data.find((d: any) => d.name === activeConversation.participantName);
                                if (doctor) {
                                    setSelectedDoctor(doctor);
                                    setActiveTab('find-doctor');
                                }
                            } catch (e) {
                                console.error(e);
                            }
                        }
                    }}
                />
            );
        }
        return <ChatList onSelectConversation={setActiveConversation} onOpenAI={role === 'patient' ? () => setShowAI(true) : undefined} />;
    };

    const renderFindDoctor = () => {
        if (selectedDoctor) {
            return <DoctorDetail doctor={selectedDoctor} onBack={() => setSelectedDoctor(null)} onBook={() => { setSelectedDoctor(null); setActiveTab('appointments'); }} onNavigate={handleTabChange} />;
        }
        return <FindDoctor onSelectDoctor={setSelectedDoctor} />;
    };

    const renderAppointments = () => {
        if (selectedAppointment) {
            return <AppointmentDetail appointment={selectedAppointment} onBack={() => setSelectedAppointment(null)} onChat={() => { setSelectedAppointment(null); setActiveTab('messages'); }} onVideoCall={() => setShowVideoCall(true)} />;
        }
        return <AppointmentsList onSelectAppointment={setSelectedAppointment} />;
    };

    const renderPatientScreen = () => {
        switch (activeTab) {
            case 'home': return <PatientHome onNavigate={handleTabChange} />;
            case 'find-doctor': return renderFindDoctor();
            case 'appointments': return renderAppointments();
            case 'prescriptions': return <PrescriptionsList />;
            case 'reports': return <ReportsList />;
            case 'billing': return <BillingList />;
            case 'pharmacy': return <PharmacyStore onBack={() => setActiveTab('home')} />;
            case 'messages': return renderChatScreen();
            case 'profile': return <PatientProfile onNavigate={handleTabChange} />;
            default: return <PatientHome onNavigate={handleTabChange} />;
        }
    };

    const renderDoctorScreen = () => {
        switch (activeTab) {
            case 'home': return <DoctorHome onNavigate={handleTabChange} />;
            case 'patients': return <PatientsList onNavigate={handleTabChange} />;
            case 'patient-detail': 
                if (selectedPatient) return <PatientDetail patient={selectedPatient} onBack={() => setActiveTab('patients')} onNavigate={handleTabChange} />;
                return <PatientsList onNavigate={handleTabChange} />;
            case 'appointments': return renderAppointments();
            case 'prescriptions': return <PrescriptionsList />;
            case 'reports': return <ReportsList />;
            case 'billing': return <BillingList />;
            case 'messages': return renderChatScreen();
            case 'analytics': return <AnalyticsScreen />;
            case 'profile': return <DoctorProfile onNavigate={handleTabChange} />;
            default: return <DoctorHome onNavigate={handleTabChange} />;
        }
    };

    const hideBottomNav = showAI || activeConversation !== null || activeTab === 'pharmacy';

    return (
        <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
            <View style={{ flex: 1, width: '100%' }}>
                <SafeAreaView style={{ flex: 1 }}>
                    <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                        {role === 'doctor' ? renderDoctorScreen() : renderPatientScreen()}
                    </Animated.View>
                </SafeAreaView>
                {!hideBottomNav && <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />}
            </View>
        </View>
    );
}
