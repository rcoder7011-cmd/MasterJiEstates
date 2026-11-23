import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { AppText } from '../ui/AppText';

interface HeaderBrandProps {
  title?: string;
  subtitle?: string;
}

export const HeaderBrand: React.FC<HeaderBrandProps> = ({
  title = 'MJ Estates',
  subtitle = 'Welcome to MJ Estates',
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <AppText variant="caption" color="secondaryDark" weight="700" style={styles.badgeText}>
          REAL ESTATE ADVISORY
        </AppText>
      </View>
      <AppText variant="display" color="primary" align="center" style={styles.title}>
        {title}
      </AppText>
      <AppText variant="body" color="textSecondary" align="center">
        {subtitle}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.secondarySubtle,
    borderWidth: 1,
    borderColor: colors.borderGold,
    marginBottom: spacing.md,
  },
  badgeText: {
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    marginBottom: spacing.xs,
  },
});
