import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Search, Phone, Calendar, ChevronRight, User, FileText, MessageSquare } from 'lucide-react-native';
import api from '@/lib/api';
import { colors, spacing, radius, typography, cardShadow, fonts } from '@/lib/theme';
import { MedCard } from '@/components/ui/MedCard';
import { AnimatedListItem } from '@/components/ui/Animations';
import { SkeletonBox } from '@/components/ui/SkeletonBox';

interface Patient {
    _id: string;
    name?: string;
    fullName?: string;
    phone: string;
    age?: number;
    gender?: string;
    lastVisit?: string;
    condition?: string;
    avatar?: string;
    email?: string;
}

const PAGE_SIZE = 10;
const GENDERS = ['All', 'Male', 'Female'];

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function getStatusColor(condition?: string): { bg: string; text: string; label: string } {
    if (!condition) return { bg: '#F0FDF4', text: '#16A34A', label: 'Stable' };
    const c = condition.toLowerCase();
    if (c.includes('critical') || c.includes('urgent')) return { bg: '#FEF2F2', text: '#DC2626', label: 'Critical' };
    if (c.includes('follow') || c.includes('review')) return { bg: '#FFFBEB', text: '#D97706', label: 'Review' };
    return { bg: '#F0FDF4', text: '#16A34A', label: 'Stable' };
}

const AVATAR_COLORS = [
    { bg: '#EFF6FF', text: '#2563EB' },
    { bg: '#F0FDF4', text: '#16A34A' },
    { bg: '#FDF4FF', text: '#9333EA' },
    { bg: '#FFF7ED', text: '#EA580C' },
    { bg: '#F0FDFA', text: '#0D9488' },
    { bg: '#FEF2F2', text: '#DC2626' },
    { bg: '#ECFDF5', text: '#059669' },
    { bg: '#FFFBEB', text: '#D97706' },
];

export default function PatientsList({ onNavigate }: { onNavigate?: (tab: string, data?: any) => void }) {
    const [search, setSearch] = useState('');
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [genderFilter, setGenderFilter] = useState('All');
    const [page, setPage] = useState(0);

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const res = await api.get('/patients');
            setPatients(res.data || []);
        } catch {
            setPatients([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPatients(); }, []);

    const filtered = patients.filter((p) => {
        const name = (p.fullName || p.name || '').toLowerCase();
        const matchSearch = !search || name.includes(search.toLowerCase()) || (p.phone || '').includes(search);
        const matchGender = genderFilter === 'All' || (p.gender || '').toLowerCase() === genderFilter.toLowerCase();
        return matchSearch && matchGender;
    });

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
    const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
    const displayName = (p: Patient) => p.fullName || p.name || 'Patient';

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: colors.background }}
            contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View style={{ marginBottom: 24 }}>
                <Text style={[typography.screenTitle]}>Patients</Text>
                <Text style={[typography.body, { color: colors.textSecondary, marginTop: 4 }]}>
                    {patients.length} registered patients
                </Text>
            </View>

            {/* Search */}
            <View style={{
                flexDirection: 'row', alignItems: 'center', gap: 10,
                backgroundColor: colors.card, borderRadius: 16, paddingHorizontal: 16,
                marginBottom: 16, borderWidth: 1, borderColor: colors.border, height: 52, ...cardShadow,
            }}>
                <Search size={18} color={colors.textMuted} />
                <TextInput
                    value={search}
                    onChangeText={(t) => { setSearch(t); setPage(0); }}
                    placeholder="Search by name or phone…"
                    placeholderTextColor={colors.textMuted}
                    style={{ flex: 1, fontSize: 15, color: colors.text, fontFamily: fonts.regular }}
                />
            </View>

            {/* Gender Filter */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
                {GENDERS.map((g) => (
                    <TouchableOpacity
                        key={g}
                        onPress={() => { setGenderFilter(g); setPage(0); }}
                        activeOpacity={0.7}
                        style={{
                            paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
                            backgroundColor: genderFilter === g ? colors.primary : colors.card,
                            borderWidth: 1, borderColor: genderFilter === g ? colors.primary : colors.border,
                        }}
                    >
                        <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: genderFilter === g ? '#fff' : colors.textSecondary }}>
                            {g}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* List */}
            {loading ? (
                <View style={{ gap: 12 }}>
                    {[1, 2, 3, 4].map((i) => <SkeletonBox key={i} height={88} style={{ borderRadius: 16 }} />)}
                </View>
            ) : paginated.length === 0 ? (
                <MedCard style={{ padding: 32, alignItems: 'center' }}>
                    <User size={40} color={colors.textMuted} />
                    <Text style={[typography.bodyMedium, { color: colors.textSecondary, marginTop: 12, textAlign: 'center' }]}>
                        No patients found.
                    </Text>
                </MedCard>
            ) : (
                <>
                    {paginated.map((patient, idx) => {
                        const name = displayName(patient);
                        const initials = getInitials(name);
                        const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                        const status = getStatusColor(patient.condition);

                        return (
                            <AnimatedListItem key={patient._id} index={idx} staggerMs={55}>
                            <MedCard style={{ marginBottom: 12, padding: 16 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                                    {/* Initials Avatar */}
                                    <View style={{
                                        width: 52, height: 52, borderRadius: 18,
                                        backgroundColor: avatarColor.bg,
                                        alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Text style={{ fontFamily: fonts.bold, fontSize: 18, color: avatarColor.text }}>
                                            {initials}
                                        </Text>
                                    </View>

                                    {/* Info */}
                                    <View style={{ flex: 1 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                                            <Text style={{ fontFamily: fonts.semiBold, fontSize: 16, color: colors.text }}>
                                                {name}
                                            </Text>
                                            <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: status.bg }}>
                                                <Text style={{ fontFamily: fonts.semiBold, fontSize: 11, color: status.text }}>
                                                    {status.label}
                                                </Text>
                                            </View>
                                        </View>

                                        <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, marginBottom: 6 }}>
                                            {[patient.age ? `${patient.age} yrs` : '', patient.gender, patient.condition].filter(Boolean).join('  ·  ')}
                                        </Text>

                                        {patient.lastVisit && (
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 10 }}>
                                                <Calendar size={12} color={colors.textMuted} />
                                                <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted }}>
                                                    Last visit: {patient.lastVisit}
                                                </Text>
                                            </View>
                                        )}

                                        {/* Action Chips */}
                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                            {[
                                                { icon: User, label: 'Profile', tab: 'patient-detail' },
                                                { icon: FileText, label: 'Records', tab: 'reports' },
                                                { icon: MessageSquare, label: 'Message', tab: 'messages' },
                                            ].map(({ icon: Icon, label, tab }) => (
                                                <TouchableOpacity
                                                    key={label}
                                                    onPress={() => onNavigate?.(tab, { patient })}
                                                    activeOpacity={0.7}
                                                    style={{
                                                        flexDirection: 'row', alignItems: 'center', gap: 4,
                                                        paddingVertical: 5, paddingHorizontal: 10,
                                                        borderRadius: 10, backgroundColor: colors.background,
                                                        borderWidth: 1, borderColor: colors.border,
                                                    }}
                                                >
                                                    <Icon size={13} color={colors.primary} />
                                                    <Text style={{ fontFamily: fonts.medium, fontSize: 12, color: colors.primary }}>
                                                        {label}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>

                                    {/* Phone + Chevron */}
                                    <View style={{ alignItems: 'center', gap: 8 }}>
                                        {!!patient.phone && (
                                            <TouchableOpacity
                                                activeOpacity={0.7}
                                                style={{
                                                    width: 36, height: 36, borderRadius: 12,
                                                    backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center',
                                                }}
                                            >
                                                <Phone size={16} color={colors.primary} strokeWidth={2} />
                                            </TouchableOpacity>
                                        )}
                                        <ChevronRight size={16} color={colors.border} />
                                    </View>
                                </View>
                            </MedCard>
                            </AnimatedListItem>
                        );
                    })}

                    {totalPages > 1 && (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                            <TouchableOpacity
                                onPress={() => setPage((p) => Math.max(0, p - 1))}
                                disabled={page === 0}
                                style={{ paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12, backgroundColor: page === 0 ? colors.border : colors.primary }}
                            >
                                <Text style={{ fontFamily: fonts.semiBold, fontSize: 13, color: page === 0 ? colors.textMuted : '#fff' }}>← Prev</Text>
                            </TouchableOpacity>
                            <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary }}>
                                {page + 1} / {totalPages}
                            </Text>
                            <TouchableOpacity
                                onPress={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                                disabled={page >= totalPages - 1}
                                style={{ paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12, backgroundColor: page >= totalPages - 1 ? colors.border : colors.primary }}
                            >
                                <Text style={{ fontFamily: fonts.semiBold, fontSize: 13, color: page >= totalPages - 1 ? colors.textMuted : '#fff' }}>Next →</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </>
            )}
        </ScrollView>
    );
}
