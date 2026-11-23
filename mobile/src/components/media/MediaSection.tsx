/**
 * MediaSection Component — src/components/media/MediaSection.tsx
 * Composite Administrative Card unifying image gallery selection, primary cover assignment,
 * and optional video walkthrough picker with strict size boundaries (< 10 MB).
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { spacing } from '../../theme/spacing';
import { AppCard } from '../ui/AppCard';
import { AppText } from '../ui/AppText';
import { AppIcon } from '../ui/AppIcon';
import { AppDivider } from '../ui/AppDivider';
import { MediaAsset } from '../../types/media';
import { PropertyImagePicker } from './PropertyImagePicker';
import { PropertyVideoPicker } from './PropertyVideoPicker';

export interface MediaSectionProps {
  images: MediaAsset[];
  onImagesChange: (images: MediaAsset[]) => void;
  video: MediaAsset | null;
  onVideoChange: (video: MediaAsset | null) => void;
  disabled?: boolean;
  error?: string;
  stepNumber?: number;
}

export const MediaSection: React.FC<MediaSectionProps> = ({
  images,
  onImagesChange,
  video,
  onVideoChange,
  disabled = false,
  error,
  stepNumber = 4,
}) => {
  return (
    <AppCard style={styles.card}>
      {/* Section Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <AppIcon name="Camera" size="sm" color="primary" />
          <AppText variant="h3" color="primary" style={styles.title}>
            {stepNumber}. Property Media &amp; Virtual Tour
          </AppText>
        </View>
        <AppText variant="caption" color="textSecondary" style={styles.subtitle}>
          Manage high-resolution listing photography and virtual walkthrough.
        </AppText>
      </View>

      <AppDivider spacing="sm" />

      {/* Global Error Banner if any */}
      {error ? (
        <View style={styles.errorBanner}>
          <AppIcon name="AlertCircle" size="xs" color="error" />
          <AppText variant="caption" color="error" style={styles.errorText}>
            {error}
          </AppText>
        </View>
      ) : null}

      {/* Part A: Property Photos Picker */}
      <PropertyImagePicker
        images={images}
        onImagesChange={onImagesChange}
        disabled={disabled}
      />

      <AppDivider spacing="md" color="borderGold" />

      {/* Part B: Property Video Picker */}
      <PropertyVideoPicker
        video={video}
        onVideoChange={onVideoChange}
        disabled={disabled}
      />
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
  },
  header: {
    marginBottom: spacing.xs,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    marginLeft: spacing.xxs,
  },
  subtitle: {
    marginTop: 2,
    lineHeight: 16,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.xs,
    backgroundColor: 'rgba(217, 83, 79, 0.1)',
    borderRadius: 4,
    marginBottom: spacing.sm,
  },
  errorText: {
    flex: 1,
    lineHeight: 16,
  },
});

