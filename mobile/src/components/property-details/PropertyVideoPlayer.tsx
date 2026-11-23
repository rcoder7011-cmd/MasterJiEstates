/**
 * PropertyVideoPlayer Component
 * High-performance video walkthrough player powered by expo-video.
 * Displays play/pause controls, mute toggling, video aspect ratio, and loading states.
 * Strictly returns null if property has no video available.
 */

import React, { useState, useRef } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { AppText } from '../ui/AppText';
import { AppIcon } from '../ui/AppIcon';

export interface PropertyVideoPlayerProps {
  videoUrl?: string;
  title?: string;
}

export const PropertyVideoPlayer: React.FC<PropertyVideoPlayerProps> = ({
  videoUrl,
  title = 'Property Video Walkthrough',
}) => {
  // STRICT RULE: Do not render video section when the property has no video
  if (!videoUrl || videoUrl.trim() === '') {
    return null;
  }

  return <PropertyVideoPlayerInner videoUrl={videoUrl} title={title} />;
};

const PropertyVideoPlayerInner: React.FC<{ videoUrl: string; title: string }> = ({
  videoUrl,
  title,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const playerRef = useRef<any>(null);

  const player = useVideoPlayer(videoUrl, (p) => {
    p.loop = true;
    p.muted = false;
    playerRef.current = p;
  });

  const togglePlay = () => {
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
      setHasError(true);
    }
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    try {
      playerRef.current.muted = !playerRef.current.muted;
      setIsMuted(playerRef.current.muted);
    } catch {
      // safe fallback
    }
  };

  return (
    <View style={styles.container}>
      {/* Section Heading */}
      <View style={styles.headingRow}>
        <AppIcon name="Play" size="sm" color="primary" />
        <AppText variant="h3" color="primary" style={styles.headingText}>
          {title}
        </AppText>
      </View>

      {/* Video Container Box */}
      <View style={styles.videoBox}>
        {hasError ? (
          <View style={styles.errorBox}>
            <AppIcon name="AlertCircle" size="lg" color="error" />
            <AppText variant="caption" color="textSecondary" style={styles.errorText}>
              Video Walkthrough Currently Unavailable
            </AppText>
          </View>
        ) : (
          <>
            <VideoView
              player={player}
              style={styles.videoView}
              fullscreenOptions={{ enable: true }}
              allowsPictureInPicture
              nativeControls={false}
            />

            {/* Custom Overlay Controls */}
            <View style={styles.controlsOverlay}>
              {/* Play / Pause Center Button */}
              <Pressable
                onPress={togglePlay}
                accessible
                accessibilityRole="button"
                accessibilityLabel={isPlaying ? 'Pause video walkthrough' : 'Play video walkthrough'}
                style={({ pressed }) => [
                  styles.playButton,
                  pressed ? styles.btnPressed : null,
                ]}
              >
                <AppIcon
                  name={isPlaying ? 'Pause' : 'Play'}
                  size="md"
                  color="textInverse"
                />
              </Pressable>

              {/* Bottom Control Bar */}
              <View style={styles.bottomBar}>
                <View style={styles.videoBadge}>
                  <AppText variant="caption" color="textInverse" weight="700">
                    HD WALKTHROUGH
                  </AppText>
                </View>

                {/* Mute / Unmute Button */}
                <Pressable
                  onPress={toggleMute}
                  hitSlop={8}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel={isMuted ? 'Unmute video' : 'Mute video'}
                  style={styles.muteButton}
                >
                  <AppIcon
                    name={isMuted ? 'VolumeX' : 'Volume2'}
                    size="sm"
                    color="textInverse"
                  />
                </Pressable>
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  headingText: {
    marginLeft: spacing.xs,
  },
  videoBox: {
    width: '100%',
    height: 220,
    backgroundColor: '#0F172A',
    borderRadius: radius.lg,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.border,
  },
  videoView: {
    width: '100%',
    height: '100%',
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.85,
  },
  bottomBar: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  videoBadge: {
    backgroundColor: 'rgba(20, 43, 79, 0.85)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  muteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  errorText: {
    marginTop: spacing.xs,
    color: '#94A3B8',
  },
});
