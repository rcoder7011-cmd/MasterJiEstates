import React, { memo, useState } from 'react';
import { View, Pressable, Image, StyleSheet, Alert, GestureResponderEvent } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { AppText } from '../ui/AppText';
import { AppIcon } from '../ui/AppIcon';
import { PropertyPreviewItem } from '../../constants/propertyCategories';
import { PropertyItem } from '../../types/property';
import { formatIndianCurrency } from '../../utils/formatting';
import { useSavedProperties } from '../../hooks/useSavedProperties';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';

export type AnyPropertyItem = PropertyItem | PropertyPreviewItem;

export interface PropertyPreviewCardProps {
  property: AnyPropertyItem;
  layout?: 'carousel' | 'vertical';
  onPress?: () => void;
}

const PropertyPreviewCardComponent: React.FC<PropertyPreviewCardProps> = ({
  property,
  layout = 'carousel',
  onPress,
}) => {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  const { isSaved: checkIsSaved, toggleSave } = useSavedProperties();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

  const isSaved = checkIsSaved(property.id);

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

  const isCarousel = layout === 'carousel';

  // Resolve location string
  const locationDisplay =
    'location' in property && typeof property.location === 'string'
      ? property.location
      : 'locality' in property && property.locality
      ? `${property.locality}, ${property.city || 'Delhi NCR'}`
      : 'address' in property && property.address
      ? property.address
      : 'Delhi NCR';

  // Resolve category label
  const categoryLabel =
    'category' in property && typeof property.category === 'string'
      ? property.category.toUpperCase()
      : 'propertyType' in property && property.propertyType
      ? property.propertyType.toUpperCase()
      : 'RESIDENTIAL';

  // Resolve BHK
  const bhkDisplay =
    'bhk' in property && property.bhk
      ? property.bhk
      : 'bedrooms' in property && property.bedrooms
      ? property.bedrooms
      : undefined;

  // Resolve Area
  const areaDisplay = property.area || '1,850 sq ft';

  // Resolve Image
  const resolvedImageUri =
    ('imageUrl' in property && typeof (property as any).imageUrl === 'string' && (property as any).imageUrl) ||
    ('images' in property && Array.isArray((property as any).images) && (property as any).images.length > 0 && (property as any).images[0]) ||
    null;

  return (
    <Pressable
      onPress={handlePress}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${property.title}, ${locationDisplay}, ${formatIndianCurrency(property.price)}`}
      style={({ pressed }) => [
        styles.cardContainer,
        isCarousel ? styles.carouselCard : styles.verticalCard,
        pressed ? styles.cardPressed : null,
      ]}
    >
      {/* Visual Image Header */}
      <View style={styles.imageContainer}>
        {resolvedImageUri && !imageError ? (
          <Image
            source={{ uri: resolvedImageUri }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={styles.imageFallback}>
            <View style={styles.centerIconWrap}>
              <AppIcon name="Building2" size="lg" color="primaryLight" />
            </View>
          </View>
        )}

        {/* Category Pill Tag */}
        <View style={styles.categoryPill}>
          <AppText variant="caption" color="textInverse" weight="700" style={styles.categoryPillText}>
            {categoryLabel}
          </AppText>
        </View>

        {/* Top-Right: Quick Save & Sample Badge */}
        <View style={styles.topRightCol}>
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

          {/* Sample Data Indicator strictly for demo inventory isolation */}
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
        {/* Price Tag */}
        <AppText variant="h2" color="primary" style={styles.price}>
          {formatIndianCurrency(property.price)}
        </AppText>

        {/* Property Title */}
        <AppText variant="h3" color="textPrimary" numberOfLines={1} style={styles.title}>
          {property.title}
        </AppText>

        {/* Location Row */}
        <View style={styles.locationRow}>
          <AppIcon name="MapPin" size="xs" color="secondary" />
          <AppText variant="bodySmall" color="textSecondary" numberOfLines={1} style={styles.locationText}>
            {locationDisplay}
          </AppText>
        </View>

        {/* Specs Badges Row */}
        <View style={styles.specsRow}>
          {bhkDisplay ? (
            <View style={styles.specBadge}>
              <AppIcon name="Bed" size="xs" color="textSecondary" />
              <AppText variant="caption" color="textSecondary" style={styles.specText}>
                {bhkDisplay}
              </AppText>
            </View>
          ) : null}

          <View style={styles.specBadge}>
            <AppIcon name="Maximize2" size="xs" color="textSecondary" />
            <AppText variant="caption" color="textSecondary" style={styles.specText}>
              {areaDisplay}
            </AppText>
          </View>
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
  },
  carouselCard: {
    width: 260,
  },
  verticalCard: {
    width: '100%',
    marginBottom: spacing.md,
  },
  cardPressed: {
    backgroundColor: colors.surfaceMuted,
    transform: [{ scale: 0.99 }],
  },
  imageContainer: {
    height: 140,
    backgroundColor: colors.primarySubtle,
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySubtle,
  },
  centerIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryPill: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: 'rgba(20, 43, 79, 0.88)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.xs,
  },
  categoryPillText: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
  topRightCol: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    alignItems: 'flex-end',
    gap: 4,
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
  price: {
    fontSize: 18,
    lineHeight: 24,
    color: colors.primary,
    fontWeight: '800',
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
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
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  specBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  specText: {
    fontSize: 11,
  },
});

export const PropertyPreviewCard = memo(PropertyPreviewCardComponent);
