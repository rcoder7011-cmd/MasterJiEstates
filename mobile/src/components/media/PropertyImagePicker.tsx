/**
 * PropertyImagePicker Component — src/components/media/PropertyImagePicker.tsx
 * Allows Admin/Staff to select, preview, reorder cover, and remove property photos.
 * Enforces maximum 15 images and supported formats (JPG, PNG, WebP).
 */

import React, { useState } from 'react';
import {
  View,
  Image,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { AppText } from '../ui/AppText';
import { AppIcon } from '../ui/AppIcon';
import { AppButton } from '../ui/AppButton';
import { MediaAsset } from '../../types/media';
import { MAX_IMAGE_COUNT, formatFileSize } from '../../utils/mediaValidation';
import { pickImagesFromGallery } from '../../services/mediaService';

export interface PropertyImagePickerProps {
  images: MediaAsset[];
  onImagesChange: (images: MediaAsset[]) => void;
  disabled?: boolean;
}

export const PropertyImagePicker: React.FC<PropertyImagePickerProps> = ({
  images,
  onImagesChange,
  disabled = false,
}) => {
  const [isPicking, setIsPicking] = useState(false);

  const canAddMore = images.length < MAX_IMAGE_COUNT && !disabled;

  const handlePickImages = async () => {
    if (!canAddMore || isPicking) return;

    setIsPicking(true);
    try {
      const result = await pickImagesFromGallery({
        currentCount: images.length,
        maxCount: MAX_IMAGE_COUNT,
      });

      if (result.error) {
        Alert.alert('Notice', result.error);
      }

      if (result.assets.length > 0) {
        // If no cover image yet, designate first asset as cover
        const hasCover = images.some((img) => img.isCover);
        const newBatch = result.assets.map((asset, index) => ({
          ...asset,
          isCover: !hasCover && index === 0,
        }));

        onImagesChange([...images, ...newBatch]);
      }
    } catch {
      Alert.alert('Error', 'Unable to load photo picker.');
    } finally {
      setIsPicking(false);
    }
  };

  const handleSetCover = (targetId: string) => {
    if (disabled) return;
    const target = images.find((img) => img.id === targetId);
    if (!target) return;

    // Move cover item to the first index and update isCover flags
    const otherImages = images.filter((img) => img.id !== targetId);
    const updated: MediaAsset[] = [
      { ...target, isCover: true },
      ...otherImages.map((img) => ({ ...img, isCover: false })),
    ];
    onImagesChange(updated);
  };

  const handleRemoveImage = (targetId: string) => {
    if (disabled) return;

    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove this photo from the listing?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const filtered = images.filter((img) => img.id !== targetId);
            // If the removed image was the cover, promote the new first image to cover
            if (filtered.length > 0 && !filtered.some((img) => img.isCover)) {
              filtered[0] = { ...filtered[0], isCover: true };
            }
            onImagesChange(filtered);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with counter and Add button */}
      <View style={styles.headerRow}>
        <View style={styles.titleWrapper}>
          <AppText variant="h3" color="primary">
            Property Photos
          </AppText>
          <View
            style={[
              styles.countChip,
              images.length >= MAX_IMAGE_COUNT && styles.countChipMax,
            ]}
          >
            <AppText
              variant="caption"
              weight="700"
              color={images.length >= MAX_IMAGE_COUNT ? 'secondary' : 'textSecondary'}
            >
              {images.length} / {MAX_IMAGE_COUNT}
            </AppText>
          </View>
        </View>

        {canAddMore && (
          <AppButton
            title="Add Photos"
            variant="outline"
            size="sm"
            leftIcon={
              isPicking ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <AppIcon name="Plus" size="xs" color="primary" />
              )
            }
            onPress={handlePickImages}
            disabled={isPicking || disabled}
          />
        )}
      </View>

      {/* Empty State */}
      {images.length === 0 ? (
        <Pressable
          style={styles.emptyContainer}
          onPress={handlePickImages}
          disabled={isPicking || disabled}
        >
          <View style={styles.emptyIconCircle}>
            <AppIcon name="Camera" size="md" color="secondary" />
          </View>
          <AppText variant="bodySmall" weight="600" color="primary" style={styles.emptyTitle}>
            No Photos Selected
          </AppText>
          <AppText variant="caption" color="textSecondary" align="center" style={styles.emptySubtitle}>
            Attach up to {MAX_IMAGE_COUNT} photos (JPG, PNG, WebP). The first image will be set as the listing cover.
          </AppText>
          <View style={styles.emptySelectBtn}>
            <AppIcon name="Upload" size="xs" color="textOnGold" />
            <AppText variant="bodySmall" weight="700" color="textOnGold" style={styles.emptySelectText}>
              Select From Gallery
            </AppText>
          </View>
        </Pressable>
      ) : (
        /* Thumbnails Grid */
        <View style={styles.gridContainer}>
          {images.map((item, index) => {
            const isCover = item.isCover || index === 0;

            return (
              <View
                key={item.id}
                style={[styles.thumbnailCard, isCover && styles.thumbnailCardCover]}
              >
                <Image
                  source={{ uri: item.uri }}
                  style={styles.thumbnailImage}
                  resizeMode="cover"
                />

                {/* Cover Badge */}
                {isCover ? (
                  <View style={styles.coverBadge}>
                    <AppIcon name="Star" size="xs" color="textOnGold" />
                    <AppText
                      variant="caption"
                      weight="700"
                      color="textOnGold"
                      style={styles.coverBadgeText}
                    >
                      COVER
                    </AppText>
                  </View>
                ) : (
                  /* Set Cover Action */
                  <Pressable
                    style={styles.setCoverBtn}
                    onPress={() => handleSetCover(item.id)}
                    disabled={disabled}
                    hitSlop={4}
                  >
                    <AppText variant="caption" weight="600" color="textInverse">
                      Set Cover
                    </AppText>
                  </Pressable>
                )}

                {/* Remove Button */}
                <Pressable
                  style={styles.removeBtn}
                  onPress={() => handleRemoveImage(item.id)}
                  disabled={disabled}
                  hitSlop={6}
                >
                  <AppIcon name="Trash2" size="xs" color="textInverse" />
                </Pressable>

                {/* Size / Remote badge */}
                <View style={styles.metaRow}>
                  {item.isRemote ? (
                    <View style={styles.remoteChip}>
                      <AppText variant="caption" weight="600" color="textSecondary">
                        Saved
                      </AppText>
                    </View>
                  ) : item.size ? (
                    <View style={styles.sizeChip}>
                      <AppText variant="caption" color="textInverse">
                        {formatFileSize(item.size)}
                      </AppText>
                    </View>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Helper text */}
      <View style={styles.helperRow}>
        <AppIcon name="Info" size="xs" color="textSecondary" />
        <AppText variant="caption" color="textSecondary" style={styles.helperText}>
          Supported formats: JPG, PNG, WebP. Maximum {MAX_IMAGE_COUNT} images. Tap &quot;Set Cover&quot; on any photo to make it the primary card image.
        </AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  countChip: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  countChipMax: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.secondary,
  },
  emptyContainer: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.borderGold,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  emptyTitle: {
    marginBottom: spacing.xxs,
  },
  emptySubtitle: {
    lineHeight: 18,
    maxWidth: 280,
    marginBottom: spacing.md,
  },
  emptySelectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  emptySelectText: {
    letterSpacing: 0.3,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  thumbnailCard: {
    width: '31.5%',
    aspectRatio: 1,
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: colors.backgroundSecondary,
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumbnailCardCover: {
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  coverBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.secondary,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  coverBadgeText: {
    fontSize: 9,
    letterSpacing: 0.5,
  },
  setCoverBtn: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(217, 83, 79, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaRow: {
    position: 'absolute',
    bottom: 4,
    right: 4,
  },
  sizeChip: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: radius.xs,
  },
  remoteChip: {
    backgroundColor: colors.background,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: radius.xs,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  helperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  helperText: {
    flex: 1,
    lineHeight: 16,
  },
});

