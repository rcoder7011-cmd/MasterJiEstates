import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  AppText,
  AppCard,
  AppButton,
  AppHeader,
  AppIcon,
  AppDivider,
} from '../src/components';
import { colors } from '../src/theme/colors';
import { spacing, layout } from '../src/theme/spacing';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Page Not Found"
        showBack
        onBackPress={() => router.replace('/(tabs)')}
      />

      <View style={styles.content}>
        <AppCard variant="default" style={styles.card}>
          <View style={styles.iconCircle}>
            <AppIcon name="AlertCircle" size="xl" color="error" />
          </View>

          <AppText variant="h2" color="primary" align="center" style={styles.title}>
            Screen Does Not Exist
          </AppText>

          <AppText variant="body" color="textSecondary" align="center" style={styles.desc}>
            The requested mobile route could not be found or has been moved.
          </AppText>

          <AppDivider spacing="md" />

          <AppButton
            title="Go to Home Screen"
            variant="primary"
            leftIcon={<AppIcon name="Home" size="sm" color="textInverse" />}
            onPress={() => router.replace('/(tabs)')}
          />
        </AppCard>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: layout.screenPaddingHorizontal,
    justifyContent: 'center',
  },
  card: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.errorSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    marginBottom: spacing.xs,
  },
  desc: {
    marginBottom: spacing.md,
  },
});
