/**
 * MedCare Design System - Medical Friendly
 * Soft, calm, and premium healthcare UI.
 */

import { Platform } from 'react-native';

export const colors = {
  primary: '#1D8FD4',       // Deeper medical blue (was #3ABEF9 — too light)
  secondary: '#A78BFA',     // Richer lavender (was #D8B4FE — too pastel)
  accent: '#2DD4BF',        // Deeper teal (was #99F6E4 — too pale)
  background: '#EEF1F5',    // Slightly deeper off-white (was #F7F8FA)
  surface: '#FFFFFF',
  card: '#FFFFFF',
  border: '#D1D9E6',        // More visible border (was #E8EBF0 — barely visible)
  success: '#10B981',       // Richer emerald (was #34D399 — too light)
  warning: '#F59E0B',       // Stronger amber (was #FBBF24)
  danger: '#EF4444',        // Clearer red (was #F87171 — too pink)
  info: '#3B82F6',          // Deeper info blue (was #60A5FA — too light)
  text: '#0F172A',          // Near-black slate (was #1C1C1E)
  textSecondary: '#475569', // Richer medium slate (was #6B7280)
  textMuted: '#94A3B8',     // Clearer muted (was #9CA3AF)
  disabled: '#CBD5E1',
} as const;


export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

// ─── Font Families ────────────────────────────────────────────────────────────
export const fonts = {
  regular:  'Inter_400Regular',
  medium:   'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold:     'Inter_700Bold',
} as const;

// ─── Typography Scale ─────────────────────────────────────────────────────────
export const typography = {
  // Screen / Page titles  22-24px SemiBold
  screenTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.5,
    color: colors.text,
  },
  // Section headers  16-18px Medium
  sectionTitle: {
    fontFamily: fonts.medium,
    fontSize: 17,
    lineHeight: 24,
    color: colors.text,
  },
  // Card values / health data  18-20px Bold
  cardValue: {
    fontFamily: fonts.bold,
    fontSize: 20,
    lineHeight: 28,
    color: colors.text,
  },
  // Body text  14-16px Regular
  body: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 24,
    color: colors.textSecondary,
  },
  // Body emphasis (Medium weight body)
  bodyMedium: {
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 24,
    color: colors.text,
  },
  // Small body  13-14px Regular
  bodySmall: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  // Labels / captions  12-13px Regular
  label: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
  },
  // Labels — Medium weight
  labelMedium: {
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
  },
  // Overline / uppercase category labels
  overline: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
    color: colors.textMuted,
  },
  // Button text
  button: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  // DEPRECATED — kept for backward compat, maps to bodySmall
  title:     { fontFamily: fonts.semiBold, fontSize: 20, lineHeight: 28, color: colors.text },
  section:   { fontFamily: fonts.medium,   fontSize: 16, lineHeight: 24, color: colors.text },
  caption:   { fontFamily: fonts.regular,  fontSize: 12, lineHeight: 18, color: colors.textMuted },
} as const;

export const cardShadow = Platform.select({
  ios: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
  },
  android: {
    elevation: 4,
  },
  default: {},
});

export const statusBadge = {
  stable:    { bg: '#D1FAE5', text: '#065F46' },
  critical:  { bg: '#FEE2E2', text: '#991B1B' },
  review:    { bg: '#FEF3C7', text: '#92400E' },
  upcoming:  { bg: '#DBEAFE', text: '#1E40AF' },
  completed: { bg: '#D1FAE5', text: '#065F46' },
  cancelled: { bg: '#FEE2E2', text: '#991B1B' },
  confirmed: { bg: '#DBEAFE', text: '#1E40AF' },
} as const;
