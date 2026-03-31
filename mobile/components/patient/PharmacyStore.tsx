import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, TextInput, Animated, Dimensions, StyleSheet } from 'react-native';
import { Search, ShoppingCart, Plus, Minus, ArrowLeft, Star, Pill, FlaskConical, Leaf, Package, Heart, Mic, SlidersHorizontal, MapPin } from 'lucide-react-native';
import RazorpayCheckout from '../shared/RazorpayCheckout';
import { toast } from '@/hooks/use-toast';
import { colors, fonts, Shadows, radius, typography } from '@/lib/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with 16 padding on edges and between

interface PharmacyStoreProps { onBack: () => void; }

// Dummy Data Enriched
const medicines = [
    { id: '1', name: 'Paracetamol 500mg', type: 'Tablet', price: 45, originalPrice: 55, discount: 18, rating: 4.8, reviews: 120, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&q=80', description: 'Used for pain relief and fever reducing.', isNearby: true },
    { id: '2', name: 'Amoxicillin 250mg', type: 'Capsule', price: 120, originalPrice: 150, discount: 20, rating: 4.5, reviews: 85, image: 'https://images.unsplash.com/photo-1550572017-edb799dc3e91?w=300&q=80', description: 'Antibiotic for bacterial infections.', isNearby: false },
    { id: '3', name: 'Vitamin C Complex', type: 'Supplement', price: 150, originalPrice: 200, discount: 25, rating: 4.9, reviews: 340, image: 'https://images.unsplash.com/photo-1614732484003-ef9881555dc3?w=300&q=80', description: 'Immune system booster with Zinc.', isNearby: true },
    { id: '4', name: 'Cough Syrup (Herbal)', type: 'Syrup', price: 85, originalPrice: 85, discount: 0, rating: 4.6, reviews: 112, image: 'https://images.unsplash.com/photo-1628770138403-f3caff35bb54?w=300&q=80', description: 'Natural dry cough relief.', isNearby: true },
    { id: '5', name: 'Ibuprofen 400mg', type: 'Tablet', price: 65, originalPrice: 75, discount: 13, rating: 4.7, reviews: 290, image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&q=80', description: 'Reduces inflammation and chronic pain.', isNearby: false },
    { id: '6', name: 'Eye Drops (Lubricant)', type: 'Drops', price: 110, originalPrice: 130, discount: 15, rating: 4.4, reviews: 65, image: 'https://images.unsplash.com/photo-1607613009820-a29f4bea3571?w=300&q=80', description: 'Instant dry eye relief formula.', isNearby: true },
];

const categories = [
    { name: 'All', icon: Package },
    { name: 'Tablet', icon: Pill },
    { name: 'Capsule', icon: Pill },
    { name: 'Syrup', icon: FlaskConical },
    { name: 'Drops', icon: Package },
    { name: 'Supplement', icon: Leaf },
];

const MedicineCard = React.memo(({ item, cartCount, onUpdateCart }: any) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true }).start();
    };
    const handlePressOut = () => {
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
    };

    return (
        <Animated.View style={[styles.cardContainer, { transform: [{ scale: scaleAnim }] }]}>
            <TouchableOpacity activeOpacity={0.9} onPressIn={handlePressIn} onPressOut={handlePressOut} style={styles.cardInternal}>
                {/* Image Section */}
                <View style={styles.imageWrapper}>
                    <Image source={{ uri: item.image }} style={styles.productImage} />
                    {item.discount > 0 && (
                        <View style={styles.discountBadge}>
                            <Text style={styles.discountText}>{item.discount}% OFF</Text>
                        </View>
                    )}
                    {item.isNearby && (
                        <View style={styles.nearbyBadge}>
                            <MapPin size={10} color="#059669" />
                            <Text style={styles.nearbyText}>Nearby</Text>
                        </View>
                    )}
                </View>

                {/* Content Section */}
                <View style={styles.cardContent}>
                    <View style={styles.ratingRow}>
                        <Star size={12} color="#ca8a04" fill="#ca8a04" />
                        <Text style={styles.ratingText}>{item.rating}</Text>
                        <Text style={styles.reviewsText}>({item.reviews})</Text>
                    </View>

                    <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.productDesc} numberOfLines={2}>{item.description}</Text>

                    {/* Price & Action Row */}
                    <View style={styles.priceActionRow}>
                        <View>
                            <Text style={styles.currentPrice}>₹{item.price}</Text>
                            {item.discount > 0 && (
                                <Text style={styles.originalPrice}>₹{item.originalPrice}</Text>
                            )}
                        </View>

                        {/* Stepper or Add Button */}
                        {cartCount > 0 ? (
                            <View style={styles.stepperContainer}>
                                <TouchableOpacity onPress={() => onUpdateCart(item.id, -1)} style={styles.stepperBtn}>
                                    <Minus size={14} color={colors.primary} />
                                </TouchableOpacity>
                                <Text style={styles.stepperCount}>{cartCount}</Text>
                                <TouchableOpacity onPress={() => onUpdateCart(item.id, 1)} style={styles.stepperBtn}>
                                    <Plus size={14} color={colors.primary} />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity onPress={() => onUpdateCart(item.id, 1)} style={styles.addButton}>
                                <Plus size={16} color="#FFF" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
});

export default function PharmacyStore({ onBack }: PharmacyStoreProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState<{ [id: string]: number }>({});
    const [category, setCategory] = useState('All');
    const [showRazorpay, setShowRazorpay] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    
    // Focus animation
    const focusValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(focusValue, {
            toValue: isFocused ? 1 : 0,
            duration: 200,
            useNativeDriver: false
        }).start();
    }, [isFocused]);

    const searchBorderColor = focusValue.interpolate({
        inputRange: [0, 1],
        outputRange: [colors.border, colors.primary]
    });

    const updateCart = useCallback((id: string, delta: number) => {
        setCart(prev => {
            const current = prev[id] || 0;
            const next = Math.max(0, current + delta);
            
            // Trigger toast on first add
            if (current === 0 && next === 1) {
                toast({ title: 'Added to Cart 🛒', description: 'Item has been added nicely to your order list.' });
            }

            const newState = { ...prev };
            if (next === 0) delete newState[id];
            else newState[id] = next;
            return newState;
        });
    }, []);

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

    const renderHeader = () => (
        <View style={styles.listHeaderPadding}>
            {/* Search Bar Section */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <Animated.View style={[styles.searchContainer, { borderColor: searchBorderColor }]}>
                    <Search size={20} color={isFocused ? colors.primary : colors.textMuted} />
                    <TextInput
                        placeholder="Search medicines, brands..."
                        placeholderTextColor={colors.textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        style={styles.searchInput}
                    />
                    <TouchableOpacity>
                        <Mic size={20} color={colors.textMuted} />
                    </TouchableOpacity>
                </Animated.View>

                {/* Filter Btn */}
                <TouchableOpacity style={styles.filterBtn}>
                    <SlidersHorizontal size={20} color={colors.primary} />
                </TouchableOpacity>
            </View>

            {/* Category Chips */}
            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={categories}
                keyExtractor={(item) => item.name}
                contentContainerStyle={{ gap: 12, paddingBottom: 20 }}
                style={{ overflow: 'visible' }}
                renderItem={({ item }) => {
                    const isActive = category === item.name;
                    const Icon = item.icon;
                    return (
                        <TouchableOpacity
                            onPress={() => setCategory(item.name)}
                            activeOpacity={0.8}
                            style={[
                                styles.chip,
                                isActive ? styles.chipActive : styles.chipInactive
                            ]}
                        >
                            <Icon size={14} color={isActive ? '#FFF' : colors.textSecondary} style={{ marginRight: 6 }} />
                            <Text style={[styles.chipText, { color: isActive ? '#FFF' : colors.textSecondary }]}>
                                {item.name}
                            </Text>
                        </TouchableOpacity>
                    );
                }}
            />

            {/* Section Title */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <Text style={typography.sectionTitle}>{category === 'All' ? 'Trending Products' : `${category} Products`}</Text>
                <Text style={[typography.bodySmall, { color: colors.primary }]}>See All</Text>
            </View>
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Image source={{ uri: 'https://cdn3d.iconscout.com/3d/premium/thumb/empty-box-4999516-4171661.png' }} style={styles.emptyImg} />
            <Text style={styles.emptyTitle}>No Medicines Found</Text>
            <Text style={styles.emptySubtitle}>We couldn't find what you're looking for based on your search filters.</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Sticky Header */}
            <View style={styles.stickyHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                    <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={styles.backBtn}>
                        <ArrowLeft size={20} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={typography.title}>Pharmacy Store</Text>
                </View>

                <TouchableOpacity activeOpacity={0.7} style={styles.cartBtn}>
                    <ShoppingCart size={22} color={colors.primary} />
                    {cartCount > 0 && (
                        <View style={styles.cartBadge}>
                            <Text style={styles.cartBadgeText}>{cartCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* Main FlatList */}
            <FlatList
                data={filteredMeds}
                keyExtractor={item => item.id}
                numColumns={2}
                columnWrapperStyle={styles.rowWrapper}
                contentContainerStyle={[styles.flatListContent, { paddingBottom: cartTotal > 0 ? 120 : 40 }]}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmpty}
                renderItem={({ item }) => (
                    <MedicineCard
                        item={item}
                        cartCount={cart[item.id] || 0}
                        onUpdateCart={updateCart}
                    />
                )}
            />

            {/* Floating Checkout Bar */}
            {cartTotal > 0 && (
                <View style={styles.checkoutBar}>
                    <View>
                        <Text style={{ color: '#D8E8EC', fontSize: 13, fontFamily: fonts.medium }}>{cartCount} Items | Total</Text>
                        <Text style={{ color: '#FFF', fontSize: 20, fontFamily: fonts.bold }}>₹{cartTotal}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setShowRazorpay(true)} activeOpacity={0.8} style={styles.checkoutBtn}>
                        <Text style={styles.checkoutBtnText}>Checkout</Text>
                    </TouchableOpacity>
                </View>
            )}

            <RazorpayCheckout visible={showRazorpay} amount={cartTotal} onClose={handleCancel} onCancel={handleCancel} onSuccess={handleSuccess} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    stickyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 16,
        backgroundColor: colors.surface,
        ...Shadows.md,
        zIndex: 10
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: radius.full,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center'
    },
    cartBtn: {
        width: 44,
        height: 44,
        borderRadius: radius.full,
        backgroundColor: colors.primary + '15',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
    },
    cartBadge: {
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: colors.danger,
        borderRadius: 12,
        minWidth: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
        borderWidth: 2,
        borderColor: colors.surface
    },
    cartBadgeText: {
        color: '#FFF',
        fontSize: 10,
        fontFamily: fonts.bold
    },
    flatListContent: {
        paddingHorizontal: 16,
        paddingTop: 20
    },
    listHeaderPadding: {
        paddingBottom: 10
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        paddingHorizontal: 16,
        height: 54,
        borderWidth: 1.5,
        ...Shadows.sm
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 15,
        fontFamily: fonts.medium,
        color: colors.text
    },
    filterBtn: {
        width: 54,
        height: 54,
        borderRadius: radius.lg,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        ...Shadows.sm
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: radius.full,
        borderWidth: 1,
        ...Shadows.sm
    },
    chipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary
    },
    chipInactive: {
        backgroundColor: colors.surface,
        borderColor: colors.border
    },
    chipText: {
        fontSize: 13,
        fontFamily: fonts.semiBold
    },
    rowWrapper: {
        justifyContent: 'space-between',
        marginBottom: 16
    },
    cardContainer: {
        width: CARD_WIDTH,
    },
    cardInternal: {
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
        ...Shadows.sm
    },
    imageWrapper: {
        position: 'relative',
        width: '100%',
        height: 140,
        backgroundColor: '#F8FAFC'
    },
    productImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover'
    },
    discountBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: colors.danger,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6
    },
    discountText: {
        color: '#FFF',
        fontSize: 10,
        fontFamily: fonts.bold
    },
    nearbyBadge: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        backgroundColor: '#FFF',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: 6,
        ...Shadows.sm,
        gap: 2
    },
    nearbyText: {
        color: '#059669',
        fontSize: 10,
        fontFamily: fonts.semiBold
    },
    cardContent: {
        padding: 12
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        gap: 4
    },
    ratingText: {
        fontSize: 12,
        fontFamily: fonts.bold,
        color: '#ca8a04'
    },
    reviewsText: {
        fontSize: 10,
        fontFamily: fonts.medium,
        color: colors.textMuted
    },
    productName: {
        fontSize: 14,
        fontFamily: fonts.bold,
        color: colors.text,
        marginBottom: 4
    },
    productDesc: {
        fontSize: 11,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
        marginBottom: 12,
        lineHeight: 16
    },
    priceActionRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between'
    },
    currentPrice: {
        fontSize: 16,
        fontFamily: fonts.bold,
        color: colors.primary
    },
    originalPrice: {
        fontSize: 11,
        fontFamily: fonts.medium,
        color: colors.textMuted,
        textDecorationLine: 'line-through',
        marginTop: 2
    },
    addButton: {
        width: 32,
        height: 32,
        borderRadius: radius.full,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadows.sm
    },
    stepperContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        borderRadius: radius.full,
        paddingHorizontal: 4,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: colors.border
    },
    stepperBtn: {
        padding: 4
    },
    stepperCount: {
        fontSize: 13,
        fontFamily: fonts.bold,
        color: colors.primary,
        paddingHorizontal: 8
    },
    emptyContainer: {
        paddingTop: 60,
        alignItems: 'center'
    },
    emptyImg: {
        width: 150,
        height: 150,
        opacity: 0.8,
        marginBottom: 20
    },
    emptyTitle: {
        fontSize: 18,
        fontFamily: fonts.bold,
        color: colors.text,
        marginBottom: 8
    },
    emptySubtitle: {
        fontSize: 14,
        fontFamily: fonts.medium,
        color: colors.textSecondary,
        textAlign: 'center',
        paddingHorizontal: 40
    },
    checkoutBar: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: colors.primary,
        borderRadius: radius.xl,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...Shadows.lg
    },
    checkoutBtn: {
        backgroundColor: '#FFF',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: radius.lg
    },
    checkoutBtnText: {
        color: colors.primary,
        fontSize: 14,
        fontFamily: fonts.bold
    }
});
