import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../src/theme/colors';
import { spacing, layout } from '../../src/theme/spacing';
import { useDevAuth } from '../../src/context/DevAuthContext';
import { useAuth } from '../../src/hooks/useAuth';
import {
  AppText,
  AppCard,
  AppButton,
  AppHeader,
  AppIcon,
  AppDivider,
} from '../../src/components';

/**
 * Admin Route Guard & Portal Layout
 * Protects all /admin routes from unauthorized customer access.
 */
export default function AdminLayout() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { isAdmin: isDevAdmin, setRole } = useDevAuth();
  const isAdmin = (isAuthenticated && user?.role === 'admin') || (__DEV__ && isDevAdmin);

  // Reusable Authorization Guard
  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.guardContainer}>
        <AppHeader
          title="Admin Access Required"
          subtitle="Restricted Section"
          showBack
          onBackPress={() => router.replace('/(tabs)')}
        />

        <ScrollView contentContainerStyle={styles.guardContent}>
          <AppCard variant="goldAccent" style={styles.guardCard}>
            <View style={styles.iconCircle}>
              <AppIcon name="Shield" size="xl" color="secondary" />
            </View>

            <AppText variant="h2" color="primary" align="center" style={styles.guardTitle}>
              Administrator Authorization Required
            </AppText>

            <AppText variant="body" color="textSecondary" align="center" style={styles.guardDesc}>
              The Admin Dashboard and Property Management workflows are strictly reserved for MasterJiEstates administrative personnel.
            </AppText>

            <AppDivider spacing="md" color="borderGold" />

            {/* Development Mode Role Switcher (Hidden in Production Builds) */}
            {__DEV__ ? (
              <View style={styles.devBox}>
                <View style={styles.devBadge}>
                  <AppText variant="caption" color="secondaryDark" weight="700">
                    DEVELOPMENT ONLY MECHANISM
                  </AppText>
                </View>
                <AppText variant="caption" color="textMuted" align="center" style={styles.devNote}>
                  In production, this guard validates verified JWT tokens & session claims from the server. For development preview, enable admin preview below:
                </AppText>

                <AppButton
                  title="Enable Admin Role (Preview)"
                  variant="secondary"
                  size="md"
                  leftIcon={<AppIcon name="CheckCircle" size="sm" color="textOnGold" />}
                  onPress={() => setRole('admin')}
                  style={styles.devBtn}
                />
              </View>
            ) : null}

            <AppButton
              title="Return to Customer Portal"
              variant="outline"
              size="md"
              leftIcon={<AppIcon name="ArrowLeft" size="sm" color="primary" />}
              onPress={() => router.replace('/(tabs)')}
            />
          </AppCard>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Authorized Admin Stack Navigation
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="properties" />
      <Stack.Screen name="add-property" />
      <Stack.Screen name="edit-property/[id]" />
      <Stack.Screen name="reports" />
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
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.secondarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  guardTitle: {
    marginBottom: spacing.xs,
  },
  guardDesc: {
    marginBottom: spacing.md,
  },
  devBox: {
    width: '100%',
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.md,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  devBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: spacing.xs,
    backgroundColor: colors.secondarySubtle,
    borderWidth: 1,
    borderColor: colors.borderGold,
    marginBottom: spacing.xs,
  },
  devNote: {
    marginBottom: spacing.md,
  },
  devBtn: {
    width: '100%',
  },
});
