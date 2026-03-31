/**
 * MedCare Design System — Teal Healthcare Palette
 *
 * Inspired by: Apple Health, Fitbit — calm, medical, premium.
 * Primary brand: deep teal #1F4E5F
 * All colors derived from logo: teal / cyan / soft-blue family.
 *
 * LAYER MODEL (from previous elevation upgrade):
 *   Layer 0 — Background  (#F4F7F9 warm off-white with subtle teal tint)
 *   Layer 1 — Cards        (Shadows.md — medium elevation)
 *   Layer 2 — Floating     (Shadows.lg — nav bar, FABs, modals)
 */

import { Platform, ViewStyle } from 'react-native';

// ─── Color Palette ────────────────────────────────────────────────────────────
export const colors = {
  // Brand — Teal family (from logo)
  primary:      '#1F4E5F',   // Deep teal — buttons, active states, icons
  primaryLight: '#2A6B82',   // Lighter teal for hover/pressed tones
  secondary:    '#6EC1C8',   // Soft cyan — secondary actions, info accents
  accent:       '#A8DADC',   // Light aqua — tints, card backgrounds
  blue:         '#457B9D',   // Muted steel blue — tertiary accent

  // Gradients (start → end)
  gradientTeal:  ['#1F4E5F', '#6EC1C8'] as const,   // Teal → Cyan
  gradientCyan:  ['#6EC1C8', '#A8DADC'] as const,   // Cyan → Aqua
  gradientCard:  ['#F0F9FA', '#FFFFFF'] as const,   // Subtle card wash

  // Backgrounds — Layer 0
  background:    '#F4F7F9',  // Off-white with a breath of teal
  backgroundAlt: '#EBF5F7',  // Slightly tinted section bg
  surface:       '#FFFFFF',
  card:          '#FFFFFF',  // Cards: white but tinted via shadow/border below
  cardTint:      '#F0F9FA',  // Light teal-tinted card surfaces (health metrics)

  // Borders
  border:        '#D8E8EC',  // Subtle teal-tinted border
  borderGlass:   'rgba(255, 255, 255, 0.65)',

  // Semantic status
  success:  '#6BCB77',   // Soft green
  warning:  '#F4A261',   // Soft orange
  danger:   '#E76F51',   // Muted red-orange
  info:     '#6EC1C8',   // Cyan (same as secondary)

  // Text
  text:          '#1C1C1E',   // Near-black
  textSecondary: '#6B7280',   // Medium grey
  textMuted:     '#9CA3AF',   // Light muted grey
  disabled:      '#CBD5E1',
} as const;

// ─── Health Metric Card Tints ─────────────────────────────────────────────────
// Each vital metric gets a soft tinted background derived from palette
export const metricTints = {
  heartRate:     { bg: '#FEF2F2', icon: '#E76F51',  border: '#FECDD3' },   // soft red
  oxygen:        { bg: '#EBF8FA', icon: '#6EC1C8',  border: '#A8DADC' },   // cyan
  steps:         { bg: '#E8F5EE', icon: '#6BCB77',  border: '#BBF7D0' },   // teal-green
  bloodPressure: { bg: '#EFF6FF', icon: '#457B9D',  border: '#BFDBFE' },   // steel blue
  bloodSugar:    { bg: '#FFF8EC', icon: '#F4A261',  border: '#FED7AA' },   // soft orange
  weight:        { bg: '#F5F0FF', icon: '#A78BFA',  border: '#DDD6FE' },   // lavender
} as const;

// ─── Spacing ──────────────────────────────────────────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

// ─── Border Radius ────────────────────────────────────────────────────────────
export const radius = {
  sm: 8,
  md: 12,
  lg: 20,   // cards
  xl: 24,   // hero cards / bottom sheets
  full: 9999,
} as const;

// ─── Font Families ────────────────────────────────────────────────────────────
export const fonts = {
  regular:  'Inter_400Regular',
  medium:   'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold:     'Inter_700Bold',
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────
export const typography = {
  screenTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.5,
    color: colors.text,
  },
  sectionTitle: {
    fontFamily: fonts.medium,
    fontSize: 17,
    lineHeight: 24,
    color: colors.text,
  },
  cardValue: {
    fontFamily: fonts.bold,
    fontSize: 20,
    lineHeight: 28,
    color: colors.text,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 24,
    color: colors.textSecondary,
  },
  bodyMedium: {
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 24,
    color: colors.text,
  },
  bodySmall: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  label: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
  },
  labelMedium: {
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
  },
  overline: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
    color: colors.textMuted,
  },
  button: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  // Backward-compat aliases
  title:   { fontFamily: fonts.semiBold, fontSize: 20, lineHeight: 28, color: colors.text },
  section: { fontFamily: fonts.medium,   fontSize: 16, lineHeight: 24, color: colors.text },
  caption: { fontFamily: fonts.regular,  fontSize: 12, lineHeight: 18, color: colors.textMuted },
} as const;

// ─── Elevation / Shadow System ────────────────────────────────────────────────
//  Teal-tinted shadows for a cohesive on-brand feel.
//  Using dark teal base (#0D2B36) at low opacity instead of plain black.
const SHADOW_COLOR = '#0D2B36';  // darkened teal — cohesive with brand

export const Shadows = {
  /** Light elevation — buttons, badges */
  sm: Platform.select<ViewStyle>({
    ios: {
      shadowColor: SHADOW_COLOR,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
    },
    android: { elevation: 3 },
    web: { boxShadow: '0 4px 12px 0 rgba(13, 43, 54, 0.08)' } as any,
    default: {},
  })!,

  /** Medium elevation — cards floating above background */
  md: Platform.select<ViewStyle>({
    ios: {
      shadowColor: SHADOW_COLOR,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.09,
      shadowRadius: 24,
    },
    android: { elevation: 5 },
    web: { boxShadow: '0 6px 24px 0 rgba(13, 43, 54, 0.09), 0 1px 4px 0 rgba(13, 43, 54, 0.05)' } as any,
    default: {},
  })!,

  /** High elevation — nav bar, modals, floating action buttons */
  lg: Platform.select<ViewStyle>({
    ios: {
      shadowColor: SHADOW_COLOR,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.13,
      shadowRadius: 32,
    },
    android: { elevation: 12 },
    web: { boxShadow: '0 10px 32px 0 rgba(13, 43, 54, 0.13), 0 2px 8px 0 rgba(13, 43, 54, 0.07)' } as any,
    default: {},
  })!,

  /** Reduced elevation — card pressed/active state */
  pressed: Platform.select<ViewStyle>({
    ios: {
      shadowColor: SHADOW_COLOR,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
    },
    android: { elevation: 2 },
    web: { boxShadow: '0 2px 8px 0 rgba(13, 43, 54, 0.05)' } as any,
    default: {},
  })!,
} as const;

// ─── Backward-compat cardShadow alias (maps to Shadows.md) ───────────────────
export const cardShadow = Shadows.md;

// ─── Status Badge Colors ──────────────────────────────────────────────────────
// Teal-family tints for status pills
export const statusBadge = {
  stable:      { bg: '#E8F5EE', text: '#2D7A43' },   // soft green
  critical:    { bg: '#FEE8E2', text: '#C0402A' },   // muted red
  review:      { bg: '#FFF4E6', text: '#B5600E' },   // soft amber
  upcoming:    { bg: '#E8F2FA', text: '#1C567A' },   // teal-blue tint
  completed:   { bg: '#E8F5EE', text: '#2D7A43' },   // soft green
  cancelled:   { bg: '#FEE8E2', text: '#C0402A' },   // muted red
  confirmed:   { bg: '#EAF5F7', text: '#1F4E5F' },   // primary teal tint
  rescheduled: { bg: '#F5F3FF', text: '#6D28D9' },   // purple tint
  info:        { bg: '#EAF5F7', text: '#457B9D' },   // steel blue tint
} as const;

// ─── Dark Mode Tokens (reference only — toggle manually if dark mode added) ──
export const darkColors = {
  primary:      '#3D8FA3',   // slightly brighter teal for dark bg visibility
  background:   '#121212',
  card:         '#1E1E1E',
  surface:      '#242424',
  border:       '#2C3E3F',
  text:         '#F2F2F7',
  textSecondary:'#8E8E93',
  textMuted:    '#636366',
} as const;
