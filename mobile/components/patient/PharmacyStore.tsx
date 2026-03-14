import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { Search, ShoppingCart, Plus, Minus, ArrowLeft, Star } from 'lucide-react-native';
import RazorpayCheckout from '../shared/RazorpayCheckout';
import { toast } from '@/hooks/use-toast';

interface PharmacyStoreProps { onBack: () => void; }

const medicines = [
    { id: '1', name: 'Paracetamol 500mg', type: 'Tablet', price: 45, rating: 4.8, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&q=80', description: 'Used for pain relief and fever' },
    { id: '2', name: 'Amoxicillin 250mg', type: 'Capsule', price: 120, rating: 4.5, image: 'https://images.unsplash.com/photo-1550572017-edb799dc3e91?w=300&q=80', description: 'Antibiotic for bacterial infections' },
    { id: '3', name: 'Vitamin C Complex', type: 'Supplement', price: 150, rating: 4.9, image: 'https://images.unsplash.com/photo-1614732484003-ef9881555dc3?w=300&q=80', description: 'Immune system booster' },
    { id: '4', name: 'Cough Syrup (Herbal)', type: 'Syrup', price: 85, rating: 4.6, image: 'https://images.unsplash.com/photo-1628770138403-f3caff35bb54?w=300&q=80', description: 'Dry cough relief' },
    { id: '5', name: 'Ibuprofen 400mg', type: 'Tablet', price: 65, rating: 4.7, image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&q=80', description: 'Reduces inflammation and pain' },
    { id: '6', name: 'Eye Drops (Lubricant)', type: 'Drops', price: 110, rating: 4.4, image: 'https://images.unsplash.com/photo-1607613009820-a29f4bea3571?w=300&q=80', description: 'For dry eye relief' },
];

export default function PharmacyStore({ onBack }: PharmacyStoreProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState<{ [id: string]: number }>({});
    const [category, setCategory] = useState('All');
    const [showRazorpay, setShowRazorpay] = useState(false);

    const updateCart = (id: string, delta: number) => {
        setCart(prev => {
            const current = prev[id] || 0;
            const next = Math.max(0, current + delta);
            const newState = { ...prev };
            if (next === 0) delete newState[id];
            else newState[id] = next;
            return newState;
        });
    };

    const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
    const cartTotal = Object.entries(cart).reduce((total, [id, count]) => {
        const item = medicines.find(m => m.id === id);
        return total + (item ? item.price * count : 0);
    }, 0);

    const filteredMeds = medicines.filter(m =>
        (category === 'All' || m.type === category) &&
        m.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSuccess = () => {
        setShowRazorpay(false);
        setCart({});
        toast({ title: 'Order Placed! 📦', description: `Your pharmacy order of ₹${cartTotal} is successful.` });
    };

    const handleCancel = () => {
        setShowRazorpay(false);
        toast({ title: 'Payment cancelled', description: 'Your cart is saved — you can checkout anytime.' });
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                        <ArrowLeft size={16} color="#0284c7" />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#0284c7' }}>Pharmacy Store</Text>
                </View>
                <TouchableOpacity activeOpacity={0.7} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#f0fdfa', alignItems: 'center', justifyContent: 'center' }}>
                    <ShoppingCart size={20} color="#0ea5e9" />
                    {cartCount > 0 && (
                        <View style={{ position: 'absolute', top: -4, right: -4, backgroundColor: '#ef4444', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' }}>
                            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>{cartCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: cartTotal > 0 ? 100 : 20 }} showsVerticalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 20 }}>
                    <Search size={20} color="#94a3b8" />
                    <TextInput placeholder="Search medicines..." value={searchQuery} onChangeText={setSearchQuery} style={{ flex: 1, marginLeft: 12, fontSize: 14, color: '#0284c7' }} placeholderTextColor="#94a3b8" />
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }} contentContainerStyle={{ gap: 8 }}>
                    {['All', 'Tablet', 'Capsule', 'Syrup', 'Drops', 'Supplement'].map(cat => (
                        <TouchableOpacity key={cat} onPress={() => setCategory(cat)} activeOpacity={0.7} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: category === cat ? '#0ea5e9' : '#fff', borderWidth: 1, borderColor: category === cat ? '#0ea5e9' : '#e2e8f0' }}>
                            <Text style={{ fontSize: 12, fontWeight: '500', color: category === cat ? '#fff' : '#64748b' }}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    {filteredMeds.map(med => (
                        <View key={med.id} style={{ width: '48%', backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 16 }}>
                            <Image source={{ uri: med.image }} style={{ width: '100%', height: 120, backgroundColor: '#f1f5f9' }} />
                            <View style={{ padding: 12 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#0284c7', flex: 1 }} numberOfLines={2}>{med.name}</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: '#fef9c3', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4 }}>
                                        <Star size={10} color="#ca8a04" fill="#ca8a04" />
                                        <Text style={{ fontSize: 10, fontWeight: '600', color: '#ca8a04' }}>{med.rating}</Text>
                                    </View>
                                </View>
                                <Text style={{ fontSize: 11, color: '#64748b', marginBottom: 12 }} numberOfLines={2}>{med.description}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#16a34a' }}>₹{med.price}</Text>
                                    {cart[med.id] ? (
                                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0fdfa', borderRadius: 12 }}>
                                            <TouchableOpacity onPress={() => updateCart(med.id, -1)} style={{ padding: 6 }}><Minus size={14} color="#0ea5e9" /></TouchableOpacity>
                                            <Text style={{ fontSize: 12, fontWeight: '700', color: '#0ea5e9', paddingHorizontal: 4 }}>{cart[med.id]}</Text>
                                            <TouchableOpacity onPress={() => updateCart(med.id, 1)} style={{ padding: 6 }}><Plus size={14} color="#0ea5e9" /></TouchableOpacity>
                                        </View>
                                    ) : (
                                        <TouchableOpacity onPress={() => updateCart(med.id, 1)} style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: '#0ea5e9', alignItems: 'center', justifyContent: 'center' }}>
                                            <Plus size={16} color="#fff" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {cartTotal > 0 && (
                <View style={{ position: 'absolute', bottom: 20, left: 16, right: 16, backgroundColor: '#0284c7', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View>
                        <Text style={{ color: '#94a3b8', fontSize: 12 }}>{cartCount} Items | Total</Text>
                        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>₹{cartTotal}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setShowRazorpay(true)} activeOpacity={0.7} style={{ backgroundColor: '#0ea5e9', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 }}>
                        <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>Checkout</Text>
                    </TouchableOpacity>
                </View>
            )}
            <RazorpayCheckout visible={showRazorpay} amount={cartTotal} onClose={handleCancel} onCancel={handleCancel} onSuccess={handleSuccess} />
        </View>
    );
}
