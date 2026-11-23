/**
 * Trust Indicators & Verification Badges — mobile/src/components/property/TrustIndicators.tsx
 *
 * Displays grounded, verified trust credentials for properties.
 * Adheres strictly to Section 8: Never confuses listing approval with legal title verification.
 */

import React, { useState } from 'react';
import { View, Pressable, Modal, StyleSheet } from 'react-native';
import { AppText, AppIcon, AppDivider, AppButton } from '../ui';
import { colors } from '../../theme/colors';
import { spacing, layout } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { PropertyVerificationInfo } from '../../types/moderation';
import { useTranslation } from '../../hooks/useTranslation';

interface TrustIndicatorsProps {
  verification?: PropertyVerificationInfo;
  listingStatus?: string;
  onReportPress?: () => void;
}

export const TrustIndicators: React.FC<TrustIndicatorsProps> = ({
  verification,
  listingStatus = 'available',
  onReportPress,
}) => {
  const { t } = useTranslation();
  const [infoModalVisible, setInfoModalVisible] = useState(false);

  const badgeType = verification?.status === 'verified'
    ? (verification?.badge || 'listing_approved')
    : 'listing_approved';

  // Resolve verified badge details
  let badgeLabel = 'Listing Approved';
  let badgeIcon = 'CheckCircle';
  let badgeDesc = 'Approved by MJ Estates moderation team for catalog accuracy.';

  if (badgeType === 'documents_verified') {
    badgeLabel = 'Documents Verified';
    badgeIcon = 'ShieldCheck';
    badgeDesc = 'Electricity bill, tax receipt, or ownership papers reviewed by backoffice staff.';
  } else if (badgeType === 'details_reviewed') {
    badgeLabel = 'Property Details Reviewed';
    badgeIcon = 'Award';
    badgeDesc = 'Floor plan, carpet area, and specifications checked by advisory coordinators.';
  }

  return (
    <View style={styles.container}>
      {/* Trust Badges Card */}
      <View style={styles.badgeRow}>
        {/* Primary Approval / Verification Pill */}
        <View style={styles.primaryBadge}>
          <AppIcon name={badgeIcon as any} size="xs" color="secondaryDark" />
          <AppText variant="caption" color="secondaryDark" weight="700">
            {badgeLabel.toUpperCase()}
          </AppText>
        </View>

        {/* Physical Inspection Escorted Pill */}
        <View style={styles.secondaryBadge}>
          <AppIcon name="Shield" size="xs" color="primary" />
          <AppText variant="caption" color="primary" weight="700">
            ESCORTED INSPECTION
          </AppText>
        </View>

        {/* Info Explainer Trigger */}
        <Pressable
          onPress={() => setInfoModalVisible(true)}
          hitSlop={8}
          style={styles.infoBtn}
          accessible
          accessibilityLabel="Learn what MJ Estates verifies"
        >
          <AppIcon name="Info" size="xs" color="textMuted" />
        </Pressable>
      </View>

      {/* Advisory Disclosure Box */}
      <View style={styles.disclosureBox}>
        <AppText variant="caption" color="textSecondary" style={styles.disclosureText}>
          {badgeDesc}
        </AppText>
      </View>

      {/* Report Option Link */}
      {onReportPress && (
        <Pressable
          onPress={onReportPress}
          style={styles.reportRow}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Report an issue or concern with this listing"
        >
          <AppIcon name="AlertTriangle" size="xs" color="textMuted" />
          <AppText variant="caption" color="textSecondary" weight="600">
            {t('moderation.reportPrompt', 'Notice inaccurate pricing or suspect information?')}
          </AppText>
          <AppText variant="caption" color="secondaryDark" weight="700">
            {t('moderation.reportLink', 'Report Listing')}
          </AppText>
        </Pressable>
      )}

      {/* Explainer Modal */}
      <Modal
        visible={infoModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setInfoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderIcon}>
                <AppIcon name="Shield" size="md" color="secondary" />
              </View>
              <View style={styles.modalHeaderText}>
                <AppText variant="h3" color="primary">
                  Trust & Verification Standards
                </AppText>
                <AppText variant="caption" color="textSecondary">
                  How MJ Estates safeguards home seekers
                </AppText>
              </View>
            </View>

            <AppDivider spacing="sm" />

            <View style={styles.standardsList}>
              <View style={styles.standardItem}>
                <AppIcon name="CheckCircle" size="sm" color="success" />
                <View style={styles.standardTextCol}>
                  <AppText variant="bodySmall" color="primary" weight="700">
                    1. Listing Approval & Moderation
                  </AppText>
                  <AppText variant="caption" color="textSecondary">
                    Every listing is reviewed by human coordinators before publication to check pricing, photo authenticity, and contact authenticity.
                  </AppText>
                </View>
              </View>

              <View style={styles.standardItem}>
                <AppIcon name="Building2" size="sm" color="primary" />
                <View style={styles.standardTextCol}>
                  <AppText variant="bodySmall" color="primary" weight="700">
                    2. Physical Site Escort
                  </AppText>
                  <AppText variant="caption" color="textSecondary">
                    Physical inspections are personally accompanied by certified MasterJi Estates advisors from our Noida 62A headquarters.
                  </AppText>
                </View>
              </View>

              <View style={styles.standardItem}>
                <AppIcon name="FileText" size="sm" color="secondary" />
                <View style={styles.standardTextCol}>
                  <AppText variant="bodySmall" color="primary" weight="700">
                    3. Legal Due Diligence
                  </AppText>
                  <AppText variant="caption" color="textSecondary">
                    Formal title deed verification, encumbrance certificates, and registry audits are executed during the escrow advisory phase prior to any transaction.
                  </AppText>
                </View>
              </View>
            </View>

            <AppButton
              title="Understood"
              variant="primary"
              size="md"
              onPress={() => setInfoModalVisible(false)}
              style={styles.closeBtn}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  primaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.secondarySubtle,
    borderWidth: 1,
    borderColor: colors.borderGold,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  secondaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  infoBtn: {
    padding: 4,
  },
  disclosureBox: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    marginBottom: spacing.xs,
  },
  disclosureText: {
    lineHeight: 16,
  },
  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    padding: layout.screenPaddingHorizontal,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  modalHeaderIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeaderText: {
    flex: 1,
  },
  standardsList: {
    gap: spacing.md,
    marginVertical: spacing.md,
  },
  standardItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  standardTextCol: {
    flex: 1,
    gap: 2,
  },
  closeBtn: {
    marginTop: spacing.xs,
  },
});
