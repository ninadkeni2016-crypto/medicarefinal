import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Platform, Dimensions } from 'react-native';
import { Search, Bot, ChevronRight, MessageSquare, Activity } from 'lucide-react-native';
import { patientConversations, doctorConversations, Conversation } from '@/lib/chat-data';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

const { width } = Dimensions.get('window');

import { MedCard } from '../ui/MedCard';
import { SectionHeader } from '../ui/SectionHeader';
import { colors, spacing, radius, typography, cardShadow, fonts } from '@/lib/theme';

interface Props { onSelectConversation: (c: Conversation) => void; onOpenAI?: () => void; }

export default function ChatList({ onSelectConversation, onOpenAI }: Props) {
    const { role } = useAuth();
    const [search, setSearch] = useState('');
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/chat/conversations')
            .then(res => {
                if (res.data && res.data.length > 0) {
                    const mapped: Conversation[] = res.data.map((c: any) => ({
                        id: c._id,
                        participantName: c.participantNames?.find((n: string) => n !== '') || 'Unknown',
                        participantAvatar: '',
                        lastMessage: c.lastMessage || '',
                        lastMessageTime: c.lastMessageTime ? new Date(c.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                        unreadCount: c.unreadCount || 0,
                        online: false,
                    }));
                    setConversations(mapped);
                } else {
                    setConversations(role === 'doctor' ? doctorConversations : patientConversations);
                }
            })
            .catch(() => {
                setConversations(role === 'doctor' ? doctorConversations : patientConversations);
            })
            .finally(() => setLoading(false));
    }, [role]);

    const filtered = search
        ? conversations.filter(c => c.participantName.toLowerCase().includes(search.toLowerCase()))
        : conversations;

    if (loading) return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
            <ActivityIndicator size="large" color={colors.primary} />
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <View style={{ padding: 20 }}>
                <View style={{ marginBottom: 28 }}>
                    <Text style={typography.screenTitle}>Messages</Text>
                    <Text style={[typography.body, { marginTop: 4 }]}>Track your consultations and active chats</Text>
                </View>

                {/* Search Bar */}
                <MedCard style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    gap: 12, 
                    paddingVertical: 2, 
                    paddingHorizontal: 16, 
                    marginBottom: 24, 
                    borderRadius: 18,
                    backgroundColor: colors.card,
                    borderWidth: 1,
                    borderColor: colors.border
                }}>
                    <Search size={20} color={colors.textMuted} />
                    <TextInput 
                        value={search} 
                        onChangeText={setSearch} 
                        placeholder="Search conversations..." 
                        placeholderTextColor={colors.textMuted} 
                        style={{ flex: 1, height: 52, fontSize: 15, color: colors.text, fontFamily: fonts.regular }} 
                    />
                </MedCard>

                {onOpenAI && role === 'patient' && (
                    <TouchableOpacity onPress={onOpenAI} activeOpacity={0.9} style={{ marginBottom: 32 }}>
                        <MedCard style={{ 
                            backgroundColor: colors.primary, 
                            padding: 20, 
                            flexDirection: 'row', 
                            alignItems: 'center', 
                            gap: 16,
                            overflow: 'hidden',
                            position: 'relative'
                        }}>
                            <View style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.1)' }} />
                            <View style={{ width: 60, height: 60, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
                                <Bot size={32} color="#FFF" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontFamily: fonts.bold, fontSize: 17, color: '#FFF' }}>AI Health Assistant</Text>
                                <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>Secure symptom checker & advice</Text>
                            </View>
                            <View style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
                                <ChevronRight size={22} color="#FFF" />
                            </View>
                        </MedCard>
                    </TouchableOpacity>
                )}
                
                <SectionHeader title="Recent Conversations" />
            </View>

            <FlatList
                data={filtered}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <TouchableOpacity 
                        onPress={() => onSelectConversation(item)} 
                        activeOpacity={0.8} 
                        style={{ marginBottom: 14 }}
                    >
                        <MedCard style={{ 
                            flexDirection: 'row', 
                            alignItems: 'center', 
                            gap: 16, 
                            padding: 14,
                            borderRadius: 22
                        }}>
                            {/* Initials Avatar */}
                            <View style={{ position: 'relative' }}>
                                <View style={{
                                    width: 56, height: 56, borderRadius: 18,
                                    backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Text style={{ fontFamily: fonts.bold, fontSize: 18, color: colors.primary }}>
                                        {item.participantName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
                                    </Text>
                                </View>
                                {item.online && (
                                    <View style={{
                                        position: 'absolute', bottom: 0, right: 0,
                                        width: 14, height: 14, borderRadius: 7,
                                        backgroundColor: colors.success, borderWidth: 2, borderColor: '#FFF',
                                    }} />
                                )}
                            </View>
                            <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                    <Text style={typography.bodyMedium}>{item.participantName}</Text>
                                    <Text style={typography.label}>{item.lastMessageTime}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <View style={{ flex: 1, marginRight: 8 }}>
                                        {(item as any).specialization && (
                                            <Text style={[typography.overline, { marginBottom: 2 }]}>{(item as any).specialization}</Text>
                                        )}
                                        <Text style={[typography.body, item.unreadCount > 0 && { color: colors.text, fontFamily: fonts.medium }]} numberOfLines={1}>
                                            {item.lastMessage}
                                        </Text>
                                    </View>
                                    {item.unreadCount > 0 && (
                                        <View style={{ backgroundColor: colors.primary, borderRadius: 12, minWidth: 22, height: 22, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 }}>
                                            <Text style={{ fontFamily: fonts.bold, fontSize: 11, color: '#FFF' }}>{item.unreadCount}</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </MedCard>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}
