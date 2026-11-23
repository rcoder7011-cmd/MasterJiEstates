import React from 'react';
import { View, Pressable, StyleSheet, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { AppText } from '../ui/AppText';
import { AppIcon } from '../ui/AppIcon';
import { CONTACT_CONFIG } from '../../constants/propertyCategories';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';

export const PropertyCategories: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

  const handleBuyPress = () => {
    router.push({
      pathname: '/explore',
      params: { intent: 'buy', transaction: 'buy' },
    });
  };

  const handleRentPress = () => {
    router.push({
      pathname: '/explore',
      params: { intent: 'rent', transaction: 'rent' },
    });
  };

  const handleSellPress = () => {
    if (isAuthenticated) {
      router.push('/property/create');
    } else {
      router.push({
        pathname: '/auth/login',
        params: { redirect: '/property/create' },
      });
    }
  };

  const handleDirectConsultation = () => {
    Alert.alert(
      t('home.directConsultationTitle', 'Speak to Property Advisor'),
      t(
        'home.directConsultationDesc',
        'Would you like to connect directly with an authorized MasterJiEstates advisor for dedicated consultation?'
      ),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('home.whatsappAdvisor', 'WhatsApp Advisor'),
          onPress: () => Linking.openURL(CONTACT_CONFIG.whatsappUrl).catch(() => {}),
        },
        {
          text: t('home.callUs', 'Call Us'),
          onPress: () => Linking.openURL(CONTACT_CONFIG.phoneTel).catch(() => {}),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <AppText variant="caption" color="textGold" weight="700" style={styles.sectionEyebrow}>
            PRIMARY ACTIONS
          </AppText>
          <AppText variant="h2" color="primary" style={styles.sectionTitle}>
            How Can We Assist You?
          </AppText>
        </View>

        <Pressable
          onPress={handleDirectConsultation}
          style={({ pressed }) => [styles.advisoryPill, pressed ? styles.advisoryPillPressed : null]}
          accessibilityRole="button"
          accessibilityLabel="Direct advisory consultation"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <AppIcon name="PhoneCall" size="xs" color="secondaryDark" />
          <AppText variant="caption" color="secondaryDark" weight="700">
            {t('home.advisory', 'Advisory')}
          </AppText>
        </Pressable>
      </View>

      {/* 3 Prominent Primary Action Cards: Buy, Rent, Sell */}
      <View style={styles.cardsRow}>
        {/* 1. Buy Card */}
        <Pressable
          onPress={handleBuyPress}
          accessible
          accessibilityRole="button"
          accessibilityLabel={`${t('home.buyTitle', 'Buy Property')} - ${t('home.buySubtitle', 'Explore verified homes & luxury plots')}`}
          style={({ pressed }) => [
            styles.card,
            styles.buyCard,
            pressed ? styles.cardPressed : null,
          ]}
        >
          <View style={[styles.iconWrap, styles.buyIconWrap]}>
            <AppIcon name="Key" size="md" color="primary" />
          </View>
          <AppText variant="h3" color="primary" style={styles.cardHeading}>
            {t('home.buyTitle', 'Buy Property')}
          </AppText>
          <AppText variant="caption" color="textSecondary" style={styles.cardSubtitle}>
            {t('home.buySubtitle', 'Explore verified homes & luxury plots')}
          </AppText>
          <View style={styles.cardActionRow}>
            <AppText variant="caption" color="primary" weight="700">
              {t('common.search', 'Explore')}
            </AppText>
            <AppIcon name="ArrowRight" size="xs" color="primary" />
          </View>
        </Pressable>

        {/* 2. Rent Card */}
        <Pressable
          onPress={handleRentPress}
          accessible
          accessibilityRole="button"
          accessibilityLabel={`${t('home.rentTitle', 'Rent Property')} - ${t('home.rentSubtitle', 'Browse premium apartments & commercial spaces')}`}
          style={({ pressed }) => [
            styles.card,
            styles.rentCard,
            pressed ? styles.cardPressed : null,
          ]}
        >
          <View style={[styles.iconWrap, styles.rentIconWrap]}>
            <AppIcon name="Tag" size="md" color="secondaryDark" />
          </View>
          <AppText variant="h3" color="primary" style={styles.cardHeading}>
            {t('home.rentTitle', 'Rent Property')}
          </AppText>
          <AppText variant="caption" color="textSecondary" style={styles.cardSubtitle}>
            {t('home.rentSubtitle', 'Browse premium apartments & commercial spaces')}
          </AppText>
          <View style={styles.cardActionRow}>
            <AppText variant="caption" color="secondaryDark" weight="700">
              {t('common.search', 'Explore')}
            </AppText>
            <AppIcon name="ArrowRight" size="xs" color="secondaryDark" />
          </View>
        </Pressable>
      </View>

      {/* 3. Sell Card (Full-width prominent banner card) */}
      <Pressable
        onPress={handleSellPress}
        accessible
        accessibilityRole="button"
        accessibilityLabel={`${t('home.sellTitle', 'Sell Property')} - ${t('home.sellSubtitle', 'List your property with trusted MJ Estates advisors')}`}
        style={({ pressed }) => [
          styles.sellBannerCard,
          pressed ? styles.cardPressed : null,
        ]}
      >
        <View style={styles.sellLeftContent}>
          <View style={styles.sellHeaderRow}>
            <View style={[styles.iconWrap, styles.sellIconWrap]}>
              <AppIcon name="Briefcase" size="md" color="primary" />
            </View>
            <View style={styles.sellBadge}>
              <AppText variant="caption" color="textInverse" weight="700" style={styles.sellBadgeText}>
                LIST WITH US
              </AppText>
            </View>
          </View>
          <AppText variant="h3" color="primary" style={styles.sellCardHeading}>
            {t('home.sellTitle', 'Sell / List Property')}
          </AppText>
          <AppText variant="caption" color="textSecondary" style={styles.sellCardSubtitle}>
            {t('home.sellSubtitle', 'List your property with trusted MJ Estates advisors for maximum market reach')}
          </AppText>
        </View>
        <View style={styles.sellActionBtn}>
          <AppText variant="caption" color="textInverse" weight="700">
            {t('common.viewProperty', 'List Now')}
          </AppText>
          <AppIcon name="ArrowRight" size="xs" color="textInverse" />
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  sectionEyebrow: {
    letterSpacing: 1,
    marginBottom: 2,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
  },
  advisoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    backgroundColor: colors.secondarySubtle,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderGold,
    marginTop: 4,
  },
  advisoryPillPressed: {
    opacity: 0.8,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'space-between',
  },
  buyCard: {
    backgroundColor: '#FAFBFD',
  },
  rentCard: {
    backgroundColor: '#FFFCF7',
    borderColor: colors.borderGold,
  },
  cardPressed: {
    backgroundColor: colors.surfaceMuted,
    transform: [{ scale: 0.98 }],
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  buyIconWrap: {
    backgroundColor: colors.primarySubtle,
  },
  rentIconWrap: {
    backgroundColor: colors.secondarySubtle,
  },
  cardHeading: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 11,
    lineHeight: 15,
    marginBottom: spacing.sm,
  },
  cardActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  sellBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  sellLeftContent: {
    flex: 1,
    marginRight: spacing.sm,
  },
  sellHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  sellIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySubtle,
    marginBottom: 0,
  },
  sellBadge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  sellBadgeText: {
    fontSize: 9,
    letterSpacing: 0.5,
  },
  sellCardHeading: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  sellCardSubtitle: {
    fontSize: 11,
    lineHeight: 15,
  },
  sellActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
});
