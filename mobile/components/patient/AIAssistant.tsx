import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { ArrowLeft, Send, Bot } from 'lucide-react-native';
import { colors, spacing, radius, typography, fonts, Shadows } from '@/lib/theme';

interface Props { onBack: () => void; }

interface Msg { id: string; text: string; sender: 'user' | 'ai'; }

const aiResponses = [
    "Based on your symptoms, this could be related to several conditions. I'd recommend consulting with a healthcare professional for a proper diagnosis.",
    "It sounds like you may be experiencing common symptoms. Make sure to stay hydrated and rest. If symptoms persist for more than 48 hours, please see a doctor.",
    "I understand your concern. While I can provide general health information, it's important to get a professional medical opinion for accurate diagnosis and treatment.",
    "Those symptoms could indicate a viral infection. Monitor your temperature and stay hydrated. If you develop a fever above 101°F, seek medical attention.",
    "Thank you for sharing that. Here are some general recommendations: maintain proper hygiene, eat nutritious foods, and get adequate sleep. Would you like me to suggest a specialist?",
];

export default function AIAssistant({ onBack }: Props) {
    const [messages, setMessages] = useState<Msg[]>([
        { id: '0', text: "Hello! I'm your AI Health Assistant 🤖\n\nI can help you:\n• Check symptoms\n• Get health advice\n• Find the right specialist\n\nHow can I help you today?", sender: 'ai' },
    ]);
    const [text, setText] = useState('');
    const flatListRef = useRef<FlatList>(null);

    const handleSend = () => {
        if (!text.trim()) return;
        const userMsg: Msg = { id: String(Date.now()), text: text.trim(), sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setText('');
        setTimeout(() => {
            const reply: Msg = { id: String(Date.now() + 1), text: aiResponses[Math.floor(Math.random() * aiResponses.length)], sender: 'ai' };
            setMessages(prev => [...prev, reply]);
        }, 1500);
    };

    useEffect(() => { setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100); }, [messages]);

    return (
        <KeyboardAvoidingView 
            style={{ flex: 1, backgroundColor: colors.background }} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
            {/* Header */}
            <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                gap: 12, 
                padding: 16, 
                backgroundColor: colors.surface, 
                borderBottomWidth: 1, 
                borderBottomColor: colors.border,
                ...Shadows.sm
            }}>
                <TouchableOpacity 
                    onPress={onBack} 
                    activeOpacity={0.7} 
                    style={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: 12, 
                        backgroundColor: colors.background, 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                    }}
                >
                    <ArrowLeft size={20} color={colors.primary} />
                </TouchableOpacity>
                <View style={{ 
                    width: 44, 
                    height: 44, 
                    borderRadius: 14, 
                    backgroundColor: colors.primary, 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                }}>
                    <Bot size={24} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[typography.bodyMedium, { color: colors.primary, fontSize: 16 }]}>AI Health Assistant</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success }} />
                        <Text style={[typography.label, { color: colors.success }]}>Always available</Text>
                    </View>
                </View>
            </View>

            {/* Messages */}
            <FlatList
                style={{ flex: 1 }}
                ref={flatListRef}
                data={messages}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <View style={{ 
                        alignSelf: item.sender === 'user' ? 'flex-end' : 'flex-start', 
                        maxWidth: '82%', 
                        marginBottom: 16 
                    }}>
                        {item.sender === 'ai' && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6, marginLeft: 4 }}>
                                <View style={{ 
                                    width: 24, 
                                    height: 24, 
                                    borderRadius: 8, 
                                    backgroundColor: colors.secondary, 
                                    alignItems: 'center', 
                                    justifyContent: 'center' 
                                }}>
                                    <Bot size={14} color="#fff" />
                                </View>
                                <Text style={[typography.overline, { fontSize: 10, color: colors.textSecondary }]}>AI Assistant</Text>
                            </View>
                        )}
                        <View style={{ 
                            backgroundColor: item.sender === 'user' ? colors.primary : colors.cardTint, 
                            borderRadius: radius.lg, 
                            borderBottomRightRadius: item.sender === 'user' ? 4 : radius.lg, 
                            borderBottomLeftRadius: item.sender !== 'user' ? 4 : radius.lg, 
                            paddingHorizontal: 16, 
                            paddingVertical: 12,
                            borderWidth: 1,
                            borderColor: item.sender === 'user' ? colors.primary : colors.border,
                            ...Shadows.sm
                        }}>
                            <Text style={{ 
                                fontSize: 15, 
                                color: item.sender === 'user' ? '#fff' : colors.text, 
                                lineHeight: 22,
                                fontFamily: fonts.regular
                            }}>
                                {item.text}
                            </Text>
                        </View>
                    </View>
                )}
            />

            {/* Quick Actions */}
            <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
                <Text style={[typography.overline, { marginBottom: 8, marginLeft: 4 }]}>Quick Suggestions</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {['Headache', 'Fever', 'Cough', 'Fatigue'].map(symptom => (
                        <TouchableOpacity 
                            key={symptom} 
                            onPress={() => { setText(`I have a ${symptom.toLowerCase()}`); }} 
                            activeOpacity={0.7} 
                            style={{ 
                                paddingHorizontal: 14, 
                                paddingVertical: 8, 
                                borderRadius: 20, 
                                backgroundColor: colors.accent,
                                borderWidth: 1,
                                borderColor: colors.border
                            }}
                        >
                            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.primary }}>{symptom}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Input */}
            <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                gap: 10, 
                padding: 16, 
                paddingBottom: Platform.OS === 'ios' ? 32 : 16, 
                backgroundColor: colors.surface, 
                borderTopWidth: 1, 
                borderTopColor: colors.border 
            }}>
                <TextInput 
                    value={text} 
                    onChangeText={setText} 
                    placeholder="Describe your symptoms..." 
                    placeholderTextColor={colors.textMuted} 
                    style={{ 
                        flex: 1, 
                        paddingHorizontal: 18, 
                        paddingVertical: 12, 
                        borderRadius: 25, 
                        backgroundColor: colors.background, 
                        fontSize: 15, 
                        color: colors.text,
                        fontFamily: fonts.regular,
                        borderWidth: 1,
                        borderColor: colors.border
                    }} 
                    onSubmitEditing={handleSend} 
                />
                <TouchableOpacity 
                    onPress={handleSend} 
                    activeOpacity={0.7} 
                    style={{ 
                        width: 48, 
                        height: 48, 
                        borderRadius: 24, 
                        backgroundColor: text.trim() ? colors.primary : colors.disabled, 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        ...Shadows.sm
                    }}
                >
                    <Send size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}
