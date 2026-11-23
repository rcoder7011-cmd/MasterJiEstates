/**
 * Compare Properties Screen — app/property/compare.tsx
 * Mobile-first side-by-side comparison matrix for 2-3 properties.
 * Compares images, pricing, location, specs, amenities, and provides 1-tap details navigation.
 */

import React from 'react';
import {
  View,
  ScrollView,
  Image,
  Pressable,
  StyleSheet,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  AppText,
  AppCard,
  AppButton,
  AppIcon,
} from '../../src/components';
import { colors } from '../../src/theme/colors';
import { spacing, layout } from '../../src/theme/spacing';
import { radius } from '../../src/theme/radius';
import { useCompare } from '../../src/hooks/useCompare';
import { useTranslation } from '../../src/hooks/useTranslation';
import { formatIndianCurrency } from '../../src/utils/formatting';
import { PropertyItem } from '../../src/types/property';

export default function CompareScreen() {
  const router = useRouter();
  const { compareProperties, compareCount, removeFromCompare, clearCompare } = useCompare();
  const { t } = useTranslation();
  const { width: windowWidth } = useWindowDimensions();

  // Determine dynamic column width for 2 vs 3 properties
  const columnWidth = compareCount >= 3 ? Math.max(220, (windowWidth - 48) / 2.3) : Math.max(260, (windowWidth - 48) / 2);

  const handleClearAll = () => {
    Alert.alert(
      t('compare.clearConfirmTitle', 'Clear Comparison'),
      t('compare.clearConfirmDesc', 'Are you sure you want to clear all properties from comparison?'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('compare.clearAll', 'Clear All'),
          style: 'destructive',
          onPress: clearCompare,
        },
      ]
    );
  };

  const handleOpenDetails = (id: string) => {
    router.push({
      pathname: '/property/[id]',
      params: { id },
    });
  };

  // 1. Empty State (0 properties)
  if (compareCount === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Pressable
            style={styles.backBtn}
            onPress={() => router.back()}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <AppIcon name="ArrowLeft" size="sm" color="primary" />
          </Pressable>
          <AppText variant="h2" color="primary">
            {t('compare.title', 'Compare Properties')}
          </AppText>
          <View style={styles.headerRightPlaceholder} />
        </View>

        <View style={styles.emptyContainer}>
          <AppCard variant="default" style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <AppIcon name="Compass" size="lg" color="secondary" />
            </View>
            <AppText variant="h2" color="primary" align="center" style={styles.emptyTitle}>
              {t('compare.emptyTitle', 'No Properties to Compare')}
            </AppText>
            <AppText
              variant="bodySmall"
              color="textSecondary"
              align="center"
              style={styles.emptyDesc}
            >
              {t(
                'compare.emptyDesc',
                'Select up to 3 properties from Home, Explore or Property Details to compare prices, sizes, and amenities side-by-side.'
              )}
            </AppText>
            <AppButton
              title={t('common.browseAll', 'Explore Properties')}
              variant="primary"
              size="md"
              leftIcon={<AppIcon name="Search" size="sm" color="textInverse" />}
              onPress={() => router.push('/explore')}
              style={styles.exploreBtn}
            />
          </AppCard>
        </View>
      </SafeAreaView>
    );
  }

  // Row definition list
  const specRows: { key: string; label: string; getValue: (p: PropertyItem) => string }[] = [
    {
      key: 'price',
      label: t('compare.specs.price', 'Price'),
      getValue: (p) =>
        p.transaction === 'rent'
          ? `${formatIndianCurrency(p.price)} / mo`
          : formatIndianCurrency(p.price),
    },
    {
      key: 'type',
      label: t('compare.specs.type', 'Property Type'),
      getValue: (p) => p.propertyType.toUpperCase(),
    },
    {
      key: 'subtype',
      label: t('compare.specs.subtype', 'Sub Type'),
      getValue: (p) => p.subType || 'N/A',
    },
    {
      key: 'locality',
      label: t('compare.specs.locality', 'Locality'),
      getValue: (p) => p.locality || 'N/A',
    },
    {
      key: 'city',
      label: t('compare.specs.city', 'City'),
      getValue: (p) => p.city || 'Delhi NCR',
    },
    {
      key: 'bedrooms',
      label: t('compare.specs.bedrooms', 'Bedrooms'),
      getValue: (p) => (p.propertyType === 'plot' ? 'N/A (Plot)' : p.bedrooms ? `${p.bedrooms} BHK` : 'N/A'),
    },
    {
      key: 'bathrooms',
      label: t('compare.specs.bathrooms', 'Bathrooms'),
      getValue: (p) => (p.propertyType === 'plot' ? 'N/A (Plot)' : p.bathrooms ? `${p.bathrooms}` : 'N/A'),
    },
    {
      key: 'area',
      label: t('compare.specs.area', 'Area'),
      getValue: (p) => p.area || 'N/A',
    },
    {
      key: 'furnishing',
      label: t('compare.specs.furnishing', 'Furnishing'),
      getValue: (p) =>
        p.propertyType === 'plot'
          ? 'N/A (Plot)'
          : p.furnishingStatus
          ? p.furnishingStatus
          : 'Unfurnished',
    },
    {
      key: 'floor',
      label: t('compare.specs.floor', 'Floor'),
      getValue: (p) =>
        p.floor !== undefined
          ? `${p.floor}${p.totalFloors ? ` of ${p.totalFloors}` : ''}`
          : 'N/A',
    },
    {
      key: 'parking',
      label: t('compare.specs.parking', 'Parking'),
      getValue: (p) => (p.parking ? `${p.parking} Dedicated` : 'Street / Open'),
    },
    {
      key: 'facing',
      label: t('compare.specs.facing', 'Facing'),
      getValue: (p) => p.facing || 'East',
    },
    {
      key: 'amenities',
      label: t('compare.specs.amenities', 'Amenities'),
      getValue: (p) => (Array.isArray(p.amenities) && p.amenities.length > 0 ? p.amenities.join(', ') : 'Standard Essentials'),
    },
    {
      key: 'status',
      label: t('compare.specs.status', 'Status'),
      getValue: (p) => p.status.toUpperCase(),
    },
    {
      key: 'propertyId',
      label: t('compare.specs.propertyId', 'Property ID'),
      getValue: (p) => p.id,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Screen Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <AppIcon name="ArrowLeft" size="sm" color="primary" />
        </Pressable>
        <View style={styles.headerTitleWrap}>
          <AppText variant="h2" color="primary">
            {t('compare.title', 'Compare Properties')}
          </AppText>
          <AppText variant="caption" color="textSecondary">
            {compareCount} of 3 properties
          </AppText>
        </View>
        <Pressable
          style={styles.clearHeaderBtn}
          onPress={handleClearAll}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Clear comparison"
        >
          <AppText variant="caption" color="error" weight="700">
            {t('compare.clearAll', 'Clear All')}
          </AppText>
        </Pressable>
      </View>

      {/* Notice if only 1 property selected */}
      {compareCount === 1 ? (
        <View style={styles.singleNoticeBox}>
          <AppIcon name="Compass" size="xs" color="secondary" />
          <AppText variant="caption" color="textSecondary" style={styles.singleNoticeText}>
            {t('compare.minPropertiesNotice', 'Select at least 2 properties to compare specifications side-by-side.')}
          </AppText>
          <Pressable
            style={styles.addMorePill}
            onPress={() => router.push('/explore')}
            hitSlop={6}
          >
            <AppText variant="caption" color="secondaryDark" weight="700">
              + Add Property
            </AppText>
          </Pressable>
        </View>
      ) : null}

      {/* Main Scrollable Matrix */}
      <ScrollView
        style={styles.matrixScrollView}
        contentContainerStyle={styles.matrixContent}
        showsVerticalScrollIndicator={false}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScrollContent}
        >
          {compareProperties.map((prop, index) => {
            const coverUri = prop.images && prop.images.length > 0 ? prop.images[0] : null;

            return (
              <View
                key={prop.id}
                style={[
                  styles.propertyColumn,
                  { width: columnWidth },
                  index > 0 && styles.propertyColumnBorder,
                ]}
              >
                {/* Column Top Card */}
                <View style={styles.columnCardHeader}>
                  <View style={styles.imageWrap}>
                    {coverUri ? (
                      <Image source={{ uri: coverUri }} style={styles.propertyImage} resizeMode="cover" />
                    ) : (
                      <View style={styles.imageFallback}>
                        <AppIcon name="Building2" size="md" color="textSecondary" />
                      </View>
                    )}

                    {/* Remove Action Button */}
                    <Pressable
                      style={styles.removeColumnBtn}
                      onPress={() => removeFromCompare(prop.id)}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${prop.title} from compare`}
                    >
                      <AppIcon name="Trash2" size="xs" color="textInverse" />
                    </Pressable>

                    {/* Transaction Badge */}
                    <View style={styles.colTransactionBadge}>
                      <AppText variant="caption" color="textInverse" weight="700" style={styles.colTransactionText}>
                        {prop.transaction.toUpperCase()}
                      </AppText>
                    </View>
                  </View>

                  {/* Title & Price */}
                  <View style={styles.headerInfo}>
                    <AppText variant="h3" color="primary" numberOfLines={2} style={styles.colTitle}>
                      {prop.title}
                    </AppText>
                    <AppText variant="bodySmall" color="secondaryDark" weight="800" style={styles.colPrice}>
                      {prop.transaction === 'rent'
                        ? `${formatIndianCurrency(prop.price)} / mo`
                        : formatIndianCurrency(prop.price)}
                    </AppText>
                    <AppText variant="caption" color="textSecondary" numberOfLines={1}>
                      {prop.locality}, {prop.city}
                    </AppText>
                  </View>

                  {/* View Details Action */}
                  <AppButton
                    title={t('common.viewProperty', 'View Details')}
                    variant="outline"
                    size="sm"
                    onPress={() => handleOpenDetails(prop.id)}
                    style={styles.viewDetailsBtn}
                  />
                </View>

                {/* Specification Rows */}
                <View style={styles.specsTable}>
                  {specRows.map((row) => (
                    <View key={row.key} style={styles.specCell}>
                      <AppText variant="caption" color="textSecondary" weight="600" style={styles.specLabel}>
                        {row.label}
                      </AppText>
                      <AppText variant="bodySmall" color="textPrimary" weight="600" style={styles.specValue}>
                        {row.getValue(prop)}
                      </AppText>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    alignItems: 'center',
  },
  clearHeaderBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  headerRightPlaceholder: {
    width: 36,
  },
  singleNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.secondarySubtle,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGold,
  },
  singleNoticeText: {
    flex: 1,
    fontSize: 12,
  },
  addMorePill: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  matrixScrollView: {
    flex: 1,
  },
  matrixContent: {
    paddingBottom: spacing.xxl,
  },
  horizontalScrollContent: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.md,
  },
  propertyColumn: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    marginRight: spacing.md,
  },
  propertyColumnBorder: {
    // Styling for secondary and tertiary columns
  },
  columnCardHeader: {
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingBottom: spacing.sm,
  },
  imageWrap: {
    height: 120,
    borderRadius: radius.sm,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.primarySubtle,
    marginBottom: spacing.xs,
  },
  propertyImage: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeColumnBtn: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  colTransactionBadge: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  colTransactionText: {
    fontSize: 9,
  },
  headerInfo: {
    marginVertical: spacing.xs,
  },
  colTitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    marginBottom: 2,
    minHeight: 36,
  },
  colPrice: {
    fontSize: 15,
    marginBottom: 2,
  },
  viewDetailsBtn: {
    marginTop: spacing.xs,
    width: '100%',
  },
  specsTable: {
    gap: spacing.xs,
  },
  specCell: {
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  specLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  specValue: {
    fontSize: 12,
    lineHeight: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: layout.screenPaddingHorizontal,
  },
  emptyCard: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.secondarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    marginBottom: spacing.xs,
  },
  emptyDesc: {
    maxWidth: 280,
    marginBottom: spacing.lg,
    lineHeight: 18,
  },
  exploreBtn: {
    minWidth: 200,
  },
});
