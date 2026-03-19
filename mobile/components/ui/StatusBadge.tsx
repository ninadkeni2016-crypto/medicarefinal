import React from 'react';
import { View, Text, Platform } from 'react-native';
import { statusBadge, radius } from '@/lib/theme';

type StatusKey = keyof typeof statusBadge;

interface StatusBadgeProps {
  status: string;
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const key = (status?.toLowerCase() || 'upcoming') as StatusKey;
  const style = statusBadge[key] ?? statusBadge.upcoming;
  const display = label ?? status;

  return (
    <View
      style={{
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: radius.full,
        backgroundColor: style.bg,
        // Subtle pill elevation — badges float slightly above card
        ...Platform.select({
          ios: {
            shadowColor: style.text,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.12,
            shadowRadius: 4,
          },
          android: { elevation: 1 },
          web: { boxShadow: `0 2px 4px 0 ${style.text}20` } as any,
          default: {},
        }),
      }}
    >
      <Text style={{ fontSize: 11, fontWeight: '600', color: style.text, textTransform: 'capitalize' }}>
        {display}
      </Text>
    </View>
  );
}
