/**
 * PropertyDetailSkeleton Component
 * Elegant loading placeholder displayed while remote property details resolve.
 */

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, layout } from '../../theme/spacing';
import { radius } from '../../theme/radius';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const PropertyDetailSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Gallery Skeleton */}
      <View style={styles.gallerySkeleton} />

      {/* Body Content Skeleton */}
      <View style={styles.body}>
        {/* Badges placeholder */}
        <View style={styles.badgeRow}>
          <View style={[styles.shimmerBox, styles.badge]} />
          <View style={[styles.shimmerBox, styles.badge, { width: 90 }]} />
        </View>

        {/* Price placeholder */}
        <View style={[styles.shimmerBox, styles.priceLine]} />

        {/* Title placeholder */}
        <View style={[styles.shimmerBox, styles.titleLine]} />
        <View style={[styles.shimmerBox, styles.titleLine, { width: '60%' }]} />

        {/* Location placeholder */}
        <View style={[styles.shimmerBox, styles.locationLine]} />

        {/* Quick specs pill placeholders */}
        <View style={styles.quickSpecsRow}>
          <View style={[styles.shimmerBox, styles.specPill]} />
          <View style={[styles.shimmerBox, styles.specPill]} />
          <View style={[styles.shimmerBox, styles.specPill]} />
          <View style={[styles.shimmerBox, styles.specPill]} />
        </View>

        {/* Specs grid placeholders */}
        <View style={styles.grid}>
          <View style={[styles.shimmerBox, styles.gridItem]} />
          <View style={[styles.shimmerBox, styles.gridItem]} />
          <View style={[styles.shimmerBox, styles.gridItem]} />
          <View style={[styles.shimmerBox, styles.gridItem]} />
        </View>

        {/* Description block placeholder */}
        <View style={[styles.shimmerBox, styles.descBlock]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gallerySkeleton: {
    width: SCREEN_WIDTH,
    height: 280,
    backgroundColor: colors.primarySubtle,
  },
  body: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.md,
  },
  shimmerBox: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  badge: {
    width: 60,
    height: 22,
    borderRadius: radius.xs,
  },
  priceLine: {
    width: 140,
    height: 32,
    borderRadius: radius.sm,
    marginBottom: spacing.xs,
  },
  titleLine: {
    width: '90%',
    height: 20,
    marginBottom: 6,
  },
  locationLine: {
    width: '45%',
    height: 14,
    marginBottom: spacing.md,
  },
  quickSpecsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  specPill: {
    flex: 1,
    height: 32,
    borderRadius: radius.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  gridItem: {
    width: '48.5%',
    height: 52,
    borderRadius: radius.md,
  },
  descBlock: {
    width: '100%',
    height: 90,
    borderRadius: radius.md,
  },
});
