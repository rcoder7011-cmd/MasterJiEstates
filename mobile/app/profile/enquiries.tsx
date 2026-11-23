/**
 * My Consultations & Enquiries Screen — app/profile/enquiries.tsx
 * Displays customer's property enquiries, callback requests, and escorted site visit appointments.
 * Features tabs (All / Enquiries / Site Visits), live status tracking, visit cancellation, and details modal.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  Image,
  Alert,
  Modal,
  ScrollView,
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
import { useTranslation } from '../../src/hooks/useTranslation';
import { EnquiryRecord, SiteVisitRecord } from '../../src/types/enquiry';
import { formatIndianCurrency } from '../../src/utils/formatting';
import {
  fetchUserEnquiries,
  fetchUserSiteVisits,
  cancelUserSiteVisit,
} from '../../src/services/enquiryService';

type TabType = 'all' | 'enquiries' | 'visits';

interface ConsultationItem {
  id: string;
  type: 'enquiry' | 'visit';
  referenceCode: string;
  propertyId: string;
  propertyTitle: string;
  propertyLocation?: string;
  propertyPrice?: number;
  propertyImage?: string;
  status: string;
  date: string;
  createdAt?: string;
  enquiryRecord?: EnquiryRecord;
  visitRecord?: SiteVisitRecord;
}

export default function EnquiriesScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [siteVisits, setSiteVisits] = useState<SiteVisitRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<ConsultationItem | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [enqs, visits] = await Promise.all([
        fetchUserEnquiries(),
        fetchUserSiteVisits(),
      ]);
      setEnquiries(enqs);
      setSiteVisits(visits);
    } catch {
      // In offline / fallback mode, keep existing state
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function init() {
      setIsLoading(true);
      await loadData();
      if (isMounted) {
        setIsLoading(false);
      }
    }
    init();
    return () => {
      isMounted = false;
    };
  }, [loadData]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  }, [loadData]);

  // Combine and sort consultations newest-first
  const allConsultations: ConsultationItem[] = useMemo(() => {
    const list: ConsultationItem[] = [];

    enquiries.forEach((enq) => {
      list.push({
        id: `enq_${enq.id}`,
        type: 'enquiry',
        referenceCode: enq.referenceCode || `ENQ-${enq.id}`,
        propertyId: enq.propertyId,
        propertyTitle: enq.propertyTitle,
        propertyLocation: enq.propertyLocation,
        propertyPrice: enq.propertyPrice,
        propertyImage: enq.propertyImage,
        status: enq.status,
        date: enq.date,
        createdAt: enq.createdAt,
        enquiryRecord: enq,
      });
    });

    siteVisits.forEach((visit) => {
      list.push({
        id: `visit_${visit.id}`,
        type: 'visit',
        referenceCode: visit.bookingReference || `VISIT-${visit.id}`,
        propertyId: visit.propertyId,
        propertyTitle: visit.propertyTitle,
        propertyLocation: visit.propertyLocation,
        propertyPrice: visit.propertyPrice,
        propertyImage: visit.propertyImage,
        status: visit.status,
        date: visit.date,
        createdAt: visit.createdAt,
        visitRecord: visit,
      });
    });

    // Sort descending by creation date if available
    return list.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }, [enquiries, siteVisits]);

  // Filter consultations based on selected tab
  const displayedItems = useMemo(() => {
    if (activeTab === 'enquiries') {
      return allConsultations.filter((item) => item.type === 'enquiry');
    }
    if (activeTab === 'visits') {
      return allConsultations.filter((item) => item.type === 'visit');
    }
    return allConsultations;
  }, [allConsultations, activeTab]);

  // Cancellation handler for site visits
  const handleCancelVisit = (bookingRef: string, title: string) => {
    Alert.alert(
      t('consultations.cancelConfirmTitle', 'Cancel Site Visit'),
      `${t('consultations.cancelConfirmDesc', 'Are you sure you want to cancel this scheduled site visit request?')} (${title})`,
      [
        { text: t('common.cancel', 'No, Keep Visit'), style: 'cancel' },
        {
          text: t('consultations.cancelVisit', 'Yes, Cancel'),
          style: 'destructive',
          onPress: async () => {
            const res = await cancelUserSiteVisit(bookingRef);
            if (res.success) {
              Alert.alert(t('common.success', 'Cancelled'), t('consultations.cancelSuccess', 'Site visit request has been successfully cancelled.'));
              setSelectedItem(null);
              await loadData();
            } else {
              Alert.alert(t('common.error', 'Error'), res.error || 'Failed to cancel site visit.');
            }
          },
        },
      ]
    );
  };

  const getStatusBadgeConfig = (status: string, type: 'enquiry' | 'visit') => {
    const s = (status || '').toLowerCase();
    if (type === 'visit') {
      if (s === 'requested') {
        return {
          label: t('consultations.statusVisitRequested', 'Visit Requested (Pending)'),
          bgColor: colors.secondarySubtle,
          borderColor: colors.borderGold,
          textColor: colors.secondaryDark,
        };
      }
      if (s === 'confirmed') {
        return {
          label: t('consultations.statusVisitConfirmed', 'Visit Confirmed'),
          bgColor: colors.successSubtle,
          borderColor: colors.success,
          textColor: colors.success,
        };
      }
      if (s === 'completed') {
        return {
          label: t('consultations.statusCompleted', 'Completed'),
          bgColor: colors.successSubtle,
          borderColor: colors.success,
          textColor: colors.success,
        };
      }
      if (s === 'cancelled') {
        return {
          label: t('consultations.statusCancelled', 'Cancelled'),
          bgColor: colors.errorSubtle,
          borderColor: colors.error,
          textColor: colors.error,
        };
      }
    }

    // Enquiry status mappings
    if (s === 'contacted') {
      return {
        label: t('consultations.statusContacted', 'Contacted'),
        bgColor: colors.primarySubtle,
        borderColor: colors.primaryLight,
        textColor: colors.primary,
      };
    }
    if (s === 'under_review' || s === 'follow_up') {
      return {
        label: t('consultations.statusUnderReview', 'Under Review'),
        bgColor: colors.secondarySubtle,
        borderColor: colors.borderGold,
        textColor: colors.secondaryDark,
      };
    }
    if (s === 'completed' || s === 'converted') {
      return {
        label: t('consultations.statusCompleted', 'Completed'),
        bgColor: colors.successSubtle,
        borderColor: colors.success,
        textColor: colors.success,
      };
    }
    if (s === 'closed') {
      return {
        label: t('consultations.statusClosed', 'Closed'),
        bgColor: colors.surfaceMuted,
        borderColor: colors.border,
        textColor: colors.textSecondary,
      };
    }

    return {
      label: t('consultations.statusSubmitted', 'Submitted'),
      bgColor: '#EFF6FF',
      borderColor: '#BFDBFE',
      textColor: colors.primary,
    };
  };

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <Pressable
        style={[styles.tabBtn, activeTab === 'all' && styles.tabBtnActive]}
        onPress={() => setActiveTab('all')}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'all' }}
      >
        <AppText
          variant="caption"
          color={activeTab === 'all' ? 'textInverse' : 'textSecondary'}
          weight="700"
        >
          {t('consultations.allTab', 'All')} ({allConsultations.length})
        </AppText>
      </Pressable>

      <Pressable
        style={[styles.tabBtn, activeTab === 'enquiries' && styles.tabBtnActive]}
        onPress={() => setActiveTab('enquiries')}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'enquiries' }}
      >
        <AppText
          variant="caption"
          color={activeTab === 'enquiries' ? 'textInverse' : 'textSecondary'}
          weight="700"
        >
          {t('consultations.enquiriesTab', 'Enquiries')} ({enquiries.length})
        </AppText>
      </Pressable>

      <Pressable
        style={[styles.tabBtn, activeTab === 'visits' && styles.tabBtnActive]}
        onPress={() => setActiveTab('visits')}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'visits' }}
      >
        <AppText
          variant="caption"
          color={activeTab === 'visits' ? 'textInverse' : 'textSecondary'}
          weight="700"
        >
          {t('consultations.visitsTab', 'Site Visits')} ({siteVisits.length})
        </AppText>
      </Pressable>
    </View>
  );

  const renderEmptyState = () => {
    let emptyTitle = t('consultations.emptyAllTitle', 'No Consultations Yet');
    let emptyDesc = t(
      'consultations.emptyAllDesc',
      'When you submit an enquiry or request a site inspection, your records and status updates will appear here.'
    );

    if (activeTab === 'enquiries') {
      emptyTitle = t('consultations.emptyEnquiriesTitle', 'No Enquiries Found');
      emptyDesc = t(
        'consultations.emptyEnquiriesDesc',
        'Inquire about properties in Explore or Home to receive pricing consultations and advisor assistance.'
      );
    } else if (activeTab === 'visits') {
      emptyTitle = t('consultations.emptyVisitsTitle', 'No Site Visits Scheduled');
      emptyDesc = t(
        'consultations.emptyVisitsDesc',
        'Schedule escorted property inspections on any verified listing details screen.'
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <AppCard variant="default" style={styles.emptyCard}>
          <View style={styles.emptyIconCircle}>
            <AppIcon
              name={activeTab === 'visits' ? 'Compass' : 'MessageSquare'}
              size="lg"
              color="secondary"
            />
          </View>
          <AppText variant="h2" color="primary" align="center" style={styles.emptyTitle}>
            {emptyTitle}
          </AppText>
          <AppText variant="bodySmall" color="textSecondary" align="center" style={styles.emptyDesc}>
            {emptyDesc}
          </AppText>
          <AppButton
            title={t('common.browseAll', 'Browse Verified Properties')}
            variant="primary"
            size="md"
            leftIcon={<AppIcon name="Building" size="sm" color="textInverse" />}
            onPress={() => router.push('/explore')}
            style={styles.exploreBtn}
          />
        </AppCard>

        {/* Security & Advisory Reassurance Card */}
        <AppCard variant="goldAccent" style={styles.infoCard}>
          <View style={styles.infoTitleRow}>
            <AppIcon name="Shield" size="sm" color="secondary" />
            <AppText variant="caption" color="secondaryDark" weight="700">
              DIRECT MASTERJI ESTATES ASSISTANCE
            </AppText>
          </View>
          <AppDivider spacing="xs" color="borderGold" />
          <AppText variant="caption" color="textSecondary" style={styles.infoText}>
            {`• All property enquiries connect directly with our authorized consultation team.\n• Escorted site inspections are managed personally by verified staff.\n• We guarantee title deed review, RERA verification, and legal assistance.`}
          </AppText>
        </AppCard>
      </View>
    );
  };

  const renderItem = ({ item }: { item: ConsultationItem }) => {
    const isVisit = item.type === 'visit';
    const badge = getStatusBadgeConfig(item.status, item.type);
    const visitRecord = item.visitRecord;
    const isCancellable = isVisit && item.status.toLowerCase() === 'requested';

    return (
      <AppCard style={styles.consultationCard}>
        {/* Top Meta Bar */}
        <View style={styles.cardHeaderRow}>
          <View style={styles.typeBadge}>
            <AppIcon
              name={isVisit ? 'Compass' : 'Mail'}
              size="xs"
              color={isVisit ? 'secondaryDark' : 'primary'}
            />
            <AppText
              variant="caption"
              color={isVisit ? 'secondaryDark' : 'primary'}
              weight="700"
            >
              {isVisit ? 'SITE VISIT' : 'ENQUIRY'}
            </AppText>
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: badge.bgColor, borderColor: badge.borderColor },
            ]}
          >
            <AppText variant="caption" style={{ color: badge.textColor, fontWeight: '700' }}>
              {badge.label}
            </AppText>
          </View>
        </View>

        {/* Property Overview */}
        <View style={styles.propertyRow}>
          {item.propertyImage ? (
            <Image
              source={{ uri: item.propertyImage }}
              style={styles.propertyThumbnail}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.thumbnailFallback}>
              <AppIcon name="Building2" size="sm" color="textSecondary" />
            </View>
          )}

          <View style={styles.propertyInfoCol}>
            <AppText variant="h3" color="primary" numberOfLines={1}>
              {item.propertyTitle}
            </AppText>
            {item.propertyLocation ? (
              <AppText variant="caption" color="textSecondary" numberOfLines={1}>
                {item.propertyLocation}
              </AppText>
            ) : null}
            <AppText variant="bodySmall" color="secondaryDark" weight="800">
              {formatIndianCurrency(item.propertyPrice || 0)}
            </AppText>
          </View>
        </View>

        <AppDivider spacing="xs" />

        {/* Consultation Specific Details */}
        <View style={styles.detailsStrip}>
          <View style={styles.detailCol}>
            <AppText variant="caption" color="textSecondary" weight="600">
              {isVisit ? t('consultations.visitDate', 'Scheduled Date') : 'Submitted On'}
            </AppText>
            <AppText variant="bodySmall" color="textPrimary" weight="600">
              {isVisit && visitRecord ? visitRecord.preferredDate : item.date}
            </AppText>
          </View>

          {isVisit && visitRecord ? (
            <View style={styles.detailCol}>
              <AppText variant="caption" color="textSecondary" weight="600">
                {t('consultations.timeSlot', 'Slot')}
              </AppText>
              <AppText variant="bodySmall" color="textPrimary" weight="600" numberOfLines={1}>
                {visitRecord.preferredTimeSlot.split(' ')[0]}
              </AppText>
            </View>
          ) : (
            <View style={styles.detailCol}>
              <AppText variant="caption" color="textSecondary" weight="600">
                {t('consultations.referenceCode', 'Reference')}
              </AppText>
              <AppText variant="bodySmall" color="textPrimary" weight="600" numberOfLines={1}>
                {item.referenceCode}
              </AppText>
            </View>
          )}
        </View>

        {/* Card Action Buttons */}
        <View style={styles.cardActionsRow}>
          <AppButton
            title={t('common.viewProperty', 'View Property')}
            variant="outline"
            size="sm"
            onPress={() =>
              router.push({
                pathname: '/property/[id]',
                params: { id: item.propertyId },
              })
            }
            style={styles.cardActionBtn}
          />

          <AppButton
            title={t('consultations.detailsTitle', 'Details')}
            variant="secondary"
            size="sm"
            onPress={() => setSelectedItem(item)}
            style={styles.cardActionBtn}
          />

          {isCancellable ? (
            <AppButton
              title={t('common.cancel', 'Cancel')}
              variant="outline"
              size="sm"
              onPress={() => handleCancelVisit(item.referenceCode, item.propertyTitle)}
              style={styles.cancelActionBtn}
            />
          ) : null}
        </View>
      </AppCard>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <AppHeader
        title={t('consultations.title', 'My Consultations')}
        subtitle={t('consultations.subtitle', 'Enquiries & Site Visit Bookings')}
        showBack
        onBackPress={() => router.back()}
      />

      {renderTabs()}

      {isLoading && allConsultations.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.secondary} />
          <AppText variant="bodySmall" color="textSecondary" style={styles.loadingText}>
            {t('common.loading', 'Loading consultations...')}
          </AppText>
        </View>
      ) : (
        <FlatList
          data={displayedItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={renderEmptyState}
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
        />
      )}

      {/* Consultation Details Modal */}
      {selectedItem ? (
        <Modal
          visible={Boolean(selectedItem)}
          animationType="slide"
          transparent
          onRequestClose={() => setSelectedItem(null)}
        >
          <View style={styles.detailModalOverlay}>
            <View style={styles.detailSheet}>
              <View style={styles.sheetHeader}>
                <View style={styles.sheetHeaderLeft}>
                  <AppText variant="h2" color="primary">
                    {selectedItem.type === 'visit' ? 'Site Visit Details' : 'Enquiry Details'}
                  </AppText>
                  <AppText variant="caption" color="textSecondary">
                    Ref: {selectedItem.referenceCode}
                  </AppText>
                </View>
                <Pressable
                  style={styles.closeBtn}
                  onPress={() => setSelectedItem(null)}
                  hitSlop={8}
                >
                  <AppIcon name="X" size="sm" color="textSecondary" />
                </Pressable>
              </View>

              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                {/* Property Details */}
                <View style={styles.modalPropBox}>
                  <AppText variant="h3" color="primary">
                    {selectedItem.propertyTitle}
                  </AppText>
                  <AppText variant="caption" color="textSecondary">
                    {selectedItem.propertyLocation} • ID: #{selectedItem.propertyId}
                  </AppText>
                  <AppText variant="body" color="secondaryDark" weight="800" style={styles.modalPrice}>
                    {formatIndianCurrency(selectedItem.propertyPrice || 0)}
                  </AppText>
                </View>

                {/* Specifics */}
                {selectedItem.type === 'visit' && selectedItem.visitRecord ? (
                  <View style={styles.specSection}>
                    <View style={styles.modalSpecRow}>
                      <AppText variant="caption" color="textSecondary" weight="700">
                        SCHEDULED VISIT DATE:
                      </AppText>
                      <AppText variant="bodySmall" color="primary" weight="600">
                        {selectedItem.visitRecord.preferredDate}
                      </AppText>
                    </View>

                    <View style={styles.modalSpecRow}>
                      <AppText variant="caption" color="textSecondary" weight="700">
                        TIME SLOT:
                      </AppText>
                      <AppText variant="bodySmall" color="primary" weight="600">
                        {selectedItem.visitRecord.preferredTimeSlot}
                      </AppText>
                    </View>

                    {selectedItem.visitRecord.notes ? (
                      <View style={styles.modalNotesBox}>
                        <AppText variant="caption" color="textSecondary" weight="700">
                          VISIT NOTES:
                        </AppText>
                        <AppText variant="bodySmall" color="textPrimary">
                          {selectedItem.visitRecord.notes}
                        </AppText>
                      </View>
                    ) : null}
                  </View>
                ) : selectedItem.enquiryRecord ? (
                  <View style={styles.specSection}>
                    <View style={styles.modalSpecRow}>
                      <AppText variant="caption" color="textSecondary" weight="700">
                        ENQUIRY TYPE:
                      </AppText>
                      <AppText variant="bodySmall" color="primary" weight="600">
                        {(selectedItem.enquiryRecord.enquiryType || 'general').toUpperCase()}
                      </AppText>
                    </View>

                    {selectedItem.enquiryRecord.message ? (
                      <View style={styles.modalNotesBox}>
                        <AppText variant="caption" color="textSecondary" weight="700">
                          SUBMITTED MESSAGE:
                        </AppText>
                        <AppText variant="bodySmall" color="textPrimary">
                          {selectedItem.enquiryRecord.message}
                        </AppText>
                      </View>
                    ) : null}
                  </View>
                ) : null}

                {/* Advisor Assurance Notice */}
                <View style={styles.advisorCard}>
                  <AppIcon name="Shield" size="sm" color="secondary" />
                  <AppText variant="caption" color="textSecondary" style={styles.advisorCardText}>
                    Our certified Noida Sector 62A headquarters coordinates all client visits and consultations directly to ensure transparency and security.
                  </AppText>
                </View>

                {/* Close and Actions */}
                <View style={styles.modalBtnRow}>
                  {selectedItem.type === 'visit' &&
                  selectedItem.status.toLowerCase() === 'requested' ? (
                    <AppButton
                      title={t('consultations.cancelVisit', 'Cancel Visit Request')}
                      variant="outline"
                      size="md"
                      onPress={() =>
                        handleCancelVisit(selectedItem.referenceCode, selectedItem.propertyTitle)
                      }
                      style={styles.modalCancelBtn}
                    />
                  ) : null}
                  <AppButton
                    title={t('common.close', 'Close')}
                    variant="primary"
                    size="md"
                    onPress={() => setSelectedItem(null)}
                    style={styles.modalCloseBtn}
                  />
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: spacing.xs,
  },
  tabBtn: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.xs,
    backgroundColor: colors.surfaceMuted,
  },
  tabBtnActive: {
    backgroundColor: colors.primary,
  },
  listContent: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.md,
    flexGrow: 1,
  },
  consultationCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusBadge: {
    paddingHorizontal: spacing.xs + 4,
    paddingVertical: 2,
    borderRadius: radius.xs,
    borderWidth: 1,
  },
  propertyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  propertyThumbnail: {
    width: 60,
    height: 60,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumbnailFallback: {
    width: 60,
    height: 60,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  propertyInfoCol: {
    flex: 1,
  },
  detailsStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.xs,
  },
  detailCol: {
    flex: 1,
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  cardActionBtn: {
    flex: 1,
  },
  cancelActionBtn: {
    minWidth: 70,
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
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  emptyCard: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
  infoCard: {
    width: '100%',
    padding: spacing.md,
  },
  infoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    lineHeight: 18,
  },
  detailModalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  detailSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    maxHeight: '85%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sheetHeaderLeft: {
    flex: 1,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScroll: {
    maxHeight: 460,
  },
  modalPropBox: {
    backgroundColor: colors.primarySubtle,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  modalPrice: {
    marginTop: 4,
  },
  specSection: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  modalSpecRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalNotesBox: {
    backgroundColor: colors.surfaceMuted,
    padding: spacing.sm,
    borderRadius: radius.xs,
    marginTop: spacing.xs,
  },
  advisorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.secondarySubtle,
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderGold,
    marginVertical: spacing.sm,
  },
  advisorCardText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 15,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  modalCancelBtn: {
    flex: 1,
  },
  modalCloseBtn: {
    flex: 1,
  },
});
