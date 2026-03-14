import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, TextInput, ActivityIndicator } from 'react-native';
import { ArrowLeft, Star, MapPin, Clock, Calendar, Users, Award, Video, CheckCircle, Send } from 'lucide-react-native';
import { Doctor } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface DoctorDetailProps { doctor: Doctor; onBack: () => void; onBook: () => void; }

const dates = [
    { label: 'Today', value: 'Mar 8' },
    { label: 'Tomorrow', value: 'Mar 9' },
    { label: 'Mon', value: 'Mar 10' },
    { label: 'Tue', value: 'Mar 11' },
    { label: 'Wed', value: 'Mar 12' },
];

export default function DoctorDetail({ doctor, onBack, onBook }: DoctorDetailProps) {
    const { userName, patientProfile } = useAuth();
    const [selectedDate, setSelectedDate] = useState(dates[0].value);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [selectedType, setSelectedType] = useState<'In-Person' | 'Video Call'>('In-Person');
    const [booked, setBooked] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Reviews State
    const [reviews, setReviews] = useState<any[]>([]);
    const [reviewComment, setReviewComment] = useState('');
    const [reviewRating, setReviewRating] = useState(5);
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                // Handle mixed id fields (mock vs mongodb)
                const docId = (doctor as any)._id || doctor.id;
                if (!docId) return;
                const res = await api.get(`/reviews/${docId}`);
                setReviews(res.data);
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
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                    <ArrowLeft size={16} color="#334155" />
                </TouchableOpacity>
                <Text style={{ flex: 1, fontSize: 18, fontWeight: '700', color: '#0284c7' }}>Doctor Profile</Text>
            </View>

            <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#f1f5f9', alignItems: 'center', marginBottom: 16 }}>
                <Image source={{ uri: doctor.avatar }} style={{ width: 80, height: 80, borderRadius: 16, marginBottom: 12 }} />
                <Text style={{ fontWeight: '700', fontSize: 18, color: '#0284c7' }}>{doctor.name}</Text>
                <Text style={{ fontSize: 14, color: '#0ea5e9', fontWeight: '500' }}>{doctor.specialization}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 }}>
                    <Star size={16} color="#ca8a04" />
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#0284c7' }}>{doctor.rating}</Text>
                    <Text style={{ fontSize: 12, color: '#64748b' }}>({reviews.length || doctor.reviews || (doctor as any).reviewsCount || 0} reviews)</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 16, width: '100%' }}>
                    {[
                        { icon: Award, label: 'Experience', value: doctor.experience },
                        { icon: Users, label: 'Patients', value: String(doctor.patients) },
                        { icon: MapPin, label: 'Distance', value: doctor.distance },
                    ].map(({ icon: Icon, label, value }) => (
                        <View key={label} style={{ flex: 1, backgroundColor: '#f8fafc', borderRadius: 12, padding: 10, alignItems: 'center' }}>
                            <Icon size={16} color="#64748b" />
                            <Text style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>{label}</Text>
                            <Text style={{ fontSize: 14, fontWeight: '700', color: '#0284c7' }}>{value}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 16 }}>
                <Text style={{ fontWeight: '700', fontSize: 14, color: '#0284c7', marginBottom: 8 }}>About</Text>
                <Text style={{ fontSize: 12, color: '#475569', lineHeight: 18, marginBottom: 12 }}>
                    {(doctor as any).bio || `${doctor.name} is a highly experienced ${doctor.specialization} with ${doctor.experience} of practice. Known for providing compassionate care and using the latest treatment methods.`}
                </Text>

                {(doctor as any).education?.length > 0 && (
                    <>
                        <Text style={{ fontWeight: '700', fontSize: 13, color: '#0284c7', marginBottom: 4 }}>Education</Text>
                        <View style={{ marginBottom: 12 }}>
                            {(doctor as any).education.map((edu: string, i: number) => (
                                <Text key={i} style={{ fontSize: 12, color: '#64748b' }}>• {edu}</Text>
                            ))}
                        </View>
                    </>
                )}

                {(doctor as any).languages?.length > 0 && (
                    <>
                        <Text style={{ fontWeight: '700', fontSize: 13, color: '#0284c7', marginBottom: 4 }}>Languages</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                            {(doctor as any).languages.map((lang: string, i: number) => (
                                <View key={i} style={{ backgroundColor: '#f0f9ff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                                    <Text style={{ fontSize: 11, color: '#0369a1' }}>{lang}</Text>
                                </View>
                            ))}
                        </View>
                    </>
                )}
            </View>

            <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 16 }}>
                <Text style={{ fontWeight: '700', fontSize: 14, color: '#0284c7', marginBottom: 12 }}>Consultation Type</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    {([
                        { type: 'In-Person' as const, icon: MapPin, desc: 'Visit clinic' },
                        { type: 'Video Call' as const, icon: Video, desc: 'Online consult' },
                    ]).map(({ type, icon: Icon, desc }) => (
                        <TouchableOpacity key={type} onPress={() => setSelectedType(type)} activeOpacity={0.7} style={{ flex: 1, padding: 12, borderRadius: 12, borderWidth: 2, borderColor: selectedType === type ? '#0ea5e9' : '#e2e8f0', backgroundColor: selectedType === type ? '#f0fdfa' : '#fff', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Icon size={16} color={selectedType === type ? '#0ea5e9' : '#64748b'} />
                            <View>
                                <Text style={{ fontSize: 12, fontWeight: '600', color: '#0284c7' }}>{type}</Text>
                                <Text style={{ fontSize: 10, color: '#64748b' }}>{desc}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 16 }}>
                <Text style={{ fontWeight: '700', fontSize: 14, color: '#0284c7', marginBottom: 12 }}>Select Date</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        {dates.map(d => (
                            <TouchableOpacity key={d.value} onPress={() => setSelectedDate(d.value)} activeOpacity={0.7} style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, minWidth: 70, alignItems: 'center', backgroundColor: selectedDate === d.value ? '#0ea5e9' : '#f1f5f9' }}>
                                <Text style={{ fontSize: 10, fontWeight: '500', color: selectedDate === d.value ? 'rgba(255,255,255,0.8)' : '#64748b' }}>{d.label}</Text>
                                <Text style={{ fontSize: 12, fontWeight: '700', color: selectedDate === d.value ? '#fff' : '#0284c7' }}>{d.value}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </View>

            <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                    <Clock size={16} color="#0284c7" />
                    <Text style={{ fontWeight: '700', fontSize: 14, color: '#0284c7' }}>Available Slots</Text>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {doctor.availableSlots.map(slot => (
                        <TouchableOpacity key={slot} onPress={() => setSelectedSlot(slot)} activeOpacity={0.7} style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: selectedSlot === slot ? '#0ea5e9' : '#f1f5f9' }}>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: selectedSlot === slot ? '#fff' : '#0284c7' }}>{slot}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f1f5f9', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <View>
                    <Text style={{ fontSize: 12, color: '#64748b' }}>Consultation Fee</Text>
                    <Text style={{ fontSize: 22, fontWeight: '700', color: '#0284c7' }}>₹{doctor.consultationFee}</Text>
                </View>
                <View style={{ paddingHorizontal: 12, paddingVertical: 4, backgroundColor: '#dcfce7', borderRadius: 20 }}>
                    <Text style={{ fontSize: 10, fontWeight: '600', color: '#16a34a' }}>Payable after consultation</Text>
                </View>
            </View>

            <TouchableOpacity onPress={handleBook} disabled={!selectedSlot || booked || loading} activeOpacity={0.7} style={{ width: '100%', paddingVertical: 14, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: booked ? '#16a34a' : selectedSlot ? '#0ea5e9' : '#e2e8f0' }}>
                {booked ? (
                    <><CheckCircle size={16} color="#fff" /><Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Appointment Booked!</Text></>
                ) : loading ? (
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>Booking...</Text>
                ) : (
                    <><Calendar size={16} color={selectedSlot ? '#fff' : '#64748b'} /><Text style={{ fontSize: 14, fontWeight: '600', color: selectedSlot ? '#fff' : '#64748b' }}>{selectedSlot ? `Book for ${selectedSlot}, ${selectedDate}` : 'Select a time slot'}</Text></>
                )}
            </TouchableOpacity>

            {/* Patient Reviews Section */}
            <View style={{ marginTop: 24, marginBottom: 16 }}>
                <Text style={{ fontWeight: '700', fontSize: 18, color: '#0284c7', marginBottom: 16 }}>Patient Reviews</Text>
                
                {/* Write Review Form */}
                <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 16 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#0284c7', marginBottom: 8 }}>Write a Review</Text>
                    <View style={{ flexDirection: 'row', gap: 4, marginBottom: 12 }}>
                        {[1, 2, 3, 4, 5].map(star => (
                            <TouchableOpacity key={star} onPress={() => setReviewRating(star)}>
                                <Star size={24} color={star <= reviewRating ? '#f59e0b' : '#e2e8f0'} fill={star <= reviewRating ? '#f59e0b' : 'transparent'} />
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TextInput
                        value={reviewComment}
                        onChangeText={setReviewComment}
                        placeholder="Share your experience..."
                        placeholderTextColor="#94a3b8"
                        multiline
                        style={{ height: 80, textAlignVertical: 'top', backgroundColor: '#f8fafc', borderRadius: 12, padding: 12, color: '#334155', fontSize: 14, marginBottom: 12 }}
                    />
                    <TouchableOpacity
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
                        style={{ alignSelf: 'flex-end', backgroundColor: (!reviewComment.trim() || submittingReview) ? '#94a3b8' : '#0ea5e9', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 6 }}
                    >
                        {submittingReview ? <ActivityIndicator size="small" color="#fff" /> : <><Send size={14} color="#fff" /><Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>Post</Text></>}
                    </TouchableOpacity>
                </View>

                {/* List of Reviews */}
                {reviews.map((rev, i) => (
                    <View key={rev._id || i} style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 12 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                            <Text style={{ fontWeight: '600', fontSize: 14, color: '#0284c7' }}>{rev.user?.name || 'Anonymous'}</Text>
                            <View style={{ flexDirection: 'row' }}>
                                {[...Array(5)].map((_, idx) => (
                                    <Star key={idx} size={12} color={idx < rev.rating ? '#f59e0b' : '#e2e8f0'} fill={idx < rev.rating ? '#f59e0b' : 'transparent'} />
                                ))}
                            </View>
                        </View>
                        <Text style={{ fontSize: 13, color: '#475569', lineHeight: 20 }}>{rev.comment}</Text>
                    </View>
                ))}
                {reviews.length === 0 && (
                    <Text style={{ textAlign: 'center', color: '#94a3b8', marginTop: 12 }}>No reviews yet. Be the first!</Text>
                )}
            </View>

        </ScrollView>
    );
}
