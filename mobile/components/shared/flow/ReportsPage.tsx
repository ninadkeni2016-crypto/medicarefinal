import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { ArrowLeft, FileText, UploadCloud, FileType, CheckCircle2, Calendar, Building2 } from 'lucide-react-native';
import { Appointment } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { getAppointmentState, updateAppointmentState } from '@/lib/appointment-state';
import { toast } from '@/hooks/use-toast';
import api from '@/lib/api';

interface Props { appointment: Appointment; onBack: () => void; }

const REPORT_CATEGORIES = ['Blood Test', 'X-Ray', 'MRI', 'Ultrasound', 'CT Scan'];

export default function ReportsPage({ appointment, onBack }: Props) {
    const { role } = useAuth();
    const state = getAppointmentState(appointment.id);
    const [reportName, setReportName] = useState(state.reportName);
    const [reportType, setReportType] = useState(state.reportType || 'Blood Test');
    const [reportDate, setReportDate] = useState(state.reportDate || new Date().toISOString().split('T')[0]);
    const [labName, setLabName] = useState(state.labName || '');
    const [reportRemarks, setReportRemarks] = useState(state.reportRemarks || '');
    
    // Simulate file upload
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(state.reportName ? `${state.reportName.replace(/\s+/g, '_').toLowerCase()}.pdf` : null);

    const handleSimulateUpload = () => {
        setIsUploading(true);
        setTimeout(() => {
            setUploadedFile(`medical_report_${Math.floor(Math.random() * 10000)}.pdf`);
            setIsUploading(false);
            if (!reportName) setReportName('Comprehensive Health Report');
            if (!labName) setLabName('City Central Lab');
            toast({ title: '📄 Document uploaded successfully' });
        }, 1500);
    };

    const handleSubmit = async () => {
        if (!reportName.trim() || !uploadedFile) { toast({ title: 'Please upload a report and enter a name' }); return; }
        
        try {
            await api.post('/reports', {
                name: reportName,
                type: reportType,
                date: reportDate,
                status: 'Ready',
                labName,
                remarks: reportRemarks,
                doctorName: appointment.doctorName,
                patientName: appointment.patientName
            });
            updateAppointmentState(appointment.id, { 
                reportName, reportType, reportDate, labName, reportRemarks, 
                currentStep: Math.max(state.currentStep, 3) 
            });
            toast({ title: '✅ Reports saved successfully' });
            onBack();
        } catch (error) {
            console.error('Report save failed', error);
            toast({ title: 'Failed to save', variant: 'destructive' });
        }
    };

    if (role === 'patient') {
        return (
            <ScrollView style={{ flex: 1, backgroundColor: '#F8FAFC' }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
                {/* Header */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                    <TouchableOpacity onPress={onBack} style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 }}><ArrowLeft size={20} color="#0F172A" /></TouchableOpacity>
                    <View style={{ flex: 1 }}><Text style={{ fontSize: 20, fontWeight: '700', color: '#0F172A' }}>Clinical Reports</Text><Text style={{ fontSize: 13, color: '#64748B', fontWeight: '500' }}>Prescribed by {appointment.doctorName}</Text></View>
                </View>

                {state.reportName ? (
                    <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                            <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' }}>
                                <FileText size={24} color="#2563EB" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 16, fontWeight: '700', color: '#0F172A' }}>{state.reportName}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#16A34A' }} />
                                    <Text style={{ fontSize: 12, color: '#16A34A', fontWeight: '600' }}>Ready for Review</Text>
                                </View>
                            </View>
                        </View>

                        <View style={{ backgroundColor: '#F8FAFC', borderRadius: 12, padding: 16, gap: 12 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ fontSize: 13, color: '#64748B', fontWeight: '500' }}>Test Category</Text>
                                <Text style={{ fontSize: 14, color: '#0F172A', fontWeight: '600' }}>{state.reportType}</Text>
                            </View>
                            <View style={{ height: 1, backgroundColor: '#F1F5F9' }} />
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>INV-{String(appointment.id).padStart(5, '0')}</Text>
                                <Text style={{ fontSize: 14, color: '#0F172A', fontWeight: '600' }}>{state.reportDate}</Text>
                            </View>
                            <View style={{ height: 1, backgroundColor: '#F1F5F9' }} />
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ fontSize: 13, color: '#64748B', fontWeight: '500' }}>Laboratory</Text>
                                <Text style={{ fontSize: 14, color: '#0F172A', fontWeight: '600' }}>{state.labName || 'Not specified'}</Text>
                            </View>
                        </View>

                        {state.reportRemarks ? (
                            <View style={{ marginTop: 16 }}>
                                <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748B', textTransform: 'uppercase', marginBottom: 6 }}>Clinical Remarks</Text>
                                <Text style={{ fontSize: 14, color: '#334155', lineHeight: 20 }}>{state.reportRemarks}</Text>
                            </View>
                        ) : null}

                        <TouchableOpacity style={{ marginTop: 24, width: '100%', height: 48, borderRadius: 12, backgroundColor: '#EFF6FF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            <FileText size={18} color="#2563EB" />
                            <Text style={{ color: '#2563EB', fontWeight: '700', fontSize: 14 }}>View Full Document</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 }}>
                        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                            <FileType size={40} color="#CBD5E1" />
                        </View>
                        <Text style={{ fontSize: 16, fontWeight: '700', color: '#334155', textAlign: 'center' }}>No reports uploaded yet</Text>
                        <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 8 }}>The doctor has not uploaded any reports for this visit.</Text>
                    </View>
                )}
            </ScrollView>
        );
    }

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#F8FAFC' }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <TouchableOpacity onPress={onBack} style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 }}><ArrowLeft size={20} color="#0F172A" /></TouchableOpacity>
                <View><Text style={{ fontSize: 20, fontWeight: '700', color: '#0F172A' }}>Upload Reports</Text><Text style={{ fontSize: 13, color: '#64748B', fontWeight: '500' }}>Patient: {appointment.patientName}</Text></View>
            </View>

            {/* Document Upload Area */}
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 16 }}>Attach Medical Documents</Text>

                {uploadedFile ? (
                    <View style={{ backgroundColor: '#F0FDF4', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#BBF7D0', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                            <View style={{ width: 40, height: 40, backgroundColor: '#FFFFFF', borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
                                <FileText size={20} color="#16A34A" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 14, fontWeight: '600', color: '#166534' }} numberOfLines={1}>{uploadedFile}</Text>
                                <Text style={{ fontSize: 12, color: '#15803D' }}>2.4 MB • PDF</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => setUploadedFile(null)} style={{ padding: 8 }}>
                            <Text style={{ color: '#166534', fontWeight: '600', fontSize: 13 }}>Remove</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity 
                        onPress={handleSimulateUpload} 
                        disabled={isUploading}
                        style={{ 
                            borderWidth: 2, borderStyle: 'dashed', borderColor: isUploading ? '#93C5FD' : '#BFDBFE', 
                            borderRadius: 16, backgroundColor: '#EFF6FF', 
                            padding: 32, alignItems: 'center', justifyContent: 'center' 
                        }}
                    >
                        {isUploading ? (
                            <>
                                <UploadCloud size={36} color="#3B82F6" />
                                <Text style={{ fontSize: 15, fontWeight: '600', color: '#2563EB', marginTop: 12 }}>Uploading...</Text>
                            </>
                        ) : (
                            <>
                                <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 }}>
                                    <UploadCloud size={28} color="#2563EB" />
                                </View>
                                <Text style={{ fontSize: 16, fontWeight: '700', color: '#1E3A8A' }}>Tap to browse files</Text>
                                <Text style={{ fontSize: 13, color: '#60A5FA', marginTop: 8, textAlign: 'center' }}>Supports PDF, JPG, PNG, DICOM{'\n'}(Max size: 20MB)</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}
            </View>

            {/* Category Selection */}
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 12 }}>Report Category</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {REPORT_CATEGORIES.map(t => (
                        <TouchableOpacity 
                            key={t} 
                            onPress={() => setReportType(t)} 
                            style={{ 
                                paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, 
                                backgroundColor: reportType === t ? '#2563EB' : '#F8FAFC',
                                borderWidth: 1,
                                borderColor: reportType === t ? '#2563EB' : '#E2E8F0',
                                flexDirection: 'row', alignItems: 'center', gap: 6
                            }}
                        >
                            {reportType === t && <CheckCircle2 size={16} color="#FFFFFF" />}
                            <Text style={{ fontSize: 14, fontWeight: '600', color: reportType === t ? '#FFFFFF' : '#475569' }}>{t}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Report Metadata */}
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 30, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 16 }}>Clinical Metadata</Text>
                
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748B', marginBottom: 8, marginLeft: 4 }}>Report Title</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, paddingHorizontal: 16, height: 52, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 }}>
                    <View style={{ marginRight: 10 }}><FileText size={18} color="#94A3B8" /></View>
                    <TextInput value={reportName} onChangeText={setReportName} placeholder="E.g., Complete Blood Count Profile" placeholderTextColor="#94A3B8" style={{ flex: 1, fontSize: 15, color: '#0F172A', fontWeight: '500' }} />
                </View>

                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748B', marginBottom: 8, marginLeft: 4 }}>Date Performed</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, paddingHorizontal: 16, height: 52, borderWidth: 1, borderColor: '#E2E8F0' }}>
                            <View style={{ marginRight: 10 }}><Calendar size={18} color="#94A3B8" /></View>
                            <TextInput value={reportDate} onChangeText={setReportDate} placeholder="YYYY-MM-DD" placeholderTextColor="#94A3B8" style={{ flex: 1, fontSize: 15, color: '#0F172A', fontWeight: '500' }} />
                        </View>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748B', marginBottom: 8, marginLeft: 4 }}>Laboratory</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, paddingHorizontal: 16, height: 52, borderWidth: 1, borderColor: '#E2E8F0' }}>
                            <View style={{ marginRight: 10 }}><Building2 size={18} color="#94A3B8" /></View>
                            <TextInput value={labName} onChangeText={setLabName} placeholder="Lab Name" placeholderTextColor="#94A3B8" style={{ flex: 1, fontSize: 15, color: '#0F172A', fontWeight: '500' }} />
                        </View>
                    </View>
                </View>

                <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748B', marginBottom: 8, marginLeft: 4 }}>Doctor's Remarks (Optional)</Text>
                <TextInput 
                    value={reportRemarks} 
                    onChangeText={setReportRemarks} 
                    placeholder="Enter interpretation or findings..." 
                    placeholderTextColor="#94A3B8" 
                    multiline 
                    style={{ width: '100%', height: 100, borderRadius: 12, backgroundColor: '#F8FAFC', padding: 16, fontSize: 15, color: '#0F172A', borderWidth: 1, borderColor: '#E2E8F0' }} 
                    textAlignVertical="top" 
                />
            </View>

            {/* Actions */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity onPress={onBack} style={{ flex: 1, height: 56, borderRadius: 16, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' }}><Text style={{ fontSize: 16, fontWeight: '700', color: '#475569' }}>Cancel</Text></TouchableOpacity>
                <TouchableOpacity onPress={handleSubmit} style={{ flex: 1.5, height: 56, borderRadius: 16, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }}><Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF' }}>Save Report</Text></TouchableOpacity>
            </View>
        </ScrollView>
    );
}
