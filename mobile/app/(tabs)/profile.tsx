/**
 * Customer Profile Screen — app/(tabs)/profile.tsx
 * Full customer portal featuring authenticated user profile header,
 * navigation menu (Saved, Enquiries, Language, Preferences, About, Support, Legal),
 * modal contact support sheet, and secure sign-out.
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  AppText,
  AppCard,
  AppButton,
  AppHeader,
  AppIcon,
  AppDivider,
} from '../../src/components';
import { colors } from '../../src/theme/colors';
import { spacing, layout } from '../../src/theme/spacing';
import { radius } from '../../src/theme/radius';
import { useDevAuth } from '../../src/context/DevAuthContext';
import { useAuth } from '../../src/hooks/useAuth';
import { useTranslation } from '../../src/hooks/useTranslation';
import { useSavedProperties } from '../../src/hooks/useSavedProperties';
import { useCompare } from '../../src/hooks/useCompare';
import { useRecentlyViewed } from '../../src/hooks/useRecentlyViewed';
import { useNotifications } from '../../src/hooks/useNotifications';
import { maskPhoneNumber, maskEmail } from '../../src/utils/validation';
import {
  callSupport,
  openWhatsAppSupport,
  sendSupportEmail,
  openOfficialWebsite,
  OFFICIAL_CONTACT,
} from '../../src/services/contactService';

export default function ProfileScreen() {
  const router = useRouter();
  const { userRole, isAdmin, toggleRole, isFounder: isDevFounder, toggleFounder } = useDevAuth();
  const { user, isAuthenticated, logout } = useAuth();
  const { t, selectedLanguageOption } = useTranslation();
  const { savedIds } = useSavedProperties();
  const { compareCount } = useCompare();
  const { recentlyViewedCount } = useRecentlyViewed();
  const { unreadCount } = useNotifications();

  const [supportModalVisible, setSupportModalVisible] = useState(false);

  const hasFounderAccess =
    (isAuthenticated &&
      Boolean(
        user?.isFounder === true ||
          (user?.founderRole && ['founder', 'ceo'].includes(user.founderRole))
      )) ||
    (__DEV__ && isDevFounder);

  const handleLogout = () => {
    Alert.alert(
      t('auth.confirmSignOutTitle', 'Sign Out of MJ Estates'),
      t(
        'auth.confirmSignOutDesc',
        'Are you sure you want to sign out of your account on this device?'
      ),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('auth.signOut', 'Sign Out'),
          style: 'destructive',
          onPress: async () => {
            await logout();
            Alert.alert(
              t('common.success', 'Signed Out'),
              'You have been safely signed out.'
            );
          },
        },
      ]
    );
  };

  const handlePrivacyPolicy = () => {
    Alert.alert(
      'Privacy Policy',
      'MJ Estates respects customer data privacy. Your contact details and shortlisted properties are encrypted and never sold to third parties.',
      [
        { text: 'Close', style: 'cancel' },
        { text: 'Visit Website', onPress: openOfficialWebsite },
      ]
    );
  };

  const handleTermsConditions = () => {
    Alert.alert(
      'Terms & Conditions',
      'All property listings are subject to legal verification and availability. Consultation and escrow advisory adhere to official RERA guidelines.',
      [
        { text: 'Close', style: 'cancel' },
        { text: 'Visit Website', onPress: openOfficialWebsite },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <AppHeader
        title={t('profile.title', 'Profile & Settings')}
        subtitle={t('profile.subtitle', 'Account Preferences & Consultation Tools')}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Header Profile Card */}
        {isAuthenticated && user ? (
          <AppCard variant="elevated" style={styles.profileHeaderCard}>
            <View style={styles.userProfileRow}>
              <View style={styles.avatarCircle}>
                <AppText variant="h1" color="textInverse">
                  {user.name.charAt(0).toUpperCase()}
                </AppText>
              </View>
              <View style={styles.userInfoCol}>
                <View style={styles.authStatusBadge}>
                  <AppText variant="caption" color="success" weight="700">
                    {t('auth.authenticated', 'AUTHENTICATED')}
                  </AppText>
                </View>
                <AppText variant="h2" color="primary" numberOfLines={1}>
                  {user.name}
                </AppText>
                <AppText variant="bodySmall" color="textSecondary">
                  {user.phone
                    ? maskPhoneNumber(user.phone)
                    : user.email
                    ? maskEmail(user.email)
                    : 'Verified Client'}
                </AppText>
              </View>
            </View>

            <AppDivider spacing="md" />

            <AppButton
              title={t('profile.editProfile', 'Edit Profile')}
              variant="outline"
              size="sm"
              leftIcon={<AppIcon name="User" size="sm" color="primary" />}
              onPress={() => router.push('/profile/edit')}
            />
          </AppCard>
        ) : (
          <AppCard variant="default" style={styles.profileHeaderCard}>
            <View style={styles.userProfileRow}>
              <View style={[styles.avatarCircle, styles.guestAvatar]}>
                <AppIcon name="User" size="lg" color="textSecondary" />
              </View>
              <View style={styles.userInfoCol}>
                <View style={styles.guestBadge}>
                  <AppText variant="caption" color="textSecondary" weight="700">
                    {t('auth.guest', 'GUEST CUSTOMER')}
                  </AppText>
                </View>
                <AppText variant="h2" color="primary">
                  {t('auth.welcome', 'Welcome to MJ Estates')}
                </AppText>
                <AppText variant="caption" color="textSecondary">
                  {t(
                    'auth.guestSubtitle',
                    'Sign in to save properties, receive alerts, and track your enquiries.'
                  )}
                </AppText>
              </View>
            </View>

            <AppDivider spacing="md" />

            <AppButton
              title={t('auth.signIn', 'Sign In to Your Account')}
              variant="primary"
              size="sm"
              leftIcon={<AppIcon name="User" size="sm" color="textInverse" />}
              onPress={() =>
                router.push({
                  pathname: '/auth/login',
                  params: { redirect: '/(tabs)/profile' },
                })
              }
            />
          </AppCard>
        )}

        {/* 2. Customer Activity Section */}
        <AppCard style={styles.menuCard}>
          <AppText variant="caption" color="textSecondary" weight="700" style={styles.menuGroupTitle}>
            CUSTOMER ACTIVITY
          </AppText>
          <AppDivider spacing="xs" />

          {/* Saved Properties */}
          <Pressable
            style={styles.menuItem}
            onPress={() => router.push('/(tabs)/saved')}
            accessibilityRole="button"
            accessibilityLabel="Open Saved Properties"
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconBox}>
                <AppIcon name="Heart" size="md" color="secondary" />
              </View>
              <View style={styles.menuItemTextCol}>
                <AppText variant="body" color="primary" weight="600">
                  {t('profile.savedProperties', 'Saved Properties')}
                </AppText>
                <AppText variant="caption" color="textSecondary">
                  {savedIds.length} shortlisted {savedIds.length === 1 ? 'home' : 'homes'}
                </AppText>
              </View>
            </View>
            <View style={styles.menuItemRight}>
              <View style={styles.counterBadge}>
                <AppText variant="caption" color="secondaryDark" weight="700">
                  {savedIds.length}
                </AppText>
              </View>
              <AppIcon name="ChevronRight" size="sm" color="textSecondary" />
            </View>
          </Pressable>

          <AppDivider spacing="xs" />

          {/* Compare Properties */}
          <Pressable
            style={styles.menuItem}
            onPress={() => router.push('/property/compare')}
            accessibilityRole="button"
            accessibilityLabel="Open Compare Properties"
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconBox}>
                <AppIcon name="Compass" size="md" color="secondaryDark" />
              </View>
              <View style={styles.menuItemTextCol}>
                <AppText variant="body" color="primary" weight="600">
                  {t('compare.title', 'Compare Properties')}
                </AppText>
                <AppText variant="caption" color="textSecondary">
                  {compareCount} {compareCount === 1 ? 'property' : 'properties'} in comparison tray
                </AppText>
              </View>
            </View>
            <View style={styles.menuItemRight}>
              <View style={styles.counterBadge}>
                <AppText variant="caption" color="secondaryDark" weight="700">
                  {compareCount}
                </AppText>
              </View>
              <AppIcon name="ChevronRight" size="sm" color="textSecondary" />
            </View>
          </Pressable>

          <AppDivider spacing="xs" />

          {/* Recently Viewed Properties */}
          <Pressable
            style={styles.menuItem}
            onPress={() => router.push('/property/recently-viewed')}
            accessibilityRole="button"
            accessibilityLabel="Open Recently Viewed Properties"
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconBox}>
                <AppIcon name="Building2" size="md" color="primary" />
              </View>
              <View style={styles.menuItemTextCol}>
                <AppText variant="body" color="primary" weight="600">
                  {t('recentlyViewed.title', 'Recently Viewed')}
                </AppText>
                <AppText variant="caption" color="textSecondary">
                  {recentlyViewedCount} {recentlyViewedCount === 1 ? 'listing' : 'listings'} explored
                </AppText>
              </View>
            </View>
            <View style={styles.menuItemRight}>
              <View style={styles.counterBadge}>
                <AppText variant="caption" color="secondaryDark" weight="700">
                  {recentlyViewedCount}
                </AppText>
              </View>
              <AppIcon name="ChevronRight" size="sm" color="textSecondary" />
            </View>
          </Pressable>

          <AppDivider spacing="xs" />

          {/* My Enquiries */}
          <Pressable
            style={styles.menuItem}
            onPress={() => router.push('/profile/enquiries')}
            accessibilityRole="button"
            accessibilityLabel="Open My Enquiries"
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconBox}>
                <AppIcon name="MessageSquare" size="md" color="primary" />
              </View>
              <View style={styles.menuItemTextCol}>
                <AppText variant="body" color="primary" weight="600">
                  {t('profile.myEnquiries', 'My Enquiries')}
                </AppText>
                <AppText variant="caption" color="textSecondary">
                  Site-visit bookings & consultations
                </AppText>
              </View>
            </View>
            <AppIcon name="ChevronRight" size="sm" color="textSecondary" />
          </Pressable>

          <AppDivider spacing="xs" />

          {/* Saved Searches */}
          <Pressable
            style={styles.menuItem}
            onPress={() => router.push('/property/saved-searches')}
            accessibilityRole="button"
            accessibilityLabel="Open Saved Searches"
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconBox}>
                <AppIcon name="Bookmark" size="md" color="secondaryDark" />
              </View>
              <View style={styles.menuItemTextCol}>
                <AppText variant="body" color="primary" weight="600">
                  {t('savedSearches.title', 'Saved Searches')}
                </AppText>
                <AppText variant="caption" color="textSecondary">
                  Custom criteria & listing alerts
                </AppText>
              </View>
            </View>
            <AppIcon name="ChevronRight" size="sm" color="textSecondary" />
          </Pressable>
        </AppCard>

        {/* 3. Settings & Language Section */}
        <AppCard style={styles.menuCard}>
          <AppText variant="caption" color="textSecondary" weight="700" style={styles.menuGroupTitle}>
            PREFERENCES & DISPLAY
          </AppText>
          <AppDivider spacing="xs" />

          {/* Notifications Inbox */}
          <Pressable
            style={styles.menuItem}
            onPress={() => router.push('/notifications')}
            accessibilityRole="button"
            accessibilityLabel="Open Notifications"
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconBox}>
                <AppIcon name="Bell" size="md" color="primary" />
              </View>
              <View style={styles.menuItemTextCol}>
                <AppText variant="body" color="primary" weight="600">
                  {t('notifications.title', 'Notifications')}
                </AppText>
                <AppText variant="caption" color="textSecondary">
                  Alerts & consultation updates
                </AppText>
              </View>
            </View>
            <View style={styles.menuItemRight}>
              {unreadCount > 0 && (
                <View style={[styles.counterBadge, { backgroundColor: colors.error }]}>
                  <AppText variant="caption" color="textInverse" weight="700">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </AppText>
                </View>
              )}
              <AppIcon name="ChevronRight" size="sm" color="textSecondary" />
            </View>
          </Pressable>

          <AppDivider spacing="xs" />

          {/* Language Settings */}
          <Pressable
            style={styles.menuItem}
            onPress={() => router.push('/profile/language')}
            accessibilityRole="button"
            accessibilityLabel="Open Language Settings"
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconBox}>
                <AppIcon name="Globe" size="md" color="secondary" />
              </View>
              <View style={styles.menuItemTextCol}>
                <AppText variant="body" color="primary" weight="600">
                  {t('profile.language', 'App Language')}
                </AppText>
                <AppText variant="caption" color="textSecondary">
                  {selectedLanguageOption.nativeLabel} ({selectedLanguageOption.label})
                </AppText>
              </View>
            </View>
            <View style={styles.menuItemRight}>
              <View style={styles.langBadge}>
                <AppText variant="caption" color="secondaryDark" weight="700">
                  {selectedLanguageOption.nativeLabel}
                </AppText>
              </View>
              <AppIcon name="ChevronRight" size="sm" color="textSecondary" />
            </View>
          </Pressable>

          <AppDivider spacing="xs" />

          {/* App Preferences */}
          <Pressable
            style={styles.menuItem}
            onPress={() => router.push('/profile/preferences')}
            accessibilityRole="button"
            accessibilityLabel="Open App Preferences"
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconBox}>
                <AppIcon name="Bell" size="md" color="primary" />
              </View>
              <View style={styles.menuItemTextCol}>
                <AppText variant="body" color="primary" weight="600">
                  {t('profile.preferences', 'Notifications & Preferences')}
                </AppText>
                <AppText variant="caption" color="textSecondary">
                  Price alerts & WhatsApp updates
                </AppText>
              </View>
            </View>
            <AppIcon name="ChevronRight" size="sm" color="textSecondary" />
          </Pressable>
        </AppCard>

        {/* 4. Support & Information Section */}
        <AppCard style={styles.menuCard}>
          <AppText variant="caption" color="textSecondary" weight="700" style={styles.menuGroupTitle}>
            SUPPORT & TRUST
          </AppText>
          <AppDivider spacing="xs" />

          {/* Contact Support */}
          <Pressable
            style={styles.menuItem}
            onPress={() => setSupportModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Contact Customer Support"
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconBox}>
                <AppIcon name="Phone" size="md" color="secondary" />
              </View>
              <View style={styles.menuItemTextCol}>
                <AppText variant="body" color="primary" weight="600">
                  {t('profile.support', 'Contact Customer Support')}
                </AppText>
                <AppText variant="caption" color="textSecondary">
                  {OFFICIAL_CONTACT.PHONE} • WhatsApp • Email
                </AppText>
              </View>
            </View>
            <AppIcon name="ChevronRight" size="sm" color="textSecondary" />
          </Pressable>

          <AppDivider spacing="xs" />

          {/* About MJ Estates */}
          <Pressable
            style={styles.menuItem}
            onPress={() => router.push('/profile/about')}
            accessibilityRole="button"
            accessibilityLabel="About MJ Estates"
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconBox}>
                <AppIcon name="Building" size="md" color="primary" />
              </View>
              <View style={styles.menuItemTextCol}>
                <AppText variant="body" color="primary" weight="600">
                  {t('profile.about', 'About MJ Estates')}
                </AppText>
                <AppText variant="caption" color="textSecondary">
                  Heritage, RERA credentials & advisors
                </AppText>
              </View>
            </View>
            <AppIcon name="ChevronRight" size="sm" color="textSecondary" />
          </Pressable>

          <AppDivider spacing="xs" />

          {/* Extra Services */}
          <Pressable
            style={styles.menuItem}
            onPress={() => router.push('/extra-services')}
            accessibilityRole="button"
            accessibilityLabel="Open Extra Services"
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconBox}>
                <AppIcon name="Sparkles" size="md" color="secondary" />
              </View>
              <View style={styles.menuItemTextCol}>
                <AppText variant="body" color="primary" weight="600">
                  Extra Services
                </AppText>
                <AppText variant="caption" color="textSecondary">
                  Interiors, software, AI/ML, architecture & carpentry
                </AppText>
              </View>
            </View>
            <AppIcon name="ChevronRight" size="sm" color="textSecondary" />
          </Pressable>

          <AppDivider spacing="xs" />

          {/* Privacy Policy */}
          <Pressable
            style={styles.menuItem}
            onPress={handlePrivacyPolicy}
            accessibilityRole="button"
            accessibilityLabel="Open Privacy Policy"
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconBox}>
                <AppIcon name="Shield" size="md" color="primary" />
              </View>
              <View style={styles.menuItemTextCol}>
                <AppText variant="body" color="primary" weight="600">
                  {t('profile.privacy', 'Privacy Policy')}
                </AppText>
                <AppText variant="caption" color="textSecondary">
                  Data confidentiality & protection terms
                </AppText>
              </View>
            </View>
            <AppIcon name="ChevronRight" size="sm" color="textSecondary" />
          </Pressable>

          <AppDivider spacing="xs" />

          {/* Terms & Conditions */}
          <Pressable
            style={styles.menuItem}
            onPress={handleTermsConditions}
            accessibilityRole="button"
            accessibilityLabel="Open Terms and Conditions"
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconBox}>
                <AppIcon name="FileText" size="md" color="primary" />
              </View>
              <View style={styles.menuItemTextCol}>
                <AppText variant="body" color="primary" weight="600">
                  {t('profile.terms', 'Terms & Conditions')}
                </AppText>
                <AppText variant="caption" color="textSecondary">
                  Service agreement & advisory compliance
                </AppText>
              </View>
            </View>
            <AppIcon name="ChevronRight" size="sm" color="textSecondary" />
          </Pressable>
        </AppCard>

        {/* 5. Session Actions (Sign Out) */}
        {isAuthenticated && (
          <AppCard style={styles.logoutCard}>
            <AppButton
              title={t('auth.signOut', 'Sign Out of MJ Estates')}
              variant="outline"
              size="md"
              leftIcon={<AppIcon name="ArrowLeft" size="sm" color="error" />}
              onPress={handleLogout}
              style={styles.logoutBtn}
            />
          </AppCard>
        )}

        {/* 6. Private Founder & CEO Dashboard Entry (STRICTLY RESTRICTED) */}
        {hasFounderAccess && (
          <AppCard variant="goldAccent" style={styles.founderCard}>
            <View style={styles.founderCardHeader}>
              <View style={styles.founderIconCircle}>
                <AppIcon name="Award" size="md" color="secondary" />
              </View>
              <View style={styles.founderTitleCol}>
                <View style={styles.founderBadgeRow}>
                  <View style={styles.founderBadge}>
                    <AppText variant="caption" color="secondaryDark" weight="700">
                      EXECUTIVE SUITE
                    </AppText>
                  </View>
                </View>
                <AppText variant="h2" color="primary">
                  {t('founderDashboard.title', 'Executive Office')}
                </AppText>
                <AppText variant="caption" color="textSecondary">
                  {t('founderDashboard.subtitle', 'Private Founder & CEO Dashboard')}
                </AppText>
              </View>
            </View>

            <AppDivider spacing="sm" color="borderGold" />

            <AppText variant="bodySmall" color="textSecondary" style={styles.founderSummary}>
              Confidential real-time platform KPIs, active inventory metrics, pending moderation queues, and verified client consultations.
            </AppText>

            <AppButton
              title="Open Executive Dashboard (/founder)"
              variant="secondary"
              size="sm"
              leftIcon={<AppIcon name="Shield" size="sm" color="textOnGold" />}
              onPress={() => router.push('/founder' as any)}
              style={styles.founderBtn}
            />
          </AppCard>
        )}

        {/* 7. Development-Only Role & Showcase Mechanisms (Filtered in Production) */}
        {__DEV__ ? (
          <>
            <AppCard variant="goldAccent" style={styles.devCard}>
              <View style={styles.devCardHeader}>
                <AppIcon name="Shield" size="md" color="secondary" />
                <AppText variant="h3" color="primary" style={styles.devTitle}>
                  Role-Based Navigation Preview
                </AppText>
              </View>
              <AppDivider spacing="sm" color="borderGold" />
              <View style={styles.devTag}>
                <AppText variant="caption" color="secondaryDark" weight="700">
                  DEVELOPMENT MECHANISM ONLY
                </AppText>
              </View>
              <AppText variant="bodySmall" color="textSecondary" style={styles.devDesc}>
                Current Role: <AppText variant="bodySmall" color="primary" weight="700">{userRole.toUpperCase()}</AppText>{'\n'}
                Toggle role below to test the protected Admin route guard (`/admin`).
              </AppText>

              <AppButton
                title={`Switch to ${isAdmin ? 'Customer' : 'Admin'} Role`}
                variant="secondary"
                size="sm"
                leftIcon={<AppIcon name="Shield" size="sm" color="textOnGold" />}
                onPress={toggleRole}
                style={styles.btnSpacing}
              />

              <AppButton
                title={`Founder Preview: ${isDevFounder ? 'ENABLED' : 'DISABLED'}`}
                variant="outline"
                size="sm"
                leftIcon={<AppIcon name="Award" size="sm" color="secondary" />}
                onPress={toggleFounder}
                style={styles.btnSpacing}
              />

              <AppButton
                title="Access Admin Portal (/admin)"
                variant="primary"
                size="sm"
                leftIcon={<AppIcon name="Building" size="sm" color="textInverse" />}
                onPress={() => router.push('/admin')}
              />
            </AppCard>

            <AppCard style={styles.devCard}>
              <View style={styles.devCardHeader}>
                <AppIcon name="CheckCircle" size="md" color="success" />
                <AppText variant="h3" color="primary" style={styles.devTitle}>
                  Design System Showcase
                </AppText>
              </View>
              <AppDivider spacing="sm" />
              <AppText variant="bodySmall" color="textSecondary" style={styles.devDesc}>
                Inspect all design system tokens, typography scales, inputs, and interactive components.
              </AppText>
              <AppButton
                title="Open Component Showcase (/dev-showcase)"
                variant="outline"
                size="sm"
                onPress={() => router.push('/dev-showcase')}
              />
            </AppCard>
          </>
        ) : null}
      </ScrollView>

      {/* Contact Support Modal */}
      <Modal
        visible={supportModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSupportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setSupportModalVisible(false)}
          />
          <AppCard variant="elevated" style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <AppText variant="h2" color="primary">
                  {t('contact.title', 'Contact Customer Support')}
                </AppText>
                <AppText variant="caption" color="textSecondary">
                  {t('contact.subtitle', 'Official MJ Estates Channels')}
                </AppText>
              </View>
              <Pressable
                onPress={() => setSupportModalVisible(false)}
                style={styles.closeBtn}
                accessibilityRole="button"
                accessibilityLabel="Close support modal"
              >
                <AppIcon name="X" size="sm" color="textSecondary" />
              </Pressable>
            </View>

            <AppDivider spacing="md" />

            <View style={styles.modalActions}>
              <AppButton
                title={`${t('contact.call', 'Call')}: ${OFFICIAL_CONTACT.PHONE}`}
                variant="primary"
                size="md"
                leftIcon={<AppIcon name="Phone" size="sm" color="textInverse" />}
                onPress={() => {
                  setSupportModalVisible(false);
                  callSupport();
                }}
              />

              <AppButton
                title={`${t('contact.whatsapp', 'WhatsApp')}: ${OFFICIAL_CONTACT.WHATSAPP}`}
                variant="secondary"
                size="md"
                leftIcon={<AppIcon name="MessageSquare" size="sm" color="textOnGold" />}
                onPress={() => {
                  setSupportModalVisible(false);
                  openWhatsAppSupport();
                }}
              />

              <AppButton
                title={`${t('contact.email', 'Email')}: ${OFFICIAL_CONTACT.EMAIL}`}
                variant="outline"
                size="md"
                leftIcon={<AppIcon name="Mail" size="sm" color="primary" />}
                onPress={() => {
                  setSupportModalVisible(false);
                  sendSupportEmail();
                }}
              />

              <AppButton
                title={t('contact.website', 'Visit Website (www.masterjiestates.in)')}
                variant="outline"
                size="md"
                leftIcon={<AppIcon name="Globe" size="sm" color="primary" />}
                onPress={() => {
                  setSupportModalVisible(false);
                  openOfficialWebsite();
                }}
              />
            </View>
          </AppCard>
        </View>
      </Modal>
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
  profileHeaderCard: {
    marginBottom: spacing.lg,
  },
  userProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestAvatar: {
    backgroundColor: colors.primarySubtle,
  },
  userInfoCol: {
    flex: 1,
  },
  authStatusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.successSubtle,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.success,
    marginBottom: 2,
  },
  guestBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 2,
  },
  menuCard: {
    marginBottom: spacing.lg,
    paddingVertical: spacing.sm,
  },
  menuGroupTitle: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs,
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuItemTextCol: {
    flex: 1,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  counterBadge: {
    backgroundColor: colors.secondarySubtle,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  langBadge: {
    backgroundColor: colors.secondarySubtle,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  logoutCard: {
    marginBottom: spacing.lg,
    borderColor: colors.errorSubtle,
  },
  logoutBtn: {
    borderColor: colors.error,
  },
  founderCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
  },
  founderCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  founderIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondarySubtle,
    borderWidth: 1,
    borderColor: colors.borderGold,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  founderTitleCol: {
    flex: 1,
  },
  founderBadgeRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  founderBadge: {
    backgroundColor: colors.secondarySubtle,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: radius.xs,
  },
  founderSummary: {
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  founderBtn: {
    width: '100%',
  },
  devCard: {
    marginBottom: spacing.lg,
  },
  devCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  devTitle: {
    marginLeft: spacing.sm,
  },
  devDesc: {
    marginBottom: spacing.md,
  },
  devTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: spacing.xs,
    backgroundColor: colors.secondarySubtle,
    borderWidth: 1,
    borderColor: colors.borderGold,
    marginBottom: spacing.xs,
  },
  btnSpacing: {
    marginBottom: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: layout.screenPaddingHorizontal,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    padding: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  closeBtn: {
    padding: spacing.xs,
  },
  modalActions: {
    gap: spacing.sm,
  },
});
