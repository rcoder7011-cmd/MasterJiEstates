import React from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Platform,
} from 'react-native';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/spacing';
import { radius } from '../../theme/radius';

export type CardPadding = 'none' | 'compact' | 'standard' | 'spacious';
export type CardVariant = 'default' | 'elevated' | 'outlined' | 'goldAccent';

export interface AppCardProps {
  children: React.ReactNode;
  padding?: CardPadding;
  variant?: CardVariant;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const AppCard: React.FC<AppCardProps> = ({
  children,
  padding = 'standard',
  variant = 'default',
  onPress,
  style,
  accessible,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const getPaddingStyle = (): ViewStyle => {
    switch (padding) {
      case 'none':
        return { padding: 0 };
      case 'compact':
        return { padding: layout.cardPaddingCompact };
      case 'spacious':
        return { padding: layout.cardPaddingSpacious };
      case 'standard':
      default:
        return { padding: layout.cardPadding };
    }
  };

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return styles.elevatedCard;
      case 'outlined':
        return styles.outlinedCard;
      case 'goldAccent':
        return styles.goldAccentCard;
      case 'default':
      default:
        return styles.defaultCard;
    }
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessible={accessible}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        style={({ pressed }) => [
          styles.baseCard,
          getVariantStyle(),
          getPaddingStyle(),
          pressed ? styles.pressedCard : null,
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={[styles.baseCard, getVariantStyle(), getPaddingStyle(), style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  baseCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  defaultCard: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  outlinedCard: {
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  goldAccentCard: {
    borderWidth: 1.5,
    borderColor: colors.borderGold,
    backgroundColor: colors.surface,
  },
  elevatedCard: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
      default: {},
    }),
  },
  pressedCard: {
    opacity: 0.92,
    backgroundColor: colors.surfaceMuted,
  },
});
