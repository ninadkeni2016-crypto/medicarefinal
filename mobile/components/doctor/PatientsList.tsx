import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { Search, Phone, Calendar, ChevronRight } from 'lucide-react-native';

const mockPatients = [
    { id: '0', name: 'Shardul Mahadik', age: 14, gender: 'Male', phone: '+91 98765 00000', lastVisit: 'Mar 8, 2026', condition: 'Polio', avatar: require('../../assets/images/shardul.png') },
    { id: '1', name: 'Arjun Verma', age: 32, gender: 'Male', phone: '+91 98765 43210', lastVisit: 'Mar 6, 2026', condition: 'Hypertension', avatar: 'https://randomuser.me/api/portraits/men/75.jpg' },
    { id: '2', name: 'Kavya Reddy', age: 28, gender: 'Female', phone: '+91 87654 32109', lastVisit: 'Mar 5, 2026', condition: 'Diabetes', avatar: 'https://randomuser.me/api/portraits/women/26.jpg' },
    { id: '3', name: 'Rohan Gupta', age: 45, gender: 'Male', phone: '+91 76543 21098', lastVisit: 'Mar 4, 2026', condition: 'Heart Disease', avatar: 'https://randomuser.me/api/portraits/men/22.jpg' },
    { id: '4', name: 'Sneha Joshi', age: 35, gender: 'Female', phone: '+91 65432 10987', lastVisit: 'Mar 3, 2026', condition: 'Asthma', avatar: 'https://randomuser.me/api/portraits/women/33.jpg' },
    { id: '5', name: 'Aditya Kumar', age: 50, gender: 'Male', phone: '+91 54321 09876', lastVisit: 'Mar 2, 2026', condition: 'Arthritis', avatar: 'https://randomuser.me/api/portraits/men/85.jpg' },
    { id: '6', name: 'Pooja Mehta', age: 22, gender: 'Female', phone: '+91 43210 98765', lastVisit: 'Mar 1, 2026', condition: 'Migraine', avatar: 'https://randomuser.me/api/portraits/women/45.jpg' },
];

export default function PatientsList() {
    const [search, setSearch] = useState('');
    const filtered = search ? mockPatients.filter(p => p.name.toLowerCase().includes(search.toLowerCase())) : mockPatients;

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#0284c7', marginBottom: 4 }}>My Patients</Text>
            <Text style={{ fontSize: 14, color: '#64748b', marginBottom: 12 }}>{mockPatients.length} patients</Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f1f5f9', borderRadius: 12, paddingHorizontal: 12, marginBottom: 16 }}>
                <Search size={16} color="#64748b" />
                <TextInput value={search} onChangeText={setSearch} placeholder="Search patients..." placeholderTextColor="#94a3b8" style={{ flex: 1, paddingVertical: 10, fontSize: 14, color: '#0284c7' }} />
            </View>

            {filtered.map((patient) => (
                <TouchableOpacity key={patient.id} activeOpacity={0.7} style={{ backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#f1f5f9', flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <Image source={typeof patient.avatar === 'string' ? { uri: patient.avatar } : patient.avatar} style={{ width: 48, height: 48, borderRadius: 12 }} contentFit="cover" />
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: '600', fontSize: 14, color: '#0284c7' }}>{patient.name}</Text>
                        <Text style={{ fontSize: 12, color: '#64748b' }}>{patient.age} yrs • {patient.gender} • {patient.condition}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                            <Calendar size={10} color="#64748b" />
                            <Text style={{ fontSize: 11, color: '#64748b' }}>Last: {patient.lastVisit}</Text>
                        </View>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                        <TouchableOpacity activeOpacity={0.7} style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center' }}>
                            <Phone size={14} color="#16a34a" />
                        </TouchableOpacity>
                        <ChevronRight size={14} color="#94a3b8" />
                    </View>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
}
