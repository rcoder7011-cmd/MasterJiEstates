/**
 * PropertyVisitModal Component — src/components/property-details/PropertyVisitModal.tsx
 * Modal bottom sheet for scheduling escorted physical on-site inspections.
 * Enforces future dates (next 14-30 days), time slot preference, and clear pending status.
 */

import React, { useState, useMemo } from 'react';
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
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';
import { schedulePropertyVisit } from '../../services/enquiryService';
import { validateIndianPhone, validateEmail } from '../../utils/validation';
import { formatIndianCurrency } from '../../utils/formatting';

export interface PropertyVisitModalProps {
  visible: boolean;
  property: PropertyItem;
  onClose: () => void;
  onSuccess?: (bookingReference?: string) => void;
}

const PropertyVisitModalContent: React.FC<PropertyVisitModalProps> = ({
  visible,
  property,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { t } = useTranslation();

  // Generate next 14 days starting from tomorrow (strictly preventing past dates)
  const availableDates = useMemo(() => {
    const list: { fullDate: string; dayName: string; dayNum: number; monthName: string }[] = [];
    const base = new Date();
    for (let i = 1; i <= 14; i++) {
      const d = new Date(base.getTime() + i * 24 * 60 * 60 * 1000);
      const isoDate = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-IN', { weekday: 'short' });
      const dayNum = d.getDate();
      const monthName = d.toLocaleDateString('en-IN', { month: 'short' });
      list.push({ fullDate: isoDate, dayName, dayNum, monthName });
    }
    return list;
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(() => availableDates[0]?.fullDate || '');
  const [selectedSlot, setSelectedSlot] = useState<string>('Morning (10:00 AM - 01:00 PM)');
  const [name, setName] = useState<string>(() => user?.fullName || (user as any)?.name || '');
  const [phone, setPhone] = useState<string>(() => user?.phone || '');
  const [email, setEmail] = useState<string>(() => user?.email || '');
  const [notes, setNotes] = useState<string>('');

  const [nameError, setNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timeSlots = [
    { id: 'Morning (10:00 AM - 01:00 PM)', label: t('visitModal.slotMorning', 'Morning (10:00 AM - 01:00 PM)'), icon: 'Sun' },
    { id: 'Afternoon (01:00 PM - 04:00 PM)', label: t('visitModal.slotAfternoon', 'Afternoon (01:00 PM - 04:00 PM)'), icon: 'Sun' },
    { id: 'Evening (04:00 PM - 07:00 PM)', label: t('visitModal.slotEvening', 'Evening (04:00 PM - 07:00 PM)'), icon: 'Moon' },
  ];

  const handleSubmit = async () => {
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
      const result = await schedulePropertyVisit({
        propertyId: property.id,
        propertyTitle: property.title,
        name: trimmedName,
        phone: phoneValidation.sanitizedValue!,
        email: emailValidation.sanitizedValue!,
        preferredDate: selectedDate,
        preferredTimeSlot: selectedSlot,
        notes: notes.trim(),
      });

      if (result.success) {
        Alert.alert(
          t('visitModal.successTitle', 'Visit Request Received'),
          result.bookingReference
            ? `${t('visitModal.successDesc', 'Your site visit request has been recorded as Pending. A MasterJi Estates coordinator will contact you to confirm the appointment and arrange the escorted entry.')}\n\n${t('consultations.bookingRef', 'Booking Reference')}: ${result.bookingReference}`
            : t('visitModal.successDesc', 'Your site visit request has been recorded as Pending. A MasterJi Estates coordinator will contact you to confirm the appointment and arrange the escorted entry.'),
          [
            {
              text: t('common.close', 'OK'),
              onPress: () => {
                onClose();
                onSuccess?.(result.bookingReference);
              },
            },
          ]
        );
      } else {
        Alert.alert(t('common.error', 'Scheduling Failed'), result.error || 'Unable to schedule site visit.');
      }
    } catch {
      Alert.alert(t('common.error', 'Network Error'), 'Unable to connect to MasterJi Estates server.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
                {t('visitModal.title', 'Request a Property Visit')}
              </AppText>
              <AppText variant="caption" color="textSecondary">
                {t('visitModal.subtitle', 'Escorted on-site inspection with MasterJi advisor')}
              </AppText>
            </View>
            <Pressable
              style={styles.closeBtn}
              onPress={onClose}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Close visit request form"
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
            {/* Preferred Date Selector (Horizontal Date Strip) */}
            <AppText variant="caption" color="textSecondary" weight="700" style={styles.fieldLabel}>
              {t('visitModal.selectDate', 'PREFERRED VISIT DATE')}
            </AppText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
              {availableDates.map((item) => {
                const isSelected = selectedDate === item.fullDate;
                return (
                  <Pressable
                    key={item.fullDate}
                    style={[styles.dateCard, isSelected && styles.dateCardSelected]}
                    onPress={() => setSelectedDate(item.fullDate)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <AppText
                      variant="caption"
                      color={isSelected ? 'textInverse' : 'textSecondary'}
                      weight="600"
                    >
                      {item.dayName}
                    </AppText>
                    <AppText
                      variant="h2"
                      color={isSelected ? 'textInverse' : 'primary'}
                      weight="800"
                      style={styles.dateNum}
                    >
                      {item.dayNum}
                    </AppText>
                    <AppText
                      variant="caption"
                      color={isSelected ? 'textInverse' : 'textSecondary'}
                    >
                      {item.monthName}
                    </AppText>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Time Slot Preference */}
            <AppText variant="caption" color="textSecondary" weight="700" style={styles.fieldLabel}>
              {t('visitModal.selectTime', 'PREFERRED TIME SLOT')}
            </AppText>
            <View style={styles.slotsCol}>
              {timeSlots.map((slot) => {
                const isSelected = selectedSlot === slot.id;
                return (
                  <Pressable
                    key={slot.id}
                    style={[styles.slotItem, isSelected && styles.slotItemSelected]}
                    onPress={() => setSelectedSlot(slot.id)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <View style={[styles.slotRadio, isSelected && styles.slotRadioSelected]} />
                    <AppText
                      variant="bodySmall"
                      color={isSelected ? 'primary' : 'textPrimary'}
                      weight={isSelected ? '700' : '500'}
                    >
                      {slot.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>

            {/* Customer Contact Details */}
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
              label={t('visitModal.notes', 'Visit Notes / Instructions (Optional)')}
              value={notes}
              onChangeText={setNotes}
              placeholder={t(
                'visitModal.notesPlaceholder',
                'E.g., requesting visitor parking pass or family accompanying...'
              )}
              multiline
              numberOfLines={2}
            />

            {/* Pending Notice Advisory */}
            <View style={styles.noticeBox}>
              <AppIcon name="Compass" size="xs" color="secondary" />
              <AppText variant="caption" color="textSecondary" style={styles.noticeText}>
                {t(
                  'visitModal.pendingNotice',
                  'All physical site inspections are escorted directly by MasterJi Estates certified staff.'
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
                    ? t('visitModal.submitting', 'Scheduling...')
                    : t('visitModal.submitBtn', 'Submit Visit Request')
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

export const PropertyVisitModal: React.FC<PropertyVisitModalProps> = (props) => {
  if (!props.visible) return null;
  return <PropertyVisitModalContent {...props} />;
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
  dateScroll: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  dateCard: {
    width: 60,
    height: 74,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateCardSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dateNum: {
    fontSize: 18,
    marginVertical: 1,
  },
  slotsCol: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  slotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  slotItemSelected: {
    backgroundColor: colors.secondarySubtle,
    borderColor: colors.borderGold,
  },
  slotRadio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.textSecondary,
  },
  slotRadioSelected: {
    borderColor: colors.secondaryDark,
    backgroundColor: colors.secondary,
  },
  noticeBox: {
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
  noticeText: {
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
