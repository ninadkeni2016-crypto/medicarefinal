import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Animated, KeyboardAvoidingView, Platform, ActivityIndicator, Modal, Alert } from 'react-native';
import { Stethoscope, User, ArrowRight, Mail, Lock, X, CheckCircle, Eye, EyeOff, Smartphone, Shield } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/lib/mock-data';
import ForgotPasswordForm from './shared/ForgotPasswordForm';
import { colors, spacing, radius, typography, cardShadow, fonts } from '@/lib/theme';

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

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]).start();
    }, [fadeAnim, slideAnim]);

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
            Alert.alert('Sign in', `${provider} sign-in is not yet configured.`);
        }, 800);
    };

    const otpRefs = useRef<(TextInput | null)[]>([]);

    const handleOTPChange = (text: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);
        if (text && index < 5) otpRefs.current[index + 1]?.focus();
    };

    const inputStyle = {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 12,
        color: colors.text,
        fontSize: 15,
        fontFamily: fonts.regular,
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View style={{ backgroundColor: colors.card, paddingTop: Platform.OS === 'ios' ? 56 : 40, paddingBottom: spacing.xl, paddingHorizontal: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                    <Animated.View style={{ alignItems: 'center', opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                        <Image source={require('../assets/images/logo.png')} style={{ width: 110, height: 110, marginBottom: spacing.md }} resizeMode="contain" />
                        <Text style={[typography.screenTitle, { fontSize: 22 }]}>Medicare</Text>
                        <Text style={[typography.body, { marginTop: 4 }]}>Healthcare management</Text>
                    </Animated.View>
                </View>

                <Animated.View style={{ opacity: fadeAnim, padding: spacing.lg, paddingTop: spacing.xl }}>
                    {/* Login / Sign up toggle */}
                    <View style={{ flexDirection: 'row', backgroundColor: colors.card, borderRadius: radius.md, padding: 4, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border }}>
                        {([false, true] as const).map((isSign) => (
                            <TouchableOpacity
                                key={String(isSign)}
                                onPress={() => setIsSignUp(isSign)}
                                activeOpacity={0.7}
                                style={{
                                    flex: 1,
                                    paddingVertical: 12,
                                    borderRadius: radius.sm,
                                    backgroundColor: isSignUp === isSign ? colors.card : 'transparent',
                                    alignItems: 'center',
                                    ...(isSignUp === isSign && cardShadow),
                                }}
                            >
                                <Text style={[typography.label, { color: isSignUp === isSign ? colors.primary : colors.textMuted }]}>
                                    {isSign ? 'Sign up' : 'Log in'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Role */}
                    <View style={{ flexDirection: 'row', backgroundColor: colors.background, borderRadius: radius.md, padding: 4, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border }}>
                        {(['patient', 'doctor'] as UserRole[]).map((role) => (
                            <TouchableOpacity
                                key={role}
                                onPress={() => setSelectedRole(role)}
                                activeOpacity={0.7}
                                style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 8,
                                    paddingVertical: 12,
                                    borderRadius: radius.sm,
                                    backgroundColor: selectedRole === role ? colors.card : 'transparent',
                                    borderWidth: selectedRole === role ? 1 : 0,
                                    borderColor: colors.border,
                                }}
                            >
                                {role === 'patient' ? <User size={16} color={selectedRole === role ? colors.primary : colors.textSecondary} /> : <Stethoscope size={16} color={selectedRole === role ? colors.primary : colors.textSecondary} />}
                                <Text style={[typography.label, { color: selectedRole === role ? colors.primary : colors.textSecondary }]}>
                                    {role === 'patient' ? 'Patient' : 'Doctor'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Form */}
                    <View style={{ backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.lg, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border, ...cardShadow }}>
                        {isSignUp && (
                            <View style={{ marginBottom: spacing.md }}>
                                <Text style={[typography.label, { color: colors.textSecondary, marginBottom: 6 }]}>Full name</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, backgroundColor: colors.background }}>
                                    <User size={18} color={colors.textMuted} />
                                    <TextInput value={name} onChangeText={setName} placeholder="Enter full name" placeholderTextColor={colors.textMuted} style={inputStyle} />
                                </View>
                            </View>
                        )}

                        <View style={{ marginBottom: spacing.md }}>
                            <Text style={[typography.label, { color: colors.textSecondary, marginBottom: 6 }]}>Email</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, backgroundColor: colors.background }}>
                                <Mail size={18} color={colors.textMuted} />
                                <TextInput value={email} onChangeText={setEmail} placeholder="name@example.com" placeholderTextColor={colors.textMuted} autoCapitalize="none" keyboardType="email-address" style={inputStyle} />
                            </View>
                        </View>

                        {isSignUp && (
                            <View style={{ marginBottom: spacing.md }}>
                                <Text style={[typography.label, { color: colors.textSecondary, marginBottom: 6 }]}>Phone</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, backgroundColor: colors.background }}>
                                    <Smartphone size={18} color={colors.textMuted} />
                                    <Text style={[typography.body, { color: colors.textSecondary, marginRight: 4 }]}>+91</Text>
                                    <TextInput value={phone} onChangeText={setPhone} placeholder="Phone number" placeholderTextColor={colors.textMuted} keyboardType="phone-pad" maxLength={10} style={inputStyle} />
                                </View>
                            </View>
                        )}

                        <View style={{ marginBottom: spacing.md }}>
                            <Text style={[typography.label, { color: colors.textSecondary, marginBottom: 6 }]}>Password</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, backgroundColor: colors.background }}>
                                <Lock size={18} color={colors.textMuted} />
                                <TextInput value={password} onChangeText={setPassword} placeholder="••••••••" placeholderTextColor={colors.textMuted} secureTextEntry={!showPassword} style={inputStyle} />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} activeOpacity={0.7}>
                                    {showPassword ? <EyeOff size={18} color={colors.textMuted} /> : <Eye size={18} color={colors.textMuted} />}
                                </TouchableOpacity>
                            </View>
                        </View>

                        {!isSignUp && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg }}>
                                <TouchableOpacity onPress={() => setRememberMe(!rememberMe)} activeOpacity={0.7} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <View style={{ width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: rememberMe ? colors.primary : colors.border, backgroundColor: rememberMe ? colors.primary : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                                        {rememberMe && <CheckCircle size={12} color="#fff" />}
                                    </View>
                                    <Text style={[typography.caption, { color: colors.textSecondary }]}>Remember me</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setShowForgotPassword(true)} activeOpacity={0.7}>
                                    <Text style={[typography.caption, { color: colors.primary, fontWeight: '600' }]}>Forgot password?</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {authError && (
                            <View style={{ marginBottom: spacing.md, padding: spacing.sm, backgroundColor: '#FEF2F2', borderRadius: radius.sm }}>
                                <Text style={[typography.caption, { color: colors.danger }]}>{authError}</Text>
                            </View>
                        )}

                        <TouchableOpacity
                            onPress={handlePrimaryAction}
                            activeOpacity={0.8}
                            disabled={isLoading}
                            style={{
                                width: '100%',
                                backgroundColor: colors.primary,
                                paddingVertical: 14,
                                borderRadius: radius.md,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                            }}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <>
                                    <Text style={{ color: '#fff', fontFamily: fonts.semiBold, fontSize: 15 }}>{isSignUp ? 'Create account' : 'Log in'}</Text>
                                    <ArrowRight size={18} color="#fff" strokeWidth={2} />
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: spacing.lg }}>
                        <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
                        <Text style={{ marginHorizontal: spacing.md, fontSize: 12, color: colors.textMuted }}>or continue with</Text>
                        <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
                    </View>

                    <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl }}>
                        {[
                            { label: 'Google', icon: Mail },
                            { label: 'Apple', icon: Smartphone },
                            { label: 'Phone', icon: Smartphone },
                        ].map(({ label, icon: Icon }) => (
                            <TouchableOpacity
                                key={label}
                                onPress={() => label === 'Phone' ? setShowOTP(true) : handleSocialLogin(label)}
                                activeOpacity={0.7}
                                style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 6,
                                    paddingVertical: 12,
                                    borderRadius: radius.md,
                                    borderWidth: 1,
                                    borderColor: colors.border,
                                    backgroundColor: colors.card,
                                }}
                            >
                                <Icon size={18} color={colors.textSecondary} strokeWidth={2} />
                                <Text style={[typography.caption, { color: colors.text, fontWeight: '500' }]}>{label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={{ alignItems: 'center', paddingBottom: spacing.xxl }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                            <Shield size={14} color={colors.textMuted} />
                            <Text style={[typography.caption, { color: colors.textMuted }]}>Secure sign-in</Text>
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>

            {/* OTP Modal */}
            <Modal visible={showOTP} transparent animationType="slide">
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
                    <View style={{ backgroundColor: colors.card, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg, paddingBottom: 40 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg }}>
                            <Text style={[typography.title, { color: colors.text }]}>Verify email</Text>
                            <TouchableOpacity onPress={() => setShowOTP(false)}><X size={22} color={colors.textMuted} /></TouchableOpacity>
                        </View>
                        <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 4 }]}>Enter the 6-digit code sent to</Text>
                        <Text style={[typography.section, { color: colors.primary, marginBottom: spacing.lg }]}>{pendingVerificationEmail || email || 'your email'}</Text>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xl }}>
                            {otp.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    ref={(ref) => { otpRefs.current[index] = ref; }}
                                    value={digit}
                                    onChangeText={(text) => handleOTPChange(text, index)}
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    style={{
                                        width: 44,
                                        height: 52,
                                        borderRadius: radius.md,
                                        borderWidth: 1,
                                        borderColor: digit ? colors.primary : colors.border,
                                        backgroundColor: colors.background,
                                        textAlign: 'center',
                                        fontSize: 20,
                                        fontWeight: '600',
                                        color: colors.text,
                                    }}
                                />
                            ))}
                        </View>

                        <TouchableOpacity
                            onPress={handleVerifyOTP}
                            activeOpacity={0.8}
                            disabled={isLoading}
                            style={{ backgroundColor: colors.primary, paddingVertical: 14, borderRadius: radius.md, alignItems: 'center', marginBottom: spacing.md }}
                        >
                            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontFamily: fonts.semiBold, fontSize: 15 }}>Verify and continue</Text>}
                        </TouchableOpacity>

                        <TouchableOpacity activeOpacity={0.7} style={{ alignItems: 'center' }}>
                            <Text style={[typography.caption, { color: colors.textSecondary }]}>Didn't receive code? <Text style={{ color: colors.primary, fontWeight: '600' }}>Resend</Text></Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <ForgotPasswordForm visible={showForgotPassword} onClose={() => setShowForgotPassword(false)} />
        </KeyboardAvoidingView>
    );
}
