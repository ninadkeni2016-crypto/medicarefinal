import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Animated, KeyboardAvoidingView, Platform, Dimensions, ActivityIndicator, Modal, Alert } from 'react-native';
import { Stethoscope, User, ArrowRight, Shield, Eye, EyeOff, Smartphone, Mail, Lock, X, CheckCircle, Video, Pill, FileText, MessageSquare, ScanLine } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { UserRole } from '@/lib/mock-data';

import ForgotPasswordForm from './shared/ForgotPasswordForm';

const { width } = Dimensions.get('window');

export default function LoginPage() {
    const [selectedRole, setSelectedRole] = useState<UserRole>('patient');
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showOTP, setShowOTP] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);
    const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);
    const { login, register, verifyOTP } = useAuth();

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const logoScale = useRef(new Animated.Value(0.8)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(logoScale, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]).start();

        // Pulse animation for logo
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.05, duration: 2000, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    const handlePrimaryAction = async () => {
        setAuthError(null);

        if (isSignUp) {
            if (!name.trim() || !email.trim() || !password.trim()) {
                setAuthError('Please fill in name, email and password to sign up.');
                return;
            }
            setIsLoading(true);
            try {
                const result = await register(name.trim(), email.trim(), password, selectedRole);
                if (result.success) {
                    setPendingVerificationEmail(email.trim());
                    setShowOTP(true);
                } else {
                    setAuthError(result.message);
                }
            } catch (e) {
                setAuthError('Something went wrong while creating your account.');
            } finally {
                setIsLoading(false);
            }
            return;
        }

        if (!email || !password) {
            setAuthError('Please enter both email and password.');
            return;
        }

        setIsLoading(true);
        try {
            const result = await login(selectedRole, email.trim(), password);
            if (!result.success) {
                if (result.needsVerification && result.email) {
                    setPendingVerificationEmail(result.email);
                    setShowOTP(true);
                } else {
                    setAuthError(result.message);
                }
            }
        } catch (e) {
            setAuthError('Something went wrong while logging in.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOTPLogin = () => {
        setShowOTP(true);
    };

    const handleVerifyOTP = async () => {
        if (!pendingVerificationEmail) {
            setShowOTP(false);
            return;
        }

        const code = otp.join('');
        if (code.length !== 6) {
            Alert.alert('Invalid code', 'Please enter the 6-digit OTP sent to your email.');
            return;
        }

        setIsLoading(true);
        try {
            const ok = await verifyOTP(pendingVerificationEmail, code);
            if (!ok) {
                Alert.alert('Verification failed', 'The OTP is invalid or has expired.');
            } else {
                setShowOTP(false);
                setOtp(['', '', '', '', '', '']);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLogin = (provider: string) => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            // This is a placeholder for social login integration
            Alert.alert('Social Login', `${provider} login is not yet configured for this role.`);
        }, 1500);
    };

    const otpRefs = useRef<(TextInput | null)[]>([]);

    const handleOTPChange = (text: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);
        if (text && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const features = [
        { icon: Video, label: 'Video Consult', desc: 'HD video calls' },
        { icon: Pill, label: 'E-Pharmacy', desc: 'Order medicines' },
        { icon: FileText, label: 'Health Records', desc: 'Digital reports' },
        { icon: MessageSquare, label: 'Live Chat', desc: '24/7 support' },
    ];

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: '#fff' }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                {/* Top Gradient Header */}
                <View style={{ backgroundColor: '#0284c7', paddingTop: Platform.OS === 'ios' ? 70 : 56, paddingBottom: 40, paddingHorizontal: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
                    <Animated.View style={{ alignItems: 'center', transform: [{ scale: pulseAnim }] }}>
                        <Image
                            source={require('../assets/images/logo.png')}
                            style={{ width: 140, height: 140, marginBottom: 12 }}
                            resizeMode="contain"
                        />
                        <Text style={{ fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: 1 }}>MediCare</Text>
                        <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>Your Health, Our Priority</Text>
                    </Animated.View>

                    {/* Stats Bar */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 24, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 8 }}>
                        {[
                            { value: '5K+', label: 'Doctors' },
                            { value: '50K+', label: 'Patients' },
                            { value: '4.9★', label: 'Rating' },
                        ].map(({ value, label }) => (
                            <View key={label} style={{ alignItems: 'center' }}>
                                <Text style={{ fontSize: 18, fontWeight: '800', color: '#fff' }}>{value}</Text>
                                <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], padding: 24, paddingTop: 28 }}>

                    {/* Toggle Login / Sign Up */}
                    <View style={{ flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 16, padding: 4, marginBottom: 20 }}>
                        {[false, true].map((isSign) => (
                            <TouchableOpacity key={String(isSign)} onPress={() => setIsSignUp(isSign)} activeOpacity={0.7} style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: isSignUp === isSign ? '#fff' : 'transparent', alignItems: 'center' }}>
                                <Text style={{ fontSize: 14, fontWeight: '600', color: isSignUp === isSign ? '#0284c7' : '#94a3b8' }}>{isSign ? 'Sign Up' : 'Login'}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Role Toggle */}
                    <View style={{ width: '100%', backgroundColor: '#f0f9ff', borderRadius: 16, padding: 4, flexDirection: 'row', marginBottom: 20, borderWidth: 1, borderColor: '#e0f2fe' }}>
                        {(['patient', 'doctor'] as UserRole[]).map((role) => (
                            <TouchableOpacity key={role} onPress={() => setSelectedRole(role)} activeOpacity={0.7} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12, backgroundColor: selectedRole === role ? '#0284c7' : 'transparent' }}>
                                {role === 'patient' ? <User size={16} color={selectedRole === role ? '#fff' : '#64748b'} /> : <Stethoscope size={16} color={selectedRole === role ? '#fff' : '#64748b'} />}
                                <Text style={{ fontSize: 14, fontWeight: '600', color: selectedRole === role ? '#fff' : '#64748b' }}>{role === 'patient' ? 'Patient' : 'Doctor'}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Form Card */}
                    <View style={{ width: '100%', backgroundColor: '#fff', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#0284c7', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 4 }, shadowRadius: 16, elevation: 3 }}>

                        {/* Name - only for Sign Up */}
                        {isSignUp && (
                            <View style={{ marginBottom: 14 }}>
                                <Text style={{ fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 6 }}>Full Name</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, backgroundColor: '#f8fafc', paddingHorizontal: 14 }}>
                                    <User size={16} color="#94a3b8" />
                                    <TextInput value={name} onChangeText={setName} placeholder="Enter your full name" placeholderTextColor="#94a3b8" style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 10, color: '#0f172a', fontSize: 14 }} />
                                </View>
                            </View>
                        )}

                        {/* Email */}
                        <View style={{ marginBottom: 14 }}>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 6 }}>Email Address</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, backgroundColor: '#f8fafc', paddingHorizontal: 14 }}>
                                <Mail size={16} color="#94a3b8" />
                                <TextInput value={email} onChangeText={setEmail} placeholder={selectedRole === 'doctor' ? 'doctor@medicare.com' : 'patient@email.com'} placeholderTextColor="#94a3b8" autoCapitalize="none" keyboardType="email-address" style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 10, color: '#0f172a', fontSize: 14 }} />
                            </View>
                        </View>

                        {/* Phone - only for Sign Up */}
                        {isSignUp && (
                            <View style={{ marginBottom: 14 }}>
                                <Text style={{ fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 6 }}>Phone Number</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, backgroundColor: '#f8fafc', paddingHorizontal: 14 }}>
                                    <Smartphone size={16} color="#94a3b8" />
                                    <Text style={{ color: '#475569', fontSize: 14, marginLeft: 8, marginRight: 4 }}>+91</Text>
                                    <TextInput value={phone} onChangeText={setPhone} placeholder="9876543210" placeholderTextColor="#94a3b8" keyboardType="phone-pad" maxLength={10} style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 4, color: '#0f172a', fontSize: 14 }} />
                                </View>
                            </View>
                        )}

                        {/* Password */}
                        <View style={{ marginBottom: 14 }}>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 6 }}>Password</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, backgroundColor: '#f8fafc', paddingHorizontal: 14 }}>
                                <Lock size={16} color="#94a3b8" />
                                <TextInput value={password} onChangeText={setPassword} placeholder="••••••••" placeholderTextColor="#94a3b8" secureTextEntry={!showPassword} style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 10, color: '#0f172a', fontSize: 14 }} />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} activeOpacity={0.7}>
                                    {showPassword ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Remember Me & Forgot Password */}
                        {!isSignUp && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                                <TouchableOpacity onPress={() => setRememberMe(!rememberMe)} activeOpacity={0.7} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <View style={{ width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: rememberMe ? '#0284c7' : '#cbd5e1', backgroundColor: rememberMe ? '#0284c7' : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                                        {rememberMe && <CheckCircle size={12} color="#fff" />}
                                    </View>
                                    <Text style={{ fontSize: 13, color: '#64748b' }}>Remember me</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setShowForgotPassword(true)} activeOpacity={0.7}>
                                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#0284c7' }}>Forgot Password?</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Auth error message */}
                        {authError && (
                            <View style={{ marginBottom: 10 }}>
                                <Text style={{ color: '#dc2626', fontSize: 13 }}>{authError}</Text>
                            </View>
                        )}

                        {/* Sign In / Sign Up Button */}
                        <TouchableOpacity onPress={handlePrimaryAction} activeOpacity={0.8} disabled={isLoading} style={{ width: '100%', backgroundColor: '#0284c7', paddingVertical: 16, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: '#0284c7', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 4 }}>
                            {isLoading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <>
                                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>{isSignUp ? 'Create Account' : `Login as ${selectedRole === 'doctor' ? 'Doctor' : 'Patient'}`}</Text>
                                    <ArrowRight size={18} color="#ffffff" />
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Divider */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20 }}>
                        <View style={{ flex: 1, height: 1, backgroundColor: '#e2e8f0' }} />
                        <Text style={{ marginHorizontal: 16, fontSize: 12, color: '#94a3b8', fontWeight: '500' }}>or continue with</Text>
                        <View style={{ flex: 1, height: 1, backgroundColor: '#e2e8f0' }} />
                    </View>

                    {/* Social Login Buttons */}
                    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
                        {[
                            { label: 'Google', emoji: '🔵', color: '#ea4335' },
                            { label: 'Apple', emoji: '🍎', color: '#000' },
                            { label: 'Phone', emoji: '📱', color: '#16a34a' },
                        ].map(({ label, emoji }) => (
                            <TouchableOpacity key={label} onPress={() => label === 'Phone' ? handleOTPLogin() : handleSocialLogin(label)} activeOpacity={0.7} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: '#e2e8f0', backgroundColor: '#fafafa' }}>
                                <Text style={{ fontSize: 16 }}>{emoji}</Text>
                                <Text style={{ fontSize: 13, fontWeight: '600', color: '#475569' }}>{label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Biometric Login */}
                    {!isSignUp && (
                        <TouchableOpacity onPress={handlePrimaryAction} activeOpacity={0.7} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, backgroundColor: '#f0f9ff', borderWidth: 1, borderColor: '#bae6fd', marginBottom: 20 }}>
                            <ScanLine size={20} color="#0284c7" />
                            <Text style={{ fontSize: 14, fontWeight: '600', color: '#0284c7' }}>Login with Biometrics</Text>
                        </TouchableOpacity>
                    )}

                    {/* Features Grid */}
                    <View style={{ marginBottom: 24 }}>
                        <Text style={{ fontSize: 13, fontWeight: '600', color: '#94a3b8', textAlign: 'center', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>Why Choose MediCare?</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                            {features.map(({ icon: Icon, label, desc }) => (
                                <View key={label} style={{ width: '48%', backgroundColor: '#f8fafc', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#f1f5f9' }}>
                                    <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#e0f2fe', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                                        <Icon size={18} color="#0284c7" />
                                    </View>
                                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#0f172a', marginBottom: 2 }}>{label}</Text>
                                    <Text style={{ fontSize: 11, color: '#94a3b8' }}>{desc}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={{ alignItems: 'center', paddingBottom: 30 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                            <Shield size={14} color="#94a3b8" />
                            <Text style={{ fontSize: 11, color: '#94a3b8' }}>HIPAA Compliant • 256-bit SSL Encryption</Text>
                        </View>
                        <Text style={{ fontSize: 11, color: '#cbd5e1' }}>v2.1.0 • © 2026 MediCare Health Technologies</Text>
                    </View>
                </Animated.View>
            </ScrollView>

            {/* OTP Modal */}
            <Modal visible={showOTP} transparent animationType="slide">
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                    <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                            <Text style={{ fontSize: 20, fontWeight: '700', color: '#0f172a' }}>Verify OTP</Text>
                            <TouchableOpacity onPress={() => setShowOTP(false)}><X size={20} color="#94a3b8" /></TouchableOpacity>
                        </View>
                        <Text style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>Enter the 6-digit code sent to</Text>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#0284c7', marginBottom: 24 }}>
                            {pendingVerificationEmail || email || 'your registered email'}
                        </Text>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
                            {otp.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    ref={(ref) => { otpRefs.current[index] = ref; }}
                                    value={digit}
                                    onChangeText={(text) => handleOTPChange(text, index)}
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    style={{ width: 48, height: 56, borderRadius: 12, borderWidth: 2, borderColor: digit ? '#0284c7' : '#e2e8f0', backgroundColor: '#f8fafc', textAlign: 'center', fontSize: 22, fontWeight: '700', color: '#0f172a' }}
                                />
                            ))}
                        </View>

                        <TouchableOpacity onPress={handleVerifyOTP} activeOpacity={0.7} disabled={isLoading} style={{ backgroundColor: '#0284c7', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginBottom: 16 }}>
                            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Verify & Sign In</Text>}
                        </TouchableOpacity>

                        <TouchableOpacity activeOpacity={0.7} style={{ alignItems: 'center' }}>
                            <Text style={{ fontSize: 14, color: '#64748b' }}>Didn't receive code? <Text style={{ color: '#0284c7', fontWeight: '600' }}>Resend</Text></Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Forgot Password Flow */}
            <ForgotPasswordForm 
                visible={showForgotPassword} 
                onClose={() => setShowForgotPassword(false)} 
            />
        </KeyboardAvoidingView>
    );
}
