/**
 * useTheme Hook
 * Provides type-safe access to application design tokens.
 */

import { theme, Theme } from '../theme';

export function useTheme(): Theme {
  return theme;
}

