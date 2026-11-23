/**
 * Customer Preferences Screen — app/profile/preferences.tsx
 * Allows customer to manage practical application settings:
 * Notification preferences, language shortcut, and legal disclosures.
 */

import React, { useState } from 'react';
import { View, ScrollView, Switch, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
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
import { useTranslation } from '../../src/hooks/useTranslation';
import { useAuth } from '../../src/hooks/useAuth';
import { saveNotificationPreferences } from '../../src/services/notificationService';
import { analyticsService } from '../../src/services/analyticsService';
import { NotificationPreferences } from '../../src/types/notification';

export default function PreferencesScreen() {
  const router = useRouter();
  const { t, selectedLanguageOption } = useTranslation();
  const { user, updateUser, isAuthenticated } = useAuth();

  // Practical preference states backed by user profile
  const userPrefs = user?.notificationPreferences;
  const [enquiryUpdates, setEnquiryUpdates] = useState<boolean>(
    userPrefs?.enquiryUpdates ?? true
  );
  const [siteVisitUpdates, setSiteVisitUpdates] = useState<boolean>(
    userPrefs?.siteVisitUpdates ?? true
  );
  const [newListingsAlerts, setNewListingsAlerts] = useState<boolean>(
    userPrefs?.newListingsAlerts ?? true
  );
  const [priceDropAlerts, setPriceDropAlerts] = useState<boolean>(
    userPrefs?.priceDropAlerts ?? true
  );
  const [whatsappAlerts, setWhatsappAlerts] = useState<boolean>(
    userPrefs?.whatsappAlerts ?? true
  );
  const [analyticsConsent, setAnalyticsConsent] = useState<boolean>(
    analyticsService.isEnabled()
  );
  const [isSaving, setIsSaving] = useState(false);

  // Sync preference change to backend
  const handleToggle = async (key: keyof NotificationPreferences, value: boolean) => {
    switch (key) {
      case 'enquiryUpdates':
        setEnquiryUpdates(value);
        break;
      case 'siteVisitUpdates':
        setSiteVisitUpdates(value);
        break;
      case 'newListingsAlerts':
        setNewListingsAlerts(value);
        break;
      case 'priceDropAlerts':
        setPriceDropAlerts(value);
        break;
      case 'whatsappAlerts':
        setWhatsappAlerts(value);
        break;
    }

    if (isAuthenticated && user) {
      setIsSaving(true);
      try {
        const payload: Partial<NotificationPreferences> = {
          [key]: value,
        };
        const res = await saveNotificationPreferences(payload);
        if (res.success && user) {
          updateUser({
            ...user,
            notificationPreferences: {
              ...(user.notificationPreferences || {}),
              [key]: value,
            },
          });
        }
      } catch {
        // Graceful degradation
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <AppHeader
        title={t('settings.title', 'App Preferences')}
        subtitle={t('settings.subtitle', 'Notification & Display Controls')}
        showBack
        onBackPress={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Language Selection Quick Access */}
        <AppCard style={styles.card}>
          <Pressable
            style={styles.menuRow}
            onPress={() => router.push('/profile/language')}
            accessibilityRole="button"
            accessibilityLabel="Open Language Settings"
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconCircle}>
                <AppIcon name="Globe" size="md" color="secondary" />
              </View>
              <View style={styles.menuTextCol}>
                <AppText variant="h3" color="primary">
                  {t('settings.languageTitle', 'Language')}
                </AppText>
                <AppText variant="bodySmall" color="textSecondary">
                  {selectedLanguageOption.nativeLabel} ({selectedLanguageOption.label})
                </AppText>
              </View>
            </View>
            <AppIcon name="ChevronRight" size="sm" color="textSecondary" />
          </Pressable>
        </AppCard>

        {/* Notification Preferences */}
        <AppCard style={styles.card}>
          <View style={styles.headerRow}>
            <AppText variant="h3" color="primary" style={styles.sectionTitle}>
              {t('settings.notificationsTitle', 'Notification Preferences')}
            </AppText>
            {isSaving && <ActivityIndicator size="small" color={colors.secondary} />}
          </View>
          <AppDivider spacing="sm" />

          {/* Enquiry Updates */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <AppText variant="body" color="primary" weight="600">
                {t('settings.enquiryUpdates', 'Enquiry & Consultation Updates')}
              </AppText>
              <AppText variant="caption" color="textSecondary">
                Instant alerts when advisors respond to your inquiries or pricing requests
              </AppText>
            </View>
            <Switch
              value={enquiryUpdates}
              onValueChange={(val) => handleToggle('enquiryUpdates', val)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>

          <AppDivider spacing="md" />

          {/* Site Visit Updates */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <AppText variant="body" color="primary" weight="600">
                {t('settings.siteVisitUpdates', 'Site Visit Status & Reminders')}
              </AppText>
              <AppText variant="caption" color="textSecondary">
                Notifications for visit scheduling, coordinator confirmations and reminders
              </AppText>
            </View>
            <Switch
              value={siteVisitUpdates}
              onValueChange={(val) => handleToggle('siteVisitUpdates', val)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>

          <AppDivider spacing="md" />

          {/* New Listings Matching Saved Searches */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <AppText variant="body" color="primary" weight="600">
                {t('settings.newListings', 'New Listings in Preferred Areas')}
              </AppText>
              <AppText variant="caption" color="textSecondary">
                Notifications when verified homes are published matching your saved searches
              </AppText>
            </View>
            <Switch
              value={newListingsAlerts}
              onValueChange={(val) => handleToggle('newListingsAlerts', val)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>

          <AppDivider spacing="md" />

          {/* Price Drops */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <AppText variant="body" color="primary" weight="600">
                {t('settings.priceDrops', 'Property Price Drop Alerts')}
              </AppText>
              <AppText variant="caption" color="textSecondary">
                Instant alerts when shortlisted properties adjust their listed pricing
              </AppText>
            </View>
            <Switch
              value={priceDropAlerts}
              onValueChange={(val) => handleToggle('priceDropAlerts', val)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>

          <AppDivider spacing="md" />

          {/* WhatsApp Updates */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <AppText variant="body" color="primary" weight="600">
                {t('settings.whatsappAlerts', 'WhatsApp Consultation Updates')}
              </AppText>
              <AppText variant="caption" color="textSecondary">
                Receive site-visit confirmations and verified brochures via WhatsApp
              </AppText>
            </View>
            <Switch
              value={whatsappAlerts}
              onValueChange={(val) => handleToggle('whatsappAlerts', val)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>
        </AppCard>

        {/* Privacy & App Analytics Consent */}
        <AppCard style={styles.card}>
          <View style={styles.headerRow}>
            <AppText variant="h3" color="primary" style={styles.sectionTitle}>
              Privacy & Telemetry Controls
            </AppText>
          </View>
          <AppDivider spacing="sm" />
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <AppText variant="body" color="primary" weight="600">
                Anonymous Usage Analytics
              </AppText>
              <AppText variant="caption" color="textSecondary">
                Help improve application stability & performance. No passwords, personal contact numbers, or private details are ever gathered.
              </AppText>
            </View>
            <Switch
              value={analyticsConsent}
              onValueChange={(val) => {
                setAnalyticsConsent(val);
                analyticsService.setEnabled(val);
              }}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>
        </AppCard>

        {/* Legal & Regulatory Compliance */}
        <AppCard variant="goldAccent" style={styles.card}>
          <View style={styles.reraHeader}>
            <AppIcon name="Shield" size="sm" color="secondary" />
            <AppText variant="caption" color="secondaryDark" weight="700">
              REGULATORY COMPLIANCE & TRUST
            </AppText>
          </View>
          <AppDivider spacing="xs" color="borderGold" />
          <AppText variant="caption" color="textSecondary" style={styles.reraText}>
            {t(
              'settings.reraNote',
              'MJ Estates adheres strictly to RERA guidelines and local real-estate compliance. We do not engage in unauthorized marketing or unsolicited telemarketing.'
            )}
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
  card: {
    marginBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    marginBottom: 0,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuTextCol: {
    flex: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  toggleInfo: {
    flex: 1,
  },
  reraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  reraText: {
    lineHeight: 18,
  },
});
