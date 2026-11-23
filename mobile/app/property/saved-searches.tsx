/**
 * Saved Searches Screen — mobile/app/property/saved-searches.tsx
 *
 * Displays authenticated user's saved search preferences, live matching property counts,
 * alert subscription toggles, search renaming, and 1-tap re-execution.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  AppText,
  AppCard,
  AppButton,
  AppInput,
  AppHeader,
  AppIcon,
  AppDivider,
} from '../../src/components';
import { colors } from '../../src/theme/colors';
import { spacing, layout } from '../../src/theme/spacing';
import { radius } from '../../src/theme/radius';
import { useAuth } from '../../src/hooks/useAuth';
import { useTranslation } from '../../src/hooks/useTranslation';
import {
  fetchSavedSearches,
  updateSavedSearch,
  deleteSavedSearch,
} from '../../src/services/savedSearchService';
import { SavedSearchItem } from '../../src/types/savedSearch';
import { formatIndianCurrency } from '../../src/utils/formatting';

export default function SavedSearchesScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

  const [savedSearches, setSavedSearches] = useState<SavedSearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Edit/Rename Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<SavedSearchItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editAlerts, setEditAlerts] = useState(true);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(async () => {
      if (!isAuthenticated) {
        if (isMounted) setIsLoading(false);
        return;
      }
      try {
        const result = await fetchSavedSearches();
        if (isMounted && result.success && result.data) {
          setSavedSearches(result.data);
        }
      } catch {
        // Ignore background load error
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const result = await fetchSavedSearches();
      if (result.success && result.data) {
        setSavedSearches(result.data);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRunSearch = (item: SavedSearchItem) => {
    const f = item.filters || {};
    router.push({
      pathname: '/(tabs)/explore',
      params: {
        transaction: f.transaction && f.transaction !== 'all' ? f.transaction : undefined,
        type: f.propertyType && f.propertyType !== 'all' ? f.propertyType : undefined,
        city: f.city && f.city !== 'all' ? f.city : undefined,
        q: f.searchQuery ? f.searchQuery : undefined,
      },
    });
  };

  const handleToggleAlerts = async (item: SavedSearchItem, value: boolean) => {
    // Optimistic UI update
    setSavedSearches((prev) =>
      prev.map((s) => (s.id === item.id ? { ...s, alertsEnabled: value } : s))
    );
    try {
      await updateSavedSearch(item.id, { alertsEnabled: value });
    } catch {
      // Revert if error
      handleRefresh();
    }
  };

  const handleOpenEdit = (item: SavedSearchItem) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditAlerts(item.alertsEnabled);
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editingItem || !editName.trim()) return;
    setIsSubmittingEdit(true);

    try {
      const result = await updateSavedSearch(editingItem.id, {
        name: editName.trim(),
        alertsEnabled: editAlerts,
      });

      if (result.success && result.data) {
        setSavedSearches((prev) =>
          prev.map((s) => (s.id === editingItem.id ? result.data! : s))
        );
        setEditModalVisible(false);
      } else {
        Alert.alert(t('common.error', 'Error'), result.error || 'Failed to update search.');
      }
    } catch (err: any) {
      Alert.alert(t('common.error', 'Error'), err.message || 'Error updating search.');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleDelete = (item: SavedSearchItem) => {
    Alert.alert(
      t('savedSearches.deleteTitle', 'Delete Saved Search'),
      t(
        'savedSearches.deleteConfirm',
        `Are you sure you want to delete "${item.name}"? You will no longer receive new property alerts for these criteria.`
      ),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('common.delete', 'Delete'),
          style: 'destructive',
          onPress: async () => {
            setSavedSearches((prev) => prev.filter((s) => s.id !== item.id));
            try {
              await deleteSavedSearch(item.id);
            } catch {
              handleRefresh();
            }
          },
        },
      ]
    );
  };

  // Guest State
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <AppHeader
          title={t('savedSearches.title', 'Saved Searches')}
          showBack
          onBackPress={() => router.back()}
        />
        <View style={styles.guestContainer}>
          <AppCard style={styles.guestCard}>
            <View style={styles.guestIconCircle}>
              <AppIcon name="Search" size="xl" color="secondary" />
            </View>
            <AppText variant="h2" color="primary" align="center" style={styles.guestTitle}>
              {t('savedSearches.signInTitle', 'Save Your Favorite Search Filters')}
            </AppText>
            <AppText variant="body" color="textSecondary" align="center" style={styles.guestDesc}>
              {t(
                'savedSearches.signInDesc',
                'Sign in to save your preferred locations, budget ranges, and property types to rerun them anytime and receive instant alerts.'
              )}
            </AppText>
            <AppButton
              title={t('auth.signIn', 'Sign In to Your Account')}
              variant="primary"
              size="md"
              leftIcon={<AppIcon name="User" size="sm" color="textInverse" />}
              onPress={() =>
                router.push({
                  pathname: '/auth/login',
                  params: { redirect: '/property/saved-searches' },
                })
              }
              style={styles.signInBtn}
            />
          </AppCard>
        </View>
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }: { item: SavedSearchItem }) => {
    const f = item.filters || {};
    const chips: string[] = [];

    if (f.transaction && f.transaction !== 'all') chips.push(f.transaction.toUpperCase());
    if (f.propertyType && f.propertyType !== 'all') chips.push(f.propertyType);
    if (f.city && f.city !== 'all') chips.push(f.city);
    if (f.locality && f.locality !== 'all') chips.push(f.locality);
    if (Array.isArray(f.bedrooms) && f.bedrooms.length > 0) {
      chips.push(f.bedrooms.join(', '));
    }
    if (f.minPrice || f.maxPrice) {
      const min = f.minPrice ? formatIndianCurrency(f.minPrice) : '₹0';
      const max = f.maxPrice ? formatIndianCurrency(f.maxPrice) : 'Any';
      chips.push(`${min} - ${max}`);
    }

    return (
      <AppCard variant="elevated" style={styles.searchCard}>
        <View style={styles.cardHeader}>
          <View style={styles.nameCol}>
            <AppText variant="h3" color="primary" numberOfLines={1}>
              {item.name}
            </AppText>
            <View style={styles.matchingBadge}>
              <AppIcon name="Building" size="xs" color="secondary" />
              <AppText variant="caption" color="secondaryDark" weight="700">
                {item.matchingCount} Matching {item.matchingCount === 1 ? 'Home' : 'Homes'}
              </AppText>
            </View>
          </View>

          <View style={styles.headerActions}>
            <Pressable
              hitSlop={8}
              onPress={() => handleOpenEdit(item)}
              style={styles.iconBtn}
              accessibilityRole="button"
              accessibilityLabel="Edit search"
            >
              <AppIcon name="SlidersHorizontal" size="xs" color="textSecondary" />
            </Pressable>
            <Pressable
              hitSlop={8}
              onPress={() => handleDelete(item)}
              style={styles.iconBtn}
              accessibilityRole="button"
              accessibilityLabel="Delete search"
            >
              <AppIcon name="Trash2" size="xs" color="error" />
            </Pressable>
          </View>
        </View>

        {/* Filter Summary Chips */}
        {chips.length > 0 && (
          <View style={styles.chipsRow}>
            {chips.map((chip, idx) => (
              <View key={idx} style={styles.filterChip}>
                <AppText variant="caption" color="textSecondary" weight="600">
                  {chip}
                </AppText>
              </View>
            ))}
          </View>
        )}

        <AppDivider spacing="sm" />

        {/* Footer: Alert Toggle & Rerun Button */}
        <View style={styles.cardFooter}>
          <View style={styles.alertToggleRow}>
            <AppIcon name="Bell" size="xs" color={item.alertsEnabled ? 'secondary' : 'textMuted'} />
            <AppText variant="caption" color="textSecondary" weight="600">
              {item.alertsEnabled ? 'Alerts Active' : 'Alerts Paused'}
            </AppText>
            <Switch
              value={item.alertsEnabled}
              onValueChange={(val) => handleToggleAlerts(item, val)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.surface}
              style={styles.switchScale}
            />
          </View>

          <AppButton
            title={t('savedSearches.runSearch', 'Run Search')}
            variant="primary"
            size="sm"
            leftIcon={<AppIcon name="Search" size="xs" color="textInverse" />}
            onPress={() => handleRunSearch(item)}
            style={styles.runBtn}
          />
        </View>
      </AppCard>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <AppHeader
        title={t('savedSearches.title', 'Saved Searches')}
        subtitle={t('savedSearches.subtitle', 'Live Alerts & 1-Tap Search Execution')}
        showBack
        onBackPress={() => router.back()}
      />

      {isLoading && savedSearches.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.secondary} />
          <AppText variant="bodySmall" color="textSecondary" style={styles.loadingText}>
            Loading saved searches...
          </AppText>
        </View>
      ) : (
        <FlatList
          data={savedSearches}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.secondary]}
              tintColor={colors.secondary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <AppIcon name="Search" size="xl" color="textMuted" />
              </View>
              <AppText variant="h3" color="primary" align="center" style={styles.emptyTitle}>
                {t('savedSearches.emptyTitle', 'No Saved Searches')}
              </AppText>
              <AppText variant="body" color="textSecondary" align="center" style={styles.emptyDesc}>
                {t(
                  'savedSearches.emptyDesc',
                  'When exploring properties, tap "Save Search" to bookmark your search filters and get notified whenever a newly verified home matches your criteria.'
                )}
              </AppText>
              <AppButton
                title={t('home.exploreAll', 'Explore Properties')}
                variant="outline"
                size="sm"
                leftIcon={<AppIcon name="Building" size="xs" color="primary" />}
                onPress={() => router.push('/(tabs)/explore')}
                style={styles.emptyBtn}
              />
            </View>
          }
        />
      )}

      {/* Edit/Rename Search Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setEditModalVisible(false)} />
          <AppCard variant="elevated" style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <AppText variant="h3" color="primary">
                {t('savedSearches.editTitle', 'Edit Saved Search')}
              </AppText>
              <Pressable hitSlop={8} onPress={() => setEditModalVisible(false)}>
                <AppIcon name="X" size="sm" color="textSecondary" />
              </Pressable>
            </View>

            <AppDivider spacing="sm" />

            <AppInput
              label={t('savedSearches.searchName', 'Search Name')}
              value={editName}
              onChangeText={setEditName}
              placeholder="E.g., 2 BHK Flats in Noida"
              maxLength={60}
            />

            <View style={styles.modalToggleRow}>
              <View style={styles.modalToggleText}>
                <AppText variant="body" color="primary" weight="600">
                  {t('savedSearches.enableAlerts', 'Property Matching Alerts')}
                </AppText>
                <AppText variant="caption" color="textSecondary">
                  Notify me when new matching homes are published
                </AppText>
              </View>
              <Switch
                value={editAlerts}
                onValueChange={setEditAlerts}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.surface}
              />
            </View>

            <AppDivider spacing="md" />

            <View style={styles.modalActions}>
              <AppButton
                title={t('common.cancel', 'Cancel')}
                variant="outline"
                size="sm"
                onPress={() => setEditModalVisible(false)}
                style={styles.halfBtn}
              />
              <AppButton
                title={isSubmittingEdit ? 'Saving...' : t('common.save', 'Save Changes')}
                variant="primary"
                size="sm"
                onPress={handleSaveEdit}
                disabled={isSubmittingEdit || !editName.trim()}
                style={styles.halfBtn}
              />
            </View>
          </AppCard>
        </View>
      </Modal>
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
    paddingVertical: spacing.md,
    flexGrow: 1,
  },
  searchCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  nameCol: {
    flex: 1,
    marginRight: spacing.sm,
  },
  matchingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.secondarySubtle,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.xs,
    alignSelf: 'flex-start',
    marginTop: spacing.xxs,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  iconBtn: {
    padding: spacing.xs,
    borderRadius: radius.xs,
    backgroundColor: colors.surfaceMuted,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginVertical: spacing.xs,
  },
  filterChip: {
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: spacing.xs,
    paddingVertical: 3,
    borderRadius: radius.xs,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  switchScale: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  runBtn: {
    minWidth: 110,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    marginBottom: spacing.xs,
  },
  emptyDesc: {
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  emptyBtn: {
    minWidth: 160,
  },
  guestContainer: {
    flex: 1,
    paddingHorizontal: layout.screenPaddingHorizontal,
    justifyContent: 'center',
  },
  guestCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  guestIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.secondarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  guestTitle: {
    marginBottom: spacing.xs,
  },
  guestDesc: {
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  signInBtn: {
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: layout.screenPaddingHorizontal,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    padding: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  modalToggleText: {
    flex: 1,
    marginRight: spacing.sm,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  halfBtn: {
    flex: 1,
  },
});
