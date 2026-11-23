/**
 * MJ Estates Design System — Spacing & Layout Tokens
 */

export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  massive: 48,
} as const;

export const layout = {
  // Screen insets
  screenPaddingHorizontal: 20,
  screenPaddingVertical: 16,

  // Container dimensions
  cardPadding: 16,
  cardPaddingCompact: 12,
  cardPaddingSpacious: 20,

  // Interactive component heights (optimized for comfortable touch targets >= 44px)
  buttonHeight: 48,
  buttonHeightSm: 38,
  buttonHeightLg: 54,
  inputHeight: 48,
  inputHeightMultiline: 100,

  // Icon sizing
  iconSizeXs: 14,
  iconSizeSm: 18,
  iconSizeMd: 22,
  iconSizeLg: 26,
  iconSizeXl: 32,

  // Border widths
  borderHairline: 1,
  borderThin: 1,
  borderMedium: 2,
  borderThick: 3,
} as const;

export type SpacingToken = keyof typeof spacing;
export type LayoutToken = keyof typeof layout;
