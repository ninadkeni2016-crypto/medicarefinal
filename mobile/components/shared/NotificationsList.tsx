import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, RefreshControl, Animated } from 'react-native';
import { Bell, Calendar, Pill, MessageSquare, CreditCard, Info, Check, Trash2, ArrowLeft } from 'lucide-react-native';
import api from '@/lib/api';
import { colors, spacing, radius, typography, cardShadow, fonts } from '@/lib/theme';
import { MedCard } from '@/components/ui/MedCard';
import { SkeletonBox } from '@/components/ui/SkeletonBox';

interface Notification {
    _id: string;
    title: string;
    body: string;
    type: 'appointment' | 'prescription' | 'message' | 'billing' | 'system';
    read: boolean;
    createdAt: string;
}

export default function NotificationsList({ onBack }: { onBack?: () => void }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data || []);
        } catch (e) {
            console.error('Failed to fetch notifications', e);
            setNotifications([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchNotifications();
    }, []);

    const markAsRead = async (id: string, isCurrentlyRead: boolean) => {
        if (isCurrentlyRead) return;
        
        // Optimistic update
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        
        try {
            await api.put(`/notifications/${id}/read`);
        } catch (e) {
            // Revert on error
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: false } : n));
        }
    };

    const markAllAsRead = async () => {
        // Optimistic update
        const unreadIds = notifications.filter(n => !n.read).map(n => n._id);
        if (unreadIds.length === 0) return;

        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        
        try {
            await api.put(`/notifications/read-all`);
        } catch (e) {
            // Revert on error
            setNotifications(prev => prev.map(n => unreadIds.includes(n._id) ? { ...n, read: false } : n));
        }
    };

    const deleteNotification = async (id: string) => {
        // Optimistic
        const previous = [...notifications];
        setNotifications(prev => prev.filter(n => n._id !== id));
        
        try {
            await api.delete(`/notifications/${id}`);
        } catch (e) {
            setNotifications(previous);
        }
    };

    const getIconForType = (type: string) => {
        switch (type) {
            case 'appointment': return { Icon: Calendar, color: '#2563EB', bg: '#EFF6FF' }; // Blue
            case 'prescription': return { Icon: Pill, color: '#16A34A', bg: '#F0FDF4' }; // Green
            case 'message': return { Icon: MessageSquare, color: '#9333EA', bg: '#FDF4FF' }; // Purple
            case 'billing': return { Icon: CreditCard, color: '#D97706', bg: '#FFFBEB' }; // Amber
            default: return { Icon: Info, color: '#475569', bg: '#F1F5F9' }; // Slate
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const renderHeader = () => (
        <View style={{ marginBottom: spacing.xl }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    {onBack && (
                        <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
                            <ArrowLeft size={20} color={colors.text} />
                        </TouchableOpacity>
                    )}
                    <View>
                        <Text style={[typography.screenTitle]}>Notifications</Text>
                        <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.primary, marginTop: 4 }}>
                            {unreadCount} unread
                        </Text>
                    </View>
                </View>

                {unreadCount > 0 && (
                    <TouchableOpacity onPress={markAllAsRead} activeOpacity={0.7} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: '#F1F5F9', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Check size={14} color="#475569" strokeWidth={3} />
                        <Text style={{ fontFamily: fonts.semiBold, fontSize: 12, color: '#475569' }}>Mark all read</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    const NotificationItem = ({ item }: { item: Notification }) => {
        const { Icon, color, bg } = getIconForType(item.type);
        
        return (
            <TouchableOpacity activeOpacity={0.8} onPress={() => markAsRead(item._id, item.read)}>
                <MedCard style={{ 
                    marginBottom: 12, 
                    padding: 16, 
                    borderLeftWidth: 4, 
                    borderLeftColor: item.read ? 'transparent' : colors.primary,
                    backgroundColor: item.read ? colors.card : '#F8FAFC'
                }}>
                    <View style={{ flexDirection: 'row', gap: 14 }}>
                        <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
                            <Icon size={20} color={color} />
                        </View>
                        
                        <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                                <Text style={{ fontFamily: fonts.semiBold, fontSize: 15, color: colors.text, flex: 1, marginRight: 8 }}>
                                    {item.title}
                                </Text>
                                <Text style={{ fontFamily: fonts.medium, fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                                    {formatDate(item.createdAt)}
                                </Text>
                            </View>
                            
                            <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, lineHeight: 18 }}>
                                {item.body}
                            </Text>
                        </View>
                    </View>
                </MedCard>
            </TouchableOpacity>
        );
    };

    if (loading && !refreshing) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.background, padding: 20 }}>
                {renderHeader()}
                {[1, 2, 3, 4, 5].map((i) => <SkeletonBox key={i} height={100} style={{ borderRadius: 16, marginBottom: 12 }} />)}
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <FlatList
                data={notifications}
                keyExtractor={(item) => item._id}
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={
                    <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
                        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                            <Bell size={32} color={colors.textMuted} />
                        </View>
                        <Text style={{ fontFamily: fonts.semiBold, fontSize: 16, color: colors.text, marginBottom: 8 }}>All caught up!</Text>
                        <Text style={{ fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary, textAlign: 'center' }}>
                            You don't have any new notifications right now.
                        </Text>
                    </View>
                }
                renderItem={({ item }) => <NotificationItem item={item} />}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />
                }
            />
        </View>
    );
}
