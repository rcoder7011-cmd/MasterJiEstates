/**
 * Language Settings Screen — app/profile/language.tsx
 * Allows customer to select between English, Hindi (Devanagari), and Hinglish (Roman Hindi).
 * Automatically updates active translations app-wide and persists to Expo SecureStore.
 */

import React from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  AppText,
  AppCard,
  AppHeader,
  AppIcon,
  AppDivider,
} from '../../src/components';
import { colors } from '../../src/theme/colors';
import { spacing, layout } from '../../src/theme/spacing';
import { radius } from '../../src/theme/radius';
import { useTranslation } from '../../src/hooks/useTranslation';
import { LanguageCode } from '../../src/types/language';

export default function LanguageScreen() {
  const router = useRouter();
  const { currentLanguage, setLanguage, languages, t } = useTranslation();

  const handleSelectLanguage = async (code: LanguageCode) => {
    await setLanguage(code);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <AppHeader
        title={t('settings.languageTitle', 'Language Selection')}
        subtitle={t('profile.language', 'Choose App Display Language')}
        showBack
        onBackPress={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introBlock}>
          <AppText variant="bodySmall" color="textSecondary">
            Select your preferred language. All application navigation, menus, labels, and notices will update immediately and persist on your device.
          </AppText>
        </View>

        <View style={styles.languageList}>
          {languages.map((lang) => {
            const isSelected = currentLanguage === lang.code;

            return (
              <Pressable
                key={lang.code}
                onPress={() => handleSelectLanguage(lang.code)}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`${lang.label} - ${lang.nativeLabel}`}
              >
                <AppCard
                  variant={isSelected ? 'elevated' : 'default'}
                  style={[
                    styles.langCard,
                    isSelected ? styles.langCardSelected : null,
                  ]}
                >
                  <View style={styles.langRow}>
                    <View style={styles.langInfoCol}>
                      <View style={styles.titleRow}>
                        <AppText
                          variant="h3"
                          color={isSelected ? 'secondary' : 'primary'}
                        >
                          {lang.nativeLabel}
                        </AppText>
                        {isSelected && (
                          <View style={styles.activeTag}>
                            <AppText variant="caption" color="secondaryDark" weight="700">
                              ACTIVE
                            </AppText>
                          </View>
                        )}
                      </View>
                      <AppText variant="bodySmall" color="textPrimary" weight="600">
                        {lang.label}
                      </AppText>
                      <AppText variant="caption" color="textSecondary" style={styles.desc}>
                        {lang.description}
                      </AppText>
                    </View>

                    <View
                      style={[
                        styles.radioCircle,
                        isSelected ? styles.radioCircleSelected : null,
                      ]}
                    >
                      {isSelected ? (
                        <AppIcon name="Check" size="sm" color="textInverse" />
                      ) : null}
                    </View>
                  </View>
                </AppCard>
              </Pressable>
            );
          })}
        </View>

        <AppCard variant="goldAccent" style={styles.noteCard}>
          <View style={styles.noteHeader}>
            <AppIcon name="Shield" size="sm" color="secondary" />
            <AppText variant="caption" color="secondaryDark" weight="700" style={styles.noteTitle}>
              CULTURAL & REGIONAL FIDELITY
            </AppText>
          </View>
          <AppDivider spacing="xs" color="borderGold" />
          <AppText variant="caption" color="textSecondary" style={styles.noteText}>
            • Hindi uses authentic Devanagari typography for native speakers.{'\n'}
            • Hinglish uses conversational Roman Hindi for modern urban users.{'\n'}
            • Property addresses, legal titles, and numbers remain unmodified to maintain legal accuracy.
          </AppText>
        </AppCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.lg,
  },
  introBlock: {
    marginBottom: spacing.lg,
  },
  languageList: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  langCard: {
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  langCardSelected: {
    borderColor: colors.secondary,
    backgroundColor: colors.surface,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  langInfoCol: {
    flex: 1,
    marginRight: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xxs,
  },
  activeTag: {
    backgroundColor: colors.secondarySubtle,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  desc: {
    marginTop: spacing.xxs,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  radioCircleSelected: {
    borderColor: colors.secondary,
    backgroundColor: colors.secondary,
  },
  noteCard: {
    marginTop: spacing.sm,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  noteTitle: {
    marginLeft: spacing.xxs,
  },
  noteText: {
    lineHeight: 18,
  },
});

