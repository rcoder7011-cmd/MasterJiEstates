import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  AppText,
  AppButton,
  AppInput,
  AppCard,
  AppHeader,
  AppLoader,
  AppDivider,
  AppIcon,
  BrandLogo,
} from '../src/components';
import { colors } from '../src/theme/colors';
import { spacing, layout } from '../src/theme/spacing';
import { radius } from '../src/theme/radius';

export default function DevShowcaseScreen() {
  const router = useRouter();
  const [inputText, setInputText] = useState('');
  const [inputErrorText, setInputErrorText] = useState('Invalid phone number format');
  const [buttonLoading, setButtonLoading] = useState(false);
  const [pressCount, setPressCount] = useState(0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Design System Showcase"
        subtitle="Part 2: UI System & Brand Verification"
        showBack
        onBackPress={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* SECTION 1: BRAND IDENTITY */}
        <View style={styles.section}>
          <AppText variant="caption" color="textGold" weight="700">
            SECTION 01 • BRAND IDENTITY
          </AppText>
          <AppText variant="h2" color="primary">
            MJ Estates
          </AppText>
          <AppText variant="body" color="textSecondary">
            Welcome to MJ Estates
          </AppText>

          <AppCard variant="goldAccent" style={styles.logoCard}>
            <BrandLogo size="md" variant="image" />
            <AppDivider spacing="sm" color="borderGold" />
            <AppText variant="caption" color="textSecondary" align="center">
              Official MasterJiEstates Logo Asset Loaded
            </AppText>
          </AppCard>
        </View>

        <AppDivider spacing="lg" />

        {/* SECTION 2: BRAND COLOR PALETTE */}
        <View style={styles.section}>
          <AppText variant="caption" color="textGold" weight="700">
            SECTION 02 • BRAND COLOR PALETTE
          </AppText>
          <AppText variant="h2" color="primary">
            Centralized Tokens
          </AppText>

          <View style={styles.colorGrid}>
            <View style={[styles.colorSwatch, { backgroundColor: colors.primary }]}>
              <AppText variant="caption" color="textInverse" weight="700">
                Primary
              </AppText>
              <AppText variant="caption" color="textInverse">
                #142B4F
              </AppText>
            </View>

            <View style={[styles.colorSwatch, { backgroundColor: colors.secondary }]}>
              <AppText variant="caption" color="textOnGold" weight="700">
                Secondary
              </AppText>
              <AppText variant="caption" color="textOnGold">
                #D97706
              </AppText>
            </View>

            <View
              style={[
                styles.colorSwatch,
                { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
              ]}
            >
              <AppText variant="caption" color="textPrimary" weight="700">
                Background
              </AppText>
              <AppText variant="caption" color="textSecondary">
                #FDFCFB
              </AppText>
            </View>

            <View
              style={[
                styles.colorSwatch,
                { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
              ]}
            >
              <AppText variant="caption" color="textPrimary" weight="700">
                Surface
              </AppText>
              <AppText variant="caption" color="textSecondary">
                #FFFFFF
              </AppText>
            </View>
          </View>

          <View style={styles.semanticRow}>
            <View
              style={[
                styles.semanticPill,
                { backgroundColor: colors.successSubtle, borderColor: colors.success },
              ]}
            >
              <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
              <AppText variant="caption" color="success" weight="700">
                Success
              </AppText>
            </View>
            <View
              style={[
                styles.semanticPill,
                { backgroundColor: colors.warningSubtle, borderColor: colors.warning },
              ]}
            >
              <View style={[styles.statusDot, { backgroundColor: colors.warning }]} />
              <AppText variant="caption" color="warning" weight="700">
                Warning
              </AppText>
            </View>
            <View
              style={[
                styles.semanticPill,
                { backgroundColor: colors.errorSubtle, borderColor: colors.error },
              ]}
            >
              <View style={[styles.statusDot, { backgroundColor: colors.error }]} />
              <AppText variant="caption" color="error" weight="700">
                Error
              </AppText>
            </View>
          </View>
        </View>

        <AppDivider spacing="lg" />

        {/* SECTION 3: TYPOGRAPHY SYSTEM */}
        <View style={styles.section}>
          <AppText variant="caption" color="textGold" weight="700">
            SECTION 03 • TYPOGRAPHY SCALE
          </AppText>
          <AppText variant="h2" color="primary">
            Multi-Script Typography
          </AppText>

          <AppCard style={styles.typeCard}>
            <AppText variant="display" color="primary">
              Display (32px)
            </AppText>
            <AppText variant="h1" color="primary">
              Heading 1 (24px)
            </AppText>
            <AppText variant="h2" color="primary">
              Heading 2 (20px)
            </AppText>
            <AppText variant="h3" color="primary">
              Heading 3 (17px)
            </AppText>
            <AppText variant="body" color="textPrimary">
              Body text: Transparent, trusted real-estate advisory.
            </AppText>
            <AppText variant="body" color="textSecondary">
              हिंदी भाषा समर्थन: मास्टर जी एस्टेट्स — आपके सपनों का घर।
            </AppText>
            <AppText variant="bodySmall" color="textSecondary">
              Body Small (13px): Property consultation & transaction coordination.
            </AppText>
            <AppText variant="caption" color="textMuted">
              Caption (11px): Verified RERA & Legal Scrutiny
            </AppText>
          </AppCard>
        </View>

        <AppDivider spacing="lg" />

        {/* SECTION 4: BUTTONS & INTERACTIVE STATES */}
        <View style={styles.section}>
          <AppText variant="caption" color="textGold" weight="700">
            SECTION 04 • REUSABLE BUTTONS
          </AppText>
          <AppText variant="h2" color="primary">
            Variants & Visual States
          </AppText>

          <View style={styles.buttonStack}>
            <AppButton
              title="Primary Action Button"
              variant="primary"
              rightIcon={<AppIcon name="ArrowRight" size="sm" color="textInverse" />}
              onPress={() => setPressCount((c) => c + 1)}
            />

            <AppButton
              title="Secondary (Brand Gold)"
              variant="secondary"
              leftIcon={<AppIcon name="Building2" size="sm" color="textOnGold" />}
              onPress={() => setPressCount((c) => c + 1)}
            />

            <AppButton
              title="Outline Button"
              variant="outline"
              leftIcon={<AppIcon name="Phone" size="sm" color="primary" />}
              onPress={() => setPressCount((c) => c + 1)}
            />

            <AppButton
              title={buttonLoading ? 'Loading...' : 'Toggle Loading State'}
              variant="primary"
              loading={buttonLoading}
              onPress={() => {
                setButtonLoading(true);
                setTimeout(() => setButtonLoading(false), 2000);
              }}
            />

            <AppButton title="Disabled Button State" variant="primary" disabled />

            <View style={styles.rowAlign}>
              <AppButton
                title="Small Primary"
                size="sm"
                variant="primary"
                style={{ flex: 1, marginRight: spacing.sm }}
              />
              <AppButton title="Small Gold" size="sm" variant="secondary" style={{ flex: 1 }} />
            </View>

            <AppText variant="caption" color="textMuted" align="center">
              Tap count: {pressCount}
            </AppText>
          </View>
        </View>

        <AppDivider spacing="lg" />

        {/* SECTION 5: INPUT FIELDS & VALIDATION STATES */}
        <View style={styles.section}>
          <AppText variant="caption" color="textGold" weight="700">
            SECTION 05 • INPUT FIELDS
          </AppText>
          <AppText variant="h2" color="primary">
            Default, Focus & Error States
          </AppText>

          <AppInput
            label="Full Name"
            placeholder="e.g. Ramesh Sharma"
            value={inputText}
            onChangeText={setInputText}
            leftIcon={<AppIcon name="User" size="sm" color="textMuted" />}
            helperText="Enter your name as registered with government ID"
          />

          <AppInput
            label="Phone Number"
            placeholder="+91 99903 16186"
            value="99903"
            error={inputErrorText}
            onChangeText={(t) => {
              if (t.length >= 10) setInputErrorText('');
              else setInputErrorText('Invalid phone number format');
            }}
            leftIcon={<AppIcon name="Phone" size="sm" color="error" />}
          />

          <AppInput
            label="Office Location (Read Only)"
            value="Noida Sector 62A, Uttar Pradesh"
            disabled
            leftIcon={<AppIcon name="MapPin" size="sm" color="textMuted" />}
          />
        </View>

        <AppDivider spacing="lg" />

        {/* SECTION 6: CARDS & CONTAINERS */}
        <View style={styles.section}>
          <AppText variant="caption" color="textGold" weight="700">
            SECTION 06 • CARDS & SURFACES
          </AppText>
          <AppText variant="h2" color="primary">
            Card Hierarchy
          </AppText>

          <View style={styles.cardStack}>
            <AppCard variant="default">
              <AppText variant="h3" color="primary">
                Default Card
              </AppText>
              <AppText variant="bodySmall" color="textSecondary">
                Clean white surface with subtle hairline border for content grouping.
              </AppText>
            </AppCard>

            <AppCard variant="elevated">
              <AppText variant="h3" color="primary">
                Elevated Card
              </AppText>
              <AppText variant="bodySmall" color="textSecondary">
                Subtle mobile-optimized elevation shadow for featured content.
              </AppText>
            </AppCard>

            <AppCard variant="goldAccent" onPress={() => setPressCount((c) => c + 1)}>
              <View style={styles.cardHeaderRow}>
                <AppText variant="h3" color="primary">
                  Interactive Gold Accent Card
                </AppText>
                <AppIcon name="ChevronRight" size="sm" color="secondary" />
              </View>
              <AppText variant="bodySmall" color="textSecondary">
                Pressable card container with tactile feedback on touch.
              </AppText>
            </AppCard>
          </View>
        </View>

        <AppDivider spacing="lg" />

        {/* SECTION 7: ICONS & CENTRALIZED WRAPPER */}
        <View style={styles.section}>
          <AppText variant="caption" color="textGold" weight="700">
            SECTION 07 • ICON SYSTEM
          </AppText>
          <AppText variant="h2" color="primary">
            Lucide Icons (Standardized)
          </AppText>

          <AppCard style={styles.iconGridCard}>
            <View style={styles.iconGrid}>
              <View style={styles.iconItem}>
                <AppIcon name="Home" size="lg" color="primary" />
                <AppText variant="caption" color="textSecondary">
                  Home
                </AppText>
              </View>
              <View style={styles.iconItem}>
                <AppIcon name="Building2" size="lg" color="secondary" />
                <AppText variant="caption" color="textSecondary">
                  Building
                </AppText>
              </View>
              <View style={styles.iconItem}>
                <AppIcon name="Search" size="lg" color="primary" />
                <AppText variant="caption" color="textSecondary">
                  Search
                </AppText>
              </View>
              <View style={styles.iconItem}>
                <AppIcon name="MapPin" size="lg" color="secondary" />
                <AppText variant="caption" color="textSecondary">
                  MapPin
                </AppText>
              </View>
              <View style={styles.iconItem}>
                <AppIcon name="Phone" size="lg" color="primary" />
                <AppText variant="caption" color="textSecondary">
                  Phone
                </AppText>
              </View>
              <View style={styles.iconItem}>
                <AppIcon name="Shield" size="lg" color="success" />
                <AppText variant="caption" color="textSecondary">
                  Shield
                </AppText>
              </View>
              <View style={styles.iconItem}>
                <AppIcon name="CheckCircle" size="lg" color="success" />
                <AppText variant="caption" color="textSecondary">
                  Check
                </AppText>
              </View>
              <View style={styles.iconItem}>
                <AppIcon name="AlertTriangle" size="lg" color="warning" />
                <AppText variant="caption" color="textSecondary">
                  Warning
                </AppText>
              </View>
            </View>
          </AppCard>
        </View>

        <AppDivider spacing="lg" />

        {/* SECTION 8: LOADER & STATUS INDICATORS */}
        <View style={styles.section}>
          <AppText variant="caption" color="textGold" weight="700">
            SECTION 08 • LOADERS & DIVIDERS
          </AppText>
          <AppText variant="h2" color="primary">
            Loading Indicators
          </AppText>

          <AppCard>
            <AppLoader size="small" message="Loading property consultation..." />
            <AppDivider label="OR" spacing="md" />
            <AppLoader size="large" color="secondary" message="Connecting with property advisor" />
          </AppCard>
        </View>

        {/* FOOTER NOTICE */}
        <View style={styles.footerNote}>
          <AppText variant="caption" color="textMuted" align="center">
            MasterJiEstates Mobile Design System • Part 2 Complete
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
  section: {
    marginBottom: spacing.xs,
  },
  logoCard: {
    marginTop: spacing.md,
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  colorSwatch: {
    flex: 1,
    minWidth: '45%',
    height: 70,
    borderRadius: radius.md,
    padding: spacing.sm,
    justifyContent: 'space-between',
  },
  semanticRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  semanticPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing.xs,
  },
  typeCard: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  buttonStack: {
    marginTop: spacing.md,
    gap: spacing.md,
  },
  rowAlign: {
    flexDirection: 'row',
  },
  cardStack: {
    marginTop: spacing.md,
    gap: spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  iconGridCard: {
    marginTop: spacing.md,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  iconItem: {
    width: '23%',
    alignItems: 'center',
    marginVertical: spacing.sm,
    gap: spacing.xs,
  },
  footerNote: {
    marginTop: spacing.xxl,
    marginBottom: spacing.xl,
  },
});

