/**
 * Private Founder Dashboard Screen — mobile/app/founder/index.tsx
 *
 * Exclusively provides high-level business intelligence, pending moderation queues,
 * active inventory counts, enquiry pipeline, and verified audit logs for MJ Estates Leadership.
 *
 * REAL DATABASE GUARANTEE:
 * Pulls genuine MongoDB counts and audit events via GET /api/founder/overview.
 * No fabricated statistics or placeholder numbers are rendered.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';
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
import { useAuth } from '../../src/hooks/useAuth';
import { useTranslation } from '../../src/hooks/useTranslation';
import { fetchFounderOverview } from '../../src/services/founderService';
import { FounderDashboardData } from '../../src/types/founder';

export default function FounderDashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [dashboardData, setDashboardData] = useState<FounderDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    fetchFounderOverview()
      .then((result) => {
        if (!isMounted) return;
        if (result.success && result.data) {
          setDashboardData(result.data);
        } else {
          setErrorMessage(result.error || 'Unable to connect to executive server.');
        }
        setIsLoading(false);
      })
      .catch((err: any) => {
        if (!isMounted) return;
        setErrorMessage(err.message || 'An error occurred while fetching dashboard data.');
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setErrorMessage(null);
    try {
      const result = await fetchFounderOverview();
      if (result.success && result.data) {
        setDashboardData(result.data);
      } else {
        setErrorMessage(result.error || 'Unable to connect to executive server.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while fetching dashboard data.');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const handleRetry = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await fetchFounderOverview();
      if (result.success && result.data) {
        setDashboardData(result.data);
      } else {
        setErrorMessage(result.error || 'Unable to connect to executive server.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while fetching dashboard data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const metrics = dashboardData?.metrics;
  const isCeo = user?.founderRole === 'ceo';
  const designation = isCeo ? 'CEO, MJ Estates' : 'Founder, MJ Estates';
  const leaderName = isCeo ? 'Mr Shokin (Master Ji)' : (user?.name || 'Riyaz Saifi');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <AppHeader
        title={t('founderDashboard.title', 'Executive Office')}
        subtitle={t('founderDashboard.subtitle', 'Private Founder & CEO Dashboard')}
        showBack
        onBackPress={() => router.replace('/(tabs)/profile')}
        rightAction={
          <Pressable
            style={styles.exitBtn}
            onPress={() => router.replace('/(tabs)/profile')}
            accessibilityRole="button"
            accessibilityLabel="Exit Founder Portal"
          >
            <AppIcon name="ArrowLeft" size="xs" color="textSecondary" />
            <AppText variant="caption" color="textSecondary" weight="700">
              EXIT
            </AppText>
          </Pressable>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.secondary]}
            tintColor={colors.secondary}
          />
        }
      >
        {/* 1. Executive Identity Banner */}
        <AppCard variant="goldAccent" style={styles.identityCard}>
          <View style={styles.identityHeader}>
            <View style={styles.leaderAvatarCircle}>
              <AppIcon name="Award" size="md" color="secondary" />
            </View>
            <View style={styles.leaderInfo}>
              <View style={styles.badgeRow}>
                <View style={styles.verifiedBadge}>
                  <AppText variant="caption" color="secondaryDark" weight="700">
                    EXECUTIVE LEADERSHIP
                  </AppText>
                </View>
                <View
                  style={[
                    styles.dbStatusBadge,
                    dashboardData?.databaseConnected ? styles.dbOnline : styles.dbOffline,
                  ]}
                >
                  <AppText
                    variant="caption"
                    color={dashboardData?.databaseConnected ? 'success' : 'textMuted'}
                    weight="700"
                  >
                    {dashboardData?.databaseConnected ? 'LIVE DATABASE' : 'OFFLINE SYNC'}
                  </AppText>
                </View>
              </View>

              <AppText variant="h2" color="primary">
                {leaderName}
              </AppText>
              <AppText variant="bodySmall" color="secondaryDark" weight="600">
                {designation}
              </AppText>
            </View>
          </View>

          <AppDivider spacing="sm" color="borderGold" />

          <AppText variant="caption" color="textSecondary">
            {t(
              'founderDashboard.disclaimer',
              'Strictly confidential. Real-time platform metrics, moderation queue, and verified client consultations.'
            )}
          </AppText>
        </AppCard>

        {/* 2. Loading State */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.secondary} />
            <AppText variant="bodySmall" color="textSecondary" style={styles.loadingText}>
              Retrieving live enterprise analytics...
            </AppText>
          </View>
        )}

        {/* 3. Error Banner with Retry */}
        {!isLoading && errorMessage && (
          <AppCard variant="outlined" style={styles.errorCard}>
            <View style={styles.errorHeader}>
              <AppIcon name="AlertCircle" size="md" color="error" />
              <AppText variant="h3" color="error" style={styles.errorTitle}>
                Data Synchronization Notice
              </AppText>
            </View>
            <AppText variant="bodySmall" color="textSecondary" style={styles.errorDesc}>
              {errorMessage}
            </AppText>
            <AppButton
              title="Retry Connection"
              variant="outline"
              size="sm"
              leftIcon={<AppIcon name="RotateCcw" size="xs" color="primary" />}
              onPress={handleRetry}
              style={styles.retryBtn}
            />
          </AppCard>
        )}

        {/* 4. Executive Metrics Grid */}
        {!isLoading && metrics && (
          <View style={styles.metricsSection}>
            <AppText variant="caption" color="textSecondary" weight="700" style={styles.sectionTitle}>
              KEY PERFORMANCE METRICS
            </AppText>

            <View style={styles.metricsGrid}>
              {/* Card 1: Total Inventory */}
              <AppCard variant="elevated" style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <View style={[styles.metricIconBox, { backgroundColor: colors.primarySubtle }]}>
                    <AppIcon name="Building" size="sm" color="primary" />
                  </View>
                  <AppText variant="caption" color="textSecondary" weight="700">
                    INVENTORY
                  </AppText>
                </View>
                <AppText variant="h1" color="primary" style={styles.metricNumber}>
                  {metrics.totalProperties}
                </AppText>
                <AppText variant="caption" color="textSecondary">
                  {metrics.activeProperties} Published & Active
                </AppText>
              </AppCard>

              {/* Card 2: Pending Approvals */}
              <AppCard variant="elevated" style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <View
                    style={[
                      styles.metricIconBox,
                      {
                        backgroundColor:
                          metrics.pendingApprovals > 0 ? colors.secondarySubtle : colors.surfaceMuted,
                      },
                    ]}
                  >
                    <AppIcon
                      name="CheckCircle"
                      size="sm"
                      color={metrics.pendingApprovals > 0 ? 'secondaryDark' : 'textMuted'}
                    />
                  </View>
                  <View
                    style={[
                      styles.alertPill,
                      metrics.pendingApprovals > 0 ? styles.alertPillActive : styles.alertPillZero,
                    ]}
                  >
                    <AppText
                      variant="caption"
                      color={metrics.pendingApprovals > 0 ? 'secondaryDark' : 'textMuted'}
                      weight="700"
                    >
                      {metrics.pendingApprovals > 0 ? 'ACTION' : 'CLEAR'}
                    </AppText>
                  </View>
                </View>
                <AppText
                  variant="h1"
                  color={metrics.pendingApprovals > 0 ? 'secondaryDark' : 'primary'}
                  style={styles.metricNumber}
                >
                  {metrics.pendingApprovals}
                </AppText>
                <AppText variant="caption" color="textSecondary">
                  Pending Moderation
                </AppText>
              </AppCard>

              {/* Card 3: Total Enquiries */}
              <AppCard variant="elevated" style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <View style={[styles.metricIconBox, { backgroundColor: colors.primarySubtle }]}>
                    <AppIcon name="MessageSquare" size="sm" color="primary" />
                  </View>
                  <AppText variant="caption" color="textSecondary" weight="700">
                    ENQUIRIES
                  </AppText>
                </View>
                <AppText variant="h1" color="primary" style={styles.metricNumber}>
                  {metrics.totalEnquiries}
                </AppText>
                <AppText variant="caption" color="textSecondary">
                  {metrics.pendingEnquiries} Require Follow-up
                </AppText>
              </AppCard>

              {/* Card 4: Confirmed Site Visits */}
              <AppCard variant="elevated" style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <View style={[styles.metricIconBox, { backgroundColor: colors.secondarySubtle }]}>
                    <AppIcon name="Compass" size="sm" color="secondary" />
                  </View>
                  <AppText variant="caption" color="textSecondary" weight="700">
                    SITE VISITS
                  </AppText>
                </View>
                <AppText variant="h1" color="primary" style={styles.metricNumber}>
                  {metrics.confirmedSiteVisits}
                </AppText>
                <AppText variant="caption" color="textSecondary">
                  Confirmed Inspections
                </AppText>
              </AppCard>
            </View>
          </View>
        )}

        {/* 5. Quick Actions Launcher */}
        <AppCard style={styles.actionsCard}>
          <AppText variant="caption" color="textSecondary" weight="700" style={styles.sectionTitle}>
            EXECUTIVE WORKFLOW LAUNCHERS
          </AppText>
          <AppDivider spacing="xs" />

          <View style={styles.actionRow}>
            <AppButton
              title="Moderation Queue"
              variant="primary"
              size="sm"
              leftIcon={<AppIcon name="Shield" size="xs" color="textInverse" />}
              onPress={() => router.push('/admin')}
              style={styles.halfBtn}
            />
            <AppButton
              title="All Listings"
              variant="outline"
              size="sm"
              leftIcon={<AppIcon name="Building" size="xs" color="primary" />}
              onPress={() => router.push('/admin/properties')}
              style={styles.halfBtn}
            />
          </View>

          <View style={[styles.actionRow, styles.secondActionRow]}>
            <AppButton
              title="Customer Inquiries"
              variant="secondary"
              size="sm"
              leftIcon={<AppIcon name="MessageSquare" size="xs" color="textOnGold" />}
              onPress={() => router.push('/profile/enquiries')}
              style={styles.halfBtn}
            />
            <AppButton
              title="Add New Listing"
              variant="outline"
              size="sm"
              leftIcon={<AppIcon name="Plus" size="xs" color="primary" />}
              onPress={() => router.push('/admin/add-property')}
              style={styles.halfBtn}
            />
          </View>
        </AppCard>

        {/* 6. Recent Platform Audit Activity */}
        <AppCard style={styles.activityCard}>
          <View style={styles.activityHeader}>
            <AppIcon name="ShieldCheck" size="sm" color="primary" />
            <AppText variant="h3" color="primary" style={styles.activityTitle}>
              Verified Business Audit Log
            </AppText>
          </View>
          <AppDivider spacing="sm" />

          {dashboardData?.recentActivities && dashboardData.recentActivities.length > 0 ? (
            dashboardData.recentActivities.map((act, index) => (
              <View key={act.id || index}>
                <View style={styles.activityRow}>
                  <View style={styles.activityBulletCircle}>
                    <AppIcon name="CheckCircle" size="xs" color="secondary" />
                  </View>
                  <View style={styles.activityTextCol}>
                    <AppText variant="bodySmall" color="primary" weight="600">
                      {act.action?.toUpperCase().replace(/_/g, ' ') || 'SYSTEM ACTION'}
                    </AppText>
                    {act.targetTitle ? (
                      <AppText variant="caption" color="textSecondary" numberOfLines={1}>
                        Target: {act.targetTitle}
                      </AppText>
                    ) : null}
                    <AppText variant="caption" color="textMuted">
                      By {act.adminName || 'Coordinator'} •{' '}
                      {new Date(act.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </AppText>
                  </View>
                </View>
                {index < (dashboardData.recentActivities.length - 1) && (
                  <AppDivider spacing="xs" />
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyActivityBox}>
              <AppIcon name="CheckCircle" size="md" color="textMuted" />
              <AppText variant="bodySmall" color="textMuted" align="center" style={styles.emptyText}>
                No pending audit alerts. Platform operating smoothly.
              </AppText>
            </View>
          )}
        </AppCard>

        {/* 7. Recent Inquiries Snapshot */}
        <AppCard style={styles.activityCard}>
          <View style={styles.activityHeader}>
            <AppIcon name="MessageSquare" size="sm" color="primary" />
            <AppText variant="h3" color="primary" style={styles.activityTitle}>
              Recent Customer Inquiries
            </AppText>
          </View>
          <AppDivider spacing="sm" />

          {dashboardData?.recentEnquiries && dashboardData.recentEnquiries.length > 0 ? (
            dashboardData.recentEnquiries.map((enq, idx) => (
              <View key={enq.id || idx}>
                <View style={styles.activityRow}>
                  <View style={styles.activityBulletCircle}>
                    <AppIcon name="User" size="xs" color="primary" />
                  </View>
                  <View style={styles.activityTextCol}>
                    <View style={styles.inquiryTopLine}>
                      <AppText variant="bodySmall" color="primary" weight="600">
                        {enq.name}
                      </AppText>
                      <View style={styles.enquiryStatusBadge}>
                        <AppText variant="caption" color="secondaryDark" weight="700">
                          {enq.status.toUpperCase()}
                        </AppText>
                      </View>
                    </View>
                    <AppText variant="caption" color="textSecondary" numberOfLines={1}>
                      {enq.propertyTitle} {enq.propertyId ? `(${enq.propertyId})` : ''}
                    </AppText>
                    <AppText variant="caption" color="textMuted">
                      Type: {enq.enquiryType} •{' '}
                      {new Date(enq.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </AppText>
                  </View>
                </View>
                {idx < (dashboardData.recentEnquiries.length - 1) && (
                  <AppDivider spacing="xs" />
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyActivityBox}>
              <AppText variant="bodySmall" color="textMuted" align="center">
                No recent customer enquiries recorded.
              </AppText>
            </View>
          )}
        </AppCard>

        {/* Bottom Safety Margin */}
        <View style={styles.bottomSpacer} />
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
    paddingVertical: spacing.md,
  },
  exitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.xs,
    backgroundColor: colors.surfaceMuted,
  },
  identityCard: {
    marginBottom: spacing.md,
  },
  identityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leaderAvatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.secondarySubtle,
    borderWidth: 1.5,
    borderColor: colors.borderGold,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  leaderInfo: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 2,
  },
  verifiedBadge: {
    backgroundColor: colors.secondarySubtle,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: radius.xs,
  },
  dbStatusBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: radius.xs,
  },
  dbOnline: {
    backgroundColor: colors.successSubtle,
  },
  dbOffline: {
    backgroundColor: colors.surfaceMuted,
  },
  loadingContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.sm,
  },
  errorCard: {
    marginBottom: spacing.md,
    borderColor: colors.border,
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xxs,
  },
  errorTitle: {
    fontSize: 15,
  },
  errorDesc: {
    marginBottom: spacing.sm,
  },
  retryBtn: {
    alignSelf: 'flex-start',
  },
  metricsSection: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metricCard: {
    width: '48%',
    padding: spacing.md,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  metricIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertPill: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  alertPillActive: {
    backgroundColor: colors.secondarySubtle,
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  alertPillZero: {
    backgroundColor: colors.surfaceMuted,
  },
  metricNumber: {
    fontSize: 28,
    lineHeight: 34,
    marginBottom: 2,
  },
  actionsCard: {
    marginBottom: spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  secondActionRow: {
    marginTop: spacing.sm,
  },
  halfBtn: {
    flex: 1,
  },
  activityCard: {
    marginBottom: spacing.md,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xxs,
  },
  activityTitle: {
    fontSize: 16,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.xs,
  },
  activityBulletCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginTop: 2,
  },
  activityTextCol: {
    flex: 1,
  },
  inquiryTopLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  enquiryStatusBadge: {
    backgroundColor: colors.secondarySubtle,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: radius.xs,
  },
  emptyActivityBox: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  emptyText: {
    marginTop: spacing.xs,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});
