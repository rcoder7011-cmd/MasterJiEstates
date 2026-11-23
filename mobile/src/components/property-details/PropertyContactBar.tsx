/**
 * PropertyContactBar Component — src/components/property-details/PropertyContactBar.tsx
 * Fixed bottom action bar with 1-tap Phone dialing, contextual WhatsApp inquiry,
 * Smart Property Enquiry modal, and Escorted Site Visit scheduling.
 */

import React, { useState } from 'react';
import { View, StyleSheet, Linking, Alert, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { AppText } from '../ui/AppText';
import { AppIcon } from '../ui/AppIcon';
import { AppButton } from '../ui/AppButton';
import { PropertyItem } from '../../types/property';
import { OFFICIAL_CONTACT } from '../../constants/contact';
import { formatIndianCurrency } from '../../utils/formatting';
import { useTranslation } from '../../hooks/useTranslation';
import { PropertyEnquiryModal } from './PropertyEnquiryModal';
import { PropertyVisitModal } from './PropertyVisitModal';

export interface PropertyContactBarProps {
  property: PropertyItem;
  onEnquirySuccess?: (referenceCode?: string) => void;
  onVisitSuccess?: (bookingReference?: string) => void;
}

export const PropertyContactBar: React.FC<PropertyContactBarProps> = ({
  property,
  onEnquirySuccess,
  onVisitSuccess,
}) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const [isEnquiryModalVisible, setIsEnquiryModalVisible] = useState(false);
  const [isVisitModalVisible, setIsVisitModalVisible] = useState(false);

  const isRental = property.transaction === 'rent';
  const formattedPrice = isRental
    ? `${formatIndianCurrency(property.price)}/mo`
    : formatIndianCurrency(property.price);

  const handleCall = () => {
    // 1-tap phone dialing via official phoneTel: tel:+919990316186
    const phoneTel = OFFICIAL_CONTACT.CALL_TEL;
    Linking.openURL(phoneTel).catch(() => {
      Alert.alert(
        'Call Failed',
        `Unable to open phone dialer on this device. Please dial: ${OFFICIAL_CONTACT.CALL_DISPLAY}`
      );
    });
  };

  const handleWhatsApp = () => {
    // Pre-populates contextual WhatsApp inquiry with property.id and title to 917011202089
    const contextualMessage = `Hello MasterJi Estates, I am interested in inquiring about "${property.title}" (Property ID: ${property.id}). Please connect me with an authorized advisor.`;
    const whatsappUrl = `https://wa.me/${OFFICIAL_CONTACT.WHATSAPP_RAW}?text=${encodeURIComponent(
      contextualMessage
    )}`;

    Linking.openURL(whatsappUrl).catch(() => {
      Alert.alert(
        'WhatsApp Failed',
        `Unable to launch WhatsApp on this device. Please message: ${OFFICIAL_CONTACT.WHATSAPP_DISPLAY}`
      );
    });
  };

  const handleEnquiry = () => {
    setIsEnquiryModalVisible(true);
  };

  const handleVisit = () => {
    setIsVisitModalVisible(true);
  };

  return (
    <>
      <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        {/* Price Mini Column */}
        <View style={styles.priceCol}>
          <AppText variant="caption" color="textSecondary" weight="600">
            {property.transaction === 'rent'
              ? t('propertyDetails.monthlyRent', 'Monthly Rent')
              : t('propertyDetails.totalPrice', 'Price')}
          </AppText>
          <AppText variant="h2" color="primary" numberOfLines={1} style={styles.priceText}>
            {formattedPrice}
          </AppText>
        </View>

        {/* Action Buttons Row */}
        <View style={styles.buttonsRow}>
          {/* Quick Call Icon Button */}
          <Pressable
            style={styles.iconCircleBtn}
            onPress={handleCall}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={t('propertyDetails.callAdvisor', 'Call MasterJi advisor')}
          >
            <AppIcon name="Phone" size="sm" color="primary" />
          </Pressable>

          {/* WhatsApp Icon Button */}
          <Pressable
            style={[styles.iconCircleBtn, styles.waCircleBtn]}
            onPress={handleWhatsApp}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={t('propertyDetails.whatsappAdvisor', 'Message on WhatsApp')}
          >
            <AppIcon name="MessageCircle" size="sm" color="secondaryDark" />
          </Pressable>

          {/* Send Enquiry Button */}
          <AppButton
            title={t('propertyDetails.sendEnquiry', 'Enquiry')}
            variant="outline"
            size="sm"
            leftIcon={<AppIcon name="Mail" size="xs" color="primary" />}
            onPress={handleEnquiry}
            style={styles.enquiryBtn}
          />

          {/* Schedule Visit Button */}
          <AppButton
            title={t('propertyDetails.scheduleVisit', 'Visit')}
            variant="primary"
            size="sm"
            leftIcon={<AppIcon name="Compass" size="xs" color="textInverse" />}
            onPress={handleVisit}
            style={styles.visitBtn}
          />
        </View>
      </View>

      {/* Property Enquiry Modal */}
      <PropertyEnquiryModal
        visible={isEnquiryModalVisible}
        property={property}
        onClose={() => setIsEnquiryModalVisible(false)}
        onSuccess={onEnquirySuccess}
      />

      {/* Property Visit Request Modal */}
      <PropertyVisitModal
        visible={isVisitModalVisible}
        property={property}
        onClose={() => setIsVisitModalVisible(false)}
        onSuccess={onVisitSuccess}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  priceCol: {
    flex: 1,
    marginRight: spacing.xs,
  },
  priceText: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waCircleBtn: {
    backgroundColor: colors.secondarySubtle,
    borderColor: colors.borderGold,
  },
  enquiryBtn: {
    minWidth: 80,
    height: 38,
    paddingHorizontal: spacing.xs,
  },
  visitBtn: {
    minWidth: 78,
    height: 38,
    paddingHorizontal: spacing.xs,
  },
});
