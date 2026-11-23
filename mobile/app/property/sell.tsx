/**
 * Sell Property Informational & Advisory Screen — app/property/sell.tsx
 * Explains how MasterJiEstates assists property owners in selling their assets
 * with direct WhatsApp advisory, phone consultation, and self-listing options.
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Linking, Pressable } from 'react-native';
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
} from '../../src/components';
import { colors } from '../../src/theme/colors';
import { spacing, layout } from '../../src/theme/spacing';
import { radius } from '../../src/theme/radius';
import { OFFICIAL_CONTACT, buildWhatsAppUrl } from '../../src/constants/contact';
import { useAuth } from '../../src/hooks/useAuth';

export default function SellPropertyScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handleWhatsApp = () => {
    const url = buildWhatsAppUrl(OFFICIAL_CONTACT.SELL_WHATSAPP_MESSAGE);
    Linking.openURL(url).catch(() => {});
  };

  const handleCall = () => {
    Linking.openURL(OFFICIAL_CONTACT.CALL_TEL).catch(() => {});
  };

  const handleListDirectly = () => {
    if (isAuthenticated) {
      router.push('/property/create');
    } else {
      router.push({
        pathname: '/auth/login',
        params: { redirect: '/property/create' },
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <AppHeader
        title="Sell Property"
        subtitle="MasterJiEstates Advisory & Valuation"
        showBack
        onBackPress={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card */}
        <AppCard variant="goldAccent" style={styles.heroCard}>
          <View style={styles.heroBadgeRow}>
            <View style={styles.badge}>
              <AppText variant="caption" color="textOnGold" weight="700">
                OFFICIAL ADVISORY
              </AppText>
            </View>
            <BrandLogo size="sm" variant="text" />
          </View>

          <AppText variant="h1" color="primary" style={styles.heroTitle}>
            Sell Your Property With MasterJiEstates
          </AppText>

          <AppText variant="body" color="textSecondary" style={styles.heroDesc}>
            Let our experienced real estate advisors handle everything from property valuation and
            buyer qualification to deed paperwork across Delhi, Noida, Ghaziabad, and Gurugram.
          </AppText>
        </AppCard>

        {/* 4 Pillars of Value */}
        <AppText variant="caption" color="textGold" weight="700" style={styles.sectionEyebrow}>
          WHY SELL WITH US
        </AppText>
        <AppText variant="h2" color="primary" style={styles.sectionTitle}>
          The MasterJi Advantage
        </AppText>

        <View style={styles.pillarsGrid}>
          <View style={styles.pillarCard}>
            <View style={styles.pillarIconCircle}>
              <AppIcon name="TrendingUp" size="sm" color="secondaryDark" />
            </View>
            <AppText variant="body" color="primary" weight="700" style={styles.pillarTitle}>
              Accurate Market Valuation
            </AppText>
            <AppText variant="caption" color="textSecondary">
              Data-backed Comparative Market Analysis (CMA) based on verified registry deeds.
            </AppText>
          </View>

          <View style={styles.pillarCard}>
            <View style={styles.pillarIconCircle}>
              <AppIcon name="Users" size="sm" color="secondaryDark" />
            </View>
            <AppText variant="body" color="primary" weight="700" style={styles.pillarTitle}>
              10,000+ Verified Buyers
            </AppText>
            <AppText variant="caption" color="textSecondary">
              Direct access to genuine families, corporate clients, and active investors.
            </AppText>
          </View>

          <View style={styles.pillarCard}>
            <View style={styles.pillarIconCircle}>
              <AppIcon name="ShieldCheck" size="sm" color="secondaryDark" />
            </View>
            <AppText variant="body" color="primary" weight="700" style={styles.pillarTitle}>
              Legal &amp; Registry Guidance
            </AppText>
            <AppText variant="caption" color="textSecondary">
              End-to-end assistance with mutation records, title deeds, and sale agreements.
            </AppText>
          </View>

          <View style={styles.pillarCard}>
            <View style={styles.pillarIconCircle}>
              <AppIcon name="Award" size="sm" color="secondaryDark" />
            </View>
            <AppText variant="body" color="primary" weight="700" style={styles.pillarTitle}>
              Zero Upfront Charges
            </AppText>
            <AppText variant="caption" color="textSecondary">
              No hidden listing costs. Standard brokerage fee invoiced only on deed execution.
            </AppText>
          </View>
        </View>

        {/* 3 Step Process */}
        <AppCard style={styles.processCard}>
          <AppText variant="h3" color="primary" style={styles.processHeading}>
            How It Works in 3 Simple Steps
          </AppText>

          <View style={styles.stepRow}>
            <View style={styles.stepNumBox}>
              <AppText variant="bodySmall" color="textInverse" weight="800">
                1
              </AppText>
            </View>
            <View style={styles.stepContent}>
              <AppText variant="bodySmall" color="primary" weight="700">
                Connect With An Advisor
              </AppText>
              <AppText variant="caption" color="textSecondary">
                Reach out via WhatsApp or phone with your property location and configuration.
              </AppText>
            </View>
          </View>

          <View style={styles.stepRow}>
            <View style={styles.stepNumBox}>
              <AppText variant="bodySmall" color="textInverse" weight="800">
                2
              </AppText>
            </View>
            <View style={styles.stepContent}>
              <AppText variant="bodySmall" color="primary" weight="700">
                Valuation &amp; Buyer Match
              </AppText>
              <AppText variant="caption" color="textSecondary">
                We inspect the property, establish fair market pricing, and schedule verified buyer visits.
              </AppText>
            </View>
          </View>

          <View style={styles.stepRow}>
            <View style={styles.stepNumBox}>
              <AppText variant="bodySmall" color="textInverse" weight="800">
                3
              </AppText>
            </View>
            <View style={styles.stepContent}>
              <AppText variant="bodySmall" color="primary" weight="700">
                Closing &amp; Deed Execution
              </AppText>
              <AppText variant="caption" color="textSecondary">
                Our legal team assists with documentation, token payments, and sub-registrar deed execution.
              </AppText>
            </View>
          </View>
        </AppCard>

        {/* Direct Action Card */}
        <AppCard variant="elevated" style={styles.actionCard}>
          <AppText variant="h3" color="primary" align="center" style={styles.actionTitle}>
            Ready to Connect With Our Advisory Desk?
          </AppText>
          <AppText variant="bodySmall" color="textSecondary" align="center" style={styles.actionDesc}>
            Speak directly with our senior property evaluation team. No obligations.
          </AppText>

          <AppButton
            title="Chat on WhatsApp"
            variant="secondary"
            size="lg"
            leftIcon={<AppIcon name="MessageCircle" size="sm" color="textOnGold" />}
            onPress={handleWhatsApp}
            style={styles.actionBtn}
          />

          <AppButton
            title="Call Property Advisory (+91 9990316186)"
            variant="outline"
            size="md"
            leftIcon={<AppIcon name="Phone" size="sm" color="primary" />}
            onPress={handleCall}
            style={styles.actionBtn}
          />

          <AppDivider spacing="md" />

          {/* Self Service Listing Link */}
          <View style={styles.selfListingBox}>
            <AppText variant="caption" color="textSecondary" align="center">
              Want to post a self-managed property listing directly?
            </AppText>
            <Pressable onPress={handleListDirectly} style={styles.selfListingBtn}>
              <AppText variant="caption" color="secondaryDark" weight="700">
                Go to Direct Property Listing Form →
              </AppText>
            </Pressable>
          </View>
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
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxl,
  },
  heroCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  badge: {
    backgroundColor: colors.secondaryDark,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.xs,
  },
  heroTitle: {
    fontSize: 22,
    lineHeight: 28,
    marginBottom: spacing.xs,
  },
  heroDesc: {
    lineHeight: 22,
  },
  sectionEyebrow: {
    letterSpacing: 1,
    marginBottom: 2,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  pillarsGrid: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  pillarCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillarIconCircle: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.secondarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  pillarTitle: {
    marginBottom: 2,
  },
  processCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: '#F9FBFD',
    borderColor: colors.borderLight,
  },
  processHeading: {
    marginBottom: spacing.md,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  stepNumBox: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepContent: {
    flex: 1,
  },
  actionCard: {
    padding: spacing.lg,
  },
  actionTitle: {
    marginBottom: 4,
  },
  actionDesc: {
    marginBottom: spacing.md,
  },
  actionBtn: {
    marginBottom: spacing.sm,
  },
  selfListingBox: {
    alignItems: 'center',
    paddingTop: spacing.xs,
  },
  selfListingBtn: {
    paddingVertical: spacing.xs,
  },
});
