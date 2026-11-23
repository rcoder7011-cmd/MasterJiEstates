/**
 * Leadership Section — mobile/src/components/about/LeadershipSection.tsx
 *
 * Renders dedicated profile cards for MJ Estates Leadership:
 * 1. Founder: Riyaz Saifi (Founder, MJ Estates)
 * 2. CEO: Mr Shokin (Master Ji) (CEO, MJ Estates)
 *
 * IMAGE PLACEHOLDER SPECIFICATION:
 * High-profile placeholders with exact markers '[ADD FOUNDER IMAGE LATER]' and '[ADD CEO IMAGE LATER]'.
 * Photos will be added in a future release. No AI or stock photos used.
 */

import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { AppText } from '../ui/AppText';
import { AppCard } from '../ui/AppCard';
import { AppIcon } from '../ui/AppIcon';
import { AppDivider } from '../ui/AppDivider';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import {
  FOUNDER_PROFILE,
  CEO_PROFILE,
  LeaderProfile,
} from '../../data/leadershipData';
import { useTranslation } from '../../hooks/useTranslation';

const founderPhoto = require('../../../assets/images/FounderImg.png');
const ceoPhoto = require('../../../assets/images/ceo.jpeg');

interface LeaderCardProps {
  profile: LeaderProfile;
  isCeo?: boolean;
}

function LeaderCard({ profile, isCeo }: LeaderCardProps) {
  const { t } = useTranslation();

  return (
    <AppCard
      variant="elevated"
      style={[styles.leaderCard, isCeo ? styles.ceoCard : styles.founderCard]}
    >
      {/* 1. Verified Designation Badge */}
      <View style={styles.topBadgeRow}>
        <View style={[styles.roleBadge, isCeo ? styles.ceoBadge : styles.founderBadge]}>
          <AppIcon
            name={isCeo ? 'Award' : 'Shield'}
            size="xs"
            color={isCeo ? 'secondaryDark' : 'primary'}
          />
          <AppText
            variant="caption"
            color={isCeo ? 'secondaryDark' : 'primary'}
            weight="700"
            style={styles.roleBadgeText}
          >
            {profile.designation.toUpperCase()}
          </AppText>
        </View>
      </View>

      {/* 2. Photo / Portrait Frame with Approved Images */}
      <View style={styles.imageContainer}>
        <Image
          source={isCeo ? ceoPhoto : founderPhoto}
          style={styles.photo}
          resizeMode="cover"
          accessibilityLabel={`${profile.name} - ${profile.designation} (${profile.imagePlaceholderText})`}
        />
      </View>

      {/* 3. Name and Title */}
      <View style={styles.nameSection}>
        <AppText variant="h2" color="primary" weight="700">
          {isCeo ? 'Mr. Shokin' : profile.name}
        </AppText>
        <AppText variant="bodySmall" color="secondary" weight="600">
          {isCeo ? 'CEO' : 'Founder'} • {profile.designation}
        </AppText>
      </View>

      <AppDivider spacing="sm" />

      {/* 4. Short Introduction */}
      <AppText variant="body" color="textSecondary" style={styles.introText}>
        {profile.shortIntro}
      </AppText>

      {/* 5. Key Responsibilities */}
      <View style={styles.responsibilitiesSection}>
        <AppText variant="caption" color="primary" weight="700" style={styles.sectionHeader}>
          {t('leadership.keyFocus', 'CORE RESPONSIBILITIES & FOCUS')}
        </AppText>
        {profile.responsibilities.map((resp, index) => (
          <View key={index} style={styles.responsibilityRow}>
            <View style={styles.bulletIcon}>
              <AppIcon name="CheckCircle" size="xs" color="secondary" />
            </View>
            <AppText variant="bodySmall" color="textSecondary" style={styles.responsibilityText}>
              {resp}
            </AppText>
          </View>
        ))}
      </View>

      {/* 6. Leadership Vision Quote */}
      <View style={styles.quoteBox}>
        <AppIcon name="Compass" size="xs" color="secondary" />
        <AppText variant="caption" color="primary" weight="600" style={styles.quoteText}>
          {`"${profile.visionQuote}"`}
        </AppText>
      </View>
    </AppCard>
  );
}

export function LeadershipSection() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <AppText variant="h3" color="primary">
          {t('leadership.sectionTitle', 'Executive Leadership')}
        </AppText>
        <AppText variant="caption" color="textSecondary">
          {t('leadership.sectionSubtitle', 'Visionary Direction & Experienced Ground Advisory')}
        </AppText>
      </View>

      <AppDivider spacing="sm" />

      {/* Founder Card: Riyaz Saifi */}
      <LeaderCard profile={FOUNDER_PROFILE} isCeo={false} />

      {/* CEO Card: Mr Shokin (Master Ji) */}
      <LeaderCard profile={CEO_PROFILE} isCeo={true} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  headerRow: {
    marginBottom: spacing.xs,
  },
  leaderCard: {
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  founderCard: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  ceoCard: {
    borderLeftWidth: 3,
    borderLeftColor: colors.secondary,
  },
  topBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: spacing.sm,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.xs,
  },
  founderBadge: {
    backgroundColor: colors.primarySubtle,
  },
  ceoBadge: {
    backgroundColor: colors.secondarySubtle,
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  roleBadgeText: {
    letterSpacing: 0.5,
  },
  imageContainer: {
    width: '100%',
    height: 250,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: spacing.md,
    backgroundColor: colors.surfaceMuted,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  placeholderBox: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    padding: spacing.md,
  },
  founderPlaceholder: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.border,
  },
  ceoPlaceholder: {
    backgroundColor: colors.secondarySubtle,
    borderColor: colors.borderGold,
  },
  placeholderIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  placeholderTag: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 4,
  },
  placeholderSub: {
    fontSize: 11,
  },
  nameSection: {
    marginBottom: spacing.xs,
  },
  introText: {
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  responsibilitiesSection: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  responsibilityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xxs,
  },
  bulletIcon: {
    marginTop: 2,
    marginRight: spacing.xs,
  },
  responsibilityText: {
    flex: 1,
    lineHeight: 18,
  },
  quoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.secondarySubtle,
    borderRadius: radius.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  quoteText: {
    flex: 1,
    fontStyle: 'italic',
    lineHeight: 18,
  },
});
