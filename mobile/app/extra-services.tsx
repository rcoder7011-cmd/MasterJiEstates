/**
 * Extra Services Screen — mobile/app/extra-services.tsx
 *
 * Showcases the 9 specialized services offered by MJ Estates:
 * 1. Interior Design & Interior Work
 * 2. Software Development Services
 * 3. Website Design & Development
 * 4. AI & Machine Learning Development
 * 5. Architecture & Architectural Design
 * 6. Carpentry & Furniture Work
 * 7. Home Buying Assistance
 * 8. Property Selling Assistance
 * 9. Real Estate Consultation
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
  IconName,
} from '../src/components';
import { colors } from '../src/theme/colors';
import { spacing, layout } from '../src/theme/spacing';
import { radius } from '../src/theme/radius';
import {
  EXTRA_SERVICES_CONTACT,
  callExtraServices,
  openWhatsAppExtraServices,
} from '../src/services/contactService';

interface ServiceItem {
  id: string;
  number: string;
  title: string;
  category: string;
  icon: IconName;
  description: string;
  features: string[];
}

const EXTRA_SERVICES: ServiceItem[] = [
  {
    id: 'interior',
    number: '01',
    title: 'Interior Design & Interior Work',
    category: 'TURNKEY INTERIORS',
    icon: 'Sparkles',
    description:
      'Complete residential and commercial interior solutions customized to your lifestyle and brand identity.',
    features: [
      'Bespoke modular kitchens & custom wardrobe design',
      'False ceiling, ambient lighting & electrical master planning',
      'Premium material selection with 3D photorealistic visualization',
      'Turnkey execution with strict timeline and quality assurance',
    ],
  },
  {
    id: 'software',
    number: '02',
    title: 'Software Development',
    category: 'SOFTWARE DEVELOPMENT SERVICES',
    icon: 'Layers',
    description:
      'Robust custom software tailored for real-estate enterprises, corporate workflows, and digital operations.',
    features: [
      'Custom CRM & lead management systems',
      'Real estate broker inventory & deal tracking platforms',
      'Enterprise workflow automation & reporting dashboards',
      'Scalable cloud infrastructure & API integrations',
    ],
  },
  {
    id: 'website',
    number: '03',
    title: 'Website Design & Development',
    category: 'DIGITAL PRESENCE',
    icon: 'Globe',
    description:
      'Modern, lightning-fast business websites and property portals engineered for high conversion.',
    features: [
      'Responsive, mobile-first architectural web design',
      'Interactive property search & map showcase portals',
      'SEO optimization & Google search indexing readiness',
      'Secure hosting setup, speed optimization & maintenance',
    ],
  },
  {
    id: 'aiml',
    number: '04',
    title: 'AI & Machine Learning Development',
    category: 'ADVANCED INTELLIGENCE',
    icon: 'Zap',
    description:
      'Cutting-edge artificial intelligence solutions built to accelerate business efficiency and decision-making.',
    features: [
      'Intelligent 24/7 WhatsApp & web customer chatbots',
      'Automated lead qualification & scoring algorithms',
      'Real estate price estimation & valuation models',
      'Custom Generative AI document & legal review assistants',
    ],
  },
  {
    id: 'architecture',
    number: '05',
    title: 'Architecture & Architectural Design',
    category: 'STRUCTURAL PLANNING',
    icon: 'Compass',
    description:
      'End-to-end architectural engineering, structural plans, and 3D elevations designed with precision.',
    features: [
      'Comprehensive floor plans, working drawings & layouts',
      'Modern 3D exterior elevations & facade engineering',
      'Municipal building sanction drawings & compliance advice',
      'Vastu-compliant residential & commercial space planning',
    ],
  },
  {
    id: 'carpentry',
    number: '06',
    title: 'Carpentry & Furniture Work',
    category: 'CUSTOM CRAFTSMANSHIP',
    icon: 'Square',
    description:
      'Master carpentry, custom wooden fittings, and handcrafted furniture built by experienced artisans.',
    features: [
      'Handcrafted solid wood dining, beds & executive tables',
      'Custom wall paneling, acoustic panels & partitions',
      'Designer wooden doors, frames & window casings',
      'On-site repair, precision restoration & wood polishing',
    ],
  },
  {
    id: 'buying',
    number: '07',
    title: 'Home Buying Assistance',
    category: 'VERIFIED ACQUISITION',
    icon: 'Key',
    description:
      'Guided end-to-end property purchase with complete revenue title scrutiny and direct owner liaison.',
    features: [
      'Hand-picked residential homes, apartments & luxury villas',
      'Rigorous 30-year revenue title search & legal vetting',
      'Guided physical walkthroughs with senior property consultants',
      'Home loan assistance through leading bank partners',
    ],
  },
  {
    id: 'selling',
    number: '08',
    title: 'Property Selling Assistance',
    category: 'DISCREET LIQUIDATION',
    icon: 'TrendingUp',
    description:
      'Orderly, privacy-first property sales that protect owner contact details from public web scrapers.',
    features: [
      'Confidential buyer screening & genuine financial verification',
      'Accurate market valuation based on live circle rates',
      'Targeted private marketing across verified investor networks',
      'Full assistance with Agreement to Sell & registry deed execution',
    ],
  },
  {
    id: 'consultation',
    number: '09',
    title: 'Real Estate Consultation',
    category: 'STRATEGIC ADVISORY',
    icon: 'Briefcase',
    description:
      'Unbiased, transparent consultation for strategic land acquisitions, commercial assets, and portfolio growth.',
    features: [
      'Direct one-on-one session with senior real-estate advisors',
      'High-yield commercial property & pre-leased asset evaluation',
      'Plotted development advisory across prime NCR growth corridors',
      'Conveyance, mutation & sub-registrar legal guidance',
    ],
  },
];

interface ExtraServicesScreenProps {
  isTabScreen?: boolean;
}

export default function ExtraServicesScreen({ isTabScreen = false }: ExtraServicesScreenProps = {}) {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <AppHeader
        title="Extra Services"
        subtitle="Turnkey Solutions, Architecture & Technology"
        showBack={!isTabScreen}
        onBackPress={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Header Services Overview Banner Graphic */}
        <AppCard style={styles.bannerCard} variant="elevated">
          <View style={styles.imageWrapper}>
            <Image
              source={require('../assets/images/services-overview.png')}
              style={styles.bannerImage}
              resizeMode="contain"
              accessibilityLabel="MasterJiEstates Services Overview — Everything You Need Under One Roof"
            />
          </View>
        </AppCard>

        {/* 2. Mandatory Notice & Contact Box (Section 3 Requirement) */}
        <AppCard variant="goldAccent" style={styles.noticeCard}>
          <View style={styles.noticeHeader}>
            <View style={styles.noticeBadge}>
              <AppIcon name="ShieldCheck" size="xs" color="secondaryDark" />
              <AppText variant="caption" color="secondaryDark" weight="700">
                OFFICIAL NOTICE
              </AppText>
            </View>
          </View>

          <AppText variant="body" color="primary" weight="600" style={styles.noticeText}>
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
                {EXTRA_SERVICES_CONTACT.PHONE}
              </AppText>
            </View>
          </View>

          {/* Quick Action Buttons */}
          <View style={styles.actionButtonsRow}>
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

        {/* 3. Section Title */}
        <View style={styles.sectionHeader}>
          <AppText variant="caption" color="secondary" weight="700" style={styles.sectionEyebrow}>
            COMPREHENSIVE CAPABILITIES
          </AppText>
          <AppText variant="h2" color="primary" weight="700">
            Our 9 Specialized Services
          </AppText>
          <AppText variant="bodySmall" color="textSecondary" style={styles.sectionSubtitle}>
            Tap any service to connect directly with our expert team for consultation and pricing.
          </AppText>
        </View>

        {/* 4. List of 9 Service Cards */}
        {EXTRA_SERVICES.map((service) => (
          <AppCard key={service.id} variant="elevated" style={styles.serviceCard}>
            {/* Header: Number, Category & Icon */}
            <View style={styles.serviceTopRow}>
              <View style={styles.serviceNumberBadge}>
                <AppText variant="caption" color="secondary" weight="700">
                  {service.number}
                </AppText>
              </View>
              <View style={styles.categoryBadge}>
                <AppText variant="caption" color="secondaryDark" weight="700" style={styles.categoryText}>
                  {service.category}
                </AppText>
              </View>
              <View style={styles.serviceIconCircle}>
                <AppIcon name={service.icon} size="md" color="secondaryDark" />
              </View>
            </View>

            {/* Service Title */}
            <AppText variant="h3" color="primary" weight="700" style={styles.serviceTitle}>
              {service.title}
            </AppText>

            {/* Short Description */}
            <AppText variant="bodySmall" color="textSecondary" style={styles.serviceDescription}>
              {service.description}
            </AppText>

            <AppDivider spacing="sm" />

            {/* Feature Bullet Points */}
            <View style={styles.featuresList}>
              {service.features.map((feature, idx) => (
                <View key={idx} style={styles.featureRow}>
                  <View style={styles.checkCircle}>
                    <AppIcon name="Check" size="xs" color="secondary" />
                  </View>
                  <AppText variant="caption" color="textPrimary" style={styles.featureText}>
                    {feature}
                  </AppText>
                </View>
              ))}
            </View>

            <AppDivider spacing="sm" />

            {/* Individual Enquire CTA Button */}
            <View style={styles.serviceFooterRow}>
              <AppButton
                title="Enquire on WhatsApp"
                variant="secondary"
                size="sm"
                leftIcon={<AppIcon name="MessageSquare" size="xs" color="textOnGold" />}
                onPress={() => openWhatsAppExtraServices(service.title)}
                style={styles.enquireBtn}
              />
              <Pressable
                onPress={callExtraServices}
                style={styles.callLink}
                accessibilityRole="button"
                accessibilityLabel={`Call regarding ${service.title}`}
              >
                <AppIcon name="Phone" size="xs" color="primary" />
                <AppText variant="caption" color="primary" weight="600">
                  Call Advisor
                </AppText>
              </Pressable>
            </View>
          </AppCard>
        ))}

        {/* 5. Bottom Final Contact Strip */}
        <AppCard style={styles.footerCard}>
          <View style={styles.footerCenter}>
            <AppIcon name="Building" size="lg" color="secondary" />
            <AppText variant="h3" color="primary" weight="700" style={styles.footerTitle}>
              MasterJi Estates Advisory Desk
            </AppText>
            <AppText variant="bodySmall" color="textSecondary" align="center" style={styles.footerDesc}>
              Headquartered in Noida Sector 62A, serving Delhi, UP, Ghaziabad, Noida, Gurugram, and Indirapuram.
            </AppText>

            <View style={styles.footerActionButtons}>
              <AppButton
                title="Call +91 7011202089"
                variant="primary"
                size="md"
                leftIcon={<AppIcon name="Phone" size="sm" color="textInverse" />}
                onPress={callExtraServices}
                style={styles.fullWidthBtn}
              />
              <AppButton
                title="WhatsApp Us"
                variant="secondary"
                size="md"
                leftIcon={<AppIcon name="MessageSquare" size="sm" color="textOnGold" />}
                onPress={() => openWhatsAppExtraServices()}
                style={[styles.fullWidthBtn, styles.mtSm]}
              />
            </View>
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
  bannerCard: {
    padding: spacing.xs,
    marginBottom: spacing.md,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  noticeCard: {
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  noticeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    backgroundColor: colors.secondarySubtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  noticeText: {
    fontStyle: 'italic',
    lineHeight: 20,
    marginTop: spacing.xs,
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
  actionButtonsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  halfBtn: {
    flex: 1,
  },
  sectionHeader: {
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  sectionEyebrow: {
    letterSpacing: 1,
    marginBottom: 2,
  },
  sectionSubtitle: {
    marginTop: spacing.xxs,
    lineHeight: 18,
  },
  serviceCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  serviceTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  serviceNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryBadge: {
    flex: 1,
  },
  categoryText: {
    letterSpacing: 0.8,
  },
  serviceIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  serviceTitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.xxs,
  },
  serviceDescription: {
    lineHeight: 18,
  },
  featuresList: {
    gap: spacing.xs,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  checkCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.secondarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  featureText: {
    flex: 1,
    lineHeight: 16,
  },
  serviceFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xxs,
  },
  enquireBtn: {
    flex: 1,
    marginRight: spacing.md,
  },
  callLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  footerCard: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
    paddingVertical: spacing.lg,
  },
  footerCenter: {
    alignItems: 'center',
  },
  footerTitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.xxs,
  },
  footerDesc: {
    maxWidth: 280,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  footerActionButtons: {
    width: '100%',
  },
  fullWidthBtn: {
    width: '100%',
  },
  mtSm: {
    marginTop: spacing.xs,
  },
});
