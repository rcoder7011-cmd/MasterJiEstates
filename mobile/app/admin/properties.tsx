/**
 * Admin Properties Screen — app/admin/properties.tsx
 * Comprehensive administrative property listing with search, multi-factor filtering,
 * instant status management, secure deletion confirmation, and edit navigation.
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  FlatList,
  Pressable,
  Image,
  StyleSheet,
  Alert,
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
import { useAdminProperties } from '../../src/hooks/useAdminProperties';
import { formatIndianCurrency } from '../../src/utils/formatting';
import {
  PropertyItem,
  PropertyStatus,
  TransactionType,
  PropertyCategoryType,
} from '../../src/types/property';

export default function AdminPropertiesScreen() {
  const router = useRouter();
  const {
    properties,
    isLoading,
    removeProperty,
    changeStatus,
  } = useAdminProperties();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<PropertyStatus | 'all'>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionType | 'all'>('all');
  const [selectedType, setSelectedType] = useState<PropertyCategoryType | 'all'>('all');

  // Filtered Properties Computation
  const filteredProperties = useMemo(() => {
    return properties.filter((item) => {
      // 1. Text Search across Title, Locality, City, and ID
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesLocality = item.locality.toLowerCase().includes(query);
        const matchesCity = item.city.toLowerCase().includes(query);
        const matchesId = item.id.toLowerCase().includes(query);
        if (!matchesTitle && !matchesLocality && !matchesCity && !matchesId) {
          return false;
        }
      }

      // 2. Status Filter
      if (selectedStatus !== 'all' && item.status !== selectedStatus) {
        return false;
      }

      // 3. Transaction Type Filter
      if (selectedTransaction !== 'all' && item.transaction !== selectedTransaction) {
        return false;
      }

      // 4. Property Type Filter
      if (selectedType !== 'all' && item.propertyType !== selectedType) {
        return false;
      }

      return true;
    });
  }, [properties, searchQuery, selectedStatus, selectedTransaction, selectedType]);

  // Handle Delete with Safety Alert
  const handleDelete = (property: PropertyItem) => {
    Alert.alert(
      'Delete Property',
      `Are you sure you want to permanently delete "${property.title}" (ID: ${property.id})? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Property',
          style: 'destructive',
          onPress: async () => {
            const success = await removeProperty(property.id);
            if (success) {
              Alert.alert('Deleted', `"${property.title}" has been successfully removed.`);
            } else {
              Alert.alert('Error', 'Unable to delete property. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Handle Status Toggle / Selection
  const handleStatusChange = (property: PropertyItem) => {
    Alert.alert(
      'Change Listing Status',
      `Select the new status for "${property.title}":`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Available (Active)',
          onPress: async () => {
            await changeStatus(property.id, 'available');
          },
        },
        {
          text: 'Sold (Closed Deal)',
          onPress: async () => {
            await changeStatus(property.id, 'sold');
          },
        },
        {
          text: 'Rented (Leased Out)',
          onPress: async () => {
            await changeStatus(property.id, 'rented');
          },
        },
      ]
    );
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('all');
    setSelectedTransaction('all');
    setSelectedType('all');
  };

  const renderHeader = () => (
    <View style={styles.headerBlock}>
      {/* Search Input */}
      <AppInput
        placeholder="Search by title, locality, city or ID..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        leftIcon={<AppIcon name="Search" size="sm" color="textSecondary" />}
        rightIcon={
          searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')}>
              <AppIcon name="X" size="sm" color="textSecondary" />
            </Pressable>
          ) : undefined
        }
      />

      {/* Filter Row 1: Status */}
      <View style={styles.filterGroup}>
        <AppText variant="caption" color="textSecondary" weight="700" style={styles.filterLabel}>
          STATUS:
        </AppText>
        <View style={styles.filterPillsRow}>
          {(['all', 'available', 'sold', 'rented'] as const).map((status) => {
            const isSelected = selectedStatus === status;
            return (
              <Pressable
                key={status}
                onPress={() => setSelectedStatus(status)}
                style={[styles.pill, isSelected ? styles.pillSelected : null]}
              >
                <AppText
                  variant="caption"
                  color={isSelected ? 'textInverse' : 'textSecondary'}
                  weight="700"
                >
                  {status === 'all' ? 'All Status' : status.toUpperCase()}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Filter Row 2: Transaction */}
      <View style={styles.filterGroup}>
        <AppText variant="caption" color="textSecondary" weight="700" style={styles.filterLabel}>
          PURPOSE:
        </AppText>
        <View style={styles.filterPillsRow}>
          {(['all', 'buy', 'rent'] as const).map((trx) => {
            const isSelected = selectedTransaction === trx;
            return (
              <Pressable
                key={trx}
                onPress={() => setSelectedTransaction(trx)}
                style={[styles.pill, isSelected ? styles.pillSelected : null]}
              >
                <AppText
                  variant="caption"
                  color={isSelected ? 'textInverse' : 'textSecondary'}
                  weight="700"
                >
                  {trx === 'all' ? 'All Purpose' : trx.toUpperCase()}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Results Count Bar */}
      <View style={styles.resultsBar}>
        <View style={styles.countBadge}>
          <AppText variant="caption" color="secondaryDark" weight="700">
            SHOWING {filteredProperties.length} OF {properties.length} PROPERTIES
          </AppText>
        </View>
        {(searchQuery || selectedStatus !== 'all' || selectedTransaction !== 'all' || selectedType !== 'all') && (
          <Pressable onPress={handleResetFilters}>
            <AppText variant="caption" color="secondary" weight="700">
              RESET FILTERS
            </AppText>
          </Pressable>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <AppCard style={styles.emptyCard}>
      <View style={styles.emptyIconCircle}>
        <AppIcon name="Building" size="lg" color="secondary" />
      </View>
      <AppText variant="h2" color="primary" align="center" style={styles.emptyTitle}>
        No Properties Found
      </AppText>
      <AppText variant="bodySmall" color="textSecondary" align="center" style={styles.emptyDesc}>
        No inventory records matched your search query or selected filters.
      </AppText>
      <View style={styles.emptyActions}>
        <AppButton
          title="Reset All Filters"
          variant="outline"
          size="sm"
          onPress={handleResetFilters}
        />
        <AppButton
          title="+ Add New Property"
          variant="secondary"
          size="sm"
          onPress={() => router.push('/admin/add-property')}
        />
      </View>
    </AppCard>
  );

  const renderPropertyItem = ({ item }: { item: PropertyItem }) => {
    const primaryImage = item.images && item.images.length > 0 ? item.images[0] : null;

    return (
      <AppCard style={styles.propertyCard}>
        {/* Top Header Row with ID and Status Badge */}
        <View style={styles.cardTopRow}>
          <View style={styles.idBadge}>
            <AppText variant="caption" color="textSecondary" weight="700">
              #{item.id}
            </AppText>
          </View>

          <View style={styles.badgesCluster}>
            <View style={styles.typeBadge}>
              <AppText variant="caption" color="primary" weight="700">
                {item.transaction.toUpperCase()} • {item.propertyType.toUpperCase()}
              </AppText>
            </View>

            {/* Tappable Status Badge */}
            <Pressable
              onPress={() => handleStatusChange(item)}
              style={[
                styles.statusBadge,
                item.status === 'available'
                  ? styles.statusAvailable
                  : item.status === 'sold'
                  ? styles.statusSold
                  : styles.statusRented,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Change status for ${item.title}`}
            >
              <AppText
                variant="caption"
                color={
                  item.status === 'available'
                    ? 'success'
                    : item.status === 'sold'
                    ? 'secondaryDark'
                    : 'primary'
                }
                weight="700"
              >
                {item.status.toUpperCase()} ▾
              </AppText>
            </Pressable>
          </View>
        </View>

        <AppDivider spacing="xs" />

        {/* Content Body Row with Thumbnail and Info */}
        <View style={styles.cardBodyRow}>
          {primaryImage ? (
            <Image
              source={{ uri: primaryImage }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.thumbnailPlaceholder}>
              <AppIcon name="Building" size="md" color="textSecondary" />
            </View>
          )}

          <View style={styles.cardInfoCol}>
            <AppText variant="h3" color="primary" numberOfLines={2} style={styles.propertyTitle}>
              {item.title}
            </AppText>

            <View style={styles.locationRow}>
              <AppIcon name="MapPin" size="xs" color="textSecondary" />
              <AppText variant="caption" color="textSecondary" numberOfLines={1} style={styles.locationText}>
                {item.locality}, {item.city}
              </AppText>
            </View>

            <AppText variant="body" color="primary" weight="700" style={styles.priceText}>
              {formatIndianCurrency(item.price)}
              {item.transaction === 'rent' ? ' / mo' : ''}
            </AppText>

            {item.area ? (
              <AppText variant="caption" color="textSecondary">
                Area: {item.area} {item.bedrooms ? `• ${item.bedrooms}` : ''}
              </AppText>
            ) : null}
          </View>
        </View>

        <AppDivider spacing="sm" />

        {/* Bottom Actions Row */}
        <View style={styles.cardActionsRow}>
          <Pressable
            style={styles.liveViewBtn}
            onPress={() =>
              router.push({
                pathname: '/property/[id]',
                params: { id: item.id },
              })
            }
          >
            <AppIcon name="Eye" size="xs" color="textSecondary" />
            <AppText variant="caption" color="textSecondary" weight="600">
              View Live
            </AppText>
          </Pressable>

          <View style={styles.actionButtonsCluster}>
            <AppButton
              title="Edit"
              variant="outline"
              size="sm"
              leftIcon={<AppIcon name="Building2" size="xs" color="primary" />}
              onPress={() =>
                router.push({
                  pathname: '/admin/edit-property/[id]',
                  params: { id: item.id },
                })
              }
            />

            <Pressable
              style={styles.deleteBtn}
              onPress={() => handleDelete(item)}
              accessibilityRole="button"
              accessibilityLabel={`Delete ${item.title}`}
            >
              <AppIcon name="Trash2" size="sm" color="error" />
            </Pressable>
          </View>
        </View>
      </AppCard>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <AppHeader
        title="Manage Properties"
        subtitle="Inventory & Listing Catalog"
        showBack
        onBackPress={() => router.back()}
        rightAction={
          <AppButton
            title="+ Add"
            size="sm"
            variant="secondary"
            leftIcon={<AppIcon name="Plus" size="xs" color="textOnGold" />}
            onPress={() => router.push('/admin/add-property')}
          />
        }
      />

      <FlatList
        data={filteredProperties}
        keyExtractor={(item) => item.id}
        renderItem={renderPropertyItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!isLoading ? renderEmptyState : undefined}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
    marginBottom: spacing.md,
  },
  filterGroup: {
    marginTop: spacing.sm,
  },
  filterLabel: {
    marginBottom: spacing.xxs,
    letterSpacing: 0.5,
  },
  filterPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs + 1,
    borderRadius: radius.full,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  resultsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  countBadge: {
    backgroundColor: colors.secondarySubtle,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  propertyCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  idBadge: {
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgesCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  typeBadge: {
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusBadge: {
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: radius.xs,
    borderWidth: 1,
  },
  statusAvailable: {
    backgroundColor: colors.successSubtle,
    borderColor: colors.success,
  },
  statusSold: {
    backgroundColor: colors.secondarySubtle,
    borderColor: colors.borderGold,
  },
  statusRented: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.border,
  },
  cardBodyRow: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundSecondary,
  },
  thumbnailPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardInfoCol: {
    flex: 1,
    marginLeft: spacing.md,
  },
  propertyTitle: {
    fontSize: 15,
    lineHeight: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationText: {
    marginLeft: 3,
  },
  priceText: {
    marginTop: spacing.xxs,
  },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  liveViewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.xs,
  },
  actionButtonsCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.errorSubtle,
    borderWidth: 1,
    borderColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xxs,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
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
  emptyActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
