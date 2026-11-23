/**
 * MJ Estates Design System — Color Tokens
 * Derived from the official MasterJiEstates brand identity:
 * Primary: Navy (#142B4F)
 * Secondary / Accent: Brand Gold (#D97706 / #F59E0B)
 * Background: Warm off-white (#FDFCFB)
 * Surface: Crisp white (#FFFFFF)
 */

export const colors = {
  // Official Premium MJ Estates Identity Tokens
  deepNavy: '#0A192F',          // Official Deep Navy
  primaryNavy: '#0F2444',       // Official Primary Navy
  gold: '#C5A059',              // Official MasterJi Gold
  canvas: '#FAF9F6',            // Official Canvas Background

  // Brand Colors
  primary: '#142B4F',           // Primary Navy
  primaryDark: '#0C1A30',       // Darker Navy for pressed/contrast
  primaryLight: '#1E3A8A',      // Lighter Navy tint
  primarySubtle: '#EEF2F9',     // Soft 5% Navy tint for badges/accents

  secondary: '#D97706',         // Secondary Brand Gold
  secondaryDark: '#B45309',     // Deep Gold
  secondaryLight: '#F59E0B',    // Amber / Bright Gold
  secondarySubtle: '#FEF3C7',   // 10% Gold background wash

  // Background & Surfaces
  background: '#FDFCFB',        // App default warm light background
  backgroundSecondary: '#F8FAFC', // Subtle grey background
  surface: '#FFFFFF',           // Card and modal surface
  surfaceElevated: '#FFFFFF',   // Elevated card surface
  surfaceMuted: '#F1F5F9',      // Input background / recessed areas

  // Typography Colors (Accessible Contrast)
  textPrimary: '#0F172A',       // High-contrast primary reading text (WCAG AAA)
  textSecondary: '#475569',     // Secondary / meta description text
  textMuted: '#94A3B8',         // Placeholder & disabled label text
  textInverse: '#FFFFFF',       // Text on dark/primary surfaces
  textGold: '#D97706',          // Gold emphasized text
  textOnGold: '#142B4F',        // Navy text on gold buttons for maximum legibility

  // Borders & Outlines
  border: '#E2E8F0',            // Standard hairline/card border
  borderLight: '#F1F5F9',       // Subtle separator line
  borderFocus: '#142B4F',       // Input active focus ring
  borderGold: 'rgba(217, 119, 6, 0.35)', // Gold outline for luxury badges/cards

  // Semantic Status Colors
  success: '#10B981',           // Emerald green for verified/success
  successSubtle: '#ECFDF5',     // Soft green tint
  warning: '#F59E0B',           // Amber for warnings/pending
  warningSubtle: '#FFFBEB',     // Soft amber tint
  error: '#EF4444',             // Red for errors/alerts
  errorSubtle: '#FEF2F2',       // Soft red tint for error banners
  info: '#3B82F6',              // Information blue

  // Interactive States
  pressedDark: 'rgba(20, 43, 79, 0.08)',
  pressedLight: 'rgba(255, 255, 255, 0.15)',
  disabledBackground: '#E2E8F0',
  disabledText: '#94A3B8',

  // Overlays
  overlay: 'rgba(15, 23, 42, 0.55)',
} as const;

export type ColorToken = keyof typeof colors;
