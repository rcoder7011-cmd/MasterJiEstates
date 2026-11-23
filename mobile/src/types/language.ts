/**
 * Language & Translation Types — src/types/language.ts
 */

export type LanguageCode = 'en' | 'hi' | 'hinglish';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  description: string;
}

export const AVAILABLE_LANGUAGES: LanguageOption[] = [
  {
    code: 'en',
    label: 'English',
    nativeLabel: 'English',
    description: 'Default international language',
  },
  {
    code: 'hi',
    label: 'Hindi',
    nativeLabel: 'हिन्दी',
    description: 'Devanagari script for native Hindi speakers',
  },
  {
    code: 'hinglish',
    label: 'Hinglish',
    nativeLabel: 'Hinglish (Roman Hindi)',
    description: 'Natural colloquial Hindi written in Roman script',
  },
];

