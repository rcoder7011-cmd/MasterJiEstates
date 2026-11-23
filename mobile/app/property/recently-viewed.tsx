/**
 * Recently Viewed Properties Screen — app/property/recently-viewed.tsx
 * Displays customer's recently explored property listings with instant navigation,
 * individual removal, and history clearing.
 */

import React, { useCallback } from 'react';
import {
  View,
  FlatList,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  AppText,
  AppCard,
  AppButton,
  AppIcon,
  PropertyCard,
} from '../../src/components';
import { colors } from '../../src/theme/colors';
import { spacing, layout } from '../../src/theme/spacing';
import { radius } from '../../src/theme/radius';
import { useRecentlyViewed } from '../../src/hooks/useRecentlyViewed';
import { useTranslation } from '../../src/hooks/useTranslation';
import { PropertyItem } from '../../src/types/property';

export default function RecentlyViewedScreen() {
  const router = useRouter();
  const { recentlyViewed, recentlyViewedCount, removeViewed, clearRecentlyViewed } = useRecentlyViewed();
  const { t } = useTranslation();

  const handleClearHistory = () => {
    Alert.alert(
      t('recentlyViewed.clearConfirmTitle', 'Clear History'),
      t('recentlyViewed.clearConfirmDesc', 'Are you sure you want to clear your recently viewed properties?'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('recentlyViewed.clearHistory', 'Clear History'),
          style: 'destructive',
          onPress: clearRecentlyViewed,
        },
      ]
    );
  };

  const handleRemove = useCallback(
    (id: string, title: string) => {
      Alert.alert(
        t('common.remove', 'Remove from History'),
        `Remove "${title}" from your recently viewed history?`,
        [
          { text: t('common.cancel', 'Cancel'), style: 'cancel' },
          {
            text: t('common.remove', 'Remove'),
            style: 'destructive',
            onPress: () => removeViewed(id),
          },
        ]
      );
    },
    [removeViewed, t]
  );

  const renderHeader = () => (
    <View style={styles.headerBlock}>
      <View style={styles.badgeRow}>
        <View style={styles.badge}>
          <AppText variant="caption" color="secondaryDark" weight="700">
            {t('recentlyViewed.title', 'RECENTLY VIEWED')} • {recentlyViewedCount} {recentlyViewedCount === 1 ? 'PROPERTY' : 'PROPERTIES'}
          </AppText>
        </View>
      </View>
      <AppText variant="h1" color="primary">
        {t('recentlyViewed.title', 'Recently Viewed')}
      </AppText>
      <AppText variant="body" color="textSecondary">
        {t(
          'recentlyViewed.subtitle',
          'Review properties you recently explored across Delhi NCR to compare or continue your enquiries.'
        )}
      </AppText>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <AppCard variant="default" style={styles.emptyCard}>
        <View style={styles.emptyIconCircle}>
          <AppIcon name="Compass" size="lg" color="secondary" />
        </View>
        <AppText variant="h2" color="primary" align="center" style={styles.emptyTitle}>
          {t('recentlyViewed.emptyTitle', 'No Recently Viewed Properties')}
        </AppText>
        <AppText
          variant="bodySmall"
          color="textSecondary"
          align="center"
          style={styles.emptyDesc}
        >
          {t(
            'recentlyViewed.emptyDesc',
            'Properties you browse will appear here so you can revisit them easily anytime.'
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
  );

  const renderItem = useCallback(
    ({ item }: { item: PropertyItem }) => (
      <View style={styles.itemWrapper}>
        <PropertyCard
          property={item}
          onPress={() =>
            router.push({
              pathname: '/property/[id]',
              params: { id: item.id },
            })
          }
        />
        <View style={styles.itemActionsBar}>
          <Pressable
            style={styles.removeAction}
            onPress={() => handleRemove(item.id, item.title)}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${item.title} from history`}
          >
            <AppIcon name="Trash2" size="sm" color="error" />
            <AppText variant="caption" color="error" weight="600" style={styles.removeText}>
              {t('common.remove', 'Remove from History')}
            </AppText>
          </Pressable>
        </View>
      </View>
    ),
    [handleRemove, router, t]
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Screen Top Bar */}
      <View style={styles.topBar}>
        <Pressable
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <AppIcon name="ArrowLeft" size="sm" color="primary" />
        </Pressable>
        <AppText variant="h3" color="primary">
          {t('recentlyViewed.title', 'Recently Viewed')}
        </AppText>
        {recentlyViewedCount > 0 ? (
          <Pressable
            style={styles.clearHeaderBtn}
            onPress={handleClearHistory}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Clear history"
          >
            <AppText variant="caption" color="error" weight="700">
              {t('recentlyViewed.clearHistory', 'Clear History')}
            </AppText>
          </Pressable>
        ) : (
          <View style={styles.topBarRightPlaceholder} />
        )}
      </View>

      <FlatList
        data={recentlyViewed}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews={Platform.OS === 'android'}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
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
  clearHeaderBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  topBarRightPlaceholder: {
    width: 36,
  },
  listContent: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.lg,
    flexGrow: 1,
  },
  headerBlock: {
    marginBottom: spacing.lg,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.xs,
    backgroundColor: colors.secondarySubtle,
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  itemWrapper: {
    marginBottom: spacing.lg,
  },
  itemActionsBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
  removeAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.errorSubtle,
  },
  removeText: {
    marginLeft: spacing.xxs,
  },
  emptyContainer: {
    marginTop: spacing.xl,
    alignItems: 'center',
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
