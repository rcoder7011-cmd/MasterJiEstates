/**
 * MJ Estates Design System — Border Radius Tokens
 */

export const radius = {
  none: 0,
  xs: 4,      // Small tags, micro badges
  sm: 6,      // Inline chips, subtle elements
  md: 8,      // Standard input fields, small buttons
  lg: 12,     // Standard cards, primary buttons
  xl: 16,     // Featured cards, bottom sheets
  xxl: 24,    // Large containers, modal dialogs
  full: 9999, // Pill buttons, avatar containers
} as const;

export type RadiusToken = keyof typeof radius;

