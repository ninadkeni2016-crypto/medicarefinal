import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, Dimensions, SafeAreaView, Linking } from 'react-native';
import { Search, Star, MapPin, CheckCircle2, SlidersHorizontal } from 'lucide-react-native';
import { Doctor } from '@/lib/mock-data';
import api from '@/lib/api';
import { MedCard } from '../ui/MedCard';
import { AnimatedListItem } from '../ui/Animations';
import { InitialsAvatar } from '../ui/InitialsAvatar';
import { colors, spacing, radius, typography, cardShadow, fonts } from '@/lib/theme';

const { width } = Dimensions.get('window');
const specs = ['All', 'Cardiologist', 'Dermatologist', 'Pediatrician', 'Orthopedic', 'Neurologist', 'Gynecologist', 'Endocrinologist', 'Psychiatrist', 'Ophthalmologist', 'Pulmonologist', 'Gastroenterologist', 'Oncologist', 'Urologist', 'General Medicine'];

export default function FindDoctor({ onSelectDoctor }: { onSelectDoctor: (d: Doctor) => void }) {
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [activeSpec, setActiveSpec] = useState('All');
    const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(handler);
    }, [search]);

    // Fetch from API on mount
    useEffect(() => {
        api.get('/doctors')
            .then((res) => {
                setAllDoctors(res.data || []);
            })
            .catch(() => {
                setAllDoctors([]);
            });
    }, []);

    // Client-side filtering (no network call needed for spec/search changes)
    const filtered = allDoctors.filter((doc) => {
        const matchSpec = activeSpec === 'All' || doc.specialization === activeSpec;
        const q = debouncedSearch.toLowerCase();
        const matchSearch = !q || doc.name.toLowerCase().includes(q) || (doc.specialization || '').toLowerCase().includes(q);
        return matchSpec && matchSearch;
    });

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                    <View>
                        <Text style={{ fontFamily: fonts.semiBold, fontSize: 12, color: colors.primary, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 4 }}>
                            Medical Network
                        </Text>
                        <Text style={typography.screenTitle}>Find Specialists</Text>
                        <Text style={[typography.body, { color: colors.textSecondary, marginTop: 4 }]}>
                            {filtered.length} doctors available
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => Linking.openURL('https://www.google.com/maps/search/doctors+near+me')}
                        activeOpacity={0.7}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: '#FFFFFF',
                            paddingHorizontal: 14,
                            paddingVertical: 8,
                            borderRadius: 24,
                            gap: 6,
                            ...cardShadow,
                            borderWidth: 1,
                            borderColor: colors.border || '#E5E7EB',
                        }}
                    >
                        <MapPin size={14} color={colors.primary} />
                        <Text style={{ fontFamily: fonts.semiBold, fontSize: 12, color: colors.primary }}>
                            Find My Doctor
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Search & Filter Bar */}
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
                    <View style={{
                        flex: 1, flexDirection: 'row', alignItems: 'center',
                        backgroundColor: colors.card, borderRadius: 16,
                        paddingHorizontal: 16, borderWidth: 1, borderColor: colors.border,
                        height: 52, ...cardShadow,
                    }}>
                        <Search size={18} color={colors.textMuted} />
                        <TextInput
                            value={search}
                            onChangeText={setSearch}
                            placeholder="Doctor name or specialty..."
                            placeholderTextColor={colors.textMuted}
                            style={{ flex: 1, marginLeft: 10, fontSize: 15, color: colors.text, fontFamily: fonts.regular }}
                        />
                    </View>
                    <TouchableOpacity style={{
                        width: 52, height: 52, borderRadius: 16,
                        backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center',
                        borderWidth: 1, borderColor: colors.border, ...cardShadow,
                    }}>
                        <SlidersHorizontal size={18} color={colors.primary} strokeWidth={2.5} />
                    </TouchableOpacity>
                </View>

                {/* Specialization Chips */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginBottom: 24 }}
                    contentContainerStyle={{ gap: 8, paddingRight: 8 }}
                >
                    {specs.map((s) => (
                        <TouchableOpacity
                            key={s}
                            onPress={() => setActiveSpec(s)}
                            activeOpacity={0.8}
                            style={{
                                paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20,
                                backgroundColor: activeSpec === s ? colors.primary : colors.card,
                                borderWidth: 1,
                                borderColor: activeSpec === s ? colors.primary : colors.border,
                            }}
                        >
                            <Text style={{
                                fontFamily: fonts.semiBold, fontSize: 13,
                                color: activeSpec === s ? '#FFF' : colors.textSecondary,
                            }}>
                                {s}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Doctor Cards */}
                {filtered.length === 0 ? (
                    <View style={{ padding: 60, alignItems: 'center' }}>
                        <Search size={40} color={colors.textMuted} />
                        <Text style={[typography.bodyMedium, { color: colors.text, marginTop: 16 }]}>
                            No Specialists Found
                        </Text>
                        <Text style={[typography.body, { color: colors.textSecondary, marginTop: 6, textAlign: 'center' }]}>
                            Try adjusting your search or specialization filter.
                        </Text>
                    </View>
                ) : (
                    filtered.map((doc: any, idx: number) => (
                        <AnimatedListItem key={doc.id || doc._id} index={idx} staggerMs={50}>
                            <MedCard
                                onPress={() => onSelectDoctor(doc as Doctor)}
                                style={{ marginBottom: 14, padding: 16 }}
                            >
                                <View style={{ flexDirection: 'row', gap: 14 }}>
                                    {/* Avatar */}
                                    <View style={{ position: 'relative' }}>
                                        <InitialsAvatar name={doc.name} size={76} radius={20} />
                                        <View style={{
                                            position: 'absolute', bottom: -4, right: -4,
                                            backgroundColor: '#FFF', borderRadius: 10, padding: 2,
                                        }}>
                                            <CheckCircle2 size={15} color={colors.primary} fill="#FFF" />
                                        </View>
                                    </View>

                                    {/* Info */}
                                    <View style={{ flex: 1 }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <View style={{ flex: 1, marginRight: 8 }}>
                                                <Text style={{ fontFamily: fonts.semiBold, fontSize: 16, color: colors.text }} numberOfLines={1}>
                                                    {doc.name}
                                                </Text>
                                                <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.primary, marginTop: 2 }}>
                                                    {doc.specialization}
                                                </Text>
                                            </View>
                                            <View style={{ alignItems: 'flex-end' }}>
                                                <Text style={{ fontFamily: fonts.bold, fontSize: 15, color: colors.text }}>
                                                    ₹{doc.consultationFee}
                                                </Text>
                                                <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted }}>
                                                    / session
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 }}>
                                            {/* Rating */}
                                            <View style={{
                                                backgroundColor: '#FFFBEB', paddingHorizontal: 8, paddingVertical: 3,
                                                borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4,
                                            }}>
                                                <Star size={11} color="#B45309" fill="#B45309" />
                                                <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: '#B45309' }}>
                                                    {doc.rating || '4.8'}
                                                </Text>
                                            </View>

                                            <View style={{ width: 1, height: 12, backgroundColor: colors.border }} />

                                            <Text style={{ fontFamily: fonts.medium, fontSize: 12, color: colors.textSecondary }}>
                                                {doc.experience || '10+'} Yrs Exp
                                            </Text>

                                            {doc.patients ? (
                                                <>
                                                    <View style={{ width: 1, height: 12, backgroundColor: colors.border }} />
                                                    <Text style={{ fontFamily: fonts.medium, fontSize: 12, color: colors.textSecondary }}>
                                                        {doc.patients > 999 ? `${(doc.patients / 1000).toFixed(1)}k` : doc.patients} patients
                                                    </Text>
                                                </>
                                            ) : null}
                                        </View>

                                        {(doc.address || doc.location) && (
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 }}>
                                                <MapPin size={11} color={colors.textMuted} />
                                                <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted }} numberOfLines={1}>
                                                    {doc.address || doc.location}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </MedCard>
                        </AnimatedListItem>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
