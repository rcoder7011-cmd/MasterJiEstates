/**
 * PropertyCard Component
 * Reusable, clean property listing card for Explore catalog, search feeds, and saved lists.
 * Enhanced with instant Wishlist/Save toggle and Compare selection.
 */

import React, { useState, memo } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  Image,
  Alert,
  GestureResponderEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { AppText } from '../ui/AppText';
import { AppIcon } from '../ui/AppIcon';
import { PropertyItem } from '../../types/property';
import { formatIndianCurrency } from '../../utils/formatting';
import { useSavedProperties } from '../../hooks/useSavedProperties';
import { useAuth } from '../../hooks/useAuth';
import { useCompare } from '../../hooks/useCompare';
import { useTranslation } from '../../hooks/useTranslation';

export interface PropertyCardProps {
  property: PropertyItem;
  onPress?: () => void;
  showSaveAction?: boolean;
  showCompareAction?: boolean;
}

const PropertyCardComponent: React.FC<PropertyCardProps> = ({
  property,
  onPress,
  showSaveAction = true,
  showCompareAction = true,
}) => {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  const { isSaved: checkIsSaved, toggleSave } = useSavedProperties();
  const { isAuthenticated } = useAuth();
  const { isInCompare, toggleCompare } = useCompare();
  const { t } = useTranslation();

  const isSaved = checkIsSaved(property.id);
  const inCompare = isInCompare(property.id);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push({
        pathname: '/property/[id]',
        params: { id: property.id },
      });
    }
  };

  const handleSavePress = async (e: GestureResponderEvent) => {
    e.stopPropagation?.();
    if (!isAuthenticated) {
      Alert.alert(
        t('auth.login', 'Sign In Required'),
        t('wishlist.guestSavePrompt', 'Sign in to save properties and access them across all your devices.'),
        [
          { text: t('common.cancel', 'Cancel'), style: 'cancel' },
          {
            text: t('auth.login', 'Sign In'),
            onPress: () => {
              router.push({
                pathname: '/auth/login',
                params: {
                  redirect: `/property/${property.id}`,
                  saveIntent: property.id,
                },
              });
            },
          },
        ]
      );
      return;
    }

    await toggleSave(property.id);
  };

  const handleComparePress = (e: GestureResponderEvent) => {
    e.stopPropagation?.();
    const res = toggleCompare(property);
    if (!res.success && res.reason === 'max_limit') {
      Alert.alert(
        t('compare.maxLimitReachedTitle', 'Comparison Limit Reached'),
        t('compare.maxLimitReachedDesc', 'You can compare up to 3 properties at a time. Remove one to add another.'),
        [{ text: t('common.close', 'OK') }]
      );
    }
  };

  const isRental = property.transaction === 'rent';
  const isSold = property.status === 'sold';
  const isRented = property.status === 'rented';

  const transactionLabel = property.transaction.toUpperCase();
  const formattedPrice = isRental
    ? `${formatIndianCurrency(property.price)} / mo`
    : formatIndianCurrency(property.price);

  const coverUri =
    property.images && property.images.length > 0
      ? property.images[0]
      : undefined;

  return (
    <Pressable
      onPress={handlePress}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${property.title}, ${property.locality}, ${property.city}, ${formattedPrice}`}
      style={({ pressed }) => [
        styles.cardContainer,
        pressed ? styles.cardPressed : null,
      ]}
    >
      {/* Visual Header / Image Display with Architectural Fallback */}
      <View style={styles.imagePlaceholder}>
        {coverUri && !imageError ? (
          <Image
            source={{ uri: coverUri }}
            style={styles.cardImage}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={styles.centerIconWrap}>
            <AppIcon
              name={
                property.propertyType === 'commercial'
                  ? 'Briefcase'
                  : property.propertyType === 'plot'
                  ? 'Compass'
                  : 'Building2'
              }
              size="lg"
              color="primaryLight"
            />
          </View>
        )}

        {/* Top-Left: Transaction Pill */}
        <View
          style={[
            styles.badgePill,
            styles.transactionBadge,
            property.transaction === 'rent'
              ? styles.rentBadge
              : property.transaction === 'sell'
              ? styles.sellBadge
              : styles.buyBadge,
          ]}
        >
          <AppText variant="caption" color="textInverse" weight="700">
            {transactionLabel}
          </AppText>
        </View>

        {/* Top-Right: Status, Sample Badge & Quick Save Button */}
        <View style={styles.topRightCol}>
          <View style={styles.topRightRow}>
            {showSaveAction ? (
              <Pressable
                style={[styles.saveBtn, isSaved && styles.saveBtnActive]}
                onPress={handleSavePress}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={isSaved ? `Remove ${property.title} from favorites` : `Save ${property.title} to favorites`}
              >
                <AppIcon
                  name="Heart"
                  size="xs"
                  color={isSaved ? 'error' : 'textSecondary'}
                />
              </Pressable>
            ) : null}

            {isSold ? (
              <View style={[styles.badgePill, styles.soldBadge]}>
                <AppText variant="caption" color="textInverse" weight="700">
                  SOLD
                </AppText>
              </View>
            ) : isRented ? (
              <View style={[styles.badgePill, styles.rentedBadge]}>
                <AppText variant="caption" color="textInverse" weight="700">
                  RENTED
                </AppText>
              </View>
            ) : (
              <View style={[styles.badgePill, styles.availableBadge]}>
                <AppText variant="caption" color="success" weight="700">
                  AVAILABLE
                </AppText>
              </View>
            )}
          </View>

          {/* Sample Data Indicator strictly for demo inventory */}
          {property.isSampleData ? (
            <View style={styles.sampleBadge}>
              <AppText variant="caption" color="secondaryDark" weight="700" style={styles.sampleBadgeText}>
                SAMPLE DATA
              </AppText>
            </View>
          ) : null}
        </View>
      </View>

      {/* Card Content Details */}
      <View style={styles.body}>
        {/* Price & SubType Row */}
        <View style={styles.priceRow}>
          <AppText variant="h2" color="primary" style={styles.price}>
            {formattedPrice}
          </AppText>
          <View style={styles.subTypePill}>
            <AppText variant="caption" color="textSecondary" weight="600">
              {property.subType}
            </AppText>
          </View>
        </View>

        {/* Property Title */}
        <AppText variant="h3" color="textPrimary" numberOfLines={1} style={styles.title}>
          {property.title}
        </AppText>

        {/* Location Row */}
        <View style={styles.locationRow}>
          <AppIcon name="MapPin" size="xs" color="secondary" />
          <AppText variant="bodySmall" color="textSecondary" numberOfLines={1} style={styles.locationText}>
            {property.locality}, {property.city}
          </AppText>
          {typeof property.distanceKm === 'number' ? (
            <View style={styles.distancePill}>
              <AppText variant="caption" color="primary" weight="700">
                {property.distanceKm} km
              </AppText>
            </View>
          ) : null}
        </View>

        {/* Specifications Badges & Compare Action Row */}
        <View style={styles.specsRow}>
          <View style={styles.specsBadgesGroup}>
            {property.bedrooms ? (
              <View style={styles.specBadge}>
                <AppIcon name="Bed" size="xs" color="textSecondary" />
                <AppText variant="caption" color="textSecondary" style={styles.specText}>
                  {property.bedrooms}
                </AppText>
              </View>
            ) : null}

            <View style={styles.specBadge}>
              <AppIcon name="Maximize2" size="xs" color="textSecondary" />
              <AppText variant="caption" color="textSecondary" style={styles.specText}>
                {property.area}
              </AppText>
            </View>

            <View style={styles.specCategory}>
              <AppText variant="caption" color="primary" weight="600" style={styles.categoryText}>
                {property.propertyType === 'plot'
                  ? 'Land / Plot'
                  : property.propertyType.toUpperCase()}
              </AppText>
            </View>
          </View>

          {showCompareAction ? (
            <Pressable
              style={[styles.compareBtn, inCompare && styles.compareBtnActive]}
              onPress={handleComparePress}
              hitSlop={6}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: inCompare }}
              accessibilityLabel={inCompare ? `Remove ${property.title} from compare` : `Add ${property.title} to compare`}
            >
              <AppIcon
                name={inCompare ? 'Check' : 'Plus'}
                size="xs"
                color={inCompare ? 'secondaryDark' : 'textSecondary'}
              />
              <AppText
                variant="caption"
                color={inCompare ? 'secondaryDark' : 'textSecondary'}
                weight={inCompare ? '700' : '600'}
                style={styles.compareBtnText}
              >
                {inCompare ? t('compare.inCompare', 'In Compare') : t('compare.addToCompare', 'Compare')}
              </AppText>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  cardPressed: {
    backgroundColor: colors.surfaceMuted,
    transform: [{ scale: 0.99 }],
  },
  imagePlaceholder: {
    height: 135,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  cardImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  centerIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgePill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  transactionBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
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
  topRightCol: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    alignItems: 'flex-end',
    gap: 4,
  },
  topRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  saveBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  saveBtnActive: {
    backgroundColor: colors.errorSubtle,
    borderColor: colors.error,
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
    paddingVertical: 1,
    borderRadius: radius.xs,
  },
  sampleBadgeText: {
    fontSize: 9,
    letterSpacing: 0.5,
  },
  body: {
    padding: spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  price: {
    fontSize: 18,
    lineHeight: 24,
    color: colors.primary,
    fontWeight: '800',
  },
  subTypePill: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  title: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '700',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  locationText: {
    marginLeft: 4,
    fontSize: 12,
    flex: 1,
  },
  distancePill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginLeft: 6,
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  specsBadgesGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 1,
  },
  specBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  specText: {
    fontSize: 11,
  },
  specCategory: {
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  categoryText: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
  compareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 3,
    borderRadius: radius.xs,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  compareBtnActive: {
    backgroundColor: colors.secondarySubtle,
    borderColor: colors.borderGold,
  },
  compareBtnText: {
    fontSize: 10,
  },
});

export const PropertyCard = memo(PropertyCardComponent);
