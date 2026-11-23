/**
 * MJ Estates Design System — Unified Theme Export
 */

import { colors } from './colors';
import { typography } from './typography';
import { spacing, layout } from './spacing';
import { radius } from './radius';

export const theme = {
  colors,
  typography,
  spacing,
  layout,
  radius,
} as const;

export type Theme = typeof theme;

export * from './colors';
export * from './typography';
export * from './spacing';
export * from './radius';
