/**
 * Admin Moderation & Reports Management Screen — app/admin/reports.tsx
 *
 * Backoffice console for reviewing customer property reports, inspecting suspicious
 * signals, recording internal private audit notes, and taking direct enforcement action
 * (mark under review, suspend listing, restore listing, resolve or dismiss).
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  FlatList,
  Pressable,
  Modal,
  TextInput,
  RefreshControl,
  StyleSheet,
  Alert,
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
  AppLoader,
} from '../../src/components';
import { colors } from '../../src/theme/colors';
import { spacing, layout } from '../../src/theme/spacing';
import { radius } from '../../src/theme/radius';
import { moderationService } from '../../src/services';
import {
  PropertyReportItem,
  ReportStatus,
  ReportReason,
} from '../../src/types/moderation';

const STATUS_FILTERS: { label: string; value: 'all' | ReportStatus }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Under Review', value: 'under_review' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Dismissed', value: 'dismissed' },
];

const REASON_LABELS: Record<ReportReason, string> = {
  fake_suspicious: 'Fake / Suspicious',
  incorrect_price: 'Incorrect Price',
  incorrect_info: 'Incorrect Info',
  duplicate_listing: 'Duplicate Listing',
  misleading_images: 'Misleading Images',
  unavailable: 'Already Sold / Unavailable',
  other: 'Other Issue',
};

// Fallback demo reports if backend has not accumulated live reports yet
const FALLBACK_REPORTS: PropertyReportItem[] = [
  {
    id: 'rep-demo-001',
    propertyIdString: 'prop-002',
    propertyTitle: '3 BHK Luxury Apartment in Sector 62',
    reporter: {
      id: 'usr-101',
      name: 'Ananya Sharma',
      email: 'ananya.s@example.com',
      phone: '+91 98765 43210',
    },
    reason: 'incorrect_price',
    reasonLabel: 'Incorrect Price',
    description: 'The listing price is shown as ₹85 Lacs, but the broker on site quoted ₹1.10 Cr.',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'rep-demo-002',
    propertyIdString: 'prop-004',
    propertyTitle: '4 BHK Independent Villa in Greater Noida',
    reporter: {
      id: 'usr-102',
      name: 'Vikram Malhotra',
      email: 'vikram.m@example.com',
      phone: '+91 99112 23344',
    },
    reason: 'duplicate_listing',
    reasonLabel: 'Duplicate Listing',
    description: 'Exact same photos and plot number are posted under another dealer ID.',
    status: 'under_review',
    adminNotes: 'Contacted listing owner to verify sole exclusivity rights.',
    actionTaken: 'other',
    reviewedBy: { id: 'usr-admin', name: 'Admin Team' },
    reviewedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'rep-demo-003',
    propertyIdString: 'prop-001',
    propertyTitle: 'MasterJi Tower 1 Commercial Office',
    reporter: {
      id: 'usr-103',
      name: 'Rajesh Gupta',
      email: 'r.gupta@example.com',
    },
    reason: 'unavailable',
    reasonLabel: 'Already Sold / Unavailable',
    description: 'Owner confirmed unit was leased last month.',
    status: 'resolved',
    adminNotes: 'Verified lease execution. Updated listing status to leased.',
    actionTaken: 'details_corrected',
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
  },
];

export default function AdminReportsScreen() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<'all' | ReportStatus>('all');
  const [reports, setReports] = useState<PropertyReportItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [activeReport, setActiveReport] = useState<PropertyReportItem | null>(null);
  const [adminNotesInput, setAdminNotesInput] = useState<string>('');
  const [isSubmittingAction, setIsSubmittingAction] = useState<boolean>(false);

  useEffect(() => {
    let isCancelled = false;

    async function fetchReportsOnStatusChange() {
      try {
        const res = await moderationService.fetchAdminReports({
          status: selectedStatus !== 'all' ? selectedStatus : undefined,
        });

        if (!isCancelled) {
          if (res.success && res.data?.reports && res.data.reports.length > 0) {
            setReports(res.data.reports);
          } else {
            const filtered = FALLBACK_REPORTS.filter((r) =>
              selectedStatus === 'all' ? true : r.status === selectedStatus
            );
            setReports(filtered);
          }
        }
      } catch {
        if (!isCancelled) {
          const filtered = FALLBACK_REPORTS.filter((r) =>
            selectedStatus === 'all' ? true : r.status === selectedStatus
          );
          setReports(filtered);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    }

    fetchReportsOnStatusChange();

    return () => {
      isCancelled = true;
    };
  }, [selectedStatus]);

  const refreshReports = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await moderationService.fetchAdminReports({
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
      });

      if (res.success && res.data?.reports && res.data.reports.length > 0) {
        setReports(res.data.reports);
      } else {
        const filtered = FALLBACK_REPORTS.filter((r) =>
          selectedStatus === 'all' ? true : r.status === selectedStatus
        );
        setReports(filtered);
      }
    } catch {
      const filtered = FALLBACK_REPORTS.filter((r) =>
        selectedStatus === 'all' ? true : r.status === selectedStatus
      );
      setReports(filtered);
    } finally {
      setIsRefreshing(false);
    }
  }, [selectedStatus]);

  const handleOpenDetail = (report: PropertyReportItem) => {
    setActiveReport(report);
    setAdminNotesInput(report.adminNotes || '');
  };

  const handleCloseDetail = () => {
    setActiveReport(null);
    setAdminNotesInput('');
  };

  const handleStatusChange = async (
    newStatus: ReportStatus,
    actionTakenType?: 'none' | 'listing_suspended' | 'details_corrected' | 'report_dismissed' | 'other'
  ) => {
    if (!activeReport) return;
    setIsSubmittingAction(true);
    try {
      const res = await moderationService.updateAdminReport(activeReport.id, {
        status: newStatus,
        adminNotes: adminNotesInput.trim() || undefined,
        actionTaken: actionTakenType,
      });

      if (res.success) {
        Alert.alert('Report Updated', `Report status changed to ${newStatus.replace('_', ' ')}.`);
        handleCloseDetail();
        refreshReports();
      } else {
        Alert.alert('Update Failed', res.error || 'Failed to update report.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Network error updating report.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleSuspendListing = () => {
    if (!activeReport) return;
    Alert.alert(
      'Suspend Property Listing',
      `Are you sure you want to suspend "${activeReport.propertyTitle}"? It will be immediately hidden from public discovery.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Suspend Listing',
          style: 'destructive',
          onPress: async () => {
            setIsSubmittingAction(true);
            try {
              const res = await moderationService.suspendPropertyListing(
                activeReport.propertyIdString,
                `Suspended due to report #${activeReport.id} (${activeReport.reasonLabel}): ${adminNotesInput.trim() || activeReport.description}`
              );

              if (res.success) {
                // Also update the report to under_review or resolved
                await moderationService.updateAdminReport(activeReport.id, {
                  status: 'under_review',
                  adminNotes: (adminNotesInput ? adminNotesInput + '\n' : '') + 'Listing suspended by admin.',
                  actionTaken: 'listing_suspended',
                });

                Alert.alert('Listing Suspended', 'The property has been suspended and hidden from public search.');
                handleCloseDetail();
                refreshReports();
              } else {
                Alert.alert('Suspension Failed', res.error || 'Failed to suspend listing.');
              }
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Error executing listing suspension.');
            } finally {
              setIsSubmittingAction(false);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case 'pending':
        return { bg: colors.warningSubtle, text: colors.secondaryDark, border: colors.warning };
      case 'under_review':
        return { bg: colors.primarySubtle, text: colors.primary, border: colors.borderGold };
      case 'resolved':
        return { bg: colors.successSubtle, text: colors.success, border: colors.success };
      case 'dismissed':
        return { bg: colors.surfaceMuted, text: colors.textMuted, border: colors.borderLight };
      default:
        return { bg: colors.surfaceMuted, text: colors.textSecondary, border: colors.borderLight };
    }
  };

  const renderReportItem = ({ item }: { item: PropertyReportItem }) => {
    const statusTheme = getStatusColor(item.status);
    const formattedDate = new Date(item.createdAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    return (
      <Pressable
        onPress={() => handleOpenDetail(item)}
        style={styles.cardPressable}
        accessible
        accessibilityRole="button"
        accessibilityLabel={`Report for ${item.propertyTitle}, status: ${item.status}`}
      >
        <AppCard variant="elevated" style={styles.reportCard}>
          <View style={styles.cardHeaderRow}>
            {/* Reason Badge */}
            <View style={styles.reasonBadge}>
              <AppIcon name="AlertTriangle" size="xs" color="error" />
              <AppText variant="caption" color="error" weight="700">
                {item.reasonLabel || REASON_LABELS[item.reason] || item.reason}
              </AppText>
            </View>

            {/* Status Pill */}
            <View
              style={[
                styles.statusPill,
                { backgroundColor: statusTheme.bg, borderColor: statusTheme.border },
              ]}
            >
              <AppText variant="caption" style={{ color: statusTheme.text, fontWeight: '700' }}>
                {item.status.replace('_', ' ').toUpperCase()}
              </AppText>
            </View>
          </View>

          {/* Property Title */}
          <AppText variant="h3" color="primary" numberOfLines={1} style={styles.propTitle}>
            {item.propertyTitle || `Property ID: ${item.propertyIdString}`}
          </AppText>

          {/* User Description Excerpt */}
          {item.description ? (
            <AppText
              variant="bodySmall"
              color="textSecondary"
              numberOfLines={2}
              style={styles.descText}
            >
              {`"${item.description}"`}
            </AppText>
          ) : null}

          <AppDivider spacing="xs" />

          {/* Footer Metadata */}
          <View style={styles.cardFooterRow}>
            <View style={styles.reporterMeta}>
              <AppIcon name="User" size="xs" color="textMuted" />
              <AppText variant="caption" color="textMuted">
                {item.reporter?.name || 'Customer'} • {formattedDate}
              </AppText>
            </View>

            <View style={styles.actionPromptRow}>
              <AppText variant="caption" color="secondary" weight="700">
                REVIEW REPORT
              </AppText>
              <AppIcon name="ChevronRight" size="xs" color="secondary" />
            </View>
          </View>
        </AppCard>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <AppHeader
        title="Moderation & Reports"
        subtitle="Listing Safety & Community Concerns"
        showBack
        onBackPress={() => router.back()}
      />

      {/* Filter Tabs */}
      <View style={styles.filterBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {STATUS_FILTERS.map((f) => {
            const isSelected = selectedStatus === f.value;
            return (
              <Pressable
                key={f.value}
                onPress={() => setSelectedStatus(f.value)}
                style={[
                  styles.filterChip,
                  isSelected ? styles.filterChipActive : null,
                ]}
                accessible
                accessibilityRole="button"
              >
                <AppText
                  variant="caption"
                  color={isSelected ? 'textOnGold' : 'textSecondary'}
                  weight={isSelected ? '700' : '600'}
                >
                  {f.label}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Content Area */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <AppLoader message="Loading moderation queue..." />
        </View>
      ) : reports.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <AppIcon name="CheckCircle" size="lg" color="success" />
          </View>
          <AppText variant="h3" color="primary" style={styles.emptyTitle}>
            No Reports Found
          </AppText>
          <AppText variant="bodySmall" color="textSecondary" align="center" style={styles.emptyDesc}>
            {selectedStatus === 'all'
              ? 'Great news! There are no flagged or reported listings pending moderation.'
              : `There are currently no reports marked as "${selectedStatus.replace('_', ' ')}".`}
          </AppText>
          <AppButton
            title="Refresh Queue"
            variant="outline"
            size="sm"
            onPress={refreshReports}
            style={{ marginTop: spacing.md }}
          />
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          renderItem={renderReportItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refreshReports}
              colors={[colors.secondary]}
              tintColor={colors.secondary}
            />
          }
        />
      )}

      {/* Report Review & Action Modal */}
      {activeReport && (
        <Modal
          visible={!!activeReport}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={handleCloseDetail}
        >
          <SafeAreaView style={styles.modalSafeArea} edges={['top', 'bottom']}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <AppText variant="h2" color="primary">
                  Report Investigation
                </AppText>
                <AppText variant="caption" color="textMuted">
                  Report ID: {activeReport.id}
                </AppText>
              </View>
              <Pressable onPress={handleCloseDetail} hitSlop={10} style={styles.closeBtn}>
                <AppIcon name="X" size="sm" color="textSecondary" />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll}>
              {/* Target Property Box */}
              <AppCard variant="elevated" style={styles.targetPropCard}>
                <View style={styles.propHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <AppText variant="caption" color="textMuted" weight="700">
                      TARGET PROPERTY
                    </AppText>
                    <AppText variant="h3" color="primary" style={styles.targetPropTitle}>
                      {activeReport.propertyTitle}
                    </AppText>
                    <AppText variant="caption" color="textSecondary">
                      Property ID: {activeReport.propertyIdString}
                    </AppText>
                  </View>
                  <AppButton
                    title="View Property"
                    variant="outline"
                    size="sm"
                    leftIcon={<AppIcon name="Eye" size="xs" color="primary" />}
                    onPress={() => {
                      handleCloseDetail();
                      router.push(`/property/${activeReport.propertyIdString}` as any);
                    }}
                  />
                </View>
              </AppCard>

              {/* Reporter & Concern Box */}
              <AppCard style={styles.concernCard}>
                <View style={styles.concernHeaderRow}>
                  <View style={styles.reasonBadgeLarge}>
                    <AppIcon name="AlertTriangle" size="xs" color="error" />
                    <AppText variant="bodySmall" color="error" weight="700">
                      {activeReport.reasonLabel || REASON_LABELS[activeReport.reason]}
                    </AppText>
                  </View>
                  <View
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor: getStatusColor(activeReport.status).bg,
                        borderColor: getStatusColor(activeReport.status).border,
                      },
                    ]}
                  >
                    <AppText
                      variant="caption"
                      style={{ color: getStatusColor(activeReport.status).text, fontWeight: '700' }}
                    >
                      {activeReport.status.replace('_', ' ').toUpperCase()}
                    </AppText>
                  </View>
                </View>

                <AppText variant="caption" color="textMuted" style={{ marginTop: spacing.xs }}>
                  Reported by: {activeReport.reporter?.name || 'Customer'} ({activeReport.reporter?.email || 'Email protected'})
                </AppText>
                {activeReport.reporter?.phone ? (
                  <AppText variant="caption" color="textMuted">
                    Phone: {activeReport.reporter.phone}
                  </AppText>
                ) : null}

                <AppDivider spacing="sm" />

                <AppText variant="bodySmall" color="textPrimary" weight="600">
                  User Concern Description:
                </AppText>
                <AppText variant="bodySmall" color="textSecondary" style={styles.userDescQuote}>
                  {activeReport.description || 'No additional text details provided.'}
                </AppText>
              </AppCard>

              {/* Internal Admin Audit Notes */}
              <View style={styles.adminNotesSection}>
                <View style={styles.notesHeaderRow}>
                  <AppIcon name="FileText" size="xs" color="primary" />
                  <AppText variant="bodySmall" color="primary" weight="700">
                    Internal Moderation Notes (Confidential)
                  </AppText>
                </View>
                <TextInput
                  value={adminNotesInput}
                  onChangeText={setAdminNotesInput}
                  placeholder="Record investigation notes, owner call summary, or legal checks..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={4}
                  style={styles.notesInput}
                  textAlignVertical="top"
                />
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <AppText variant="caption" color="textMuted" weight="700" style={styles.actionHeader}>
                  MODERATION ACTIONS
                </AppText>

                {/* Mark Under Review */}
                {activeReport.status === 'pending' && (
                  <AppButton
                    title="Mark as Under Review"
                    variant="outline"
                    size="md"
                    leftIcon={<AppIcon name="Clock" size="sm" color="primary" />}
                    loading={isSubmittingAction}
                    onPress={() => handleStatusChange('under_review', 'other')}
                    style={styles.actionBtn}
                  />
                )}

                {/* Suspend Property Listing */}
                <AppButton
                  title="Suspend Property Listing"
                  variant="outline"
                  size="md"
                  leftIcon={<AppIcon name="AlertCircle" size="sm" color="error" />}
                  loading={isSubmittingAction}
                  onPress={handleSuspendListing}
                  style={[styles.actionBtn, { borderColor: colors.error }]}
                  textStyle={{ color: colors.error }}
                />

                {/* Resolve Report */}
                <AppButton
                  title="Resolve Report"
                  variant="secondary"
                  size="md"
                  leftIcon={<AppIcon name="CheckCircle" size="sm" color="textOnGold" />}
                  loading={isSubmittingAction}
                  onPress={() =>
                    handleStatusChange('resolved', 'details_corrected')
                  }
                  style={styles.actionBtn}
                />

                {/* Dismiss Report */}
                <AppButton
                  title="Dismiss (No Violation Found)"
                  variant="ghost"
                  size="md"
                  leftIcon={<AppIcon name="X" size="sm" color="textMuted" />}
                  loading={isSubmittingAction}
                  onPress={() =>
                    handleStatusChange('dismissed', 'report_dismissed')
                  }
                  style={styles.actionBtn}
                />
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterBar: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingVertical: spacing.xs,
  },
  filterScroll: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    gap: spacing.xs,
  },
  filterChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  filterChipActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: layout.screenPaddingHorizontal * 2,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.successSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  emptyDesc: {
    lineHeight: 20,
  },
  listContent: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  cardPressable: {
    borderRadius: radius.md,
  },
  reportCard: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  reasonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.errorSubtle,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  statusPill: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.xs,
    borderWidth: 1,
  },
  propTitle: {
    marginBottom: 4,
  },
  descText: {
    fontStyle: 'italic',
    lineHeight: 18,
    marginVertical: 4,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  reporterMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionPromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  modalScroll: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  targetPropCard: {
    padding: spacing.md,
  },
  propHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  targetPropTitle: {
    marginTop: 2,
    marginBottom: 2,
  },
  concernCard: {
    padding: spacing.md,
  },
  concernHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reasonBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.errorSubtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  userDescQuote: {
    marginTop: 6,
    padding: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radius.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.secondary,
  },
  adminNotesSection: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  notesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.xs,
  },
  notesInput: {
    minHeight: 90,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.sm,
    fontSize: 14,
    color: colors.textPrimary,
  },
  modalActions: {
    gap: spacing.xs,
    paddingBottom: spacing.xl,
  },
  actionHeader: {
    marginBottom: spacing.xxs,
  },
  actionBtn: {
    marginVertical: 2,
  },
});
