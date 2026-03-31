import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, RefreshControl, Animated, Platform } from 'react-native';
import { Search, Phone, Calendar, ChevronRight, User, FileText, MessageSquare, Filter, UserRound } from 'lucide-react-native';
import api from '@/lib/api';
import { colors, spacing, radius, typography, cardShadow, fonts, Shadows } from '@/lib/theme';
import { MedCard } from '@/components/ui/MedCard';
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
    status?: string;
    avatar?: string;
    email?: string;
}

const GENDERS = ['All', 'Male', 'Female'];

function getInitials(name: string): string {
    if (!name) return 'PT';
    return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

function getStatusColor(status?: string, condition?: string): { bg: string; text: string; label: string } {
    const s = (status || condition || '').toLowerCase();
    if (s.includes('critical') || s.includes('urgent')) return { bg: '#FEF2F2', text: '#DC2626', label: 'Critical' };
    if (s.includes('follow') || s.includes('review')) return { bg: '#FFFBEB', text: '#D97706', label: 'Review' };
    return { bg: '#F0FDF4', text: '#16A34A', label: 'Stable' };
}

const AVATAR_COLORS = [
    { bg: '#EFF6FF', text: '#2563EB' },
    { bg: '#F0FDF4', text: '#16A34A' },
    { bg: '#FDF4FF', text: '#9333EA' },
    { bg: '#FFF7ED', text: '#EA580C' },
    { bg: '#F0FDFA', text: '#0D9488' },
];

const FilterChip = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => {
    const scale = useRef(new Animated.Value(active ? 1.05 : 1)).current;

    useEffect(() => {
        Animated.spring(scale, {
            toValue: active ? 1.05 : 1,
            useNativeDriver: true,
            friction: 5,
        }).start();
    }, [active]);

    return (
        <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
            <Animated.View style={{
                transform: [{ scale }],
                paddingHorizontal: 20, paddingVertical: 10, borderRadius: 24,
                backgroundColor: active ? colors.primary : colors.card,
                borderWidth: 1, borderColor: active ? colors.primary : colors.border,
                ...Shadows.sm as object
            }}>
                <Text style={{ fontFamily: active ? fonts.bold : fonts.medium, fontSize: 13, color: active ? '#fff' : colors.textSecondary }}>
                    {label}
                </Text>
            </Animated.View>
        </TouchableOpacity>
    );
};

const PatientCard = ({ patient, index, onNavigate }: { patient: Patient, index: number, onNavigate: any }) => {
    const scale = useRef(new Animated.Value(1)).current;
    const name = patient.fullName || patient.name || 'Unknown Patient';
    const initials = getInitials(name);
    const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
    const status = getStatusColor(patient.status, patient.condition);
    
    // Format date properly if it's a timestamp
    let visitDate = patient.lastVisit || 'First visit';
    if (visitDate && visitDate.includes('T')) {
        visitDate = new Date(visitDate).toLocaleDateString();
    }

    const handlePressIn = () => Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }).start();
    const handlePressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

    return (
        <Animated.View style={{ transform: [{ scale }], marginBottom: 14 }}>
            <TouchableOpacity activeOpacity={1} onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={() => onNavigate('patient-detail', { patient })}>
                <View style={{
                    backgroundColor: colors.card,
                    borderRadius: radius.xl,
                    padding: 16,
                    borderWidth: 1, borderColor: colors.border,
                    ...cardShadow as object
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                        <View style={{
                            width: 52, height: 52, borderRadius: 16,
                            backgroundColor: avatarColor.bg,
                            alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Text style={{ fontFamily: fonts.bold, fontSize: 18, color: avatarColor.text }}>
                                {initials}
                            </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <Text style={{ fontFamily: fonts.bold, fontSize: 16, color: colors.text }}>
                                    {name}
                                </Text>
                            </View>
                            <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary }}>
                                {[patient.age ? `${patient.age} yrs` : '', patient.gender].filter(Boolean).join(' · ')}
                            </Text>
                        </View>
                        <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: status.bg }}>
                            <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: status.text }}>
                                {status.label}
                            </Text>
                        </View>
                    </View>
                    
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16, backgroundColor: colors.background, padding: 8, borderRadius: 10 }}>
                        <Calendar size={14} color={colors.textMuted} />
                        <Text style={{ fontFamily: fonts.medium, fontSize: 12, color: colors.textSecondary }}>
                            Last visit: {visitDate}
                        </Text>
                    </View>

                    {/* Actions */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        {!!patient.phone && (
                            <TouchableOpacity activeOpacity={0.7} style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' }}>
                                <Phone size={18} color="#2563EB" />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={(e) => { e.stopPropagation(); onNavigate('messages', { patient }); }} activeOpacity={0.7} style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center' }}>
                            <MessageSquare size={18} color="#16A34A" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={(e) => { e.stopPropagation(); onNavigate('reports', { patient }); }} activeOpacity={0.7} style={{ flex: 1, height: 44, borderRadius: 14, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                            <FileText size={16} color={colors.primary} />
                            <Text style={{ fontFamily: fonts.bold, fontSize: 13, color: colors.primary }}>Records</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={(e) => { e.stopPropagation(); onNavigate('patient-detail', { patient }); }} activeOpacity={0.7} style={{ flex: 1, height: 44, borderRadius: 14, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                            <User size={16} color="#fff" />
                            <Text style={{ fontFamily: fonts.bold, fontSize: 13, color: '#fff' }}>Profile</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

export default function PatientsList({ onNavigate }: { onNavigate?: (tab: string, data?: any) => void }) {
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [genderFilter, setGenderFilter] = useState('All');
    
    // Animated search focus
    const [isFocused, setIsFocused] = useState(false);
    const searchBorderAnim = useRef(new Animated.Value(0)).current;

    const fetchPatients = async () => {
        try {
            // Priority: Explicit Doctor Patients fallback Custom Patient endpoints
            let res = await api.get('/patients/doctor').catch(() => null);
            if (!res || !res.data || res.data.length === 0) {
                res = await api.get('/patients').catch(() => ({ data: [] }));
            }
            setPatients(res?.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchPatients(); }, []);

    // Debounce search
    useEffect(() => {
        const handler = setTimeout(() => { setDebouncedSearch(search); }, 400);
        return () => clearTimeout(handler);
    }, [search]);

    // Search focus animation
    useEffect(() => {
        Animated.timing(searchBorderAnim, {
            toValue: isFocused ? 1 : 0,
            duration: 200,
            useNativeDriver: false
        }).start();
    }, [isFocused]);

    const borderInterpolation = searchBorderAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [colors.border, colors.primary]
    });

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchPatients();
    }, []);

    const filtered = patients.filter((p) => {
        const name = (p.fullName || p.name || '').toLowerCase();
        const loweredSearch = debouncedSearch.toLowerCase();
        const matchSearch = !debouncedSearch || name.includes(loweredSearch) || (p.phone || '').includes(loweredSearch);
        const matchGender = genderFilter === 'All' || (p.gender || '').toLowerCase() === genderFilter.toLowerCase();
        return matchSearch && matchGender;
    });

    const renderHeader = () => (
        <View style={{ marginBottom: 16 }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <View>
                    <Text style={[typography.screenTitle]}>Patients</Text>
                    <Text style={[typography.body, { color: colors.primary, marginTop: 4, fontFamily: fonts.semiBold }]}>
                        {patients.length} registered patients
                    </Text>
                </View>
                <TouchableOpacity style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', ...Shadows.sm as object }}>
                    <Filter size={20} color={colors.text} />
                </TouchableOpacity>
            </View>

            {/* Search */}
            <Animated.View style={{
                flexDirection: 'row', alignItems: 'center', gap: 12,
                backgroundColor: isFocused ? '#fff' : colors.card,
                borderRadius: 16, paddingHorizontal: 16,
                marginBottom: 16, borderWidth: 1, 
                borderColor: borderInterpolation, 
                height: 56, ...Shadows.md as object,
            }}>
                <Search size={20} color={isFocused ? colors.primary : colors.textMuted} />
                <TextInput
                    value={search}
                    onChangeText={setSearch}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Search by name or phone…"
                    placeholderTextColor={colors.textMuted}
                    style={{ flex: 1, fontSize: 16, color: colors.text, fontFamily: fonts.medium }}
                />
            </Animated.View>

            {/* Gender Filter Chips */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8, paddingBottom: 4 }}>
                {GENDERS.map((g) => (
                    <FilterChip key={g} label={g} active={genderFilter === g} onPress={() => setGenderFilter(g)} />
                ))}
            </View>
        </View>
    );

    const renderEmpty = () => {
        if (loading) return null;
        return (
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
                <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <UserRound size={40} color={colors.textMuted} />
                </View>
                <Text style={{ fontFamily: fonts.bold, fontSize: 18, color: colors.text, marginBottom: 8 }}>No patients found</Text>
                <Text style={{ fontFamily: fonts.medium, fontSize: 14, color: colors.textSecondary, textAlign: 'center', maxWidth: 250 }}>
                    {debouncedSearch ? "Try adjusting your search or filters." : "You have no registered patients yet."}
                </Text>
            </View>
        );
    };

    if (loading && !refreshing && patients.length === 0) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.background, padding: 20 }}>
                {renderHeader()}
                {[1, 2, 3, 4].map((i) => <SkeletonBox key={i} height={160} style={{ borderRadius: 16, marginBottom: 14 }} />)}
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <FlatList
                data={filtered}
                keyExtractor={(item) => item._id}
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmpty}
                renderItem={({ item, index }) => (
                    <PatientCard patient={item} index={index} onNavigate={onNavigate} />
                )}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />
                }
            />
        </View>
    );
}
