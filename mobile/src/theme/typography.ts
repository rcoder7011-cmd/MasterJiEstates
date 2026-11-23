/**
 * MJ Estates Design System — Typography Scale
 * Uses system fonts ensuring seamless multi-script rendering (English, Hindi, Hinglish).
 */

import { TextStyle, Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: undefined,
});

export const typography = {
  // Display: Top-level hero numbers or titles
  display: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '800' as TextStyle['fontWeight'],
    fontFamily,
    letterSpacing: -0.5,
  },

  // Heading 1: Primary screen titles
  h1: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700' as TextStyle['fontWeight'],
    fontFamily,
    letterSpacing: -0.3,
  },

  // Heading 2: Section titles
  h2: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700' as TextStyle['fontWeight'],
    fontFamily,
    letterSpacing: -0.2,
  },

  // Heading 3: Subsections and card titles
  h3: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '600' as TextStyle['fontWeight'],
    fontFamily,
    letterSpacing: -0.1,
  },

  // Body: Primary reading and form text
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400' as TextStyle['fontWeight'],
    fontFamily,
    letterSpacing: 0,
  },

  // Body Small: Secondary details, metadata, list descriptions
  bodySmall: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as TextStyle['fontWeight'],
    fontFamily,
    letterSpacing: 0,
  },

  // Caption: Badges, labels, helper text, timestamps
  caption: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500' as TextStyle['fontWeight'],
    fontFamily,
    letterSpacing: 0.2,
  },

  // Button: Interactive action labels
  button: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600' as TextStyle['fontWeight'],
    fontFamily,
    letterSpacing: 0.2,
  },
} as const;

export type TypographyVariant = keyof typeof typography;
