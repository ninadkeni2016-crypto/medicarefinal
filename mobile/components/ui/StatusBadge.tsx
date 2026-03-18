import React from 'react';
import { View, Text } from 'react-native';
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
      }}
    >
      <Text style={{ fontSize: 11, fontWeight: '500', color: style.text, textTransform: 'capitalize' }}>
        {display}
      </Text>
    </View>
  );
}
