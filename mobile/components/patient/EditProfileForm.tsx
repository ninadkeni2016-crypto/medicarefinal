import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { ArrowLeft, Save } from 'lucide-react-native';
import { useAuth, PatientProfile as ProfileType } from '@/contexts/AuthContext';
import api from '@/lib/api';

const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

interface EditProfileFormProps { onBack: () => void; }

export default function EditProfileForm({ onBack }: EditProfileFormProps) {
    const { patientProfile, updatePatientProfile } = useAuth();
    const [form, setForm] = useState<ProfileType>({ ...patientProfile });
    const [saved, setSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch latest profile from backend on mount
    useEffect(() => {
        api.get('/patients/profile')
            .then(res => {
                const data = res.data;
                const merged: ProfileType = {
                    fullName: data.fullName || patientProfile.fullName,
                    email: data.email || patientProfile.email,
                    phone: data.phone || '',
                    dateOfBirth: data.dateOfBirth || '',
                    gender: data.gender || '',
                    bloodGroup: data.bloodGroup || '',
                    height: data.height || '',
                    weight: data.weight || '',
                    address: data.address || '',
                    city: data.city || '',
                    emergencyContactName: data.emergencyContactName || '',
                    emergencyContactPhone: data.emergencyContactPhone || '',
                    allergies: data.allergies || '',
                    chronicConditions: data.chronicConditions || '',
                    currentMedications: data.currentMedications || '',
                    pastSurgeries: data.pastSurgeries || '',
                    insuranceProvider: data.insuranceProvider || '',
                    insurancePolicyNumber: data.insurancePolicyNumber || '',
                };
                setForm(merged);
            })
            .catch(err => console.error('Failed to load profile', err))
            .finally(() => setIsLoading(false));
    }, []);

    const update = (field: keyof ProfileType, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await api.put('/patients/profile', form);
            updatePatientProfile(form); // also update local context
            setSaved(true);
            setTimeout(() => { setSaved(false); onBack(); }, 1000);
        } catch (err) {
            console.error('Failed to save profile', err);
        } finally {
            setIsSaving(false);
        }
    };

    const renderField = (label: string, field: keyof ProfileType, placeholder: string) => (
        <View style={{ marginBottom: 12 }} key={field}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#0284c7', marginBottom: 6 }}>{label}</Text>
            <TextInput
                value={form[field]}
                onChangeText={(v) => update(field, v)}
                placeholder={placeholder}
                placeholderTextColor="#94a3b8"
                style={{ width: '100%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#fff', color: '#0284c7', fontSize: 14 }}
            />
        </View>
    );

    const renderSelectRow = (label: string, options: string[], field: keyof ProfileType) => (
        <View style={{ marginBottom: 12 }} key={field}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#0284c7', marginBottom: 6 }}>{label}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                    {options.map(opt => (
                        <TouchableOpacity key={opt} onPress={() => update(field, opt)} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: form[field] === opt ? '#0ea5e9' : '#f1f5f9' }}>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: form[field] === opt ? '#fff' : '#334155' }}>{opt}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );

    const renderSectionHeader = (title: string) => (
        <Text style={{ fontSize: 11, fontWeight: '700', color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: 1, paddingTop: 12, paddingBottom: 4 }}>{title}</Text>
    );

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView style={{ flex: 1, backgroundColor: '#f8fafc' }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {/* Header */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <TouchableOpacity onPress={onBack} style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                        <ArrowLeft size={16} color="#334155" />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: '#0284c7', flex: 1 }}>Edit Profile</Text>
                </View>

                <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#f1f5f9' }}>
                    {renderSectionHeader('Personal Information')}
                    {renderField('Full Name *', 'fullName', 'Enter your full name')}
                    {renderField('Email', 'email', 'you@email.com')}
                    {renderField('Phone', 'phone', '+91 98765 43210')}
                    {renderSelectRow('Gender', genderOptions, 'gender')}

                    {renderSectionHeader('Physical Details')}
                    {renderSelectRow('Blood Group', bloodGroups, 'bloodGroup')}
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        <View style={{ flex: 1 }}>{renderField('Height (cm)', 'height', '170')}</View>
                        <View style={{ flex: 1 }}>{renderField('Weight (kg)', 'weight', '70')}</View>
                    </View>

                    {renderSectionHeader('Address')}
                    {renderField('Address', 'address', 'Street address')}
                    {renderField('City', 'city', 'City')}

                    {renderSectionHeader('Emergency Contact')}
                    {renderField('Contact Name', 'emergencyContactName', 'Emergency contact name')}
                    {renderField('Contact Phone', 'emergencyContactPhone', 'Phone number')}

                    {renderSectionHeader('Medical History')}
                    {renderField('Known Allergies', 'allergies', 'e.g., Penicillin, Peanuts...')}
                    {renderField('Chronic Conditions', 'chronicConditions', 'e.g., Diabetes, Hypertension...')}
                    {renderField('Current Medications', 'currentMedications', 'e.g., Metformin 500mg...')}
                    {renderField('Past Surgeries', 'pastSurgeries', 'e.g., Appendectomy (2020)...')}

                    {renderSectionHeader('Insurance Details')}
                    {renderField('Insurance Provider', 'insuranceProvider', 'Provider name')}
                    {renderField('Policy Number', 'insurancePolicyNumber', 'Policy #')}
                </View>

                {/* Save Button */}
                <TouchableOpacity onPress={handleSave} style={{ marginTop: 16, width: '100%', paddingVertical: 14, borderRadius: 12, backgroundColor: saved ? '#16a34a' : '#0ea5e9', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Save size={16} color="#ffffff" />
                    <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>{saved ? 'Profile Saved!' : 'Save Profile'}</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

