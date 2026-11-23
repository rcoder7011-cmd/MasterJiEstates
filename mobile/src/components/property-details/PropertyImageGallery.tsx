/**
 * PropertyImageGallery Component
 * Horizontal image gallery with swipe pagination, image counter badge,
 * loading state, fallback placeholder, and full-screen viewer trigger.
 */

import React, { useState } from 'react';
import {
  View,
  Image,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { AppText } from '../ui/AppText';
import { AppIcon } from '../ui/AppIcon';
import { PropertyFullScreenViewer } from './PropertyFullScreenViewer';
import { useTranslation } from '../../hooks/useTranslation';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GALLERY_HEIGHT = 280;

export interface PropertyImageGalleryProps {
  images?: string[];
  propertyTitle: string;
  category: string;
}

export const PropertyImageGallery: React.FC<PropertyImageGalleryProps> = ({
  images,
  propertyTitle,
  category,
}) => {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);
  const [hasErrorMap, setHasErrorMap] = useState<Record<number, boolean>>({});
  const [loadingMap, setLoadingMap] = useState<Record<number, boolean>>({});

  const validImages = images && images.length > 0 ? images.filter((img) => typeof img === 'string' && img.trim() !== '') : [];
  const hasMultipleImages = validImages.length > 1;

  const handleImageError = (index: number) => {
    setHasErrorMap((prev) => ({ ...prev, [index]: true }));
    setLoadingMap((prev) => ({ ...prev, [index]: false }));
  };

  const handleImageLoad = (index: number) => {
    setLoadingMap((prev) => ({ ...prev, [index]: false }));
  };

  // If no images are available, render a clean branded placeholder
  if (validImages.length === 0) {
    return (
      <View style={styles.fallbackContainer}>
        <View style={styles.fallbackIconCircle}>
          <AppIcon name="Building2" size="xl" color="primaryLight" />
        </View>
        <AppText variant="h3" color="primary" align="center" style={styles.fallbackTitle}>
          {propertyTitle}
        </AppText>
        <AppText variant="caption" color="textSecondary" align="center">
          {category} • {t('propertyDetails.architecturePreview', 'Architecture Preview')}
        </AppText>
        <View style={styles.noPhotosBadge}>
          <AppIcon name="Image" size="xs" color="textSecondary" />
          <AppText variant="caption" color="textSecondary" weight="600">
            {t('propertyDetails.noPhotos', 'No Photos Available')}
          </AppText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Horizontal Swiping Gallery */}
      <FlatList
        data={validImages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          if (newIndex >= 0 && newIndex < validImages.length) {
            setActiveIndex(newIndex);
          }
        }}
        keyExtractor={(_, index) => `gallery-item-${index}`}
        renderItem={({ item, index }) => {
          const isError = hasErrorMap[index];
          const isLoading = loadingMap[index] ?? true;

          return (
            <Pressable
              onPress={() => setIsFullScreenOpen(true)}
              accessible
              accessibilityRole="button"
              accessibilityLabel={`View full screen image ${index + 1} of ${validImages.length}`}
              style={styles.slide}
            >
              {isError ? (
                <View style={styles.fallbackSlide}>
                  <AppIcon name="Building2" size="lg" color="primary" />
                  <AppText variant="caption" color="textSecondary" style={styles.errorText}>
                    Image Preview Unavailable
                  </AppText>
                </View>
              ) : (
                <>
                  <Image
                    source={{ uri: item }}
                    style={styles.image}
                    resizeMode="cover"
                    onLoad={() => handleImageLoad(index)}
                    onError={() => handleImageError(index)}
                  />
                  {isLoading ? (
                    <View style={styles.loaderWrap}>
                      <ActivityIndicator size="small" color={colors.primary} />
                    </View>
                  ) : null}
                </>
              )}
            </Pressable>
          );
        }}
      />

      {/* Floating Counter Badge (Top-Right) */}
      <View style={styles.counterBadge}>
        <AppIcon name="Camera" size="xs" color="textInverse" />
        <AppText variant="caption" color="textInverse" weight="700" style={styles.counterText}>
          {activeIndex + 1} / {validImages.length}
        </AppText>
      </View>

      {/* Floating Fullscreen Trigger Hint (Bottom-Right) */}
      <Pressable
        onPress={() => setIsFullScreenOpen(true)}
        accessible
        accessibilityRole="button"
        accessibilityLabel="Open full screen photos"
        style={styles.expandBadge}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <AppIcon name="Maximize2" size="xs" color="textInverse" />
      </Pressable>

      {/* Bottom Pagination Dots */}
      {hasMultipleImages ? (
        <View style={styles.paginationDots}>
          {validImages.map((_, dotIndex) => (
            <View
              key={`dot-${dotIndex}`}
              style={[
                styles.dot,
                dotIndex === activeIndex ? styles.activeDot : null,
              ]}
            />
          ))}
        </View>
      ) : null}

      {/* Full Screen Viewer Modal */}
      <PropertyFullScreenViewer
        visible={isFullScreenOpen}
        images={validImages}
        initialIndex={activeIndex}
        onClose={() => setIsFullScreenOpen(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    height: GALLERY_HEIGHT,
    backgroundColor: colors.primaryDark,
  },
  slide: {
    width: SCREEN_WIDTH,
    height: GALLERY_HEIGHT,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: GALLERY_HEIGHT,
  },
  loaderWrap: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySubtle,
  },
  fallbackSlide: {
    width: SCREEN_WIDTH,
    height: GALLERY_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  errorText: {
    marginTop: spacing.xs,
  },
  fallbackContainer: {
    height: 220,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  fallbackIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  fallbackTitle: {
    fontSize: 16,
    marginBottom: 2,
  },
  noPhotosBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.sm,
  },
  counterBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(12, 26, 48, 0.75)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  counterText: {
    fontSize: 11,
    letterSpacing: 0.5,
  },
  expandBadge: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: 'rgba(12, 26, 48, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  paginationDots: {
    position: 'absolute',
    bottom: spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  activeDot: {
    width: 18,
    backgroundColor: colors.secondary,
  },
});
