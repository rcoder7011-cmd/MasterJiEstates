/**
 * Admin Dashboard Screen — app/admin/index.tsx
 * Backoffice management overview displaying real-time local inventory metrics,
 * status distribution visualization, quick action launchers, and recently added listings.
 */

import React from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  AppText,
  AppCard,
  AppButton,
  AppHeader,
  AppIcon,
  AppDivider,
} from '../../src/components';
import { colors } from '../../src/theme/colors';
import { spacing, layout } from '../../src/theme/spacing';
import { radius } from '../../src/theme/radius';
import { useAdminProperties } from '../../src/hooks/useAdminProperties';
import { formatIndianCurrency } from '../../src/utils/formatting';
import { PropertyItem } from '../../src/types/property';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { properties, metrics, isLoading } = useAdminProperties();

  const total = metrics.total;
  const availablePct = total > 0 ? Math.round((metrics.available / total) * 100) : 0;
  const soldPct = total > 0 ? Math.round((metrics.sold / total) * 100) : 0;
  const rentedPct = total > 0 ? Math.max(0, 100 - availablePct - soldPct) : 0;

  // Recent 3 properties
  const recentProperties: PropertyItem[] = properties.slice(0, 3);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <AppHeader
        title="Admin Dashboard"
        subtitle="Platform Operations & Inventory"
        showBack
        onBackPress={() => router.replace('/(tabs)')}
        rightAction={
          <Pressable
            style={styles.exitBtn}
            onPress={() => router.replace('/(tabs)')}
            accessibilityRole="button"
            accessibilityLabel="Exit Admin Portal"
          >
            <AppIcon name="ArrowLeft" size="xs" color="textSecondary" />
            <AppText variant="caption" color="textSecondary" weight="700">
              EXIT PORTAL
            </AppText>
          </Pressable>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Environment Banner */}
        <View style={styles.devBanner}>
          <AppIcon name="Shield" size="sm" color="secondary" />
          <View style={styles.devBannerText}>
            <AppText variant="caption" color="secondaryDark" weight="700">
              ADMINISTRATIVE WORKSPACE • LOCAL PERSISTENCE
            </AppText>
            <AppText variant="caption" color="textSecondary">
              All inventory modifications persist securely on this device and are prepared for API sync.
            </AppText>
          </View>
        </View>

        {/* 1. Metrics Overview Grid (2x2) */}
        <View style={styles.metricsGrid}>
          {/* Total Properties */}
          <AppCard variant="elevated" style={styles.metricCard}>
            <View style={styles.metricHeaderRow}>
              <View style={[styles.metricIconCircle, { backgroundColor: colors.primarySubtle }]}>
                <AppIcon name="Building" size="sm" color="primary" />
              </View>
              <AppText variant="caption" color="textSecondary" weight="700">
                TOTAL
              </AppText>
            </View>
            <AppText variant="h1" color="primary" style={styles.metricValue}>
              {isLoading ? '...' : metrics.total}
            </AppText>
            <AppText variant="caption" color="textSecondary">
              Active Inventory Records
            </AppText>
          </AppCard>

          {/* Available */}
          <AppCard variant="elevated" style={styles.metricCard}>
            <View style={styles.metricHeaderRow}>
              <View style={[styles.metricIconCircle, { backgroundColor: colors.successSubtle }]}>
                <AppIcon name="CheckCircle" size="sm" color="success" />
              </View>
              <AppText variant="caption" color="success" weight="700">
                AVAILABLE
              </AppText>
            </View>
            <AppText variant="h1" color="success" style={styles.metricValue}>
              {isLoading ? '...' : metrics.available}
            </AppText>
            <AppText variant="caption" color="textSecondary">
              Live for Public Browsing
            </AppText>
          </AppCard>

          {/* Sold */}
          <AppCard variant="elevated" style={styles.metricCard}>
            <View style={styles.metricHeaderRow}>
              <View style={[styles.metricIconCircle, { backgroundColor: colors.secondarySubtle }]}>
                <AppIcon name="Tag" size="sm" color="secondary" />
              </View>
              <AppText variant="caption" color="secondaryDark" weight="700">
                SOLD
              </AppText>
            </View>
            <AppText variant="h1" color="secondary" style={styles.metricValue}>
              {isLoading ? '...' : metrics.sold}
            </AppText>
            <AppText variant="caption" color="textSecondary">
              Closed Sale Deals
            </AppText>
          </AppCard>

          {/* Rented */}
          <AppCard variant="elevated" style={styles.metricCard}>
            <View style={styles.metricHeaderRow}>
              <View style={[styles.metricIconCircle, { backgroundColor: colors.primarySubtle }]}>
                <AppIcon name="Key" size="sm" color="primaryLight" />
              </View>
              <AppText variant="caption" color="primaryLight" weight="700">
                RENTED
              </AppText>
            </View>
            <AppText variant="h1" color="primary" style={styles.metricValue}>
              {isLoading ? '...' : metrics.rented}
            </AppText>
            <AppText variant="caption" color="textSecondary">
              Occupied Tenancies
            </AppText>
          </AppCard>
        </View>

        {/* 2. Status Distribution Visualization */}
        {total > 0 && (
          <AppCard style={styles.distributionCard}>
            <View style={styles.distHeaderRow}>
              <AppText variant="h3" color="primary">
                Inventory Status Distribution
              </AppText>
              <AppText variant="caption" color="textSecondary">
                {total} Units Tracked
              </AppText>
            </View>

            <AppDivider spacing="sm" />

            {/* Segmented Bar */}
            <View style={styles.progressBar}>
              {availablePct > 0 && (
                <View
                  style={[
                    styles.progressSegment,
                    { width: `${availablePct}%`, backgroundColor: colors.success },
                  ]}
                />
              )}
              {soldPct > 0 && (
                <View
                  style={[
                    styles.progressSegment,
                    { width: `${soldPct}%`, backgroundColor: colors.secondary },
                  ]}
                />
              )}
              {rentedPct > 0 && (
                <View
                  style={[
                    styles.progressSegment,
                    { width: `${rentedPct}%`, backgroundColor: colors.primaryLight },
                  ]}
                />
              )}
            </View>

            {/* Legend */}
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
                <AppText variant="caption" color="textSecondary">
                  Available: {availablePct}% ({metrics.available})
                </AppText>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.secondary }]} />
                <AppText variant="caption" color="textSecondary">
                  Sold: {soldPct}% ({metrics.sold})
                </AppText>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.primaryLight }]} />
                <AppText variant="caption" color="textSecondary">
                  Rented: {rentedPct}% ({metrics.rented})
                </AppText>
              </View>
            </View>
          </AppCard>
        )}

        {/* 3. Primary Quick Actions */}
        <View style={styles.quickActionsSection}>
          <AppButton
            title="+ Add New Property"
            variant="secondary"
            size="lg"
            leftIcon={<AppIcon name="Plus" size="sm" color="textOnGold" />}
            onPress={() => router.push('/admin/add-property')}
            style={styles.addBtn}
          />

          <AppButton
            title="Manage All Properties"
            variant="outline"
            size="md"
            leftIcon={<AppIcon name="Building" size="sm" color="primary" />}
            rightIcon={<AppIcon name="ArrowRight" size="sm" color="primary" />}
            onPress={() => router.push('/admin/properties')}
          />

          <AppButton
            title="Moderation & Reports"
            variant="outline"
            size="md"
            leftIcon={<AppIcon name="AlertTriangle" size="sm" color="error" />}
            rightIcon={<AppIcon name="ArrowRight" size="sm" color="primary" />}
            onPress={() => router.push('/admin/reports' as any)}
          />
        </View>

        {/* 4. Recently Added / Updated Listings */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeaderRow}>
            <AppText variant="h2" color="primary">
              Recent Inventory
            </AppText>
            <Pressable
              onPress={() => router.push('/admin/properties')}
              accessibilityRole="button"
            >
              <AppText variant="bodySmall" color="secondary" weight="700">
                View All ({properties.length})
              </AppText>
            </Pressable>
          </View>

          {recentProperties.map((item) => (
            <AppCard key={item.id} style={styles.recentItemCard}>
              <View style={styles.recentItemRow}>
                <View style={styles.recentItemInfo}>
                  <View style={styles.recentBadgeRow}>
                    <View
                      style={[
                        styles.statusTag,
                        item.status === 'available'
                          ? styles.statusAvailable
                          : item.status === 'sold'
                          ? styles.statusSold
                          : styles.statusRented,
                      ]}
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
                        {item.status.toUpperCase()}
                      </AppText>
                    </View>
                    <AppText variant="caption" color="textSecondary">
                      {item.transaction.toUpperCase()} • {item.propertyType.toUpperCase()}
                    </AppText>
                  </View>

                  <AppText variant="h3" color="primary" numberOfLines={1}>
                    {item.title}
                  </AppText>
                  <AppText variant="caption" color="textSecondary" numberOfLines={1}>
                    {item.locality}, {item.city}
                  </AppText>
                  <AppText variant="body" color="primary" weight="700" style={styles.recentPrice}>
                    {formatIndianCurrency(item.price)}
                    {item.transaction === 'rent' ? ' / mo' : ''}
                  </AppText>
                </View>

                <View style={styles.recentItemActions}>
                  <AppButton
                    title="Edit"
                    variant="outline"
                    size="sm"
                    onPress={() =>
                      router.push({
                        pathname: '/admin/edit-property/[id]',
                        params: { id: item.id },
                      })
                    }
                  />
                </View>
              </View>
            </AppCard>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.lg,
  },
  exitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  devBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.secondarySubtle,
    borderWidth: 1,
    borderColor: colors.borderGold,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
  },
  devBannerText: {
    flex: 1,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  metricCard: {
    width: '47.5%',
    padding: spacing.md,
  },
  metricHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  metricIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    fontSize: 28,
    marginVertical: spacing.xxs,
  },
  distributionCard: {
    marginBottom: spacing.lg,
  },
  distHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressBar: {
    height: 10,
    borderRadius: radius.full,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  progressSegment: {
    height: '100%',
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  quickActionsSection: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  addBtn: {
    marginBottom: spacing.xxs,
  },
  recentSection: {
    marginBottom: spacing.xxl,
  },
  recentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  recentItemCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  recentItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recentItemInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  recentBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xxs,
  },
  statusTag: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
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
  recentPrice: {
    marginTop: spacing.xxs,
  },
  recentItemActions: {
    marginLeft: spacing.xs,
  },
});
