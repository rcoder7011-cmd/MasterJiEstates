/**
 * Language Context & Provider — src/context/LanguageContext.tsx
 * Manages active application language, persistent local storage via Expo SecureStore,
 * and reactive instant translation lookup.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import { LanguageCode, LanguageOption, AVAILABLE_LANGUAGES } from '../types/language';
import { translations } from '../translations';

const LANGUAGE_KEY = 'mj_app_language';
const DEFAULT_LANGUAGE: LanguageCode = 'en';

export interface LanguageContextType {
  currentLanguage: LanguageCode;
  selectedLanguageOption: LanguageOption;
  setLanguage: (code: LanguageCode) => Promise<void>;
  t: (keyPath: string, fallback?: string) => string;
  languages: LanguageOption[];
  isLoadingLanguage: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(DEFAULT_LANGUAGE);
  const [isLoadingLanguage, setIsLoadingLanguage] = useState(true);

  // Restore persisted language on app launch
  useEffect(() => {
    let isMounted = true;

    async function loadSavedLanguage() {
      try {
        const stored = await SecureStore.getItemAsync(LANGUAGE_KEY);
        if (stored && (stored === 'en' || stored === 'hi' || stored === 'hinglish')) {
          if (isMounted) {
            setCurrentLanguage(stored as LanguageCode);
          }
        }
      } catch (err) {
        if (__DEV__) {
          console.warn('[LanguageContext] Failed to restore language preference:', err);
        }
      } finally {
        if (isMounted) {
          setIsLoadingLanguage(false);
        }
      }
    }

    loadSavedLanguage();

    return () => {
      isMounted = false;
    };
  }, []);

  // Update language and persist to SecureStore
  const setLanguage = useCallback(async (code: LanguageCode) => {
    setCurrentLanguage(code);
    try {
      await SecureStore.setItemAsync(LANGUAGE_KEY, code);
    } catch (err) {
      if (__DEV__) {
        console.warn('[LanguageContext] Failed to persist language preference:', err);
      }
    }
  }, []);

  // Resolve dot-notation translation keys safely
  const t = useCallback(
    (keyPath: string, fallback?: string): string => {
      const activeDict = translations[currentLanguage] || translations.en;
      const parts = keyPath.split('.');
      
      let current: any = activeDict;
      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          // Fallback to English dictionary if key missing in current language
          let enFallback: any = translations.en;
          for (const fallbackPart of parts) {
            if (enFallback && typeof enFallback === 'object' && fallbackPart in enFallback) {
              enFallback = enFallback[fallbackPart];
            } else {
              enFallback = undefined;
              break;
            }
          }
          return typeof enFallback === 'string' ? enFallback : (fallback || keyPath);
        }
      }

      return typeof current === 'string' ? current : (fallback || keyPath);
    },
    [currentLanguage]
  );

  const selectedLanguageOption = useMemo(() => {
    return (
      AVAILABLE_LANGUAGES.find((opt) => opt.code === currentLanguage) ||
      AVAILABLE_LANGUAGES[0]
    );
  }, [currentLanguage]);

  const value = useMemo(
    () => ({
      currentLanguage,
      selectedLanguageOption,
      setLanguage,
      t,
      languages: AVAILABLE_LANGUAGES,
      isLoadingLanguage,
    }),
    [currentLanguage, selectedLanguageOption, setLanguage, t, isLoadingLanguage]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}

