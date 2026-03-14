import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { ArrowLeft, Send, Phone, Video } from 'lucide-react-native';
import { Conversation, ChatMsg, conversationMessages } from '@/lib/chat-data';

interface Props { conversation: Conversation; onBack: () => void; onViewProfile?: () => void; }

export default function ChatConversation({ conversation, onBack, onViewProfile }: Props) {
    const initialMsgs = conversationMessages[conversation.id] || [];
    const [messages, setMessages] = useState<ChatMsg[]>(initialMsgs);
    const [text, setText] = useState('');
    const flatListRef = useRef<FlatList>(null);

    const handleSend = () => {
        if (!text.trim()) return;
        const newMsg: ChatMsg = { id: String(Date.now()), conversationId: conversation.id, senderId: 'user', content: text.trim(), time: 'Now', isOwn: true, type: 'text' };
        setMessages(prev => [...prev, newMsg]);
        setText('');
        setTimeout(() => {
            const replies = [
                "Thank you for your message! I'll review this and get back to you shortly.",
                "I understand. Let me check your medical records and respond.",
                "That's helpful information. Please continue monitoring and let me know if anything changes.",
                "I've noted this down. We can discuss it further during your next appointment.",
                "Good to hear from you. Can you tell me more about when this started?",
            ];
            const reply: ChatMsg = {
                id: String(Date.now() + 1),
                conversationId: conversation.id,
                senderId: 'other',
                content: replies[Math.floor(Math.random() * replies.length)],
                time: 'Now',
                isOwn: false,
                type: 'text'
            };
            setMessages(prev => [...prev, reply]);
        }, 1500);
    };

    useEffect(() => {
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }, [messages]);

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
                <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                    <ArrowLeft size={16} color="#334155" />
                </TouchableOpacity>
                <TouchableOpacity onPress={onViewProfile} activeOpacity={0.7} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                    <Image source={{ uri: conversation.participantAvatar }} style={{ width: 40, height: 40, borderRadius: 12 }} />
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: '600', fontSize: 14, color: '#0284c7' }}>{conversation.participantName}</Text>
                        <Text style={{ fontSize: 12, color: conversation.online ? '#16a34a' : '#94a3b8' }}>{conversation.online ? 'Online' : 'Offline'}</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.7} style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                    <Phone size={16} color="#64748b" />
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.7} style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                    <Video size={16} color="#64748b" />
                </TouchableOpacity>
            </View>

            {/* Messages */}
            <FlatList
                style={{ flex: 1 }}
                ref={flatListRef}
                data={messages}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
                renderItem={({ item }) => (
                    <View style={{ alignSelf: item.isOwn ? 'flex-end' : 'flex-start', maxWidth: '80%', marginBottom: 10 }}>
                        <View style={{ backgroundColor: item.isOwn ? '#0ea5e9' : '#f1f5f9', borderRadius: 16, borderBottomRightRadius: item.isOwn ? 4 : 16, borderBottomLeftRadius: !item.isOwn ? 4 : 16, paddingHorizontal: 14, paddingVertical: 10 }}>
                            <Text style={{ fontSize: 14, color: item.isOwn ? '#fff' : '#0284c7', lineHeight: 20 }}>{item.content}</Text>
                        </View>
                        <Text style={{ fontSize: 10, color: '#94a3b8', marginTop: 4, alignSelf: item.isOwn ? 'flex-end' : 'flex-start' }}>{item.time}</Text>
                    </View>
                )}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            />

            {/* Input */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16, paddingBottom: Platform.OS === 'ios' ? 24 : 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9' }}>
                <TextInput
                    value={text}
                    onChangeText={setText}
                    placeholder="Type a message..."
                    placeholderTextColor="#94a3b8"
                    style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, backgroundColor: '#f1f5f9', fontSize: 14, color: '#0284c7' }}
                    onSubmitEditing={handleSend}
                    returnKeyType="send"
                />
                <TouchableOpacity onPress={handleSend} activeOpacity={0.7} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: text.trim() ? '#0ea5e9' : '#e2e8f0', alignItems: 'center', justifyContent: 'center' }}>
                    <Send size={18} color={text.trim() ? '#fff' : '#94a3b8'} />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}
