/**
 * PropertyEmptyState Component
 * Clean, friendly empty state displayed when search or filter combinations yield zero results.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { AppText } from '../ui/AppText';
import { AppIcon } from '../ui/AppIcon';
import { AppButton } from '../ui/AppButton';

export interface PropertyEmptyStateProps {
  onResetFilters?: () => void;
  hasActiveFilters?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
}

export const PropertyEmptyState: React.FC<PropertyEmptyStateProps> = ({
  onResetFilters,
  hasActiveFilters = true,
  isError = false,
  errorMessage,
  onRetry,
}) => {
  if (isError) {
    return (
      <View style={styles.container}>
        <View style={styles.errorIconCircle}>
          <AppIcon name="AlertTriangle" size="xl" color="warning" />
        </View>

        <AppText variant="h2" color="primary" align="center" style={styles.title}>
          Unable to Load Properties
        </AppText>

        <AppText variant="body" color="textSecondary" align="center" style={styles.description}>
          {errorMessage ||
            'We encountered a connection issue while fetching property listings. Please check your internet connection and try again.'}
        </AppText>

        {onRetry ? (
          <AppButton
            title="Retry Connection"
            variant="secondary"
            size="md"
            leftIcon={<AppIcon name="RotateCcw" size="sm" color="textOnGold" />}
            onPress={onRetry}
            style={styles.resetButton}
          />
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <AppIcon name="Building2" size="xl" color="textMuted" />
      </View>

      <AppText variant="h2" color="primary" align="center" style={styles.title}>
        No Properties Found
      </AppText>

      <AppText variant="body" color="textSecondary" align="center" style={styles.description}>
        {hasActiveFilters
          ? 'No properties match your current combination of search keywords and filters. Try widening your budget or clearing select filters.'
          : 'There are currently no listings in this view. Check back soon for new property additions.'}
      </AppText>

      {hasActiveFilters && onResetFilters ? (
        <AppButton
          title="Reset All Filters"
          variant="outline"
          size="md"
          leftIcon={<AppIcon name="RotateCcw" size="sm" color="primary" />}
          onPress={onResetFilters}
          style={styles.resetButton}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  errorIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.warningSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  title: {
    marginBottom: spacing.xs,
  },
  description: {
    marginBottom: spacing.lg,
    maxWidth: 320,
    lineHeight: 22,
  },
  resetButton: {
    minWidth: 200,
  },
});
