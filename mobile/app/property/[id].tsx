/**
 * Property Details Screen — Dynamic Route: app/property/[id].tsx
 * Implements full property inspection, swipeable image gallery with full-screen zoom,
 * HD video walkthrough player, conditional architectural specifications,
 * native share, favorite toggle, and fixed bottom consultation bar.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  Share,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AppText,
  AppIcon,
  AppButton,
  AppDivider,
  PropertyImageGallery,
  PropertyVideoPlayer,
  PropertyPriceSection,
  PropertySpecifications,
  PropertyLocation,
  PropertyDescription,
  PropertyAmenities,
  PropertyContactBar,
  PropertyDetailSkeleton,
  TrustIndicators,
  ReportPropertyModal,
} from '../../src/components';
import { colors } from '../../src/theme/colors';
import { spacing, layout } from '../../src/theme/spacing';
import { radius } from '../../src/theme/radius';
import { SAMPLE_PROPERTIES } from '../../src/constants/sampleProperties';
import { useSavedProperties } from '../../src/hooks/useSavedProperties';
import { useAuth } from '../../src/hooks/useAuth';
import { useCompare } from '../../src/hooks/useCompare';
import { useRecentlyViewed } from '../../src/hooks/useRecentlyViewed';
import { useTranslation } from '../../src/hooks/useTranslation';
import { propertyService, analyticsService } from '../../src/services';
import { PropertyItem } from '../../src/types/property';
import { formatIndianCurrency } from '../../src/utils/formatting';

export default function PropertyDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();

  // Resolve property item with sample fallback & asynchronous remote fetch
  const [property, setProperty] = useState<PropertyItem | null>(() => {
    return SAMPLE_PROPERTIES.find((item) => item.id === id) || null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(!property);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function loadRemoteProperty() {
      if (!id) return;
      try {
        const item = await propertyService.fetchPropertyById(id);
        if (item && isMounted) {
          setProperty(item);
        } else if (!property && isMounted) {
          setHasError(true);
        }
      } catch {
        if (!property && isMounted) {
          setHasError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadRemoteProperty();

    return () => {
      isMounted = false;
    };
  }, [id, property]);

  const handleRetry = async () => {
    if (!id) return;
    setIsLoading(true);
    setHasError(false);
    try {
      const item = await propertyService.fetchPropertyById(id);
      if (item) {
        setProperty(item);
      } else {
        setHasError(true);
      }
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Global Saved, Auth, Compare, and Recently Viewed Integrations
  const { isSaved: checkIsSaved, toggleSave } = useSavedProperties();
  const { isAuthenticated } = useAuth();
  const { isInCompare, toggleCompare } = useCompare();
  const { recordView } = useRecentlyViewed();

  const isSaved = property ? checkIsSaved(property.id) : false;
  const inCompare = property ? isInCompare(property.id) : false;
  const [reportModalVisible, setReportModalVisible] = useState<boolean>(false);

  // Handle Report Press with guest prompt
  const handleReportPress = () => {
    if (!isAuthenticated) {
      Alert.alert(
        t('moderation.loginRequiredTitle', 'Login Required'),
        t('moderation.loginRequiredDesc', 'Please sign in or create an account to report a listing.'),
        [
          { text: t('common.cancel', 'Cancel'), style: 'cancel' },
          {
            text: t('auth.signIn', 'Sign In'),
            onPress: () => router.push('/auth/login'),
          },
        ]
      );
      return;
    }
    setReportModalVisible(true);
  };

  // Record property view in recently viewed history and privacy-conscious analytics
  useEffect(() => {
    if (property) {
      recordView(property);
      analyticsService.trackPropertyViewed({
        propertyId: property.id,
        category: property.propertyType,
        transaction: property.transaction,
        city: property.city,
        price: property.price,
      });
    }
  }, [property, recordView]);

  // Native Share Handler
  const handleShare = async () => {
    if (!property) return;
    try {
      const isRental = property.transaction === 'rent';
      const formattedPrice = isRental
        ? `${formatIndianCurrency(property.price)} / month`
        : formatIndianCurrency(property.price);
      
      const shareUrl = `https://www.masterjiestates.in/properties/${property.id}`;
      const message = `*${property.title}*\n📍 ${property.locality}, ${property.city}\n💰 Price: ${formattedPrice}\n🆔 Property ID: ${property.id}\n\nExplore this verified listing on MasterJi Estates:\n${shareUrl}`;

      await Share.share({
        title: property.title,
        message,
        url: shareUrl,
      });
    } catch {
      // User cancelled or share dismissed
    }
  };

  const handleToggleSave = async () => {
    if (!property) return;
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

    const nextSaved = await toggleSave(property.id);
    Alert.alert(
      nextSaved
        ? t('propertyDetails.savedAlertTitle', 'Saved to Favorites')
        : t('propertyDetails.removedAlertTitle', 'Removed from Favorites'),
      nextSaved
        ? `"${property.title}" ${t('propertyDetails.savedAlertDesc', 'has been added to your saved list for quick access.')}`
        : `"${property.title}" ${t('propertyDetails.removedAlertDesc', 'has been removed from your saved list.')}`,
      [{ text: t('common.close', 'OK') }]
    );
  };

  const handleToggleCompare = () => {
    if (!property) return;
    const res = toggleCompare(property);
    if (!res.success && res.reason === 'max_limit') {
      Alert.alert(
        t('compare.maxLimitReachedTitle', 'Comparison Limit Reached'),
        t('compare.maxLimitReachedDesc', 'You can compare up to 3 properties at a time. Remove one to add another.'),
        [{ text: t('common.close', 'OK') }]
      );
    } else if (res.success && res.action === 'added') {
      Alert.alert(
        t('compare.addedToCompare', 'Added to Compare'),
        `"${property.title}" has been added to your comparison list.`,
        [
          { text: t('common.close', 'OK') },
          {
            text: t('compare.compareNow', 'Compare Now'),
            onPress: () => router.push('/property/compare'),
          },
        ]
      );
    }
  };

  // 1. Loading State
  if (isLoading && !property) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <PropertyDetailSkeleton />
      </SafeAreaView>
    );
  }

  // 2. Invalid / Not Found State
  if (!property) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFoundContainer}>
          <View style={styles.notFoundIconCircle}>
            <AppIcon name="AlertTriangle" size="xl" color="warning" />
          </View>
          <AppText variant="h2" color="primary" align="center" style={styles.notFoundTitle}>
            {t('propertyDetails.notFoundTitle', 'Property Not Found')}
          </AppText>
          <AppText variant="body" color="textSecondary" align="center" style={styles.notFoundDesc}>
            {hasError
              ? t('common.error', 'Unable to load property details at this time. Please check your connection.')
              : t('propertyDetails.notFoundDesc', `The property listing with ID "${id || 'N/A'}" could not be located in our catalog.`)}
          </AppText>

          {hasError ? (
            <AppButton
              title={t('propertyDetails.retry', 'Retry Loading')}
              variant="outline"
              leftIcon={<AppIcon name="RotateCcw" size="sm" color="primary" />}
              onPress={handleRetry}
              style={styles.retryButton}
            />
          ) : null}

          <AppButton
            title={t('propertyDetails.browseAll', 'Browse All Properties')}
            variant="primary"
            leftIcon={<AppIcon name="Search" size="sm" color="textInverse" />}
            onPress={() => router.replace('/explore')}
            style={styles.notFoundButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Navigation Bar */}
      <View style={styles.navBar}>
        {/* Back Button */}
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          accessible
          accessibilityRole="button"
          accessibilityLabel={t('propertyDetails.back', 'Go back to previous screen')}
          style={styles.iconCircleBtn}
        >
          <AppIcon name="ArrowLeft" size="sm" color="primary" />
        </Pressable>

        {/* Center Title / Subtype */}
        <View style={styles.navCenter}>
          <AppText variant="h3" color="primary" numberOfLines={1}>
            {property.subType}
          </AppText>
          <AppText variant="caption" color="textSecondary" numberOfLines={1}>
            {property.locality}
          </AppText>
        </View>

        {/* Right Action Buttons (Compare, Share & Favorite) */}
        <View style={styles.navRightRow}>
          {/* Compare Toggle */}
          <Pressable
            onPress={handleToggleCompare}
            hitSlop={10}
            accessible
            accessibilityRole="checkbox"
            accessibilityState={{ checked: inCompare }}
            accessibilityLabel={
              inCompare
                ? t('compare.removeFromCompare', 'Remove from compare')
                : t('compare.addToCompare', 'Add to compare')
            }
            style={[styles.iconCircleBtn, inCompare ? styles.compareActiveBtn : null]}
          >
            <AppIcon
              name="Compass"
              size="sm"
              color={inCompare ? 'secondaryDark' : 'primary'}
            />
          </Pressable>

          {/* Native Share */}
          <Pressable
            onPress={handleShare}
            hitSlop={10}
            accessible
            accessibilityRole="button"
            accessibilityLabel={t('propertyDetails.share', 'Share property details')}
            style={styles.iconCircleBtn}
          >
            <AppIcon name="Share2" size="sm" color="primary" />
          </Pressable>

          {/* Favorite Toggle */}
          <Pressable
            onPress={handleToggleSave}
            hitSlop={10}
            accessible
            accessibilityRole="button"
            accessibilityLabel={
              isSaved
                ? t('propertyDetails.saved', 'Saved in favorites')
                : t('propertyDetails.save', 'Save property to favorites')
            }
            style={[styles.iconCircleBtn, isSaved ? styles.savedBtn : null]}
          >
            <AppIcon
              name="Heart"
              size="sm"
              color={isSaved ? 'error' : 'primary'}
            />
          </Pressable>
        </View>
      </View>

      {/* Main Scrollable Property Details Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Swipeable Image Gallery with Zoom Trigger */}
        <PropertyImageGallery
          images={property.images}
          propertyTitle={property.title}
          category={property.propertyType}
        />

        {/* Body Container */}
        <View style={styles.body}>
          {/* 2. Basic Information, Price, Location, Property ID & Quick Highlights */}
          <PropertyPriceSection property={property} />

          <AppDivider spacing="sm" />

          {/* 3. Property Overview & Specifications (Context-Aware) */}
          <PropertySpecifications property={property} />

          {/* 4. Video Walkthrough Player (Renders only if video exists) */}
          <PropertyVideoPlayer
            videoUrl={property.videoUrl}
            title={t('propertyDetails.walkthroughTitle', 'HD Property Walkthrough')}
          />

          <AppDivider spacing="sm" />

          {/* 5. Complete Description with Read More / Read Less */}
          <PropertyDescription description={property.description} />

          <AppDivider spacing="sm" />

          {/* 6. Verified Amenities & Features */}
          <PropertyAmenities amenities={property.amenities} />

          <AppDivider spacing="sm" />

          {/* 7. Location & Neighborhood with Interactive Map */}
          <PropertyLocation
            locality={property.locality}
            city={property.city}
            address={property.address}
            latitude={property.latitude}
            longitude={property.longitude}
            formattedAddress={property.formattedAddress}
            title={property.title}
          />

          {/* Trust Indicators, Badges & Grounded Trust Disclosures */}
          <TrustIndicators
            verification={property.verification}
            listingStatus={property.status}
            onReportPress={handleReportPress}
          />
        </View>
      </ScrollView>

      {/* 8. Fixed Bottom Contact Bar */}
      <PropertyContactBar property={property} />

      {/* Report Listing Modal */}
      {property && (
        <ReportPropertyModal
          visible={reportModalVisible}
          onClose={() => setReportModalVisible(false)}
          propertyId={property.id}
          propertyTitle={property.title}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  iconCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedBtn: {
    backgroundColor: colors.errorSubtle,
  },
  compareActiveBtn: {
    backgroundColor: colors.secondarySubtle,
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  navCenter: {
    flex: 1,
    marginHorizontal: spacing.sm,
    alignItems: 'center',
  },
  navRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  scrollContent: {
    paddingBottom: spacing.lg,
  },
  body: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.xs,
  },
  trustNoteCard: {
    backgroundColor: colors.secondarySubtle,
    borderWidth: 1,
    borderColor: colors.borderGold,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.xs,
  },
  trustDesc: {
    lineHeight: 18,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  notFoundIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.warningSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  notFoundTitle: {
    marginBottom: spacing.xs,
  },
  notFoundDesc: {
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  notFoundButton: {
    minWidth: 220,
    marginTop: spacing.sm,
  },
  retryButton: {
    minWidth: 220,
    marginBottom: spacing.xs,
  },
});
