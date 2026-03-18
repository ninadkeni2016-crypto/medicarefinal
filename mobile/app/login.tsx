import React, { useState, useRef } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { Heart, Stethoscope, User, ArrowRight, Shield, Clock, MessageSquare, Mail, Lock, Eye, EyeOff, ChevronLeft } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/lib/mock-data';
import { useRouter } from 'expo-router';

type Screen = 'login' | 'register' | 'verify-otp';

export default function LoginPage() {
    const { login, register, verifyOTP } = useAuth();
    const router = useRouter();

    const [screen, setScreen] = useState<Screen>('login');
    const [selectedRole, setSelectedRole] = useState<UserRole>('patient');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Login fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Register fields
    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regConfirmPassword, setRegConfirmPassword] = useState('');

    // OTP fields
    const [otpEmail, setOtpEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const otpRefs = useRef<any[]>([]);

    const handleOtpChange = (val: string, i: number) => {
        if (!/^\d*$/.test(val)) return;
        const newOtp = [...otp];
        newOtp[i] = val;
        setOtp(newOtp);
        if (val && i < 5) otpRefs.current[i + 1]?.focus();
        if (!val && i > 0) otpRefs.current[i - 1]?.focus();
    };

    const clearMessages = () => { setErrorMsg(''); setSuccessMsg(''); };

    const handleLogin = async () => {
        clearMessages();
        if (!email || !password) { setErrorMsg('Please fill in all fields.'); return; }
        setIsLoading(true);
        const result = await login(selectedRole, email, password);
        setIsLoading(false);
        if (result.success) {
            router.replace('/');
        } else if (result.needsVerification && result.email) {
            setOtpEmail(result.email);
            setSuccessMsg(`Please verify your email. An OTP was sent to ${result.email}.`);
            setScreen('verify-otp');
        } else {
            setErrorMsg(result.code ? `${result.message} [${result.code}]` : result.message);
        }
    };

    const handleRegister = async () => {
        clearMessages();
        if (!regName || !regEmail || !regPassword || !regConfirmPassword) { setErrorMsg('Please fill in all fields.'); return; }
        if (regPassword !== regConfirmPassword) { setErrorMsg('Passwords do not match.'); return; }
        if (regPassword.length < 6) { setErrorMsg('Password must be at least 6 characters.'); return; }
        setIsLoading(true);
        const result = await register(regName, regEmail, regPassword, selectedRole);
        setIsLoading(false);
        if (result.success) {
            setOtpEmail(regEmail);
            setSuccessMsg(result.message);
            setScreen('verify-otp');
        } else {
            setErrorMsg(result.message);
        }
    };

    const handleVerifyOTP = async () => {
        clearMessages();
        const otpCode = otp.join('');
        if (otpCode.length < 6) { setErrorMsg('Please enter the full 6-digit code.'); return; }
        setIsLoading(true);
        const success = await verifyOTP(otpEmail, otpCode);
        setIsLoading(false);
        if (success) {
            router.replace('/');
        } else {
            setErrorMsg('Invalid or expired OTP. Please try again.');
            setOtp(['', '', '', '', '', '']);
            otpRefs.current[0]?.focus();
        }
    };

    const RoleToggle = () => (
        <View style={{ backgroundColor: '#f1f5f9', borderRadius: 16, padding: 4, flexDirection: 'row', marginBottom: 20 }}>
            {(['patient', 'doctor'] as UserRole[]).map((role) => (
                <TouchableOpacity
                    key={role}
                    onPress={() => setSelectedRole(role)}
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12, backgroundColor: selectedRole === role ? '#fff' : 'transparent' }}
                >
                    {role === 'patient' ? <User size={16} color={selectedRole === role ? '#0284c7' : '#94a3b8'} /> : <Stethoscope size={16} color={selectedRole === role ? '#0284c7' : '#94a3b8'} />}
                    <Text style={{ fontSize: 14, fontWeight: '600', color: selectedRole === role ? '#0f172a' : '#94a3b8' }}>
                        {role === 'patient' ? 'Patient' : 'Doctor'}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const InputField = ({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, icon: Icon, rightEl }: any) => (
        <View style={{ marginBottom: 14 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#334155', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 14 }}>
                {Icon && <Icon size={16} color="#94a3b8" style={{ marginRight: 8 }} />}
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="#cbd5e1"
                    autoCapitalize="none"
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType || 'default'}
                    style={{ flex: 1, paddingVertical: 14, fontSize: 14, color: '#0f172a' }}
                />
                {rightEl}
            </View>
        </View>
    );

    const FeedbackBanner = () => {
        // Only show "Create an account" if the backend explicitly says USER_NOT_FOUND
        const isUserNotFound = errorMsg.includes('USER_NOT_FOUND');
        const displayMsg = isUserNotFound ? errorMsg.replace(' [USER_NOT_FOUND]', '') : errorMsg;

        return (
            <>
                {errorMsg ? (
                    <View style={{ backgroundColor: '#fef2f2', borderRadius: 10, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: '#fecaca', borderLeftWidth: 4, borderLeftColor: '#ef4444' }}>
                        <Text style={{ color: '#dc2626', fontSize: 13, fontWeight: '500' }}>⚠️ {displayMsg}</Text>
                        {screen === 'login' && isUserNotFound ? (
                            <TouchableOpacity
                                onPress={() => { setScreen('register'); clearMessages(); }}
                                style={{ marginTop: 8, alignSelf: 'flex-start', borderBottomWidth: 1, borderBottomColor: '#dc2626' }}
                            >
                                <Text style={{ color: '#dc2626', fontSize: 12, fontWeight: '700' }}>New user? Create an account</Text>
                            </TouchableOpacity>
                        ) : null}
                    </View>
                ) : null}
                {successMsg ? (
                    <View style={{ backgroundColor: '#f0fdf4', borderRadius: 10, padding: 12, marginBottom: 14, borderLeftWidth: 3, borderLeftColor: '#22c55e' }}>
                        <Text style={{ color: '#15803d', fontSize: 13 }}>✔️ {successMsg}</Text>
                    </View>
                ) : null}
            </>
        );
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', backgroundColor: '#ffffff', padding: 24 }}>
                <View style={{ width: '100%', maxWidth: 440, alignSelf: 'center' }}>

                    {/* Logo */}
                    <View style={{ alignItems: 'center', marginBottom: 28 }}>
                        <View style={{ width: 64, height: 64, borderRadius: 18, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                            <Heart size={30} color="#fff" />
                        </View>
                        <Text style={{ fontSize: 22, fontWeight: '800', color: '#0f172a' }}>Medicare</Text>
                        <Text style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>Your Health, Our Priority</Text>
                    </View>

                    {/* ─── OTP VERIFICATION SCREEN ─── */}
                    {screen === 'verify-otp' && (
                        <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#e2e8f0' }}>
                            <TouchableOpacity onPress={() => { setScreen('register'); clearMessages(); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 20 }}>
                                <ChevronLeft size={16} color="#64748b" />
                                <Text style={{ color: '#64748b', fontSize: 13 }}>Back</Text>
                            </TouchableOpacity>
                            <Text style={{ fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 6 }}>Verify your email</Text>
                            <Text style={{ color: '#64748b', fontSize: 13, marginBottom: 20, lineHeight: 20 }}>
                                We sent a 6-digit code to{' '}
                                <Text style={{ color: '#0284c7', fontWeight: '700' }}>{otpEmail}</Text>.
                                {'\n'}It expires in 10 minutes.
                            </Text>

                            <FeedbackBanner />

                            <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
                                {otp.map((digit, i) => (
                                    <TextInput
                                        key={i}
                                        ref={(ref) => { otpRefs.current[i] = ref; }}
                                        value={digit}
                                        onChangeText={(v) => handleOtpChange(v, i)}
                                        maxLength={1}
                                        keyboardType="numeric"
                                        style={{ width: 46, height: 54, borderRadius: 12, borderWidth: 2, borderColor: digit ? '#0284c7' : '#e2e8f0', backgroundColor: digit ? '#f0f9ff' : '#f8fafc', fontSize: 22, fontWeight: '800', color: '#0f172a', textAlign: 'center' }}
                                    />
                                ))}
                            </View>

                            <TouchableOpacity
                                onPress={handleVerifyOTP}
                                disabled={isLoading}
                                style={{ backgroundColor: '#0f172a', paddingVertical: 15, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: isLoading ? 0.7 : 1 }}
                            >
                                {isLoading ? <ActivityIndicator color="#fff" /> : (
                                    <>
                                        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Verify & Continue</Text>
                                        <ArrowRight size={16} color="#fff" />
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* ─── SIGN IN / SIGN UP TABS ─── */}
                    {screen !== 'verify-otp' && (
                        <>
                            {/* Tabs */}
                            <View style={{ flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 14, padding: 4, marginBottom: 20 }}>
                                {(['login', 'register'] as Screen[]).map((s) => (
                                    <TouchableOpacity
                                        key={s}
                                        onPress={() => { setScreen(s); clearMessages(); }}
                                        style={{ flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', backgroundColor: screen === s ? '#fff' : 'transparent' }}
                                    >
                                        <Text style={{ fontSize: 14, fontWeight: '700', color: screen === s ? '#0f172a' : '#94a3b8' }}>
                                            {s === 'login' ? 'Sign In' : 'Sign Up'}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <RoleToggle />

                            <FeedbackBanner />

                            {/* ─── LOGIN FORM ─── */}
                            {screen === 'login' && (
                                <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#e2e8f0' }}>
                                    <InputField label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" icon={Mail} />
                                    <InputField
                                        label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" icon={Lock}
                                        secureTextEntry={!showPassword}
                                        rightEl={
                                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                                {showPassword ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
                                            </TouchableOpacity>
                                        }
                                    />

                                    <TouchableOpacity onPress={handleLogin} disabled={isLoading} style={{ backgroundColor: '#0f172a', paddingVertical: 15, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 6, opacity: isLoading ? 0.7 : 1 }}>
                                        {isLoading ? <ActivityIndicator color="#fff" /> : (
                                            <>
                                                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Sign In as {selectedRole === 'doctor' ? 'Doctor' : 'Patient'}</Text>
                                                <ArrowRight size={16} color="#fff" />
                                            </>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* ─── REGISTER FORM ─── */}
                            {screen === 'register' && (
                                <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#e2e8f0' }}>
                                    <InputField label="Full Name" value={regName} onChangeText={setRegName} placeholder="John Doe" icon={User} />
                                    <InputField label="Email" value={regEmail} onChangeText={setRegEmail} placeholder="you@example.com" keyboardType="email-address" icon={Mail} />
                                    <InputField
                                        label="Password" value={regPassword} onChangeText={setRegPassword} placeholder="Min. 6 characters" icon={Lock}
                                        secureTextEntry={!showPassword}
                                        rightEl={
                                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                                {showPassword ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
                                            </TouchableOpacity>
                                        }
                                    />
                                    <InputField
                                        label="Confirm Password" value={regConfirmPassword} onChangeText={setRegConfirmPassword} placeholder="Re-enter password" icon={Lock}
                                        secureTextEntry={!showConfirmPassword}
                                        rightEl={
                                            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                                {showConfirmPassword ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
                                            </TouchableOpacity>
                                        }
                                    />

                                    <TouchableOpacity onPress={handleRegister} disabled={isLoading} style={{ backgroundColor: '#0284c7', paddingVertical: 15, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 6, opacity: isLoading ? 0.7 : 1 }}>
                                        {isLoading ? <ActivityIndicator color="#fff" /> : (
                                            <>
                                                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Create Account</Text>
                                                <ArrowRight size={16} color="#fff" />
                                            </>
                                        )}
                                    </TouchableOpacity>
                                    <Text style={{ textAlign: 'center', color: '#94a3b8', fontSize: 12, marginTop: 12 }}>
                                        A verification code will be sent to your email.
                                    </Text>
                                </View>
                            )}

                            {/* Features strip */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 28 }}>
                                {[{ icon: Shield, label: 'Secure' }, { icon: Clock, label: '24/7 Access' }, { icon: MessageSquare, label: 'Live Chat' }].map(({ icon: Icon, label }) => (
                                    <View key={label} style={{ alignItems: 'center', gap: 6 }}>
                                        <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                                            <Icon size={16} color="#0284c7" />
                                        </View>
                                        <Text style={{ fontSize: 11, color: '#64748b', fontWeight: '600' }}>{label}</Text>
                                    </View>
                                ))}
                            </View>
                        </>
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
