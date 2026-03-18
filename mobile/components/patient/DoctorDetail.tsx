import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, TextInput, ActivityIndicator, Dimensions, SafeAreaView } from 'react-native';
import { ArrowLeft, Star, MapPin, Clock, Calendar, Users, Award, Video, CheckCircle2, ChevronRight, ShieldCheck, MessageSquare } from 'lucide-react-native';
import { Doctor, mockDoctors } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { MedCard } from '../ui/MedCard';
import { Button } from '../ui/button';
import { SectionHeader } from '../ui/SectionHeader';
import { colors, spacing, radius, typography, cardShadow } from '@/lib/theme';
import { InitialsAvatar } from '../ui/InitialsAvatar';


const { width } = Dimensions.get('window');

interface DoctorDetailProps { doctor: Doctor; onBack: () => void; onBook: () => void; }

const dates = [
    { label: 'Today', value: 'Mar 14' },
    { label: 'Tomorrow', value: 'Mar 15' },
    { label: 'Mon', value: 'Mar 16' },
    { label: 'Tue', value: 'Mar 17' },
    { label: 'Wed', value: 'Mar 18' },
];

export default function DoctorDetail({ doctor, onBack, onBook }: DoctorDetailProps) {
    const { userName, patientProfile } = useAuth();
    const [selectedDate, setSelectedDate] = useState(dates[0].value);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [selectedType, setSelectedType] = useState<'In-Person' | 'Video Call'>('In-Person');
    const [booked, setBooked] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const [reviews, setReviews] = useState<any[]>([]);
    const [reviewComment, setReviewComment] = useState('');
    const [reviewRating, setReviewRating] = useState(5);
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const docId = (doctor as any)._id || doctor.id;
                if (!docId) return;
                const res = await api.get(`/reviews/${docId}`);
                setReviews(res.data || []);
            } catch (err) {
                console.error('Failed to fetch reviews', err);
            }
        };
        fetchReviews();
    }, [doctor]);

    const handleBook = async () => {
        if (!selectedSlot) return;
        setLoading(true);

        try {
            const docId = (doctor as any)._id || doctor.id;
            await api.post('/appointments', {
                doctorId: docId,
                doctorName: doctor.name,
                patientName: userName,
                patientEmail: patientProfile?.email || '',
                specialization: doctor.specialization,
                date: selectedDate,
                time: selectedSlot,
                type: selectedType,
                avatar: doctor.avatar,
                status: 'upcoming'
            });

            setBooked(true);
            toast({ title: 'Appointment Booked! ✅', description: `Your visit with ${doctor.name} is confirmed.` });
            setTimeout(() => onBook(), 1500);
        } catch (error: any) {
            console.error('Booking failed:', error);
            toast({ title: 'Booking Failed', description: error.response?.data?.message || 'Please try again later', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            {/* Minimal Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border, zIndex: 10 }}>
                <TouchableOpacity onPress={onBack} style={{ width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
                    <ArrowLeft size={20} color={colors.text} />
                </TouchableOpacity>
                <Text style={{ fontSize: 17, fontWeight: '700', color: colors.text }}>Provider Profile</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                {/* Hero Profile Section */}
                <View style={{ backgroundColor: colors.card, paddingHorizontal: 20, paddingTop: 24, paddingBottom: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                    <View style={{ flexDirection: 'row', gap: 20 }}>
                        <InitialsAvatar name={doctor.name} size={110} radius={22} fontSize={40} />
                        <View style={{ flex: 1, justifyContent: 'center' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text, letterSpacing: -0.5 }}>{doctor.name}</Text>
                                <CheckCircle2 size={20} color={colors.primary} />
                            </View>
                            <Text style={{ fontSize: 16, color: colors.primary, fontWeight: '700', marginBottom: 12 }}>{doctor.specialization}</Text>
                            
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFFBEB', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 }}>
                                    <Star size={14} color="#B45309" fill="#B45309" />
                                    <Text style={{ fontSize: 13, fontWeight: '800', color: '#B45309' }}>{doctor.rating}</Text>
                                    <Text style={{ fontSize: 11, color: '#B45309', fontWeight: '600' }}>({reviews.length})</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(148, 163, 184, 0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 }}>
                                    <Award size={14} color={colors.textSecondary} />
                                    <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textSecondary }}>{doctor.experience}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={{ padding: 20, gap: 28 }}>
                    {/* About Section */}
                    <View>
                        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 8, letterSpacing: -0.3 }}>About Specialist</Text>
                        <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 22 }}>
                            {(doctor as any).bio || `${doctor.name} is a highly experienced ${doctor.specialization} with ${doctor.experience} of clinical practice. Recognized for providing comprehensive care and utilizing advanced treatment protocols.`}
                        </Text>
                    </View>

                    {/* Stats Grid */}
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        {[
                            { icon: Users, label: 'Patients', value: `${doctor.patients}+` },
                            { icon: MapPin, label: 'Distance', value: doctor.distance },
                            { icon: ShieldCheck, label: 'License', value: 'Verified' },
                        ].map((stat, i) => (
                            <MedCard key={i} style={{ flex: 1, padding: 16, alignItems: 'center' }}>
                                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(99, 102, 241, 0.08)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                                    <stat.icon size={18} color={colors.primary} />
                                </View>
                                <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }}>{stat.value}</Text>
                                <Text style={{ fontSize: 10, color: colors.textSecondary, fontWeight: '700', textTransform: 'uppercase', marginTop: 2, letterSpacing: 0.5 }}>{stat.label}</Text>
                            </MedCard>
                        ))}
                    </View>

                    {/* Consultation Type */}
                    <View>
                        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 16, letterSpacing: -0.3 }}>Consultation Type</Text>
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            {[
                                { type: 'In-Person' as const, icon: MapPin, desc: 'Clinic Visit' },
                                { type: 'Video Call' as const, icon: Video, desc: 'Telehealth' },
                            ].map((t) => (
                                <TouchableOpacity 
                                    key={t.type} 
                                    onPress={() => setSelectedType(t.type)}
                                    activeOpacity={0.8}
                                    style={{ 
                                        flex: 1, 
                                        padding: 20, 
                                        borderRadius: 20, 
                                        backgroundColor: selectedType === t.type ? colors.card : colors.background,
                                        borderWidth: 2,
                                        borderColor: selectedType === t.type ? colors.primary : colors.border,
                                        ... (selectedType === t.type ? cardShadow : {})
                                    }}
                                >
                                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: selectedType === t.type ? colors.primary : 'rgba(148, 163, 184, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                                        <t.icon size={20} color={selectedType === t.type ? '#FFF' : colors.textSecondary} />
                                    </View>
                                    <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 4 }}>{t.type}</Text>
                                    <Text style={{ fontSize: 12, color: colors.textSecondary, fontWeight: '500' }}>{t.desc}</Text>
                                    
                                    {selectedType === t.type && (
                                        <View style={{ position: 'absolute', top: 12, right: 12 }}>
                                            <CheckCircle2 size={20} color={colors.primary} fill="#FFF" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Date Selection */}
                    <View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, letterSpacing: -0.3 }}>Select Date</Text>
                            <Calendar size={18} color={colors.textSecondary} />
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                            {dates.map(d => (
                                <TouchableOpacity 
                                    key={d.value} 
                                    onPress={() => setSelectedDate(d.value)}
                                    activeOpacity={0.8}
                                    style={{ 
                                        width: 80, 
                                        paddingVertical: 16,
                                        borderRadius: 16, 
                                        backgroundColor: selectedDate === d.value ? colors.primary : colors.card,
                                        borderWidth: 1,
                                        borderColor: selectedDate === d.value ? colors.primary : colors.border,
                                        alignItems: 'center',
                                        ... (selectedDate === d.value ? cardShadow : {})
                                    }}
                                >
                                    <Text style={{ fontSize: 11, fontWeight: '700', color: selectedDate === d.value ? 'rgba(255,255,255,0.7)' : colors.textMuted, marginBottom: 6, textTransform: 'uppercase' }}>{d.label}</Text>
                                    <Text style={{ fontSize: 20, fontWeight: '800', color: selectedDate === d.value ? '#FFF' : colors.text }}>{d.value.split(' ')[1]}</Text>
                                    <Text style={{ fontSize: 11, fontWeight: '700', color: selectedDate === d.value ? 'rgba(255,255,255,0.7)' : colors.textSecondary, marginTop: 4 }}>{d.value.split(' ')[0]}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Time Selection */}
                    <View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, letterSpacing: -0.3 }}>Available Slots</Text>
                            <Clock size={18} color={colors.textSecondary} />
                        </View>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                            {doctor.availableSlots.map(slot => (
                                <TouchableOpacity 
                                    key={slot} 
                                    onPress={() => setSelectedSlot(slot)}
                                    activeOpacity={0.8}
                                    style={{ 
                                        paddingHorizontal: 20, 
                                        paddingVertical: 12, 
                                        borderRadius: 12, 
                                        backgroundColor: selectedSlot === slot ? colors.text : colors.card,
                                        borderWidth: 1,
                                        borderColor: selectedSlot === slot ? colors.text : colors.border,
                                        ... (selectedSlot === slot ? cardShadow : {})
                                    }}
                                >
                                    <Text style={{ fontSize: 14, fontWeight: '700', color: selectedSlot === slot ? '#FFF' : colors.text }}>{slot}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Booking Action */}
                    <MedCard style={{ padding: 24, borderRadius: 24 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <View>
                                <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>Consultation Fee</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
                                    <Text style={{ fontSize: 28, fontWeight: '800', color: colors.text }}>₹{doctor.consultationFee}</Text>
                                    <Text style={{ fontSize: 14, color: colors.textSecondary, fontWeight: '500' }}>/ session</Text>
                                </View>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>Appointment</Text>
                                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.primary, marginTop: 2 }}>{selectedType}</Text>
                            </View>
                        </View>

                        {!selectedSlot && (
                            <View style={{ backgroundColor: '#FFFBEB', borderRadius: 12, padding: 12, marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Clock size={16} color="#D97706" />
                                <Text style={{ fontSize: 13, color: '#D97706', fontWeight: '600' }}>Please select a date and time slot above</Text>
                            </View>
                        )}

                        <TouchableOpacity
                            onPress={handleBook}
                            disabled={!selectedSlot || loading || booked}
                            activeOpacity={0.85}
                            style={{
                                height: 56,
                                borderRadius: 18,
                                backgroundColor: booked
                                    ? '#ECFDF5'
                                    : !selectedSlot || loading
                                    ? colors.border
                                    : colors.primary,
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'row',
                                gap: 10,
                                ...(selectedSlot && !booked && !loading ? cardShadow : {}),
                            }}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFF" size="small" />
                            ) : booked ? (
                                <>
                                    <CheckCircle2 size={22} color={colors.success} />
                                    <Text style={{ color: colors.success, fontWeight: '700', fontSize: 16 }}>Appointment Booked!</Text>
                                </>
                            ) : (
                                <>
                                    <Calendar size={20} color={selectedSlot ? '#FFF' : colors.textMuted} />
                                    <Text style={{ color: selectedSlot ? '#FFF' : colors.textMuted, fontWeight: '700', fontSize: 16 }}>
                                        {selectedSlot ? `Book for ${selectedDate} · ${selectedSlot}` : 'Select a Time Slot First'}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </MedCard>

                    {/* Reviews */}
                    <View style={{ marginTop: 8 }}>
                        <SectionHeader title={`Patient Reviews (${reviews.length})`} />
                        
                        {/* Add Review */}
                        <MedCard style={{ marginBottom: 20, padding: 20, borderRadius: 20 }}>
                            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 12 }}>Share your experience</Text>
                            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
                                {[1, 2, 3, 4, 5].map(s => (
                                    <TouchableOpacity key={s} onPress={() => setReviewRating(s)} activeOpacity={0.7}>
                                        <Star size={28} color={s <= reviewRating ? '#F59E0B' : colors.border} fill={s <= reviewRating ? '#F59E0B' : 'transparent'} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <TextInput 
                                placeholder="How was your visit?"
                                multiline
                                numberOfLines={3}
                                value={reviewComment}
                                onChangeText={setReviewComment}
                                style={{ backgroundColor: colors.background, borderRadius: 16, padding: 16, fontSize: 15, color: colors.text, textAlignVertical: 'top', marginBottom: 16, borderWidth: 1, borderColor: colors.border }}
                            />
                            <Button 
                                disabled={submittingReview || !reviewComment.trim()}
                                onPress={async () => {
                                    setSubmittingReview(true);
                                    try {
                                        const docId = (doctor as any)._id || doctor.id;
                                        const res = await api.post('/reviews', { doctorId: docId, rating: reviewRating, comment: reviewComment });
                                        setReviews([res.data, ...reviews]);
                                        setReviewComment('');
                                        toast({ title: 'Review Submitted', description: 'Thank you for your feedback!' });
                                    } catch (err: any) {
                                        toast({ title: 'Error', description: err.response?.data?.message || 'Failed to submit', variant: 'destructive' });
                                    } finally {
                                        setSubmittingReview(false);
                                    }
                                }}
                                variant="outline"
                                className="w-full rounded-xl"
                            >
                                {submittingReview ? <ActivityIndicator color={colors.text} size="small" /> : <Text style={{ color: colors.text, fontWeight: '700' }}>Post Review</Text>}
                            </Button>
                        </MedCard>

                        {reviews.map((rev, i) => (
                            <MedCard key={i} style={{ marginBottom: 12, padding: 16 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <View>
                                        <Text style={{ fontWeight: '700', color: colors.text, fontSize: 15 }}>{rev.user?.name || 'Anonymous Patient'}</Text>
                                        <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: '600', marginTop: 2 }}>Verified Patient</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', gap: 2 }}>
                                        {[...Array(5)].map((_, idx) => (
                                            <Star key={idx} size={14} color={idx < rev.rating ? '#F59E0B' : colors.border} fill={idx < rev.rating ? '#F59E0B' : 'transparent'} />
                                        ))}
                                    </View>
                                </View>
                                <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 22 }}>{rev.comment}</Text>
                            </MedCard>
                        ))}
                        {reviews.length === 0 && (
                            <View style={{ padding: 40, alignItems: 'center', backgroundColor: colors.card, borderRadius: 20, borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed' }}>
                                <MessageSquare size={32} color={colors.textMuted} />
                                <Text style={{ color: colors.textMuted, marginTop: 12, fontSize: 14, fontWeight: '600' }}>No reviews yet</Text>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
