import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView, Image,
    Animated, KeyboardAvoidingView, Platform, ActivityIndicator,
    Modal, Alert, Dimensions, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
    Stethoscope, User, ArrowRight, Mail, Lock, X,
    CheckCircle, Eye, EyeOff, Smartphone, Shield, Heart,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/lib/mock-data';
import ForgotPasswordForm from './shared/ForgotPasswordForm';
import { colors, spacing, radius, typography, cardShadow, fonts } from '@/lib/theme';
import { ScalePress } from '@/components/ui/Animations';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

// ─── Staggered animated input row ────────────────────────────────────────────
function AnimatedField({
    children, delay = 0
}: { children: React.ReactNode; delay?: number }) {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(24)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: 0, duration: 400, delay, useNativeDriver: true }),
        ]).start();
    }, []);

    return (
        <Animated.View style={{ opacity, transform: [{ translateY }] }}>
            {children}
        </Animated.View>
    );
}

// ─── Focusable, glowing input ─────────────────────────────────────────────────
function GlowInput({
    icon: Icon, placeholder, value, onChangeText,
    secureTextEntry, keyboardType, autoCapitalize,
    rightNode, label, multiline,
}: any) {
    const [focused, setFocused] = useState(false);
    const glowAnim = useRef(new Animated.Value(0)).current;
    const borderColor = useRef(new Animated.Value(0)).current;

    const onFocus = () => {
        setFocused(true);
        Animated.timing(glowAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
    };
    const onBlur = () => {
        setFocused(false);
        Animated.timing(glowAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
    };

    const animBorder = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [colors.border, colors.primary] });

    return (
        <View style={{ marginBottom: 18 }}>
            <Text style={{
                fontFamily: fonts.medium, fontSize: 12,
                color: focused ? colors.primary : colors.textSecondary,
                marginBottom: 8, letterSpacing: 0.3,
                textTransform: 'uppercase',
            }}>
                {label}
            </Text>
            <Animated.View style={{
                flexDirection: 'row', alignItems: 'center',
                borderWidth: 1.5, borderColor: animBorder,
                borderRadius: 16, paddingHorizontal: 14,
                backgroundColor: focused ? 'rgba(29,143,212,0.04)' : '#F8FAFC',
                minHeight: 54,
            }}>
                <Icon size={18} color={focused ? colors.primary : colors.textMuted} strokeWidth={2} />
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType || 'default'}
                    autoCapitalize={autoCapitalize || 'sentences'}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    style={{
                        flex: 1, paddingVertical: 14, paddingHorizontal: 10,
                        fontSize: 15, color: colors.text, fontFamily: fonts.regular,
                    }}
                />
                {rightNode}
            </Animated.View>
        </View>
    );
}

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

    // ── Hero animations ───────────────────────────────────────────────────────
    const logoScale = useRef(new Animated.Value(0.6)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const heroSlide = useRef(new Animated.Value(-20)).current;
    const formOpacity = useRef(new Animated.Value(0)).current;
    const buttonScale = useRef(new Animated.Value(1)).current;
    // Per-role button scales for press feedback
    const roleScales = useRef<{ [key: string]: Animated.Value }>({
        patient: new Animated.Value(1),
        doctor: new Animated.Value(1),
    }).current;
    // Fade animation when switching role
    const roleAnim = useRef(new Animated.Value(1)).current;

    // Floating pulse on logo
    const pulse = useRef(new Animated.Value(1)).current;
    const driftAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Logo entrance
        Animated.parallel([
            Animated.spring(logoScale, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
            Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(heroSlide, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]).start(() => {
            // Form fade in after hero
            Animated.timing(formOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
        });

        // Infinite pulse on logo
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, { toValue: 1.05, duration: 2500, useNativeDriver: true }),
                Animated.timing(pulse, { toValue: 1, duration: 2500, useNativeDriver: true }),
            ])
        );
        loop.start();

        // Slow drift for background circles
        Animated.loop(
            Animated.sequence([
                Animated.timing(driftAnim, { toValue: 10, duration: 4000, useNativeDriver: true }),
                Animated.timing(driftAnim, { toValue: -10, duration: 4000, useNativeDriver: true }),
            ])
        ).start();

        return () => loop.stop();
    }, []);

    // Animate form when switching login⇄signup
    const switchAnim = useRef(new Animated.Value(1)).current;
    const handleSwitch = (val: boolean) => {
        Animated.sequence([
            Animated.timing(switchAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
            Animated.timing(switchAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
        ]).start();
        setIsSignUp(val);
        setAuthError(null);
    };

    const handleRoleChange = (role: UserRole) => {
        if (role === selectedRole) return;
        // Spring bounce on the tapped button
        Animated.sequence([
            Animated.spring(roleScales[role], { toValue: 0.92, useNativeDriver: true, speed: 80, bounciness: 0 }),
            Animated.spring(roleScales[role], { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 10 }),
        ]).start();
        // Fade form out then back in
        Animated.sequence([
            Animated.timing(roleAnim, { toValue: 0.55, duration: 100, useNativeDriver: true }),
            Animated.timing(roleAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
        ]).start();
        setSelectedRole(role);
        setAuthError(null);
    };

    const onPressInBtn = () => Animated.spring(buttonScale, { toValue: 0.96, useNativeDriver: true, speed: 50 }).start();
    const onPressOutBtn = () => Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 8 }).start();

    // ── Auth handlers ─────────────────────────────────────────────────────────
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
            } catch {
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
        } catch {
            setAuthError('Something went wrong while logging in.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!pendingVerificationEmail) { setShowOTP(false); return; }
        const code = otp.join('');
        if (code.length !== 6) { Alert.alert('Invalid code', 'Please enter the 6-digit OTP.'); return; }
        setIsLoading(true);
        try {
            const ok = await verifyOTP(pendingVerificationEmail, code);
            if (!ok) Alert.alert('Verification failed', 'The OTP is invalid or has expired.');
            else { setShowOTP(false); setOtp(['', '', '', '', '', '']); }
        } finally { setIsLoading(false); }
    };

    const otpRefs = useRef<(TextInput | null)[]>([]);
    const handleOTPChange = (text: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);
        if (text && index < 5) otpRefs.current[index + 1]?.focus();
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: '#0A1628' }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar barStyle="light-content" />
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* ══ HERO SECTION ══════════════════════════════════════════════ */}
                <LinearGradient
                    colors={['#0A1628', '#0D2341', '#1D4168']}
                    style={{ paddingTop: Platform.OS === 'ios' ? 64 : 48, paddingBottom: 48, alignItems: 'center', paddingHorizontal: 24 }}
                >
                    {/* Decorative circles */}
                    <Animated.View style={{ 
                        position: 'absolute', top: -20, right: -40, width: 220, height: 220, borderRadius: 110, 
                        backgroundColor: 'rgba(29,143,212,0.08)',
                        transform: [{ translateY: driftAnim }] 
                    }} />
                    <Animated.View style={{ 
                        position: 'absolute', top: 60, left: -60, width: 180, height: 180, borderRadius: 90, 
                        backgroundColor: 'rgba(29,143,212,0.05)',
                        transform: [{ translateY: Animated.multiply(driftAnim, -0.8) }] 
                    }} />

                    {/* Logo */}
                    <Animated.View style={{
                        opacity: logoOpacity,
                        transform: [{ scale: Animated.multiply(logoScale, pulse) }, { translateY: heroSlide }],
                        marginBottom: -20,
                    }}>
                        <Image
                            source={require('../assets/images/logo.png')}
                            style={{ width: 220, height: 220 }}
                            resizeMode="contain"
                        />
                    </Animated.View>

                    <Animated.View style={{ opacity: logoOpacity, transform: [{ translateY: heroSlide }], alignItems: 'center' }}>
                        <Text style={{ fontFamily: fonts.bold, fontSize: 30, color: '#FFFFFF', letterSpacing: -0.5 }}>
                            Medicare
                        </Text>
                        <Text style={{ fontFamily: fonts.regular, fontSize: 14, color: 'rgba(255,255,255,0.55)', marginTop: 6, letterSpacing: 0.5 }}>
                            Your health, our priority
                        </Text>

                        {/* Stats strip */}
                        <View style={{
                            flexDirection: 'row', gap: 24, marginTop: 28,
                            paddingVertical: 16, paddingHorizontal: 28,
                            backgroundColor: 'rgba(255,255,255,0.06)',
                            borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
                        }}>
                            {[
                                { val: '2,500+', label: 'Doctors' },
                                { val: '50k+', label: 'Patients' },
                                { val: '4.9★', label: 'Rated' },
                            ].map((s, i) => (
                                <View key={i} style={{ alignItems: 'center' }}>
                                    <Text style={{ fontFamily: fonts.bold, fontSize: 15, color: '#FFFFFF' }}>{s.val}</Text>
                                    <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{s.label}</Text>
                                </View>
                            ))}
                        </View>
                    </Animated.View>
                </LinearGradient>

                {/* ══ FORM CARD ════════════════════════════════════════════════ */}
                <Animated.View style={{ opacity: formOpacity }}>
                    <View style={{
                        backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32,
                        marginTop: -20, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 48,
                        minHeight: height * 0.58,
                        shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
                        shadowOpacity: 0.08, shadowRadius: 20, elevation: 8,
                    }}>

                        {/* Login / Sign Up toggle */}
                        <AnimatedField delay={0}>
                            <View style={{
                                flexDirection: 'row', backgroundColor: '#F1F5F9',
                                borderRadius: 14, padding: 4, marginBottom: 24,
                            }}>
                                {([false, true] as const).map((isSign) => (
                                    <ScalePress 
                                        key={String(isSign)} 
                                        onPress={() => { Haptics.selectionAsync(); handleSwitch(isSign); }} 
                                        style={{ flex: 1 }}
                                        haptic="selection"
                                    >
                                        <View
                                            style={{
                                                paddingVertical: 12, borderRadius: 11,
                                                backgroundColor: isSignUp === isSign ? '#FFFFFF' : 'transparent',
                                                alignItems: 'center',
                                                ...(isSignUp === isSign ? {
                                                    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
                                                    shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
                                                } : {}),
                                            }}
                                        >
                                            <Text style={{
                                                fontFamily: isSignUp === isSign ? fonts.semiBold : fonts.regular,
                                                fontSize: 14,
                                                color: isSignUp === isSign ? colors.primary : colors.textMuted,
                                            }}>
                                                {isSign ? 'Sign Up' : 'Log In'}
                                            </Text>
                                        </View>
                                    </ScalePress>
                                ))}
                            </View>
                        </AnimatedField>

                        {/* Role Selector */}
                        <AnimatedField delay={60}>
                            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
                                {(['patient', 'doctor'] as UserRole[]).map((role) => {
                                    const active = selectedRole === role;
                                    return (
                                        <Animated.View key={role} style={{ flex: 1, transform: [{ scale: roleScales[role] }] }}>
                                            <TouchableOpacity
                                                onPress={() => handleRoleChange(role)}
                                                activeOpacity={0.85}
                                                style={{
                                                    flexDirection: 'row', alignItems: 'center',
                                                    justifyContent: 'center', gap: 8,
                                                    paddingVertical: 14, borderRadius: 16,
                                                    backgroundColor: active ? colors.primary : '#F8FAFC',
                                                    borderWidth: 1.5,
                                                    borderColor: active ? colors.primary : colors.border,
                                                    shadowColor: active ? colors.primary : 'transparent',
                                                    shadowOffset: { width: 0, height: 4 },
                                                    shadowOpacity: active ? 0.25 : 0,
                                                    shadowRadius: 8, elevation: active ? 4 : 0,
                                                }}
                                            >
                                                {role === 'patient'
                                                    ? <Heart size={16} color={active ? '#fff' : colors.textSecondary} fill={active ? '#fff' : 'transparent'} />
                                                    : <Stethoscope size={16} color={active ? '#fff' : colors.textSecondary} />
                                                }
                                                <Text style={{
                                                    fontFamily: fonts.semiBold, fontSize: 14,
                                                    color: active ? '#fff' : colors.textSecondary,
                                                }}>
                                                    {role === 'patient' ? 'Patient' : 'Doctor'}
                                                </Text>
                                            </TouchableOpacity>
                                        </Animated.View>
                                    );
                                })}
                            </View>
                        </AnimatedField>

                        {/* ── Form Fields ─────────────── */}
                        <Animated.View style={{ opacity: Animated.multiply(switchAnim, roleAnim) }}>
                            {isSignUp && (
                                <AnimatedField delay={80}>
                                    <GlowInput
                                        icon={User} label="Full Name"
                                        placeholder="Enter your full name"
                                        value={name} onChangeText={setName}
                                    />
                                </AnimatedField>
                            )}

                            <AnimatedField delay={isSignUp ? 120 : 80}>
                                <GlowInput
                                    icon={Mail} label="Email Address"
                                    placeholder="name@example.com"
                                    value={email} onChangeText={setEmail}
                                    keyboardType="email-address" autoCapitalize="none"
                                />
                            </AnimatedField>

                            {isSignUp && (
                                <AnimatedField delay={160}>
                                    <GlowInput
                                        icon={Smartphone} label="Phone Number"
                                        placeholder="10-digit number"
                                        value={phone} onChangeText={setPhone}
                                        keyboardType="phone-pad" autoCapitalize="none"
                                    />
                                </AnimatedField>
                            )}

                            <AnimatedField delay={isSignUp ? 200 : 120}>
                                <GlowInput
                                    icon={Lock} label="Password"
                                    placeholder="••••••••"
                                    value={password} onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    rightNode={
                                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} activeOpacity={0.7}>
                                            {showPassword
                                                ? <EyeOff size={18} color={colors.textMuted} />
                                                : <Eye size={18} color={colors.textMuted} />
                                            }
                                        </TouchableOpacity>
                                    }
                                />
                            </AnimatedField>

                            {/* Remember me / Forgot */}
                            {!isSignUp && (
                                <AnimatedField delay={160}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                                        <TouchableOpacity onPress={() => setRememberMe(!rememberMe)} activeOpacity={0.7} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                            <View style={{
                                                width: 20, height: 20, borderRadius: 6,
                                                borderWidth: 1.5,
                                                borderColor: rememberMe ? colors.primary : colors.border,
                                                backgroundColor: rememberMe ? colors.primary : 'transparent',
                                                alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                {rememberMe && <CheckCircle size={12} color="#fff" />}
                                            </View>
                                            <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary }}>
                                                Remember me
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => setShowForgotPassword(true)} activeOpacity={0.7}>
                                            <Text style={{ fontFamily: fonts.semiBold, fontSize: 13, color: colors.primary }}>
                                                Forgot password?
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </AnimatedField>
                            )}

                            {/* Error */}
                            {authError && (
                                <View style={{
                                    marginBottom: 16, padding: 14,
                                    backgroundColor: '#FEF2F2', borderRadius: 12,
                                    borderWidth: 1, borderColor: '#FECACA',
                                    flexDirection: 'row', alignItems: 'center', gap: 8,
                                }}>
                                    <X size={14} color={colors.danger} />
                                    <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.danger, flex: 1 }}>
                                        {authError}
                                    </Text>
                                </View>
                            )}

                            {/* Primary Button */}
                            <AnimatedField delay={isSignUp ? 240 : 200}>
                                <ScalePress onPress={handlePrimaryAction} disabled={isLoading} haptic="medium">
                                    <View style={{ borderRadius: 18, overflow: 'hidden', marginBottom: 16 }}>
                                        <LinearGradient
                                            colors={[colors.primary, '#1565a8']}
                                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                            style={{
                                                paddingVertical: 17, flexDirection: 'row',
                                                alignItems: 'center', justifyContent: 'center', gap: 10,
                                            }}
                                        >
                                            {isLoading
                                                ? <ActivityIndicator size="small" color="#fff" />
                                                : <>
                                                    <Text style={{ fontFamily: fonts.semiBold, fontSize: 16, color: '#fff', letterSpacing: 0.3 }}>
                                                        {isSignUp ? 'Create Account' : 'Log In'}
                                                    </Text>
                                                    <ArrowRight size={18} color="#fff" strokeWidth={2.5} />
                                                </>
                                            }
                                        </LinearGradient>
                                    </View>
                                </ScalePress>
                            </AnimatedField>

                            {/* Divider */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}>
                                <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
                                <Text style={{ marginHorizontal: 14, fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted }}>
                                    or continue with
                                </Text>
                                <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
                            </View>

                            {/* Social Buttons */}
                            <AnimatedField delay={isSignUp ? 280 : 240}>
                                <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                                    {[
                                        { label: 'Google', icon: Mail },
                                        { label: 'Apple', icon: Smartphone },
                                        { label: 'OTP', icon: Shield },
                                    ].map(({ label, icon: Icon }) => (
                                        <ScalePress 
                                            key={label} 
                                            onPress={() => label === 'OTP' ? setShowOTP(true) : Alert.alert('Sign in', `${label} sign-in is not yet configured.`)}
                                            style={{ flex: 1 }}
                                            haptic="light"
                                        >
                                            <View
                                                style={{
                                                    flexDirection: 'row', alignItems: 'center',
                                                    justifyContent: 'center', gap: 6,
                                                    paddingVertical: 14, borderRadius: 14,
                                                    borderWidth: 1.5, borderColor: colors.border,
                                                    backgroundColor: '#F8FAFC',
                                                }}
                                            >
                                                <Icon size={17} color={colors.textSecondary} strokeWidth={2} />
                                                <Text style={{ fontFamily: fonts.medium, fontSize: 12, color: colors.text }}>{label}</Text>
                                            </View>
                                        </ScalePress>
                                    ))}
                                </View>
                            </AnimatedField>
                        </Animated.View>

                        {/* Footer */}
                        <View style={{ alignItems: 'center', marginTop: 28 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Shield size={13} color={colors.textMuted} />
                                <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted }}>
                                    256-bit encrypted & HIPAA compliant
                                </Text>
                            </View>
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>

            {/* ══ OTP Modal ════════════════════════════════════════════════════ */}
            <Modal visible={showOTP} transparent animationType="slide">
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                    <View style={{
                        backgroundColor: '#FFFFFF',
                        borderTopLeftRadius: 32, borderTopRightRadius: 32,
                        padding: 28, paddingBottom: Platform.OS === 'ios' ? 44 : 32,
                    }}>
                        <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginBottom: 24 }} />
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                            <Text style={{ fontFamily: fonts.bold, fontSize: 20, color: colors.text }}>Verify Email</Text>
                            <TouchableOpacity onPress={() => setShowOTP(false)} style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' }}>
                                <X size={18} color={colors.textMuted} />
                            </TouchableOpacity>
                        </View>
                        <Text style={{ fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary, marginBottom: 4 }}>
                            Enter the 6-digit code sent to
                        </Text>
                        <Text style={{ fontFamily: fonts.semiBold, fontSize: 14, color: colors.primary, marginBottom: 24 }}>
                            {pendingVerificationEmail || email || 'your email'}
                        </Text>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28 }}>
                            {otp.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    ref={(ref) => { otpRefs.current[index] = ref; }}
                                    value={digit}
                                    onChangeText={(text) => handleOTPChange(text, index)}
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    style={{
                                        width: 46, height: 56, borderRadius: 14,
                                        borderWidth: 1.5,
                                        borderColor: digit ? colors.primary : colors.border,
                                        backgroundColor: digit ? 'rgba(29,143,212,0.06)' : '#F8FAFC',
                                        textAlign: 'center', fontSize: 22,
                                        fontFamily: fonts.bold, color: colors.text,
                                    }}
                                />
                            ))}
                        </View>

                        <TouchableOpacity
                            onPress={handleVerifyOTP}
                            activeOpacity={0.85}
                            disabled={isLoading}
                            style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}
                        >
                            <LinearGradient
                                colors={[colors.primary, '#1565a8']}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                style={{ paddingVertical: 16, alignItems: 'center' }}
                            >
                                {isLoading
                                    ? <ActivityIndicator color="#fff" />
                                    : <Text style={{ fontFamily: fonts.semiBold, fontSize: 15, color: '#fff' }}>Verify & Continue</Text>
                                }
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity activeOpacity={0.7} style={{ alignItems: 'center' }}>
                            <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary }}>
                                Didn't receive code?{' '}
                                <Text style={{ fontFamily: fonts.semiBold, color: colors.primary }}>Resend</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <ForgotPasswordForm visible={showForgotPassword} onClose={() => setShowForgotPassword(false)} />
        </KeyboardAvoidingView>
    );
}
