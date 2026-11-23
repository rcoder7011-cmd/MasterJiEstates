/**
 * Report Property Modal — mobile/src/components/property/ReportPropertyModal.tsx
 *
 * Safe, mobile-friendly dialog allowing customers to report suspect,
 * inaccurate, or unavailable properties directly to the moderation queue.
 */

import React, { useState } from 'react';
import {
  View,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { AppText, AppButton, AppIcon, AppDivider } from '../ui';
import { colors } from '../../theme/colors';
import { spacing, layout } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { ReportReason } from '../../types/moderation';
import { submitPropertyReport } from '../../services/moderationService';
import { useTranslation } from '../../hooks/useTranslation';

interface ReportOption {
  id: ReportReason;
  label: string;
  icon: string;
  hint: string;
}

const REPORT_OPTIONS: ReportOption[] = [
  {
    id: 'fake_suspicious',
    label: 'Fake or Suspicious Property',
    icon: 'AlertTriangle',
    hint: 'Listing appears fraudulent, non-existent, or impersonated.',
  },
  {
    id: 'incorrect_price',
    label: 'Incorrect Price or Hidden Fees',
    icon: 'Tag',
    hint: 'Quoted price differs from listed value or undisclosed costs exist.',
  },
  {
    id: 'incorrect_info',
    label: 'Incorrect Details or Area',
    icon: 'Info',
    hint: 'BHK, bathrooms, square footage, or location is inaccurate.',
  },
  {
    id: 'duplicate_listing',
    label: 'Duplicate Property Listing',
    icon: 'Copy',
    hint: 'Identical home is already published multiple times on the portal.',
  },
  {
    id: 'misleading_images',
    label: 'Misleading or Unrelated Images',
    icon: 'Image',
    hint: 'Photographs do not belong to this specific physical home.',
  },
  {
    id: 'unavailable',
    label: 'Property No Longer Available',
    icon: 'X',
    hint: 'Listing is already sold, rented, or withdrawn by the owner.',
  },
  {
    id: 'other',
    label: 'Other Genuine Concern',
    icon: 'HelpCircle',
    hint: 'Other trust, safety, or legal compliance concerns.',
  },
];

interface ReportPropertyModalProps {
  visible: boolean;
  onClose: () => void;
  propertyId: string;
  propertyTitle: string;
}

export const ReportPropertyModal: React.FC<ReportPropertyModalProps> = ({
  visible,
  onClose,
  propertyId,
  propertyTitle,
}) => {
  const { t } = useTranslation();
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReset = () => {
    setSelectedReason(null);
    setDescription('');
    setIsSubmitting(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!selectedReason) {
      Alert.alert(
        t('moderation.reasonRequiredTitle', 'Reason Required'),
        t('moderation.reasonRequiredDesc', 'Please select why you are reporting this listing.')
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitPropertyReport(propertyId, {
        reason: selectedReason,
        description: description.trim(),
      });

      setIsSubmitting(false);

      if (result.success) {
        handleReset();
        onClose();
        Alert.alert(
          t('moderation.reportSuccessTitle', 'Report Submitted'),
          t(
            'moderation.reportSuccessDesc',
            'Thank you for keeping MJ Estates safe. Our moderation team will review this listing within 24 hours.'
          ),
          [{ text: t('common.close', 'Close') }]
        );
      } else {
        Alert.alert(
          t('common.error', 'Submission Failed'),
          result.error || 'Failed to submit report. Please try again.'
        );
      }
    } catch {
      setIsSubmitting(false);
      Alert.alert(
        t('common.error', 'Network Error'),
        'Unable to reach moderation services. Please check your connection.'
      );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleCol}>
              <View style={styles.headerBadge}>
                <AppIcon name="Shield" size="xs" color="secondary" />
                <AppText variant="caption" color="secondaryDark" weight="700">
                  TRUST & SAFETY
                </AppText>
              </View>
              <AppText variant="h3" color="primary">
                {t('moderation.reportTitle', 'Report Listing Concern')}
              </AppText>
              <AppText variant="caption" color="textSecondary" numberOfLines={1}>
                {propertyTitle}
              </AppText>
            </View>

            <Pressable
              onPress={handleClose}
              hitSlop={10}
              style={styles.closeBtn}
              accessible
              accessibilityLabel="Close report dialog"
            >
              <AppIcon name="X" size="sm" color="textMuted" />
            </Pressable>
          </View>

          <AppDivider spacing="sm" />

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Reason Selector */}
            <AppText variant="bodySmall" color="primary" weight="700" style={styles.sectionLabel}>
              {t('moderation.selectReason', 'What is the primary issue with this listing?')}
            </AppText>

            <View style={styles.reasonsList}>
              {REPORT_OPTIONS.map((option) => {
                const isSelected = selectedReason === option.id;
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => setSelectedReason(option.id)}
                    style={[
                      styles.reasonOption,
                      isSelected ? styles.reasonOptionSelected : null,
                    ]}
                    accessible
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <View style={styles.radioRow}>
                      <View
                        style={[
                          styles.radioCircle,
                          isSelected ? styles.radioCircleSelected : null,
                        ]}
                      >
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                      <View style={styles.optionTextCol}>
                        <AppText
                          variant="bodySmall"
                          color={isSelected ? 'primary' : 'textPrimary'}
                          weight={isSelected ? '700' : '600'}
                        >
                          {option.label}
                        </AppText>
                        <AppText variant="caption" color="textSecondary">
                          {option.hint}
                        </AppText>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {/* Optional Description */}
            <AppText variant="bodySmall" color="primary" weight="700" style={styles.sectionLabel}>
              {t('moderation.additionalDetails', 'Additional Details (Optional)')}
            </AppText>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder={t(
                'moderation.detailsPlaceholder',
                'Explain what you observed (e.g., visited the site and seller quoted different rent)...'
              )}
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
              maxLength={500}
              style={styles.textArea}
            />
            <AppText variant="caption" color="textMuted" style={styles.charCount}>
              {description.length}/500
            </AppText>

            {/* Privacy Guarantee Box */}
            <View style={styles.privacyBox}>
              <AppIcon name="Shield" size="xs" color="secondary" />
              <AppText variant="caption" color="textSecondary" style={styles.privacyText}>
                {t(
                  'moderation.privacyNotice',
                  'Your report is strictly private and reviewed only by certified MasterJi Estates administrators. Your identity is never revealed to property owners or public users.'
                )}
              </AppText>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <AppButton
              title={t('common.cancel', 'Cancel')}
              variant="outline"
              size="md"
              onPress={handleClose}
              disabled={isSubmitting}
              style={styles.actionBtnHalf}
            />
            <AppButton
              title={
                isSubmitting
                  ? t('common.submitting', 'Submitting...')
                  : t('moderation.submitReport', 'Submit Report')
              }
              variant="primary"
              size="md"
              loading={isSubmitting}
              onPress={handleSubmit}
              style={styles.actionBtnHalf}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '90%',
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitleCol: {
    flex: 1,
    marginRight: spacing.sm,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  closeBtn: {
    padding: 4,
  },
  scrollArea: {
    maxHeight: 440,
  },
  scrollContent: {
    paddingVertical: spacing.sm,
  },
  sectionLabel: {
    marginBottom: spacing.xs,
  },
  reasonsList: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  reasonOption: {
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  reasonOptionSelected: {
    borderColor: colors.secondary,
    backgroundColor: colors.secondarySubtle,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioCircleSelected: {
    borderColor: colors.secondary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.secondary,
  },
  optionTextCol: {
    flex: 1,
    gap: 2,
  },
  textArea: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    backgroundColor: colors.surfaceMuted,
    fontSize: 14,
    color: colors.textPrimary,
    textAlignVertical: 'top',
  },
  charCount: {
    textAlign: 'right',
    marginTop: 4,
    marginBottom: spacing.md,
  },
  privacyBox: {
    flexDirection: 'row',
    gap: spacing.xs,
    backgroundColor: colors.primarySubtle,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  privacyText: {
    flex: 1,
    lineHeight: 18,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionBtnHalf: {
    flex: 1,
  },
});
