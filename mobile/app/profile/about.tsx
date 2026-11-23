/**
 * About MJ Estates Screen — app/profile/about.tsx
 * Details company story, corporate lobby showcase, leadership, RERA credentials,
 * verified values, and access to specialized Extra Services.
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  AppText,
  AppCard,
  AppButton,
  AppHeader,
  AppIcon,
  AppDivider,
  BrandLogo,
  LeadershipSection,
  CompanyValuesSection,
} from '../../src/components';
import { colors } from '../../src/theme/colors';
import { spacing, layout } from '../../src/theme/spacing';
import { radius } from '../../src/theme/radius';
import { useTranslation } from '../../src/hooks/useTranslation';
import {
  callSupport,
  openWhatsAppSupport,
  sendSupportEmail,
  openOfficialWebsite,
  OFFICIAL_CONTACT,
  EXTRA_SERVICES_CONTACT,
  callExtraServices,
  openWhatsAppExtraServices,
} from '../../src/services/contactService';

export default function AboutScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <AppHeader
        title={t('profile.about', 'About MJ Estates')}
        subtitle="Heritage, Integrity & Verified Real Estate"
        showBack
        onBackPress={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Brand Banner & Story */}
        <AppCard style={styles.brandCard}>
          <View style={styles.brandCenter}>
            <BrandLogo size="lg" />
            <View style={styles.estBadge}>
              <AppText variant="caption" color="secondaryDark" weight="700">
                TRUSTED REALTY PARTNER
              </AppText>
            </View>
            <AppText variant="h2" color="primary" weight="700" style={styles.brandTitle}>
              Building Better Tomorrow
            </AppText>
            <AppText variant="bodySmall" color="secondary" weight="600" style={styles.brandQuote}>
              &ldquo;From Finding Your Property to Building Your Dream.&rdquo;
            </AppText>
            <AppText variant="body" color="textSecondary" align="center" style={styles.brandMotto}>
              MasterJiEstates is a specialized real-estate advisory and transaction facilitation enterprise headquartered in Noida Sector 62A, serving Delhi, UP, Ghaziabad, Noida, Gurugram, and Indirapuram.
            </AppText>
          </View>
        </AppCard>

        {/* 2. Corporate Office & Reception Lobby Showcase */}
        <AppCard variant="elevated" style={styles.lobbyCard}>
          <View style={styles.lobbyImageContainer}>
            <Image
              source={require('../../assets/images/reception-lobby.png')}
              style={styles.lobbyImage}
              resizeMode="cover"
              accessibilityLabel="MasterJiEstates Reception Lobby in Noida Sector 62A with Leadership"
            />
            {/* Bottom Vignette Caption */}
            <View style={styles.vignetteOverlay}>
              <View style={styles.vignetteBadge}>
                <AppText variant="caption" color="secondaryDark" weight="700" style={styles.vignetteBadgeText}>
                  OFFICIAL CORPORATE OFFICE
                </AppText>
              </View>
              <AppText variant="bodySmall" color="textInverse" weight="700">
                MasterJiEstates Reception Lobby
              </AppText>
              <View style={styles.vignetteLocationRow}>
                <AppIcon name="MapPin" size="xs" color="secondary" />
                <AppText variant="caption" color="textInverse" style={styles.vignetteAddress}>
                  Noida Sector 62A, Uttar Pradesh, India
                </AppText>
              </View>
            </View>
          </View>
        </AppCard>

        {/* 3. PROMINENT EXTRA SERVICES ACTION BUTTON & CARD */}
        <AppCard variant="goldAccent" style={styles.extraServicesBannerCard}>
          <View style={styles.extraServicesHeader}>
            <View style={styles.sparkleIconBox}>
              <AppIcon name="Sparkles" size="md" color="secondaryDark" />
            </View>
            <View style={styles.extraServicesHeaderText}>
              <View style={styles.servicesBadge}>
                <AppText variant="caption" color="secondaryDark" weight="700" style={styles.servicesBadgeText}>
                  COMPREHENSIVE TURNKEY SOLUTIONS
                </AppText>
              </View>
              <AppText variant="h3" color="primary" weight="700">
                Explore Our Extra Services
              </AppText>
            </View>
          </View>

          <AppText variant="bodySmall" color="textSecondary" style={styles.extraServicesSubtitle}>
            Beyond real-estate brokerage, MJ Estates delivers turnkey Interior Design, Architecture, Custom Software, AI & Machine Learning, Carpentry, and Acquisition Assistance.
          </AppText>

          {/* Quick Service Pills */}
          <View style={styles.servicePillsGrid}>
            <View style={styles.pill}><AppText variant="caption" color="primary" weight="600">✨ Interior Design</AppText></View>
            <View style={styles.pill}><AppText variant="caption" color="primary" weight="600">💻 Software Dev</AppText></View>
            <View style={styles.pill}><AppText variant="caption" color="primary" weight="600">🌐 Web Portals</AppText></View>
            <View style={styles.pill}><AppText variant="caption" color="primary" weight="600">⚡ AI / ML Tools</AppText></View>
            <View style={styles.pill}><AppText variant="caption" color="primary" weight="600">📐 Architecture</AppText></View>
            <View style={styles.pill}><AppText variant="caption" color="primary" weight="600">🪚 Carpentry Work</AppText></View>
          </View>

          <AppDivider spacing="sm" color="borderGold" />

          {/* Prominent Action Button to Open Extra Services Screen */}
          <AppButton
            title="Open Extra Services Screen"
            variant="secondary"
            size="md"
            rightIcon={<AppIcon name="ChevronRight" size="sm" color="textOnGold" />}
            onPress={() => router.push('/extra-services')}
            style={styles.extraServicesBtn}
          />
        </AppCard>

        {/* 4. Services Overview Graphic Card */}
        <AppCard style={styles.overviewCard} variant="elevated">
          <Pressable
            onPress={() => router.push('/extra-services')}
            accessibilityRole="button"
            accessibilityLabel="View Services Overview graphic and details"
          >
            <View style={styles.overviewImageWrapper}>
              <Image
                source={require('../../assets/images/services-overview.png')}
                style={styles.overviewImage}
                resizeMode="contain"
                accessibilityLabel="Our Services Overview — Everything You Need Under One Roof"
              />
            </View>
            <View style={styles.overviewFooter}>
              <AppText variant="caption" color="secondary" weight="700">
                EVERYTHING UNDER ONE ROOF • TAP TO EXPLORE
              </AppText>
              <AppIcon name="ArrowRight" size="xs" color="secondary" />
            </View>
          </Pressable>
        </AppCard>

        {/* 5. Vision, Mission & Core Values */}
        <CompanyValuesSection />

        {/* 6. Leadership: Founder (Riyaz Saifi) & CEO (Mr Shokin) */}
        <LeadershipSection />

        {/* 7. MANDATORY CONTACT NOTICE CARD (Section 3 Requirement) */}
        <AppCard variant="goldAccent" style={styles.noticeCard}>
          <View style={styles.noticeBadge}>
            <AppIcon name="ShieldCheck" size="xs" color="secondaryDark" />
            <AppText variant="caption" color="secondaryDark" weight="700">
              OFFICIAL ANNOUNCEMENT
            </AppText>
          </View>

          <AppText variant="body" color="primary" weight="600" style={styles.noticeQuote}>
            "{EXTRA_SERVICES_CONTACT.NOTICE_MESSAGE}"
          </AppText>

          <AppDivider spacing="sm" color="borderGold" />

          {/* Contact Hotline Row */}
          <View style={styles.phoneBanner}>
            <View style={styles.phoneIconCircle}>
              <AppIcon name="PhoneCall" size="sm" color="secondaryDark" />
            </View>
            <View style={styles.phoneMeta}>
              <AppText variant="caption" color="textSecondary" weight="500">
                Direct Services Hotline:
              </AppText>
              <AppText variant="h3" color="primary" weight="700">
                +91 7011202089
              </AppText>
            </View>
          </View>

          {/* Quick Action Buttons */}
          <View style={styles.contactButtonsRow}>
            <AppButton
              title="Call Now"
              variant="primary"
              size="sm"
              leftIcon={<AppIcon name="Phone" size="sm" color="textInverse" />}
              onPress={callExtraServices}
              style={styles.halfBtn}
            />
            <AppButton
              title="WhatsApp Us"
              variant="secondary"
              size="sm"
              leftIcon={<AppIcon name="MessageSquare" size="sm" color="textOnGold" />}
              onPress={() => openWhatsAppExtraServices()}
              style={styles.halfBtn}
            />
          </View>
        </AppCard>

        {/* 8. Official Contact Credentials Card */}
        <AppCard variant="goldAccent" style={styles.card}>
          <AppText variant="h3" color="primary" style={styles.sectionTitle}>
            Official Contact Credentials
          </AppText>
          <AppDivider spacing="sm" color="borderGold" />

          <View style={styles.contactRow}>
            <AppIcon name="Phone" size="sm" color="secondary" />
            <View style={styles.contactText}>
              <AppText variant="caption" color="textSecondary">
                General Support Hotline:
              </AppText>
              <AppText variant="body" color="primary" weight="600">
                {OFFICIAL_CONTACT.PHONE}
              </AppText>
            </View>
          </View>

          <View style={styles.contactRow}>
            <AppIcon name="PhoneCall" size="sm" color="secondary" />
            <View style={styles.contactText}>
              <AppText variant="caption" color="textSecondary">
                Services & Acquisitions Desk:
              </AppText>
              <AppText variant="body" color="primary" weight="600">
                {EXTRA_SERVICES_CONTACT.PHONE}
              </AppText>
            </View>
          </View>

          <View style={styles.contactRow}>
            <AppIcon name="MessageSquare" size="sm" color="secondary" />
            <View style={styles.contactText}>
              <AppText variant="caption" color="textSecondary">
                WhatsApp Support:
              </AppText>
              <AppText variant="body" color="primary" weight="600">
                {OFFICIAL_CONTACT.WHATSAPP}
              </AppText>
            </View>
          </View>

          <View style={styles.contactRow}>
            <AppIcon name="Mail" size="sm" color="secondary" />
            <View style={styles.contactText}>
              <AppText variant="caption" color="textSecondary">
                Official Email:
              </AppText>
              <AppText variant="body" color="primary" weight="600">
                {OFFICIAL_CONTACT.EMAIL}
              </AppText>
            </View>
          </View>

          <View style={styles.contactRow}>
            <AppIcon name="Globe" size="sm" color="secondary" />
            <View style={styles.contactText}>
              <AppText variant="caption" color="textSecondary">
                Official Website:
              </AppText>
              <AppText variant="body" color="primary" weight="600">
                {OFFICIAL_CONTACT.WEBSITE}
              </AppText>
            </View>
          </View>

          <AppDivider spacing="md" color="borderGold" />

          <View style={styles.contactButtonsRow}>
            <AppButton
              title="Call"
              variant="primary"
              size="sm"
              leftIcon={<AppIcon name="Phone" size="sm" color="textInverse" />}
              onPress={callSupport}
              style={styles.halfBtn}
            />
            <AppButton
              title="WhatsApp"
              variant="secondary"
              size="sm"
              leftIcon={<AppIcon name="MessageSquare" size="sm" color="textOnGold" />}
              onPress={() => openWhatsAppSupport()}
              style={styles.halfBtn}
            />
          </View>

          <View style={[styles.contactButtonsRow, styles.secondRow]}>
            <AppButton
              title="Email Us"
              variant="outline"
              size="sm"
              leftIcon={<AppIcon name="Mail" size="sm" color="primary" />}
              onPress={() => sendSupportEmail()}
              style={styles.halfBtn}
            />
            <AppButton
              title="Website"
              variant="outline"
              size="sm"
              leftIcon={<AppIcon name="Globe" size="sm" color="primary" />}
              onPress={openOfficialWebsite}
              style={styles.halfBtn}
            />
          </View>
        </AppCard>

        {/* 9. App Version Info */}
        <View style={styles.versionFooter}>
          <AppText variant="caption" color="textSecondary" align="center">
            MJ Estates Mobile App • Version 1.0.0{'\n'}
            © 2026 MasterJi Estates. All rights reserved.
          </AppText>
        </View>
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
  brandCard: {
    marginBottom: spacing.lg,
    paddingVertical: spacing.xl,
  },
  brandCenter: {
    alignItems: 'center',
  },
  estBadge: {
    marginTop: spacing.sm,
    backgroundColor: colors.secondarySubtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  brandTitle: {
    marginTop: spacing.md,
    letterSpacing: -0.5,
  },
  brandQuote: {
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  brandMotto: {
    marginTop: spacing.sm,
    lineHeight: 20,
    maxWidth: 320,
  },
  lobbyCard: {
    marginBottom: spacing.lg,
    padding: spacing.xs,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  lobbyImageContainer: {
    position: 'relative',
    width: '100%',
    height: 380,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
  },
  lobbyImage: {
    width: '100%',
    height: '100%',
  },
  vignetteOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(10, 25, 47, 0.90)',
    padding: spacing.md,
  },
  vignetteBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(197, 160, 89, 0.25)',
    borderWidth: 1,
    borderColor: colors.borderGold,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.xs,
    marginBottom: spacing.xxs,
  },
  vignetteBadgeText: {
    color: colors.secondaryLight,
    letterSpacing: 0.8,
  },
  vignetteLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  vignetteAddress: {
    color: colors.textInverse,
  },
  extraServicesBannerCard: {
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  extraServicesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  sparkleIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  extraServicesHeaderText: {
    flex: 1,
  },
  servicesBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.secondarySubtle,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.borderGold,
    marginBottom: 2,
  },
  servicesBadgeText: {
    letterSpacing: 0.8,
  },
  extraServicesSubtitle: {
    lineHeight: 18,
    marginTop: spacing.xxs,
    marginBottom: spacing.sm,
  },
  servicePillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  pill: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  extraServicesBtn: {
    width: '100%',
    marginTop: spacing.xs,
  },
  overviewCard: {
    padding: spacing.xs,
    marginBottom: spacing.lg,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  overviewImageWrapper: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  overviewImage: {
    width: '100%',
    height: '100%',
  },
  overviewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surfaceMuted,
    borderBottomLeftRadius: radius.md,
    borderBottomRightRadius: radius.md,
  },
  noticeCard: {
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  noticeBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.secondarySubtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.borderGold,
    marginBottom: spacing.xs,
  },
  noticeQuote: {
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  phoneBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondarySubtle,
    padding: spacing.sm,
    borderRadius: radius.md,
    marginVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  phoneIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  phoneMeta: {
    flex: 1,
  },
  card: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  contactText: {
    marginLeft: spacing.md,
  },
  contactButtonsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  secondRow: {
    marginTop: spacing.sm,
  },
  halfBtn: {
    flex: 1,
  },
  versionFooter: {
    marginVertical: spacing.lg,
  },
});
