/**
 * PropertyPriceSection Component
 * Displays property title, pricing, transaction badge, availability status,
 * copyable Property ID, location, and context-aware quick metrics strip.
 */

import React from 'react';
import { View, Pressable, StyleSheet, Alert, Share } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { AppText } from '../ui/AppText';
import { AppIcon } from '../ui/AppIcon';
import { PropertyItem } from '../../types/property';
import { formatIndianCurrency } from '../../utils/formatting';
import { useTranslation } from '../../hooks/useTranslation';

export interface PropertyPriceSectionProps {
  property: PropertyItem;
}

export const PropertyPriceSection: React.FC<PropertyPriceSectionProps> = ({
  property,
}) => {
  const { t } = useTranslation();

  const isRental = property.transaction === 'rent';
  const isSold = property.status === 'sold';
  const isRented = property.status === 'rented';
  const isPlot = property.propertyType === 'plot' || property.subType?.toLowerCase().includes('plot') || property.subType?.toLowerCase().includes('land');
  const isCommercial = property.propertyType === 'commercial' || property.subType?.toLowerCase().includes('commercial');

  const formattedPrice = isRental
    ? `${formatIndianCurrency(property.price)} ${t('propertyDetails.perMonth', '/ month')}`
    : formatIndianCurrency(property.price);

  const locationDisplay = property.locality
    ? `${property.locality}, ${property.city || 'Delhi NCR'}`
    : property.address || property.city || 'Delhi NCR';

  const handleCopyId = async () => {
    try {
      await Share.share({
        title: `MJ Estates Property ID`,
        message: property.id,
      });
    } catch {
      Alert.alert(
        t('propertyDetails.propertyId', 'Property ID'),
        `ID: ${property.id}\n(${t('propertyDetails.idCopied', 'Property ID copied')})`
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. Badges Row */}
      <View style={styles.badgesRow}>
        {/* Transaction Badge */}
        <View
          style={[
            styles.badge,
            property.transaction === 'rent'
              ? styles.rentBadge
              : property.transaction === 'sell'
              ? styles.sellBadge
              : styles.buyBadge,
          ]}
        >
          <AppText variant="caption" color="textInverse" weight="700">
            {property.transaction.toUpperCase()}
          </AppText>
        </View>

        {/* Subtype Badge */}
        {property.subType ? (
          <View style={styles.subtypeBadge}>
            <AppText variant="caption" color="primary" weight="600">
              {property.subType}
            </AppText>
          </View>
        ) : null}

        {/* Availability Status Badge */}
        {isSold ? (
          <View style={[styles.badge, styles.soldBadge]}>
            <AppText variant="caption" color="textInverse" weight="700">
              {t('propertyDetails.sold', 'SOLD')}
            </AppText>
          </View>
        ) : isRented ? (
          <View style={[styles.badge, styles.rentedBadge]}>
            <AppText variant="caption" color="textInverse" weight="700">
              {t('propertyDetails.rented', 'RENTED')}
            </AppText>
          </View>
        ) : (
          <View style={[styles.badge, styles.availableBadge]}>
            <AppText variant="caption" color="success" weight="700">
              {t('propertyDetails.available', 'AVAILABLE')}
            </AppText>
          </View>
        )}

        {/* Sample Data Marker strictly for sample data listings */}
        {property.isSampleData ? (
          <View style={styles.sampleBadge}>
            <AppText variant="caption" color="secondaryDark" weight="700" style={styles.sampleBadgeText}>
              {t('propertyDetails.sampleDataBadge', 'SAMPLE DATA')}
            </AppText>
          </View>
        ) : null}
      </View>

      {/* 2. Price Row */}
      <View style={styles.priceRow}>
        <AppText variant="display" color="primary" style={styles.priceText}>
          {formattedPrice}
        </AppText>
        {property.pricePerSqFt ? (
          <View style={styles.rateBadge}>
            <AppText variant="caption" color="textSecondary" weight="600">
              {property.pricePerSqFt}
            </AppText>
          </View>
        ) : null}
      </View>

      {/* 3. Property Title */}
      <AppText variant="h1" color="textPrimary" style={styles.title}>
        {property.title}
      </AppText>

      {/* 4. Location & Locality Row */}
      <View style={styles.locationRow}>
        <AppIcon name="MapPin" size="xs" color="secondary" />
        <AppText variant="bodySmall" color="textSecondary" numberOfLines={1} style={styles.locationText}>
          {locationDisplay}
        </AppText>
      </View>

      {/* 5. Property ID Row with Copy / Share Action */}
      <View style={styles.idRow}>
        <View style={styles.idPill}>
          <AppText variant="caption" color="textSecondary" weight="600">
            {t('propertyDetails.propertyId', 'Property ID')}:{' '}
          </AppText>
          <AppText variant="caption" color="primary" weight="700" selectable>
            {property.id}
          </AppText>
        </View>

        <Pressable
          onPress={handleCopyId}
          accessible
          accessibilityRole="button"
          accessibilityLabel={`${t('propertyDetails.copyId', 'Copy Property ID')}: ${property.id}`}
          style={({ pressed }) => [styles.copyBtn, pressed ? styles.copyBtnPressed : null]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <AppIcon name="Copy" size="xs" color="secondaryDark" />
          <AppText variant="caption" color="secondaryDark" weight="700">
            {t('propertyDetails.copyId', 'Copy ID')}
          </AppText>
        </Pressable>
      </View>

      {/* 6. Context-Aware Quick Highlight Strip */}
      <View style={styles.quickSpecsRow}>
        {/* Bedrooms / BHK (Residential Only) */}
        {!isPlot && !isCommercial && property.bedrooms ? (
          <View style={styles.quickSpecItem}>
            <AppIcon name="Bed" size="xs" color="primary" />
            <AppText variant="caption" color="textPrimary" weight="600">
              {property.bedrooms}
            </AppText>
          </View>
        ) : null}

        {/* Bathrooms (Residential Only) */}
        {!isPlot && !isCommercial && property.bathrooms ? (
          <View style={styles.quickSpecItem}>
            <AppIcon name="Home" size="xs" color="primary" />
            <AppText variant="caption" color="textPrimary" weight="600">
              {property.bathrooms} Baths
            </AppText>
          </View>
        ) : null}

        {/* Area / Plot Area */}
        {property.plotArea || property.area || property.builtUpArea ? (
          <View style={styles.quickSpecItem}>
            <AppIcon name="Maximize2" size="xs" color="primary" />
            <AppText variant="caption" color="textPrimary" weight="600">
              {property.plotArea || property.builtUpArea || property.area}
            </AppText>
          </View>
        ) : null}

        {/* Furnishing Status (Residential / Commercial) */}
        {!isPlot && property.furnishingStatus ? (
          <View style={styles.quickSpecItem}>
            <AppIcon name="Layers" size="xs" color="primary" />
            <AppText variant="caption" color="textPrimary" weight="600">
              {property.furnishingStatus}
            </AppText>
          </View>
        ) : null}

        {/* Facing (For Plots) */}
        {isPlot && property.facing ? (
          <View style={styles.quickSpecItem}>
            <AppIcon name="Compass" size="xs" color="primary" />
            <AppText variant="caption" color="textPrimary" weight="600">
              {property.facing}
            </AppText>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.xs,
  },
  buyBadge: {
    backgroundColor: colors.primary,
  },
  rentBadge: {
    backgroundColor: colors.info,
  },
  sellBadge: {
    backgroundColor: colors.secondaryDark,
  },
  subtypeBadge: {
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.xs,
  },
  availableBadge: {
    backgroundColor: colors.successSubtle,
    borderWidth: 1,
    borderColor: colors.success,
  },
  soldBadge: {
    backgroundColor: colors.error,
  },
  rentedBadge: {
    backgroundColor: colors.textSecondary,
  },
  sampleBadge: {
    backgroundColor: colors.secondarySubtle,
    borderWidth: 1,
    borderColor: colors.borderGold,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  sampleBadgeText: {
    fontSize: 9,
    letterSpacing: 0.5,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    marginBottom: spacing.xxs,
  },
  priceText: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
  },
  rateBadge: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  title: {
    fontSize: 20,
    lineHeight: 28,
    marginTop: 2,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.xs,
  },
  locationText: {
    fontSize: 13,
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.sm,
  },
  idPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.secondarySubtle,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 3,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  copyBtnPressed: {
    opacity: 0.7,
  },
  quickSpecsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  quickSpecItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
});
