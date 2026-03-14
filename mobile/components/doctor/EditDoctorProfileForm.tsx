import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Animated, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { ArrowLeft, Save, User, Mail, Phone, MapPin, Award, Stethoscope, FileText, CheckCircle } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import api from '@/lib/api';

export default function EditDoctorProfileForm({ onBack }: { onBack: () => void }) {
    const { role } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        location: '',
        specialization: '',
        experience: '',
        consultationFee: '',
        bio: '',
    });

    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const saveAnim = React.useRef(new Animated.Value(1)).current;

    // Fetch existing doctor profile on mount
    useEffect(() => {
        api.get('/doctors/profile').then(res => {
            const d = res.data;
            setFormData({
                name: d.name || '',
                email: d.email || '',
                phone: d.phone || '',
                location: d.location || '',
                specialization: d.specialization || '',
                experience: String(d.experience || ''),
                consultationFee: String(d.consultationFee || ''),
                bio: d.bio || '',
            });
        }).catch(() => {
            // Profile might not exist yet — that's fine
        }).finally(() => setIsLoading(false));
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        Animated.sequence([
            Animated.timing(saveAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
            Animated.timing(saveAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start();
        try {
            await api.put('/doctors/profile', {
                ...formData,
                experience: formData.experience,
                consultationFee: Number(formData.consultationFee),
            });
            toast({ title: '✅ Profile updated successfully' });
            onBack();
        } catch (err) {
            toast({ title: '❌ Failed to save profile. Try again.' });
        } finally {
            setIsSaving(false);
        }
    };

    const updateField = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    if (isLoading) return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#0284c7" />
        </View>
    );

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                            <ArrowLeft size={20} color="#334155" />
                        </TouchableOpacity>
                        <View>
                            <Text style={{ fontSize: 20, fontWeight: '700', color: '#0284c7' }}>Edit Profile</Text>
                            <Text style={{ fontSize: 12, color: '#64748b' }}>Update your professional details</Text>
                        </View>
                    </View>
                </View>

                {/* Avatar Section */}
                <View style={{ alignItems: 'center', marginBottom: 24 }}>
                    <View style={{ width: 100, height: 100, borderRadius: 24, backgroundColor: '#e0f2fe', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 4, borderColor: '#fff', shadowColor: '#0284c7', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 }}>
                        <Text style={{ fontSize: 36, fontWeight: '800', color: '#0284c7' }}>
                            {formData.name.split(' ').map(n => n[0]).join('').replace('D', '').substring(0, 2).toUpperCase()}
                        </Text>
                    </View>
                    <TouchableOpacity style={{ paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#f1f5f9', borderRadius: 20 }}>
                        <Text style={{ fontSize: 12, fontWeight: '600', color: '#0284c7' }}>Change Photo</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ gap: 20 }}>
                    <View>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Personal Information</Text>

                        <View style={{ marginBottom: 16 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}><User size={16} color="#0ea5e9" /><Text style={{ fontSize: 14, fontWeight: '600', color: '#334155' }}>Full Name</Text></View>
                            <TextInput value={formData.name} onChangeText={(text) => updateField('name', text)} style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 16, fontSize: 16, color: '#0f172a' }} placeholderTextColor="#94a3b8" />
                        </View>

                        <View style={{ marginBottom: 16 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}><Mail size={16} color="#0ea5e9" /><Text style={{ fontSize: 14, fontWeight: '600', color: '#334155' }}>Email Address</Text></View>
                            <TextInput value={formData.email} onChangeText={(text) => updateField('email', text)} style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 16, fontSize: 16, color: '#0f172a' }} placeholderTextColor="#94a3b8" keyboardType="email-address" autoCapitalize="none" />
                        </View>

                        <View style={{ marginBottom: 16 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}><Phone size={16} color="#0ea5e9" /><Text style={{ fontSize: 14, fontWeight: '600', color: '#334155' }}>Phone Number</Text></View>
                            <TextInput value={formData.phone} onChangeText={(text) => updateField('phone', text)} style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 16, fontSize: 16, color: '#0f172a' }} placeholderTextColor="#94a3b8" keyboardType="phone-pad" />
                        </View>
                    </View>

                    <View>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Professional Details</Text>

                        <View style={{ marginBottom: 16 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}><Stethoscope size={16} color="#0ea5e9" /><Text style={{ fontSize: 14, fontWeight: '600', color: '#334155' }}>Specialization</Text></View>
                            <TextInput value={formData.specialization} onChangeText={(text) => updateField('specialization', text)} style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 16, fontSize: 16, color: '#0f172a' }} placeholderTextColor="#94a3b8" />
                        </View>

                        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                            <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}><Award size={16} color="#0ea5e9" /><Text style={{ fontSize: 14, fontWeight: '600', color: '#334155' }}>Experience (Yrs)</Text></View>
                                <TextInput value={formData.experience} onChangeText={(text) => updateField('experience', text)} style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 16, fontSize: 16, color: '#0f172a' }} placeholderTextColor="#94a3b8" keyboardType="numeric" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}><Text style={{ fontSize: 14, fontWeight: '600', color: '#334155' }}>Fee (₹)</Text></View>
                                <TextInput value={formData.consultationFee} onChangeText={(text) => updateField('consultationFee', text)} style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 16, fontSize: 16, color: '#0f172a' }} placeholderTextColor="#94a3b8" keyboardType="numeric" />
                            </View>
                        </View>

                        <View style={{ marginBottom: 16 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}><MapPin size={16} color="#0ea5e9" /><Text style={{ fontSize: 14, fontWeight: '600', color: '#334155' }}>Clinic/Hospital Location</Text></View>
                            <TextInput value={formData.location} onChangeText={(text) => updateField('location', text)} style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 16, fontSize: 16, color: '#0f172a' }} placeholderTextColor="#94a3b8" />
                        </View>

                        <View style={{ marginBottom: 24 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}><FileText size={16} color="#0ea5e9" /><Text style={{ fontSize: 14, fontWeight: '600', color: '#334155' }}>Professional Bio</Text></View>
                            <TextInput value={formData.bio} onChangeText={(text) => updateField('bio', text)} style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 16, fontSize: 16, color: '#0f172a', height: 120 }} placeholderTextColor="#94a3b8" multiline textAlignVertical="top" />
                        </View>
                    </View>

                    {/* Actions Inside ScrollView as requested */}
                    <View style={{ flexDirection: 'row', gap: 12, marginTop: 8, marginBottom: 40 }}>
                        <TouchableOpacity onPress={onBack} style={{ flex: 1, paddingVertical: 16, borderRadius: 16, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 16, fontWeight: '600', color: '#64748b' }}>Cancel</Text>
                        </TouchableOpacity>
                        <Animated.View style={{ flex: 2, transform: [{ scale: saveAnim }] }}>
                            <TouchableOpacity onPress={handleSave} disabled={isSaving} activeOpacity={0.8} style={{ width: '100%', paddingVertical: 16, borderRadius: 16, backgroundColor: '#0284c7', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, opacity: isSaving ? 0.8 : 1 }}>
                                {isSaving ? (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <ActivityIndicator size="small" color="#fff" />
                                        <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>Saving...</Text>
                                    </View>
                                ) : (
                                    <>
                                        <Save size={20} color="#fff" />
                                        <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>Save Changes</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
