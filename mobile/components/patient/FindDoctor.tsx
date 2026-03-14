import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Search, Star, MapPin, Clock } from 'lucide-react-native';
import { mockDoctors, Doctor } from '@/lib/mock-data';
import api from '@/lib/api';

const specs = ['All', 'Cardiology', 'Dermatology', 'Neurology', 'Orthopedics', 'Pediatrics'];

interface Props { onSelectDoctor: (d: Doctor) => void; }

export default function FindDoctor({ onSelectDoctor }: Props) {
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [activeSpec, setActiveSpec] = useState('All');
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);

    // Debounce search input
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(handler);
    }, [search]);

    const fetchDoctors = async () => {
        setLoading(true);
        try {
            const params: Record<string, string> = {};
            if (activeSpec !== 'All') params.specialization = activeSpec;
            if (debouncedSearch) params.search = debouncedSearch;
            
            const res = await api.get('/doctors', { params });
            
            // Note: If backend returns empty, we show empty, not mocks (unless error)
            setDoctors(res.data);
        } catch {
            console.warn('Failed to fetch from backend, using mock data fallback for UI testing');
            setDoctors(mockDoctors);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDoctors(); }, [activeSpec, debouncedSearch]);

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#0284c7', marginBottom: 4 }}>Find a Doctor</Text>
            <Text style={{ fontSize: 14, color: '#64748b', marginBottom: 16 }}>
                {loading ? 'Searching...' : `${doctors.length} specialists available`}
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f1f5f9', borderRadius: 12, paddingHorizontal: 12, marginBottom: 16 }}>
                <Search size={16} color="#64748b" />
                <TextInput value={search} onChangeText={setSearch} placeholder="Search doctors..." placeholderTextColor="#94a3b8" style={{ flex: 1, paddingVertical: 10, fontSize: 14, color: '#0284c7' }} />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    {specs.map(s => (
                        <TouchableOpacity key={s} onPress={() => setActiveSpec(s)} activeOpacity={0.7} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: activeSpec === s ? '#0ea5e9' : '#f1f5f9' }}>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: activeSpec === s ? '#fff' : '#64748b' }}>{s}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {loading ? (
                <View style={{ padding: 20, flex: 1, alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#0ea5e9" />
                </View>
            ) : doctors.length === 0 ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                    <Text style={{ color: '#64748b' }}>No doctors found matching criteria.</Text>
                </View>
            ) : doctors.map((doc: any) => (
                <TouchableOpacity key={doc.id || doc._id} onPress={() => onSelectDoctor(doc as Doctor)} activeOpacity={0.7} style={{ backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#f1f5f9', flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <Image source={{ uri: doc.avatar || 'https://images.unsplash.com/photo-1612349317150-e410f624c427?auto=format&fit=crop&q=80&w=150' }} style={{ width: 56, height: 56, borderRadius: 14 }} />
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: '600', fontSize: 14, color: '#0284c7' }}>{doc.name}</Text>
                        <Text style={{ fontSize: 12, color: '#0ea5e9', fontWeight: '500' }}>{doc.specialization}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Star size={12} color="#ca8a04" /><Text style={{ fontSize: 12, fontWeight: '600', color: '#0284c7' }}>{doc.rating}</Text></View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><MapPin size={12} color="#64748b" /><Text style={{ fontSize: 11, color: '#64748b' }}>{doc.distance}</Text></View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Clock size={12} color="#64748b" /><Text style={{ fontSize: 11, color: '#64748b' }}>{doc.availableSlots[0]}</Text></View>
                        </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 16, fontWeight: '700', color: '#0284c7' }}>₹{doc.consultationFee}</Text>
                        <Text style={{ fontSize: 10, color: '#64748b' }}>fee</Text>
                    </View>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
}
