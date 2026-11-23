import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, layout } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { typography } from '../../theme/typography';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface AppButtonProps {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const isInteractive = !disabled && !loading;

  // Variant-specific styles
  const getVariantContainerStyle = (pressed: boolean): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: isInteractive
            ? pressed
              ? colors.primaryDark
              : colors.primary
            : colors.disabledBackground,
          borderColor: isInteractive ? colors.primary : colors.disabledBackground,
        };
      case 'secondary':
        return {
          backgroundColor: isInteractive
            ? pressed
              ? colors.secondaryDark
              : colors.secondary
            : colors.disabledBackground,
          borderColor: isInteractive ? colors.secondary : colors.disabledBackground,
        };
      case 'outline':
        return {
          backgroundColor: pressed ? colors.pressedDark : 'transparent',
          borderWidth: layout.borderMedium,
          borderColor: isInteractive ? colors.primary : colors.disabledBackground,
        };
      case 'ghost':
        return {
          backgroundColor: pressed ? colors.pressedDark : 'transparent',
          borderColor: 'transparent',
        };
      default:
        return {};
    }
  };

  const getVariantTextStyle = (): TextStyle => {
    if (!isInteractive) {
      return { color: colors.disabledText };
    }
    switch (variant) {
      case 'primary':
        return { color: colors.textInverse };
      case 'secondary':
        return { color: colors.textOnGold };
      case 'outline':
      case 'ghost':
        return { color: colors.primary };
      default:
        return { color: colors.textPrimary };
    }
  };

  const getSizeContainerStyle = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return {
          height: layout.buttonHeightSm,
          paddingHorizontal: spacing.md,
          borderRadius: radius.md,
        };
      case 'lg':
        return {
          height: layout.buttonHeightLg,
          paddingHorizontal: spacing.xxl,
          borderRadius: radius.lg,
        };
      case 'md':
      default:
        return {
          height: layout.buttonHeight,
          paddingHorizontal: spacing.lg,
          borderRadius: radius.md,
        };
    }
  };

  const spinnerColor =
    variant === 'primary'
      ? colors.textInverse
      : variant === 'secondary'
      ? colors.primary
      : colors.primary;

  return (
    <Pressable
      onPress={isInteractive ? onPress : undefined}
      disabled={!isInteractive}
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !isInteractive, busy: loading }}
      style={({ pressed }) => [
        styles.baseButton,
        getSizeContainerStyle(),
        getVariantContainerStyle(pressed),
        fullWidth ? styles.fullWidth : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} testID="button-loading" />
      ) : (
        <View style={styles.contentRow}>
          {leftIcon ? <View style={styles.leftIconContainer}>{leftIcon}</View> : null}
          <Text
            style={[
              typography.button,
              getVariantTextStyle(),
              size === 'sm' ? styles.smallText : null,
              size === 'lg' ? styles.largeText : null,
              textStyle,
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {rightIcon ? <View style={styles.rightIconContainer}>{rightIcon}</View> : null}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },
  fullWidth: {
    width: '100%',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIconContainer: {
    marginRight: spacing.sm,
  },
  rightIconContainer: {
    marginLeft: spacing.sm,
  },
  smallText: {
    fontSize: 13,
  },
  largeText: {
    fontSize: 16,
  },
});

