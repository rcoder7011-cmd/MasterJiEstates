/**
 * Translations Central Hub — src/translations/index.ts
 */

import { en, TranslationKeys } from './en';
import { hi } from './hi';
import { hinglish } from './hinglish';
import { LanguageCode } from '../types/language';

export const translations: Record<LanguageCode, TranslationKeys> = {
  en,
  hi,
  hinglish,
};

export * from './en';
export * from './hi';
export * from './hinglish';

