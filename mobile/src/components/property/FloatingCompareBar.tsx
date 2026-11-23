/**
 * Floating Compare Bar Component — src/components/property/FloatingCompareBar.tsx
 * Sticky/floating tray at the bottom of the screen when properties are selected for comparison.
 * Shows selected count (e.g. "Compare (2/3)"), thumbnail chips, "Compare Now" button, and "Clear" button.
 */

import React from 'react';
import {
  View,
  Pressable,
  Image,
  StyleSheet,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { AppText } from '../ui/AppText';
import { AppIcon } from '../ui/AppIcon';
import { useCompare } from '../../hooks/useCompare';
import { useTranslation } from '../../hooks/useTranslation';

export interface FloatingCompareBarProps {
  bottomOffset?: number;
}

export const FloatingCompareBar: React.FC<FloatingCompareBarProps> = ({
  bottomOffset = 64,
}) => {
  const router = useRouter();
  const { compareProperties, compareCount, removeFromCompare, clearCompare } = useCompare();
  const { t } = useTranslation();

  if (compareCount === 0) {
    return null;
  }

  const handleCompareNow = () => {
    router.push('/property/compare');
  };

  return (
    <View
      style={[styles.floatingContainer, { bottom: bottomOffset }]}
      accessible
      accessibilityRole="toolbar"
      accessibilityLabel={`Property comparison bar. ${compareCount} of 3 properties selected.`}
    >
      <View style={styles.contentCard}>
        {/* Left Side: Thumbnail Chips & Count */}
        <View style={styles.leftSection}>
          <View style={styles.countBadge}>
            <AppIcon name="Compass" size="xs" color="textInverse" />
            <AppText variant="caption" color="textInverse" weight="700">
              {compareCount}/3
            </AppText>
          </View>

          <View style={styles.thumbnailsRow}>
            {compareProperties.map((prop) => {
              const coverUri = prop.images && prop.images.length > 0 ? prop.images[0] : null;
              return (
                <View key={prop.id} style={styles.thumbnailWrapper}>
                  {coverUri ? (
                    <Image
                      source={{ uri: coverUri }}
                      style={styles.thumbnail}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.thumbnailFallback}>
                      <AppIcon name="Building2" size="xs" color="textSecondary" />
                    </View>
                  )}
                  <Pressable
                    style={styles.removeChipBtn}
                    onPress={() => removeFromCompare(prop.id)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${prop.title} from comparison`}
                  >
                    <AppIcon name="X" size="xs" color="textInverse" />
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>

        {/* Right Side: Actions (Clear & Compare Now) */}
        <View style={styles.rightSection}>
          <Pressable
            style={styles.clearBtn}
            onPress={clearCompare}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Clear all comparison properties"
          >
            <AppText variant="caption" color="textSecondary" weight="600">
              {t('common.clear', 'Clear')}
            </AppText>
          </Pressable>

          <Pressable
            style={styles.compareBtn}
            onPress={handleCompareNow}
            accessibilityRole="button"
            accessibilityLabel="Open property comparison screen"
          >
            <AppText variant="caption" color="textInverse" weight="700" style={styles.compareBtnText}>
              {t('compare.compareNow', 'Compare Now')}
            </AppText>
            <AppIcon name="ArrowRight" size="xs" color="textInverse" />
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    zIndex: 9999,
  },
  contentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primaryDark,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.borderGold,
    ...Platform.select({
      ios: {
        shadowColor: colors.primaryDark,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.secondaryDark,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
  },
  thumbnailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  thumbnailWrapper: {
    position: 'relative',
    width: 34,
    height: 34,
  },
  thumbnail: {
    width: 34,
    height: 34,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  thumbnailFallback: {
    width: 34,
    height: 34,
    borderRadius: radius.xs,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  removeChipBtn: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  clearBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  compareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.sm,
  },
  compareBtnText: {
    letterSpacing: 0.3,
  },
});
