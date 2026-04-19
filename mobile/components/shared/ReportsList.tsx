import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { FileText, Calendar, Download, CheckCircle, Clock as ClockIcon } from 'lucide-react-native';
import { Report } from '@/lib/mock-data';
import { toast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { colors, fonts, spacing, radius, typography } from '@/lib/theme';
import { MedCard } from '../ui/MedCard';
import { ScreenTransition, AnimatedListItem, ScalePress } from '../ui/Animations';

export default function ReportsList() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchReports = async () => {
        try {
            const res = await api.get('/reports');
            setReports(res.data || []);
        } catch (error) {
            console.error('Failed to fetch reports:', error);
            setReports([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const statusConfig: Record<string, { color: string; bg: string; icon: any }> = {
        Ready: { color: colors.success, bg: 'rgba(107, 203, 119, 0.1)', icon: CheckCircle },
        Processing: { color: '#ca8a04', bg: '#fef9c3', icon: ClockIcon },
        Pending: { color: colors.textMuted, bg: colors.border, icon: ClockIcon },
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <ScreenTransition>
            <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                <View style={{ marginBottom: 24 }}>
                    <Text style={[typography.screenTitle, { color: colors.text }]}>Medical Reports</Text>
                    <Text style={[typography.body, { color: colors.textSecondary, marginTop: 4 }]}>{reports.length} Reports Available</Text>
                </View>

                {reports.length === 0 ? (
                    <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                        <FileText size={48} color={colors.border} />
                        <Text style={{ marginTop: 16, color: colors.textMuted, fontFamily: fonts.medium }}>No reports found</Text>
                    </View>
                ) : (
                    reports.map((report, idx) => {
                        const cfg = statusConfig[report.status] || statusConfig.Pending;
                        const StatusIcon = cfg.icon;
                        return (
                            <AnimatedListItem key={report.id || idx} index={idx} staggerMs={40}>
                                <MedCard style={{ marginBottom: 12, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                                    <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(29, 143, 212, 0.08)', alignItems: 'center', justifyContent: 'center' }}>
                                        <FileText size={22} color={colors.primary} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontFamily: fonts.bold, fontSize: 15, color: colors.text }}>{report.name}</Text>
                                        <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>{report.type}</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
                                            <Calendar size={12} color={colors.textMuted} />
                                            <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted }}>{report.date}</Text>
                                        </View>
                                    </View>
                                    <View style={{ alignItems: 'flex-end', gap: 10 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, backgroundColor: cfg.bg }}>
                                            <StatusIcon size={12} color={cfg.color} />
                                            <Text style={{ fontSize: 11, fontFamily: fonts.semiBold, color: cfg.color }}>{report.status}</Text>
                                        </View>
                                        {report.status === 'Ready' && (
                                            <ScalePress onPress={() => toast({ title: '📥 Download starting', description: `${report.name} is being saved to your device.` })}>
                                                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
                                                    <Download size={18} color={colors.primary} />
                                                </View>
                                            </ScalePress>
                                        )}
                                    </View>
                                </MedCard>
                            </AnimatedListItem>
                        );
                    })
                )}
            </ScrollView>
        </ScreenTransition>
    );
}
