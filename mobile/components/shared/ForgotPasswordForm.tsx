import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ActivityIndicator, Alert } from 'react-native';
import { Mail, Lock, X, CheckCircle, ScanLine } from 'lucide-react-native';
import api from '@/lib/api';

interface ForgotPasswordFormProps {
    visible: boolean;
    onClose: () => void;
}

export default function ForgotPasswordForm({ visible, onClose }: ForgotPasswordFormProps) {
    const [email, setEmail] = useState('');
    const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Email, 2: OTP/NewPass, 3: Success
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleReset = async () => {
        if (step === 1) {
            if (!email) {
                Alert.alert('Missing email', 'Please enter your email to reset your password.');
                return;
            }
            setIsLoading(true);
            try {
                await api.post('/auth/forgot-password', { email: email.trim() });
                setStep(2);
            } catch (error: any) {
                const msg = error?.response?.data?.message || 'Failed to send reset code. Please try again.';
                Alert.alert('Error', msg);
            } finally {
                setIsLoading(false);
            }
        } else if (step === 2) {
            if (!otp || otp.length !== 6 || !newPassword) {
                Alert.alert('Incomplete Fields', 'Please enter the 6-digit OTP and your new password.');
                return;
            }
            setIsLoading(true);
            try {
                await api.post('/auth/reset-password', { 
                    email: email.trim(), 
                    otp: otp, 
                    newPassword: newPassword 
                });
                setStep(3);
                setTimeout(() => { 
                    handleClose();
                }, 3000);
            } catch (error: any) {
                const msg = error?.response?.data?.message || 'Invalid or expired OTP. Please try again.';
                Alert.alert('Error', msg);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleClose = () => {
        setStep(1);
        setEmail('');
        setOtp('');
        setNewPassword('');
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 }}>
                <View style={{ backgroundColor: '#fff', borderRadius: 24, padding: 24 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <Text style={{ fontSize: 20, fontWeight: '700', color: '#0f172a' }}>
                            {step === 1 ? 'Forgot Password' : step === 2 ? 'Set New Password' : 'Success!'}
                        </Text>
                        <TouchableOpacity onPress={handleClose}><X size={20} color="#94a3b8" /></TouchableOpacity>
                    </View>

                    {step === 3 ? (
                        <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                                <CheckCircle size={32} color="#16a34a" />
                            </View>
                            <Text style={{ fontSize: 16, fontWeight: '600', color: '#0f172a', marginBottom: 8 }}>Password Reset!</Text>
                            <Text style={{ fontSize: 14, color: '#64748b', textAlign: 'center' }}>Your password has been updated successfully. You can now login.</Text>
                        </View>
                    ) : step === 2 ? (
                        <>
                            <Text style={{ fontSize: 14, color: '#64748b', marginBottom: 16 }}>Enter the 6-digit OTP sent to your email and choose a new password.</Text>
                            
                            <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, backgroundColor: '#f8fafc', paddingHorizontal: 14, marginBottom: 12 }}>
                                <ScanLine size={16} color="#94a3b8" />
                                <TextInput value={otp} onChangeText={setOtp} placeholder="6-digit OTP" placeholderTextColor="#94a3b8" keyboardType="number-pad" maxLength={6} style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 10, color: '#0f172a', fontSize: 14 }} />
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, backgroundColor: '#f8fafc', paddingHorizontal: 14, marginBottom: 20 }}>
                                <Lock size={16} color="#94a3b8" />
                                <TextInput value={newPassword} onChangeText={setNewPassword} placeholder="New Password" placeholderTextColor="#94a3b8" secureTextEntry style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 10, color: '#0f172a', fontSize: 14 }} />
                            </View>

                            <TouchableOpacity onPress={handleReset} activeOpacity={0.7} disabled={isLoading} style={{ backgroundColor: '#0284c7', paddingVertical: 16, borderRadius: 14, alignItems: 'center' }}>
                                {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Reset Password</Text>}
                            </TouchableOpacity>
                            
                            <TouchableOpacity onPress={() => setStep(1)} style={{ marginTop: 12, alignItems: 'center' }}>
                                <Text style={{ fontSize: 13, color: '#94a3b8', textDecorationLine: 'underline' }}>Back to email</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <Text style={{ fontSize: 14, color: '#64748b', marginBottom: 16 }}>Enter your email and we'll send you a 6-digit verification code.</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, backgroundColor: '#f8fafc', paddingHorizontal: 14, marginBottom: 16 }}>
                                <Mail size={16} color="#94a3b8" />
                                <TextInput value={email} onChangeText={setEmail} placeholder="your@email.com" placeholderTextColor="#94a3b8" autoCapitalize="none" keyboardType="email-address" style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 10, color: '#0f172a', fontSize: 14 }} />
                            </View>
                            <TouchableOpacity onPress={handleReset} activeOpacity={0.7} disabled={isLoading} style={{ backgroundColor: '#0284c7', paddingVertical: 16, borderRadius: 14, alignItems: 'center' }}>
                                {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Send Code</Text>}
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
}
