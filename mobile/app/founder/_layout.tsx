/**
 * Founder Portal Layout & Authorization Guard — mobile/app/founder/_layout.tsx
 *
 * Strictly enforces that only explicitly designated Founder/CEO accounts can
 * render this portal. Normal customers, ordinary dealers, and regular admins
 * are denied access.
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../src/theme/colors';
import { spacing, layout } from '../../src/theme/spacing';
import { radius } from '../../src/theme/radius';
import { useAuth } from '../../src/hooks/useAuth';
import { useDevAuth } from '../../src/context/DevAuthContext';
import {
  AppText,
  AppCard,
  AppButton,
  AppHeader,
  AppIcon,
  AppDivider,
} from '../../src/components';
import { useTranslation } from '../../src/hooks/useTranslation';

export default function FounderLayout() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { isFounder: isDevFounder } = useDevAuth();
  const { t } = useTranslation();

  // Authorize only verified Founder or CEO
  const isAuthorized =
    (isAuthenticated &&
      Boolean(
        user?.isFounder === true ||
          (user?.founderRole && ['founder', 'ceo'].includes(user.founderRole))
      )) ||
    (__DEV__ && isDevFounder);

  // Rejection Screen for Unauthorized Access
  if (!isAuthorized) {
    return (
      <SafeAreaView style={styles.guardContainer} edges={['top', 'left', 'right']}>
        <AppHeader
          title={t('founderDashboard.guardTitle', 'Restricted Executive Portal')}
          subtitle={t('founderDashboard.guardSubtitle', 'Founder & CEO Access Only')}
          showBack
          onBackPress={() => router.replace('/(tabs)/profile')}
        />

        <ScrollView contentContainerStyle={styles.guardContent}>
          <AppCard variant="goldAccent" style={styles.guardCard}>
            <View style={styles.iconCircle}>
              <AppIcon name="Shield" size="xl" color="secondary" />
            </View>

            <AppText variant="h2" color="primary" align="center" style={styles.guardTitle}>
              {t('founderDashboard.unauthorizedTitle', 'Leadership Authorization Required')}
            </AppText>

            <AppText variant="body" color="textSecondary" align="center" style={styles.guardDesc}>
              {t(
                'founderDashboard.unauthorizedDesc',
                'The Private Founder Dashboard is strictly reserved for the designated Founder (Riyaz Saifi) and CEO (Mr Shokin). Regular customer, dealer, or general administrative accounts are not permitted.'
              )}
            </AppText>

            <AppDivider spacing="md" color="borderGold" />

            <View style={styles.securityNoteBox}>
              <AppIcon name="Lock" size="xs" color="secondaryDark" />
              <AppText variant="caption" color="secondaryDark" weight="600" style={styles.securityNote}>
                {t(
                  'founderDashboard.securityNotice',
                  'Every access attempt is cryptographically verified against server-side authorization tokens.'
                )}
              </AppText>
            </View>

            <AppButton
              title={t('founderDashboard.returnProfile', 'Return to Customer Profile')}
              variant="primary"
              size="md"
              leftIcon={<AppIcon name="ArrowLeft" size="sm" color="textInverse" />}
              onPress={() => router.replace('/(tabs)/profile')}
              style={styles.returnBtn}
            />
          </AppCard>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  guardContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  guardContent: {
    flexGrow: 1,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.xl,
    justifyContent: 'center',
  },
  guardCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.secondarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.borderGold,
  },
  guardTitle: {
    marginBottom: spacing.xs,
  },
  guardDesc: {
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  securityNoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.xs,
    marginBottom: spacing.lg,
    width: '100%',
  },
  securityNote: {
    flex: 1,
    fontSize: 11,
  },
  returnBtn: {
    width: '100%',
  },
});
