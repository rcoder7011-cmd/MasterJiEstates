import React from 'react';
import { View, StyleSheet, Linking } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { AppText } from '../ui/AppText';
import { AppButton } from '../ui/AppButton';
import { AppIcon } from '../ui/AppIcon';
import { AppCard } from '../ui/AppCard';
import { AppDivider } from '../ui/AppDivider';
import { CONTACT_CONFIG } from '../../constants/propertyCategories';

export const QuickContact: React.FC = () => {
  const handleCall = () => {
    Linking.openURL(CONTACT_CONFIG.phoneTel).catch(() => {});
  };

  const handleWhatsApp = () => {
    Linking.openURL(CONTACT_CONFIG.whatsappUrl).catch(() => {});
  };

  return (
    <View style={styles.container}>
      <AppCard variant="goldAccent" style={styles.card}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.iconCircle}>
            <AppIcon name="Shield" size="md" color="secondary" />
          </View>
          <View style={styles.titleCol}>
            <View style={styles.badgeRow}>
              <View style={styles.verifiedBadge}>
                <AppText variant="caption" color="secondaryDark" weight="700">
                  DIRECT CONSULTATION
                </AppText>
              </View>
            </View>
            <AppText variant="h2" color="primary">
              Speak with MasterJiEstates
            </AppText>
          </View>
        </View>

        <AppText variant="bodySmall" color="textSecondary" style={styles.desc}>
          Have questions about market pricing, legal scrutiny, or escorted site visits? Connect with our central Noida office directly.
        </AppText>

        <AppDivider spacing="sm" color="borderGold" />

        {/* Action Buttons Row */}
        <View style={styles.buttonRow}>
          <AppButton
            title="Call Us"
            variant="primary"
            size="md"
            leftIcon={<AppIcon name="Phone" size="sm" color="textInverse" />}
            onPress={handleCall}
            style={styles.actionBtn}
          />

          <AppButton
            title="WhatsApp Us"
            variant="secondary"
            size="md"
            leftIcon={<AppIcon name="MessageCircle" size="sm" color="textOnGold" />}
            onPress={handleWhatsApp}
            style={styles.actionBtn}
          />
        </View>

        {/* Office Location Footer */}
        <View style={styles.locationFooter}>
          <AppIcon name="MapPin" size="xs" color="textMuted" />
          <AppText variant="caption" color="textMuted" style={styles.locationText}>
            {CONTACT_CONFIG.officeLocation} • {CONTACT_CONFIG.phoneDisplay}
          </AppText>
        </View>
      </AppCard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  card: {
    padding: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  titleCol: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  verifiedBadge: {
    backgroundColor: colors.secondarySubtle,
    borderWidth: 1,
    borderColor: colors.borderGold,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: radius.xs,
  },
  desc: {
    marginBottom: spacing.xs,
    lineHeight: 19,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  actionBtn: {
    flex: 1,
  },
  locationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: spacing.md,
    paddingTop: spacing.xs,
  },
  locationText: {
    fontSize: 11,
  },
});

