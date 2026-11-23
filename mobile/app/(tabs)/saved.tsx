/**
 * Saved Properties Screen — app/(tabs)/saved.tsx
 * Displays customer's shortlisted favorites with persistent storage via Expo SecureStore,
 * 1-tap navigation to property details, removal confirmation, and empty state.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, FlatList, Pressable, StyleSheet, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  AppText,
  AppCard,
  AppButton,
  AppHeader,
  AppIcon,
  PropertyCard,
  FloatingCompareBar,
} from '../../src/components';
import { colors } from '../../src/theme/colors';
import { spacing, layout } from '../../src/theme/spacing';
import { radius } from '../../src/theme/radius';
import { SAMPLE_PROPERTIES } from '../../src/constants/sampleProperties';
import { useSavedProperties } from '../../src/hooks/useSavedProperties';
import { useTranslation } from '../../src/hooks/useTranslation';
import { propertyService } from '../../src/services';
import { PropertyItem } from '../../src/types/property';

export default function SavedScreen() {
  const router = useRouter();
  const { savedIds, removeProperty, isLoadingSaved } = useSavedProperties();
  const { t } = useTranslation();
  const [remoteProperties, setRemoteProperties] = useState<PropertyItem[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);

  // Load backend property catalog to resolve saved items
  useEffect(() => {
    let isMounted = true;
    async function loadProperties() {
      try {
        const items = await propertyService.fetchProperties();
        if (Array.isArray(items) && items.length > 0 && isMounted) {
          setRemoteProperties(items);
        }
      } catch {
        // Fallback to sample dataset
      } finally {
        if (isMounted) {
          setIsLoadingCatalog(false);
        }
      }
    }
    loadProperties();
    return () => {
      isMounted = false;
    };
  }, []);

  // Merge sample (development only) and remote properties without duplicates
  const allAvailableProperties = useMemo(() => {
    const map = new Map<string, PropertyItem>();
    if (__DEV__) {
      SAMPLE_PROPERTIES.forEach((p) => map.set(p.id, p));
    }
    remoteProperties.forEach((p) => map.set(p.id, p));
    return Array.from(map.values());
  }, [remoteProperties]);

  // Resolve saved properties from merged dataset
  const savedProperties: PropertyItem[] = allAvailableProperties.filter((item) =>
    savedIds.includes(item.id)
  );

  const handleRemove = useCallback(
    (id: string, title: string) => {
      Alert.alert(
        t('saved.removeAlertTitle', 'Remove Property'),
        t(
          'saved.removeAlertDesc',
          `Are you sure you want to remove "${title}" from your saved list?`
        ),
        [
          { text: t('common.cancel', 'Cancel'), style: 'cancel' },
          {
            text: t('common.remove', 'Remove'),
            style: 'destructive',
            onPress: async () => {
              await removeProperty(id);
            },
          },
        ]
      );
    },
    [removeProperty, t]
  );

  const renderHeader = () => (
    <View style={styles.headerBlock}>
      <View style={styles.badgeRow}>
        <View style={styles.badge}>
          <AppText variant="caption" color="secondaryDark" weight="700">
            {t('nav.saved', 'SAVED')} • {savedProperties.length} {savedProperties.length === 1 ? 'PROPERTY' : 'PROPERTIES'}
          </AppText>
        </View>
      </View>
      <AppText variant="h1" color="primary">
        {t('saved.title', 'Saved Properties')}
      </AppText>
      <AppText variant="body" color="textSecondary">
        {t(
          'saved.subtitle',
          'Review your shortlisted properties, compare specifications, and request escorted visits.'
        )}
      </AppText>
    </View>
  );

  const isInitialLoading = isLoadingSaved || (isLoadingCatalog && savedIds.length > 0);

  const renderEmptyState = () => {
    if (isInitialLoading) {
      return (
        <View style={styles.skeletonContainer}>
          {[1, 2, 3].map((key) => (
            <View key={key} style={styles.skeletonCard}>
              <View style={styles.skeletonImage} />
              <View style={styles.skeletonBody}>
                <View style={styles.skeletonLineShort} />
                <View style={styles.skeletonLineTitle} />
                <View style={styles.skeletonLineRow} />
              </View>
            </View>
          ))}
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <AppCard variant="default" style={styles.emptyCard}>
          <View style={styles.emptyIconCircle}>
            <AppIcon name="Heart" size="lg" color="secondary" />
          </View>
          <AppText variant="h2" color="primary" align="center" style={styles.emptyTitle}>
            {t('saved.emptyTitle', 'No Saved Properties Yet')}
          </AppText>
          <AppText
            variant="bodySmall"
            color="textSecondary"
            align="center"
            style={styles.emptyDesc}
          >
            {t(
              'saved.emptyDesc',
              'Tap the heart icon on any property in Home or Explore to save it here for quick access and price updates.'
            )}
          </AppText>
          <AppButton
            title={t('saved.exploreBtn', 'Explore Properties')}
            variant="primary"
            size="md"
            leftIcon={<AppIcon name="Search" size="sm" color="textInverse" />}
            onPress={() => router.push('/explore')}
            style={styles.exploreBtn}
          />
        </AppCard>
      </View>
    );
  };

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
            accessibilityLabel={`Remove ${item.title} from saved list`}
          >
            <AppIcon name="Trash2" size="sm" color="error" />
            <AppText variant="caption" color="error" weight="600" style={styles.removeText}>
              {t('common.remove', 'Remove from Shortlist')}
            </AppText>
          </Pressable>
        </View>
      </View>
    ),
    [handleRemove, router, t]
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <AppHeader
        title={t('saved.title', 'Saved Properties')}
        subtitle={t('saved.subtitle', 'Your Shortlisted Favorites')}
      />

      <FlatList
        data={savedProperties}
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

      <FloatingCompareBar bottomOffset={16} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
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
  skeletonContainer: {
    paddingTop: spacing.sm,
  },
  skeletonCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  skeletonImage: {
    height: 135,
    backgroundColor: colors.surfaceMuted,
  },
  skeletonBody: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  skeletonLineShort: {
    width: '35%',
    height: 16,
    borderRadius: radius.xs,
    backgroundColor: colors.surfaceMuted,
  },
  skeletonLineTitle: {
    width: '75%',
    height: 18,
    borderRadius: radius.xs,
    backgroundColor: colors.surfaceMuted,
  },
  skeletonLineRow: {
    width: '50%',
    height: 14,
    borderRadius: radius.xs,
    backgroundColor: colors.surfaceMuted,
  },
});
