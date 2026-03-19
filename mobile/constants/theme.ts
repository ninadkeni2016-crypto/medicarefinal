import { Platform } from 'react-native';

/**
 * constants/theme.ts — NativeWind / Tailwind companion tokens
 * Mirrors lib/theme.ts for components using Tailwind className approach.
 * Primary palette: teal #1F4E5F family.
 */
export const Colors = {
  primary:   '#1F4E5F',   // Deep teal
  secondary: '#6EC1C8',   // Soft cyan
  accent:    '#A8DADC',   // Light aqua
  blue:      '#457B9D',   // Steel blue
  background:'#F4F7F9',   // Teal-tinted off-white
  card:      '#FFFFFF',
  border:    '#D8E8EC',   // Teal-tinted border
  success:   '#6BCB77',
  warning:   '#F4A261',
  danger:    '#E76F51',
  info:      '#6EC1C8',
  text: {
    primary:   '#1C1C1E',
    secondary: '#6B7280',
    muted:     '#9CA3AF',
    white:     '#FFFFFF',
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
  sm: 8,
  md: 12,
  lg: 20,   // card radius
  xl: 24,
  full: 9999,
};

export const Shadows = {
  sm: Platform.select({
    ios:     { shadowColor: '#0D2B36', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12 },
    android: { elevation: 3 },
    web:     { boxShadow: '0 4px 12px 0 rgba(13, 43, 54, 0.08)' },
  }),
  md: Platform.select({
    ios:     { shadowColor: '#0D2B36', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.09, shadowRadius: 24 },
    android: { elevation: 5 },
    web:     { boxShadow: '0 6px 24px 0 rgba(13, 43, 54, 0.09)' },
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
