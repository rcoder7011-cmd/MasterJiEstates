/**
 * Company Values Section — mobile/src/components/about/CompanyValuesSection.tsx
 *
 * Details MJ Estates Company Story, Vision, Mission, and Core Ethical Values.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from '../ui/AppText';
import { AppCard } from '../ui/AppCard';
import { AppIcon } from '../ui/AppIcon';
import { AppDivider } from '../ui/AppDivider';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { COMPANY_INFO } from '../../data/companyData';
import { useTranslation } from '../../hooks/useTranslation';

export function CompanyValuesSection() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {/* 1. Vision & Mission Card */}
      <AppCard variant="elevated" style={styles.card}>
        <View style={styles.iconHeadingRow}>
          <View style={[styles.headingIconBox, { backgroundColor: colors.secondarySubtle }]}>
            <AppIcon name="Compass" size="sm" color="secondary" />
          </View>
          <View style={styles.headingTextCol}>
            <AppText variant="h3" color="primary">
              {t('company.visionMissionTitle', 'Vision & Mission')}
            </AppText>
            <AppText variant="caption" color="textSecondary">
              {COMPANY_INFO.tagline}
            </AppText>
          </View>
        </View>

        <AppDivider spacing="sm" />

        {/* Vision Block */}
        <View style={styles.pillarBlock}>
          <View style={styles.pillarBadge}>
            <AppText variant="caption" color="primary" weight="700">
              OUR VISION
            </AppText>
          </View>
          <AppText variant="body" color="textSecondary" style={styles.pillarDesc}>
            {COMPANY_INFO.vision}
          </AppText>
        </View>

        <AppDivider spacing="sm" />

        {/* Mission Block */}
        <View style={styles.pillarBlock}>
          <View style={[styles.pillarBadge, styles.missionBadge]}>
            <AppText variant="caption" color="secondaryDark" weight="700">
              OUR MISSION
            </AppText>
          </View>
          <AppText variant="body" color="textSecondary" style={styles.pillarDesc}>
            {COMPANY_INFO.mission}
          </AppText>
        </View>
      </AppCard>

      {/* 2. Core Values Card */}
      <AppCard variant="elevated" style={styles.card}>
        <View style={styles.iconHeadingRow}>
          <View style={[styles.headingIconBox, { backgroundColor: colors.primarySubtle }]}>
            <AppIcon name="Shield" size="sm" color="primary" />
          </View>
          <View style={styles.headingTextCol}>
            <AppText variant="h3" color="primary">
              {t('company.coreValuesTitle', 'Our Core Pillars & Values')}
            </AppText>
            <AppText variant="caption" color="textSecondary">
              Non-negotiable ethical standards across every transaction
            </AppText>
          </View>
        </View>

        <AppDivider spacing="sm" />

        {COMPANY_INFO.coreValues.map((value, idx) => (
          <View key={value.id}>
            <View style={styles.valueRow}>
              <View style={styles.valueIconCircle}>
                <AppIcon name={value.iconName} size="xs" color="secondary" />
              </View>
              <View style={styles.valueTextCol}>
                <AppText variant="body" color="primary" weight="600">
                  {value.title}
                </AppText>
                <AppText variant="caption" color="textSecondary" style={styles.valueDesc}>
                  {value.description}
                </AppText>
              </View>
            </View>
            {idx < COMPANY_INFO.coreValues.length - 1 && <AppDivider spacing="xs" />}
          </View>
        ))}
      </AppCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  card: {
    marginBottom: spacing.lg,
  },
  iconHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  headingIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  headingTextCol: {
    flex: 1,
  },
  pillarBlock: {
    marginVertical: spacing.xs,
  },
  pillarBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.xs,
    marginBottom: spacing.xs,
  },
  missionBadge: {
    backgroundColor: colors.secondarySubtle,
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  pillarDesc: {
    lineHeight: 22,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.xs,
  },
  valueIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.secondarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginTop: 2,
  },
  valueTextCol: {
    flex: 1,
  },
  valueDesc: {
    lineHeight: 18,
    marginTop: 2,
  },
});
