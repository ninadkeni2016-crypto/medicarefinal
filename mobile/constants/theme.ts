import { Platform } from 'react-native';

export const Colors = {
  primary: '#2563EB',
  secondary: '#64748B',
  background: '#F8FAFC',
  card: '#FFFFFF',
  border: '#E2E8F0',
  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#DC2626',
  text: {
    primary: '#0F172A',
    secondary: '#64748B',
    muted: '#94A3B8',
    white: '#FFFFFF',
  }
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const Shadows = {
  sm: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
    android: { elevation: 1 },
    web: { boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' },
  }),
  md: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4 },
    android: { elevation: 2 },
    web: { boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' },
  }),
};

export const Typography = {
  title: {
    fontSize: 24,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  heading: {
    fontSize: 18,
    fontWeight: '500' as const,
    color: Colors.text.primary,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
  },
  label: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.text.muted,
  }
};
