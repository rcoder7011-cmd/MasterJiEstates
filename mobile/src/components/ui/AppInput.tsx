import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  StyleProp,
  ViewStyle,
  TextStyle,
  Pressable,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, layout } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { typography } from '../../theme/typography';

export interface AppInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

export const AppInput: React.FC<AppInputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  disabled = false,
  containerStyle,
  inputStyle,
  placeholder,
  value,
  onChangeText,
  onFocus,
  onBlur,
  multiline = false,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const hasError = Boolean(error);

  const getBorderColor = (): string => {
    if (disabled) return colors.borderLight;
    if (hasError) return colors.error;
    if (isFocused) return colors.borderFocus;
    return colors.border;
  };

  const getBackgroundColor = (): string => {
    if (disabled) return colors.surfaceMuted;
    return colors.surface;
  };

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? (
        <Text
          style={[
            typography.caption,
            styles.label,
            disabled ? styles.disabledLabel : null,
          ]}
        >
          {label}
        </Text>
      ) : null}

      <View
        style={[
          styles.inputContainer,
          {
            borderColor: getBorderColor(),
            backgroundColor: getBackgroundColor(),
            minHeight: multiline ? layout.inputHeightMultiline : layout.inputHeight,
          },
          isFocused && !hasError ? styles.focusedContainer : null,
          hasError ? styles.errorContainer : null,
        ]}
      >
        {leftIcon ? <View style={styles.leftIconWrapper}>{leftIcon}</View> : null}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          editable={!disabled}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          style={[
            styles.textInput,
            typography.body,
            disabled ? styles.disabledInput : null,
            inputStyle,
          ]}
          accessible
          accessibilityLabel={label || placeholder}
          accessibilityState={{ disabled }}
          {...rest}
        />

        {rightIcon ? (
          <Pressable
            onPress={onRightIconPress}
            disabled={!onRightIconPress || disabled}
            style={styles.rightIconWrapper}
          >
            {rightIcon}
          </Pressable>
        ) : null}
      </View>

      {hasError ? (
        <Text style={[typography.caption, styles.errorText]}>{error}</Text>
      ) : helperText ? (
        <Text style={[typography.caption, styles.helperText]}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: spacing.md,
  },
  label: {
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  disabledLabel: {
    color: colors.textMuted,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    overflow: 'hidden',
  },
  focusedContainer: {
    borderWidth: layout.borderMedium,
    borderColor: colors.primary,
  },
  errorContainer: {
    borderWidth: layout.borderMedium,
    borderColor: colors.error,
  },
  textInput: {
    flex: 1,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
    fontSize: 15,
  },
  disabledInput: {
    color: colors.textMuted,
  },
  leftIconWrapper: {
    marginRight: spacing.sm,
  },
  rightIconWrapper: {
    marginLeft: spacing.sm,
    padding: spacing.xxs,
  },
  errorText: {
    color: colors.error,
    marginTop: spacing.xxs,
  },
  helperText: {
    color: colors.textMuted,
    marginTop: spacing.xxs,
  },
});

