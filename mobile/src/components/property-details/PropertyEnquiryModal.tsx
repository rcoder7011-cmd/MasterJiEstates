/**
 * PropertyEnquiryModal Component — src/components/property-details/PropertyEnquiryModal.tsx
 * Modal bottom sheet for submitting property enquiries, requesting phone callbacks,
 * or asking for pricing and legal document verifications.
 */

import React, { useState } from 'react';
import {
  View,
  Modal,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { AppText } from '../ui/AppText';
import { AppIcon } from '../ui/AppIcon';
import { AppButton } from '../ui/AppButton';
import { AppInput } from '../ui/AppInput';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { PropertyItem } from '../../types/property';
import { EnquiryType } from '../../types/enquiry';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';
import { submitPropertyEnquiry } from '../../services/enquiryService';
import { validateIndianPhone, validateEmail } from '../../utils/validation';
import { formatIndianCurrency } from '../../utils/formatting';

export interface PropertyEnquiryModalProps {
  visible: boolean;
  property: PropertyItem;
  initialType?: EnquiryType;
  onClose: () => void;
  onSuccess?: (referenceCode?: string) => void;
}

const PropertyEnquiryModalContent: React.FC<PropertyEnquiryModalProps> = ({
  visible,
  property,
  initialType = 'general',
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const [enquiryType, setEnquiryType] = useState<EnquiryType>(initialType);
  const [name, setName] = useState<string>(() => user?.fullName || (user as any)?.name || '');
  const [phone, setPhone] = useState<string>(() => user?.phone || '');
  const [email, setEmail] = useState<string>(() => user?.email || '');
  const [message, setMessage] = useState<string>('');

  const [nameError, setNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    // Validate inputs
    let hasError = false;
    setNameError(null);
    setPhoneError(null);
    setEmailError(null);

    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setNameError(t('enquiryModal.fullNamePlaceholder', 'Full name is required (minimum 2 characters).'));
      hasError = true;
    }

    const phoneValidation = validateIndianPhone(phone);
    if (!phoneValidation.isValid) {
      setPhoneError(phoneValidation.error || 'Enter a valid 10-digit Indian mobile number.');
      hasError = true;
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || 'Enter a valid email address.');
      hasError = true;
    }

    if (hasError) return;

    setIsSubmitting(true);
    try {
      const result = await submitPropertyEnquiry({
        propertyId: property.id,
        propertyTitle: property.title,
        name: trimmedName,
        phone: phoneValidation.sanitizedValue!,
        email: emailValidation.sanitizedValue!,
        enquiryType,
        message: message.trim(),
      });

      if (result.success) {
        Alert.alert(
          t('enquiryModal.successTitle', 'Enquiry Received'),
          result.referenceCode
            ? `${t('enquiryModal.successDesc', 'Thank you! Your enquiry has been registered with MasterJi Estates. An advisor will contact you within 24 hours.')}\n\n${t('consultations.referenceCode', 'Reference Code')}: ${result.referenceCode}`
            : t('enquiryModal.successDesc', 'Thank you! Your enquiry has been registered with MasterJi Estates. An advisor will contact you within 24 hours.'),
          [
            {
              text: t('common.close', 'OK'),
              onPress: () => {
                onClose();
                onSuccess?.(result.referenceCode);
              },
            },
          ]
        );
      } else {
        Alert.alert(t('common.error', 'Submission Failed'), result.error || 'Unable to submit enquiry.');
      }
    } catch {
      Alert.alert(t('common.error', 'Network Error'), 'Unable to connect to MasterJi Estates server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const typeOptions: { id: EnquiryType; label: string; icon: any }[] = [
    { id: 'general', label: t('enquiryModal.typeGeneral', 'General Info'), icon: 'Info' },
    { id: 'callback', label: t('enquiryModal.typeCallback', 'Request Callback'), icon: 'Phone' },
    { id: 'price_discussion', label: t('enquiryModal.typePrice', 'Pricing & Offers'), icon: 'Tag' },
    { id: 'legal_docs', label: t('enquiryModal.typeLegal', 'Legal & RERA'), icon: 'FileText' },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheetContainer}>
          {/* Header Row */}
          <View style={styles.sheetHeader}>
            <View style={styles.sheetHeaderLeft}>
              <AppText variant="h2" color="primary">
                {t('enquiryModal.title', 'Property Enquiry')}
              </AppText>
              <AppText variant="caption" color="textSecondary">
                {t('enquiryModal.subtitle', 'Connect with a certified MasterJi advisor')}
              </AppText>
            </View>
            <Pressable
              style={styles.closeBtn}
              onPress={onClose}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Close enquiry form"
            >
              <AppIcon name="X" size="sm" color="textSecondary" />
            </Pressable>
          </View>

          {/* Property Summary Strip */}
          <View style={styles.propertyStrip}>
            <View style={styles.propertyStripInfo}>
              <AppText variant="bodySmall" color="primary" weight="700" numberOfLines={1}>
                {property.title}
              </AppText>
              <AppText variant="caption" color="textSecondary" numberOfLines={1}>
                {property.locality}, {property.city} • ID: #{property.id}
              </AppText>
            </View>
            <AppText variant="bodySmall" color="secondaryDark" weight="800">
              {formatIndianCurrency(property.price)}
            </AppText>
          </View>

          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            {/* Enquiry Type Selector */}
            <AppText variant="caption" color="textSecondary" weight="700" style={styles.fieldLabel}>
              {t('enquiryModal.enquiryType', 'ENQUIRY REASON')}
            </AppText>
            <View style={styles.typeSelectorRow}>
              {typeOptions.map((opt) => {
                const isSelected = enquiryType === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    style={[styles.typePill, isSelected && styles.typePillSelected]}
                    onPress={() => setEnquiryType(opt.id)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <AppIcon
                      name={opt.icon}
                      size="xs"
                      color={isSelected ? 'textInverse' : 'textSecondary'}
                    />
                    <AppText
                      variant="caption"
                      color={isSelected ? 'textInverse' : 'textPrimary'}
                      weight={isSelected ? '700' : '500'}
                    >
                      {opt.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>

            {/* Customer Information Inputs */}
            <AppInput
              label={t('enquiryModal.fullName', 'Your Full Name')}
              value={name}
              onChangeText={setName}
              placeholder={t('enquiryModal.fullNamePlaceholder', 'Enter your name')}
              error={nameError || undefined}
              leftIcon={<AppIcon name="User" size="sm" color="textSecondary" />}
            />

            <AppInput
              label={t('enquiryModal.phone', 'Mobile Number')}
              value={phone}
              onChangeText={setPhone}
              placeholder={t('enquiryModal.phonePlaceholder', '10-digit mobile number')}
              keyboardType="phone-pad"
              maxLength={10}
              error={phoneError || undefined}
              leftIcon={<AppIcon name="Phone" size="sm" color="textSecondary" />}
            />

            <AppInput
              label={t('enquiryModal.email', 'Email Address')}
              value={email}
              onChangeText={setEmail}
              placeholder={t('enquiryModal.emailPlaceholder', 'Enter your email address')}
              keyboardType="email-address"
              autoCapitalize="none"
              error={emailError || undefined}
              leftIcon={<AppIcon name="Mail" size="sm" color="textSecondary" />}
            />

            <AppInput
              label={t('enquiryModal.message', 'Message (Optional)')}
              value={message}
              onChangeText={setMessage}
              placeholder={t(
                'enquiryModal.messagePlaceholder',
                'Any specific questions regarding floor, facing, or payment plan...'
              )}
              multiline
              numberOfLines={3}
            />

            {/* Privacy Reassurance Note */}
            <View style={styles.privacyBox}>
              <AppIcon name="Shield" size="xs" color="secondary" />
              <AppText variant="caption" color="textSecondary" style={styles.privacyText}>
                {t(
                  'enquiryModal.privacyNote',
                  'Your contact information is strictly confidential and shared only with verified MasterJi Estates advisors.'
                )}
              </AppText>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <AppButton
                title={t('common.cancel', 'Cancel')}
                variant="outline"
                size="md"
                onPress={onClose}
                disabled={isSubmitting}
                style={styles.cancelBtn}
              />
              <AppButton
                title={
                  isSubmitting
                    ? t('enquiryModal.submitting', 'Submitting...')
                    : t('enquiryModal.submitBtn', 'Send Enquiry')
                }
                variant="primary"
                size="md"
                loading={isSubmitting}
                onPress={handleSubmit}
                style={styles.submitBtn}
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export const PropertyEnquiryModal: React.FC<PropertyEnquiryModalProps> = (props) => {
  if (!props.visible) return null;
  return <PropertyEnquiryModalContent {...props} />;
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? spacing.xxl : spacing.lg,
    maxHeight: '90%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
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
  propertyStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  propertyStripInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  formScroll: {
    maxHeight: 520,
  },
  fieldLabel: {
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typePillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  privacyBox: {
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
  privacyText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 15,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  cancelBtn: {
    flex: 1,
  },
  submitBtn: {
    flex: 2,
  },
});
