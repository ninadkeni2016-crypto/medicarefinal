import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { ArrowLeft, Download, CheckCircle2, Pill, FileText, Receipt, Share2, Eye, Calendar } from 'lucide-react-native';
import { Appointment } from '@/lib/mock-data';
import { getAppointmentState } from '@/lib/appointment-state';
import { toast } from '@/hooks/use-toast';

interface Props { appointment: Appointment; onBack: () => void; }

export default function CompletedPage({ appointment, onBack }: Props) {
    const state = getAppointmentState(appointment.id);

    const handleAction = (type: string, action: string) => {
        toast({ title: `${action} ${type}`, description: `${type} is being processed...` });
    };

    const docDate = state.reportDate || appointment.date;
    const finalTotal = Object.values(state.billItems).reduce((s, v) => s + (Number(v) || 0), 0) - (Number(state.discount) || 0) + (((Object.values(state.billItems).reduce((s, v) => s + (Number(v) || 0), 0) - (Number(state.discount) || 0)) * (Number(state.gst) || 0)) / 100);

    const DOCUMENTS = [
        { 
            id: 'prescription',
            title: 'Digital Prescription', 
            desc: `${state.medicines.filter(m => m.name).length} Medication(s)`, 
            date: docDate,
            doctor: appointment.doctorName,
            icon: Pill, 
            color: '#16A34A', 
            bg: '#DCFCE7' 
        },
        { 
            id: 'report',
            title: state.reportName || 'Medical Report', 
            desc: state.reportType || 'Clinical Document', 
            date: docDate,
            doctor: state.labName || appointment.doctorName,
            icon: FileText, 
            color: '#2563EB', 
            bg: '#EFF6FF' 
        },
        { 
            id: 'invoice',
            title: 'Paid Invoice', 
            desc: `Total: ₹${finalTotal.toFixed(2)}`, 
            date: docDate,
            doctor: 'Hospital Billing Desk',
            icon: Receipt, 
            color: '#CA8A04', 
            bg: '#FEF9C3' 
        },
    ];

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#F8FAFC' }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <TouchableOpacity onPress={onBack} style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 }}><ArrowLeft size={20} color="#0F172A" /></TouchableOpacity>
                <View><Text style={{ fontSize: 20, fontWeight: '700', color: '#0F172A' }}>Visit Documents</Text><Text style={{ fontSize: 13, color: '#64748B', fontWeight: '500' }}>Post-Consultation files</Text></View>
            </View>

            {/* Visit Success Banner */}
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 32, borderWidth: 1, borderColor: '#F1F5F9', alignItems: 'center', marginBottom: 24, shadowColor: '#64748B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 }}>
                <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <CheckCircle2 size={32} color="#16A34A" />
                </View>
                <Text style={{ fontSize: 20, fontWeight: '800', color: '#0F172A' }}>Visit Completed</Text>
                <Text style={{ fontSize: 14, color: '#64748B', marginTop: 8, textAlign: 'center', lineHeight: 22 }}>Your medical documents and invoice are ready for download or sharing.</Text>
            </View>

            {/* Documents List */}
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 16, marginLeft: 4 }}>Available Documents</Text>
            
            <View style={{ gap: 16 }}>
                {DOCUMENTS.map((doc) => (
                    <View key={doc.id} style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 16, flex: 1 }}>
                                <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: doc.bg, alignItems: 'center', justifyContent: 'center' }}>
                                    <doc.icon size={24} color={doc.color} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#0F172A' }} numberOfLines={1}>{doc.title}</Text>
                                    <Text style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>{doc.desc}</Text>
                                </View>
                            </View>
                            <View style={{ alignItems: 'flex-end', gap: 6 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                    <Calendar size={12} color="#94A3B8" />
                                    <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '500' }}>{doc.date}</Text>
                                </View>
                                <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '500' }} numberOfLines={1}>By {doc.doctor}</Text>
                            </View>
                        </View>

                        {/* Action Buttons */}
                        <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                            <TouchableOpacity onPress={() => handleAction(doc.title, 'Downloaded')} style={{ flex: 1, height: 40, borderRadius: 10, backgroundColor: '#EFF6FF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                <Download size={14} color="#2563EB" />
                                <Text style={{ fontSize: 13, fontWeight: '600', color: '#2563EB' }}>Download</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleAction(doc.title, 'Preview')} style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' }}>
                                <Eye size={16} color="#64748B" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleAction(doc.title, 'Shared')} style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' }}>
                                <Share2 size={16} color="#64748B" />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </View>

            {/* Need Help Box */}
            <View style={{ marginTop: 32, backgroundColor: '#F8FAFC', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed', alignItems: 'center' }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#475569' }}>Having trouble with documents?</Text>
                <Text style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', marginTop: 6, marginBottom: 12 }}>Contact the hospital desk if any documents are missing or incorrect.</Text>
                <TouchableOpacity style={{ width: '100%', height: 40, borderRadius: 8, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#334155' }}>Contact Support</Text>
                </TouchableOpacity>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}
