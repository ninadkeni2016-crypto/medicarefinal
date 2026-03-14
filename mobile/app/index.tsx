import React, { useState } from 'react';
import { View, SafeAreaView, StatusBar, Platform } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Conversation } from '@/lib/chat-data';
import { Doctor, Appointment, mockDoctors } from '@/lib/mock-data';

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
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [showSettings, setShowSettings] = useState(false);
    const [showVideoCall, setShowVideoCall] = useState(false);

    if (!isLoggedIn) {
        return <LoginPage />;
    }

    if (showSettings) {
        return (
            <View style={{ flex: 1, backgroundColor: '#f8fafc', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
                <SafeAreaView style={{ flex: 1 }}>
                    <SettingsScreen onBack={() => setShowSettings(false)} />
                </SafeAreaView>
            </View>
        );
    }

    if (showVideoCall) {
        return <VideoCall onEndCall={() => setShowVideoCall(false)} patientName={role === 'doctor' ? selectedAppointment?.patientName : userName} doctorName={selectedAppointment?.doctorName} isDoctor={role === 'doctor'} />;
    }

    const handleTabChange = (tab: string) => {
        if (tab === 'settings') { setShowSettings(true); return; }
        if (tab !== 'messages') { setActiveConversation(null); setShowAI(false); }
        if (tab !== 'find-doctor') setSelectedDoctor(null);
        if (tab !== 'appointments') setSelectedAppointment(null);
        setActiveTab(tab);
    };

    const renderChatScreen = () => {
        if (showAI) return <AIAssistant onBack={() => setShowAI(false)} />;
        if (activeConversation) {
            return (
                <ChatConversation
                    conversation={activeConversation}
                    onBack={() => setActiveConversation(null)}
                    onViewProfile={() => {
                        if (activeConversation.participantRole === 'doctor') {
                            const doctor = mockDoctors.find(d => d.name === activeConversation.participantName);
                            if (doctor) {
                                setSelectedDoctor(doctor);
                                setActiveTab('find-doctor');
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
            return <DoctorDetail doctor={selectedDoctor} onBack={() => setSelectedDoctor(null)} onBook={() => { setSelectedDoctor(null); setActiveTab('appointments'); }} />;
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
            case 'patients': return <PatientsList />;
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
        <View style={{ flex: 1, backgroundColor: '#e2e8f0', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ flex: 1, width: '100%', maxWidth: 480, alignSelf: 'center', backgroundColor: '#f8fafc', overflow: 'hidden', ...(Platform.OS === 'web' ? { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#cbd5e1' } : {}) }}>
                <SafeAreaView style={{ flex: 1 }}>
                    {role === 'doctor' ? renderDoctorScreen() : renderPatientScreen()}
                </SafeAreaView>
                {!hideBottomNav && <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />}
            </View>
        </View>
    );
}
