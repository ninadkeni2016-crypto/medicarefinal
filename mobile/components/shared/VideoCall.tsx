import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions, SafeAreaView } from 'react-native';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Maximize, MessageSquare } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface VideoCallProps { onEndCall: () => void; patientName?: string; doctorName?: string; isDoctor?: boolean; }

export default function VideoCall({ onEndCall, patientName = 'Arjun Verma', doctorName = 'Dr. Sameer Mahadik', isDoctor = false }: VideoCallProps) {
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    // Simulate remote video feed with a gif or high quality image
    const remoteAvatar = isDoctor ? 'https://randomuser.me/api/portraits/men/32.jpg' : 'https://ui-avatars.com/api/?name=SM&background=e0f2fe&color=0284c7';
    // Simulate local self-view
    const localAvatar = isDoctor ? 'https://ui-avatars.com/api/?name=SM&background=e0f2fe&color=0284c7' : 'https://randomuser.me/api/portraits/men/32.jpg';

    const remoteName = isDoctor ? patientName : doctorName;

    return (
        <View style={{ flex: 1, backgroundColor: '#000' }}>
            {/* Background remote video stream (simulated) */}
            <Image
                source={{ uri: remoteAvatar }}
                style={{ width, height, position: 'absolute', opacity: 0.8 }}
                resizeMode="cover"
                blurRadius={isVideoOff ? 20 : 0}
            />
            {/* Dark gradient overlay for UI visibility */}
            <View style={{ position: 'absolute', top: 0, width, height: 120, backgroundColor: 'rgba(0,0,0,0.4)' }} />
            <View style={{ position: 'absolute', bottom: 0, width, height: 160, backgroundColor: 'rgba(0,0,0,0.6)' }} />

            <SafeAreaView style={{ flex: 1, justifyContent: 'space-between' }}>
                {/* Header Information */}
                <View style={{ paddingHorizontal: 20, paddingTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View>
                        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>{remoteName}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981' }} />
                            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>02:45 • Encrypted</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
                        <Maximize size={20} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Local Video Picture-in-Picture */}
                <View style={{ position: 'absolute', right: 20, bottom: 160, width: 100, height: 150, borderRadius: 16, overflow: 'hidden', borderWidth: 2, borderColor: '#fff' }}>
                    <Image source={{ uri: localAvatar }} style={{ width: '100%', height: '100%' }} />
                    {isVideoOff && (
                        <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center' }}>
                            <VideoOff size={24} color="#64748b" />
                        </View>
                    )}
                </View>

                {/* Bottom Controls */}
                <View style={{ paddingBottom: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
                    <TouchableOpacity onPress={() => setIsMuted(!isMuted)} activeOpacity={0.7} style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: isMuted ? '#fff' : 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
                        {isMuted ? <MicOff size={24} color="#000" /> : <Mic size={24} color="#fff" />}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setIsVideoOff(!isVideoOff)} activeOpacity={0.7} style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: isVideoOff ? '#fff' : 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
                        {isVideoOff ? <VideoOff size={24} color="#000" /> : <Video size={24} color="#fff" />}
                    </TouchableOpacity>

                    <TouchableOpacity activeOpacity={0.7} style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
                        <MessageSquare size={24} color="#fff" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={onEndCall} activeOpacity={0.7} style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center' }}>
                        <PhoneOff size={28} color="#fff" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

import { StyleSheet } from 'react-native';
