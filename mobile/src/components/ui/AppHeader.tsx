import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, layout } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { AppIcon } from './AppIcon';

export interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
  variant?: 'default' | 'transparent' | 'navy';
  style?: StyleProp<ViewStyle>;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBackPress,
  rightAction,
  variant = 'default',
  style,
}) => {
  const isNavy = variant === 'navy';
  const isTransparent = variant === 'transparent';

  const titleColor = isNavy ? colors.textInverse : colors.primary;
  const subtitleColor = isNavy ? colors.textMuted : colors.textSecondary;
  const backIconColor = isNavy ? colors.textInverse : colors.primary;

  const containerBg = isNavy
    ? colors.primary
    : isTransparent
    ? 'transparent'
    : colors.surface;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: containerBg },
        !isTransparent ? styles.bordered : null,
        style,
      ]}
    >
      <View style={styles.leftContainer}>
        {showBack ? (
          <Pressable
            onPress={onBackPress}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={({ pressed }) => [
              styles.backButton,
              pressed ? styles.pressedButton : null,
            ]}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <AppIcon name="ArrowLeft" size="md" color={backIconColor} />
          </Pressable>
        ) : null}

        <View style={styles.titleContainer}>
          <Text
            style={[typography.h2, { color: titleColor }]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={[typography.caption, { color: subtitleColor }]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      {rightAction ? (
        <View style={styles.rightContainer}>{rightAction}</View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.sm,
  },
  bordered: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  leftContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: spacing.md,
    padding: spacing.xs,
    borderRadius: spacing.sm,
  },
  pressedButton: {
    opacity: 0.6,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.md,
  },
});

