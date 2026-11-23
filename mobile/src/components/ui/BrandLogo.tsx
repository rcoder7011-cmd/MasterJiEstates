import React from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  ImageStyle,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';

export interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'image' | 'text' | 'compact';
  style?: StyleProp<ViewStyle>;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  variant = 'image',
  style,
}) => {
  const getImageDimensions = (): ImageStyle => {
    switch (size) {
      case 'sm':
        return { width: 120, height: 40 };
      case 'lg':
        return { width: 220, height: 74 };
      case 'md':
      default:
        return { width: 165, height: 55 };
    }
  };

  if (variant === 'text' || variant === 'compact') {
    return (
      <View style={[styles.textContainer, style]}>
        <View style={styles.badge}>
          <Text style={[typography.caption, styles.badgeText]}>REAL ESTATE</Text>
        </View>
        <Text style={[typography.h1, styles.brandName]}>MJ Estates</Text>
      </View>
    );
  }

  return (
    <View style={[styles.imageContainer, style]}>
      <Image
        source={require('../../../assets/images/logo.png')}
        style={[styles.logoImage, getImageDimensions()]}
        resizeMode="contain"
        accessibilityLabel="MJ Estates Logo"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    alignSelf: 'center',
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
    backgroundColor: colors.secondarySubtle,
    borderWidth: 1,
    borderColor: colors.borderGold,
    marginBottom: spacing.xs,
  },
  badgeText: {
    color: colors.secondaryDark,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  brandName: {
    color: colors.primary,
    letterSpacing: -0.5,
  },
});
