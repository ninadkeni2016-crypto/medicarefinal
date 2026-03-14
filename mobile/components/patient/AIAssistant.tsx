import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { ArrowLeft, Send, Bot } from 'lucide-react-native';

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
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
                <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                    <ArrowLeft size={16} color="#334155" />
                </TouchableOpacity>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#0ea5e9', alignItems: 'center', justifyContent: 'center' }}>
                    <Bot size={20} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '600', fontSize: 14, color: '#0284c7' }}>AI Health Assistant</Text>
                    <Text style={{ fontSize: 12, color: '#16a34a' }}>Always available</Text>
                </View>
            </View>

            {/* Messages */}
            <FlatList
                style={{ flex: 1 }}
                ref={flatListRef}
                data={messages}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
                renderItem={({ item }) => (
                    <View style={{ alignSelf: item.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%', marginBottom: 10 }}>
                        {item.sender === 'ai' && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                <View style={{ width: 20, height: 20, borderRadius: 6, backgroundColor: '#0ea5e9', alignItems: 'center', justifyContent: 'center' }}>
                                    <Bot size={12} color="#fff" />
                                </View>
                                <Text style={{ fontSize: 10, color: '#64748b', fontWeight: '500' }}>AI Assistant</Text>
                            </View>
                        )}
                        <View style={{ backgroundColor: item.sender === 'user' ? '#0ea5e9' : '#f1f5f9', borderRadius: 16, borderBottomRightRadius: item.sender === 'user' ? 4 : 16, borderBottomLeftRadius: item.sender !== 'user' ? 4 : 16, paddingHorizontal: 14, paddingVertical: 10 }}>
                            <Text style={{ fontSize: 14, color: item.sender === 'user' ? '#fff' : '#0284c7', lineHeight: 20 }}>{item.text}</Text>
                        </View>
                    </View>
                )}
            />

            {/* Quick Actions */}
            <View style={{ flexDirection: 'row', gap: 6, paddingHorizontal: 16, paddingBottom: 8 }}>
                {['Headache', 'Fever', 'Cough', 'Fatigue'].map(symptom => (
                    <TouchableOpacity key={symptom} onPress={() => { setText(`I have a ${symptom.toLowerCase()}`); }} activeOpacity={0.7} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#f0fdfa' }}>
                        <Text style={{ fontSize: 11, fontWeight: '500', color: '#0ea5e9' }}>{symptom}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Input */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16, paddingBottom: Platform.OS === 'ios' ? 24 : 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9' }}>
                <TextInput value={text} onChangeText={setText} placeholder="Describe your symptoms..." placeholderTextColor="#94a3b8" style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, backgroundColor: '#f1f5f9', fontSize: 14, color: '#0284c7' }} onSubmitEditing={handleSend} />
                <TouchableOpacity onPress={handleSend} activeOpacity={0.7} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: text.trim() ? '#0ea5e9' : '#e2e8f0', alignItems: 'center', justifyContent: 'center' }}>
                    <Send size={18} color={text.trim() ? '#fff' : '#94a3b8'} />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}
