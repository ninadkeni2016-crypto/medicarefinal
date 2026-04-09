import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Clock, Users, AlertCircle } from 'lucide-react-native';
import { colors, spacing, radius, typography, Shadows } from '@/lib/theme';
import api from '@/lib/api';

interface QueueStatusCardProps {
    doctorId: string;
    date: string; // "Apr 8" format
}

export const QueueStatusCard = ({ doctorId, date }: QueueStatusCardProps) => {
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQueue = async () => {
            try {
                const res = await api.get('/appointments/queue-status', {
                    params: { doctorId, date }
                });
                setStatus(res.data);
            } catch (err) {
                console.error('Failed to fetch queue status', err);
            } finally {
                setLoading(false);
            }
        };

        fetchQueue();
        const interval = setInterval(fetchQueue, 30000); // 30 sec refresh
        return () => clearInterval(interval);
    }, [doctorId, date]);

    if (loading) return <ActivityIndicator color={colors.primary} style={{ margin: spacing.lg }} />;
    if (!status || status.queuePosition <= 0) return null;

    const isDelayed = status.delayMinutes > 0;

    return (
        <View style={[styles.container, isDelayed && styles.delayedContainer]}>
            <View style={styles.header}>
                <View style={[styles.iconBox, isDelayed && styles.delayedIconBox]}>
                    {isDelayed ? <Clock size={20} color={colors.danger} /> : <Users size={20} color={colors.primary} />}
                </View>
                <View>
                    <Text style={styles.title}>
                        {isDelayed ? 'Doctor is running late' : 'Your Queue Position'}
                    </Text>
                    <Text style={styles.subtitle}>
                        {status.queuePosition === 1 
                            ? 'You are next!' 
                            : `Number ${status.queuePosition} in line`}
                    </Text>
                </View>
            </View>

            <View style={styles.statsRow}>
                <View style={styles.stat}>
                    <Text style={styles.statLabel}>Est. Wait</Text>
                    <Text style={[styles.statValue, isDelayed && { color: colors.danger }]}>
                        {status.estimatedWaitTime} mins
                    </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.stat}>
                    <Text style={styles.statLabel}>Delay</Text>
                    <Text style={styles.statValue}>
                        {isDelayed ? `+${status.delayMinutes} min` : 'None'}
                    </Text>
                </View>
            </View>

            {isDelayed && (
                <View style={styles.alert}>
                    <AlertCircle size={14} color={colors.danger} />
                    <Text style={styles.alertText}>The previous visit is taking longer than expected.</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: spacing.lg,
        ...Shadows.md,
        marginVertical: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    delayedContainer: {
        borderColor: colors.danger + '40', // 25% opacity
        backgroundColor: '#FFF5F5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    delayedIconBox: {
        backgroundColor: '#FEE2E2',
    },
    title: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    subtitle: {
        ...typography.title,
        fontSize: 18,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        padding: spacing.md,
        borderRadius: radius.md,
    },
    stat: {
        flex: 1,
        alignItems: 'center',
    },
    statLabel: {
        ...typography.label,
        color: colors.textMuted,
        marginBottom: 2,
    },
    statValue: {
        ...typography.bodyMedium,
        fontSize: 16,
        color: colors.primary,
        fontWeight: 'bold',
    },
    divider: {
        width: 1,
        height: 24,
        backgroundColor: colors.border,
    },
    alert: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: spacing.md,
    },
    alertText: {
        ...typography.label,
        color: colors.danger,
    },
});
