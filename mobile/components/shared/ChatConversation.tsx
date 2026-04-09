import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Image, Dimensions, ActivityIndicator } from 'react-native';
import { ArrowLeft, Send, Phone, MoreHorizontal, Check, CheckCheck } from 'lucide-react-native';
import { Conversation, ChatMsg, conversationMessages } from '@/lib/chat-data';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

const { width } = Dimensions.get('window');

import { colors, spacing, radius, typography, cardShadow, fonts } from '@/lib/theme';
import { InitialsAvatar } from '@/components/ui/InitialsAvatar';
import { MedCard } from '../ui/MedCard';

interface Props { conversation: Conversation; onBack: () => void; onViewProfile?: () => void; }

export default function ChatConversation({ conversation, onBack, onViewProfile }: Props) {
    const { role } = useAuth();
    const [messages, setMessages] = useState<ChatMsg[]>([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                if (conversation.id.startsWith('new-')) {
                    setMessages([]);
                    return;
                }
                if (conversation.id.startsWith('conv-')) {
                    setMessages(conversationMessages[conversation.id] || []);
                    setLoading(false);
                    return;
                }
                const res = await api.get(`/chat/messages/${conversation.id}`);
                const mapped: ChatMsg[] = (res.data || []).map((m: any) => ({
                    id: m._id,
                    conversationId: m.conversationId,
                    senderId: m.sender,
                    content: m.content,
                    time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isOwn: m.senderName !== conversation.participantName,
                    type: m.type || 'text'
                }));
                // Set the mapped messages
                setMessages(mapped);
            } catch (error) {
                console.error('Failed to fetch messages:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMessages();
    }, [conversation.id]);

    const handleSend = async () => {
        if (!text.trim()) return;
        const msgText = text.trim();
        setText('');

        // Optimistic UI
        const optimisticMsg: ChatMsg = {
            id: String(Date.now()),
            conversationId: conversation.id,
            senderId: 'own',
            content: msgText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isOwn: true,
            type: 'text'
        };
        setMessages(prev => [...prev, optimisticMsg]);

        try {
            if (conversation.id.startsWith('conv-')) {
                // Read-only mock fallback scenario
                return;
            }

            const payload: any = {
                content: msgText,
                type: 'text',
                receiverName: conversation.participantName
            };
            if (conversation.id.startsWith('new-')) {
                payload.receiverId = (conversation as any).participantId;
            } else {
                payload.conversationId = conversation.id;
            }
            await api.post('/chat/messages', payload);
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    useEffect(() => {
        if (!loading) {
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        }
    }, [messages, loading]);

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
            >
                {/* Header */}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    padding: 16,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                    zIndex: 10,
                    ...Platform.select({
                        web: { position: 'sticky', top: 0 }
                    })
                }}>
                    <TouchableOpacity
                        onPress={onBack}
                        activeOpacity={0.7}
                        style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, ...cardShadow }}
                    >
                        <ArrowLeft size={20} color={colors.text} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={onViewProfile}
                        activeOpacity={0.8}
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}
                    >
                        <View style={{ position: 'relative' }}>
                            <InitialsAvatar name={conversation.participantName} size={48} radius={16} />
                            <View style={{ position: 'absolute', bottom: -2, right: -2, width: 14, height: 14, borderRadius: 7, backgroundColor: conversation.online ? colors.success : colors.textMuted, borderWidth: 2, borderColor: '#FFF' }} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={typography.bodyMedium}>{conversation.participantName}</Text>
                            <Text style={[typography.label, { color: conversation.online ? colors.success : colors.textMuted }]}>{conversation.online ? 'Active Now' : 'Offline'}</Text>
                        </View>
                    </TouchableOpacity>

                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <TouchableOpacity style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(99, 102, 241, 0.08)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(99, 102, 241, 0.1)' }}>
                            <Phone size={20} color={colors.primary} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Messages List */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <View style={{
                            alignSelf: item.isOwn ? 'flex-end' : 'flex-start',
                            maxWidth: '85%',
                            marginBottom: 20
                        }}>
                            <View style={{
                                backgroundColor: item.isOwn ? colors.primary : colors.card,
                                borderRadius: 24,
                                borderBottomRightRadius: item.isOwn ? 4 : 24,
                                borderBottomLeftRadius: !item.isOwn ? 4 : 24,
                                paddingHorizontal: 18,
                                paddingVertical: 14,
                                borderWidth: item.isOwn ? 0 : 1,
                                borderColor: colors.border,
                                ...(!item.isOwn ? cardShadow : {})
                            }}>
                                <Text style={[typography.body, { color: item.isOwn ? '#FFF' : colors.text }]}>
                                    {item.content}
                                </Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginTop: 6 }}>
                                    <Text style={[typography.label, { color: item.isOwn ? 'rgba(255,255,255,0.7)' : colors.textMuted }]}>
                                        {item.time}
                                    </Text>
                                    {item.isOwn && <CheckCheck size={12} color="rgba(255,255,255,0.7)" />}
                                </View>
                            </View>
                        </View>
                    )}
                />

                {/* Disclaimer Box */}
                <View style={{
                    position: 'absolute',
                    bottom: 110,
                    right: 20,
                    backgroundColor: 'rgba(231, 111, 81, 0.1)',
                    padding: 8,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: 'rgba(231, 111, 81, 0.15)',
                    maxWidth: width * 0.5,
                    zIndex: 50,
                    pointerEvents: 'none'
                }}>
                    <Text style={{ fontSize: 9, color: colors.danger, fontFamily: fonts.semiBold, textAlign: 'right', lineHeight: 12 }}>
                        ⚠️ These features are currently unavailable and will be added in future updates.
                    </Text>
                </View>

                {/* Input Area */}
                <View style={{
                    padding: 20,
                    paddingBottom: Platform.OS === 'ios' ? 32 : 20,
                    backgroundColor: colors.card,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                    ...cardShadow
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                        <View style={{
                            flex: 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: colors.background,
                            borderRadius: 22,
                            borderWidth: 1,
                            borderColor: colors.border,
                            paddingHorizontal: 16
                        }}>
                            <TextInput
                                value={text}
                                onChangeText={setText}
                                placeholder="Type your message..."
                                placeholderTextColor={colors.textMuted}
                                style={{ flex: 1, minHeight: 52, fontSize: 16, color: colors.text, fontWeight: '500', paddingVertical: 12, maxHeight: 120 }}
                                multiline
                                onSubmitEditing={handleSend}
                            />
                            <TouchableOpacity style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}>
                                <MoreHorizontal size={22} color={colors.textMuted} />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            onPress={handleSend}
                            disabled={!text.trim()}
                            activeOpacity={0.8}
                            style={{
                                width: 52,
                                height: 52,
                                borderRadius: 18,
                                backgroundColor: text.trim() ? colors.primary : colors.background,
                                alignItems: 'center',
                                justifyContent: 'center',
                                ... (text.trim() ? cardShadow : {})
                            }}
                        >
                            <Send size={24} color={text.trim() ? '#FFF' : colors.textMuted} />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}
