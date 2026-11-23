/**
 * PropertyVideoPicker Component — src/components/media/PropertyVideoPicker.tsx
 * Allows Admin/Staff to select, preview, replace, or remove a property video tour.
 * STRICT ENFORCEMENT: Exactly 0 or 1 video, MP4 format, size strictly less than 10 MB.
 */

import React, { useState } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { AppText } from '../ui/AppText';
import { AppIcon } from '../ui/AppIcon';
import { AppButton } from '../ui/AppButton';
import { MediaAsset } from '../../types/media';
import { formatFileSize, MAX_VIDEO_SIZE_BYTES } from '../../utils/mediaValidation';
import { pickVideoFromGallery } from '../../services/mediaService';

export interface PropertyVideoPickerProps {
  video: MediaAsset | null;
  onVideoChange: (video: MediaAsset | null) => void;
  disabled?: boolean;
}

export const PropertyVideoPicker: React.FC<PropertyVideoPickerProps> = ({
  video,
  onVideoChange,
  disabled = false,
}) => {
  const [isPicking, setIsPicking] = useState(false);

  const handlePickVideo = async () => {
    if (disabled || isPicking) return;

    setIsPicking(true);
    try {
      const result = await pickVideoFromGallery();

      if (result.error) {
        Alert.alert('Invalid Video', result.error);
        return;
      }

      if (result.asset) {
        onVideoChange(result.asset);
      }
    } catch {
      Alert.alert('Error', 'Unable to open video picker.');
    } finally {
      setIsPicking(false);
    }
  };

  const handleReplaceVideo = () => {
    if (disabled) return;

    Alert.alert(
      'Replace Video Walkthrough',
      'Selecting a new video will replace the current walkthrough. Do you want to continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Select New Video',
          onPress: handlePickVideo,
        },
      ]
    );
  };

  const handleRemoveVideo = () => {
    if (disabled) return;

    Alert.alert(
      'Remove Video',
      'Are you sure you want to remove the video tour from this listing?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => onVideoChange(null),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleWrapper}>
          <AppText variant="h3" color="primary">
            Video Tour
          </AppText>
          <View style={styles.optionalChip}>
            <AppText variant="caption" weight="600" color="textSecondary">
              Optional • 0/1
            </AppText>
          </View>
        </View>

        {video && !disabled && (
          <AppButton
            title="Replace"
            variant="outline"
            size="sm"
            leftIcon={<AppIcon name="RotateCcw" size="xs" color="primary" />}
            onPress={handleReplaceVideo}
            disabled={isPicking}
          />
        )}
      </View>

      {/* Empty State or Active Video View */}
      {!video ? (
        <Pressable
          style={styles.emptyContainer}
          onPress={handlePickVideo}
          disabled={isPicking || disabled}
        >
          <View style={styles.emptyIconCircle}>
            <AppIcon name="Video" size="md" color="secondary" />
          </View>
          <AppText variant="bodySmall" weight="600" color="primary" style={styles.emptyTitle}>
            No Video Walkthrough Attached
          </AppText>
          <AppText variant="caption" color="textSecondary" align="center" style={styles.emptySubtitle}>
            Attach an optional video walkthrough (MP4 format, strictly under 10 MB). Only 1 video per listing.
          </AppText>
          <View style={styles.emptySelectBtn}>
            {isPicking ? (
              <ActivityIndicator size="small" color={colors.textOnGold} />
            ) : (
              <AppIcon name="Upload" size="xs" color="textOnGold" />
            )}
            <AppText variant="bodySmall" weight="700" color="textOnGold" style={styles.emptySelectText}>
              {isPicking ? 'Accessing Library...' : 'Select MP4 Video'}
            </AppText>
          </View>
        </Pressable>
      ) : (
        /* Video Player Preview and Metadata */
        <View style={styles.videoCard}>
          <VideoPlayerPreview uri={video.uri} />

          {/* Metadata Bar */}
          <View style={styles.metaContainer}>
            <View style={styles.metaMain}>
              <View style={styles.fileNameRow}>
                <AppIcon name="Video" size="xs" color="primary" />
                <AppText
                  variant="bodySmall"
                  weight="600"
                  color="primary"
                  numberOfLines={1}
                  style={styles.fileNameText}
                >
                  {video.name || 'property_walkthrough.mp4'}
                </AppText>
              </View>

              <View style={styles.badgeRow}>
                {video.size ? (
                  <View style={styles.specBadge}>
                    <AppText variant="caption" color="textSecondary">
                      {formatFileSize(video.size)}
                    </AppText>
                  </View>
                ) : null}

                {video.duration ? (
                  <View style={styles.specBadge}>
                    <AppText variant="caption" color="textSecondary">
                      {video.duration}s duration
                    </AppText>
                  </View>
                ) : null}

                <View style={styles.verifiedBadge}>
                  <AppIcon name="CheckCircle" size="xs" color="success" />
                  <AppText variant="caption" weight="600" color="success">
                    {'< 10 MB Verified'}
                  </AppText>
                </View>
              </View>
            </View>

            {/* Remove Action */}
            <Pressable
              style={styles.deleteButton}
              onPress={handleRemoveVideo}
              disabled={disabled}
              hitSlop={8}
            >
              <AppIcon name="Trash2" size="sm" color="error" />
            </Pressable>
          </View>
        </View>
      )}

      {/* Helper Note */}
      <View style={styles.helperRow}>
        <AppIcon name="Info" size="xs" color="textSecondary" />
        <AppText variant="caption" color="textSecondary" style={styles.helperText}>
          Strict rule: video must be strictly less than 10 MB ({formatFileSize(MAX_VIDEO_SIZE_BYTES)} limit). Files equal to or larger than 10 MB are rejected.
        </AppText>
      </View>
    </View>
  );
};

/**
 * Isolated Video Player Component to safely integrate useVideoPlayer
 */
const VideoPlayerPreview: React.FC<{ uri: string }> = ({ uri }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.muted = false;
  });

  const togglePlayback = () => {
    if (!player) return;
    try {
      if (player.playing) {
        player.pause();
        setIsPlaying(false);
      } else {
        player.play();
        setIsPlaying(true);
      }
    } catch {
      // Fallback
    }
  };

  return (
    <View style={styles.playerContainer}>
      <VideoView
        style={styles.videoPlayer}
        player={player}
        fullscreenOptions={{ enable: true }}
        allowsPictureInPicture
        contentFit="contain"
      />
      <Pressable style={styles.playOverlay} onPress={togglePlayback}>
        <View style={styles.playButtonCircle}>
          <AppIcon
            name={isPlaying ? 'Pause' : 'Play'}
            size="sm"
            color="textInverse"
          />
        </View>
      </Pressable>
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
  optionalChip: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
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
    maxWidth: 290,
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
  videoCard: {
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  playerContainer: {
    width: '100%',
    height: 200,
    backgroundColor: colors.primary,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(11, 27, 60, 0.75)',
    borderWidth: 1,
    borderColor: colors.borderGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.sm,
    backgroundColor: colors.surface,
  },
  metaMain: {
    flex: 1,
    marginRight: spacing.sm,
  },
  fileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xxs,
  },
  fileNameText: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  specBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: radius.xs,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: radius.xs,
    backgroundColor: 'rgba(40, 167, 69, 0.1)',
  },
  deleteButton: {
    padding: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(217, 83, 79, 0.1)',
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

