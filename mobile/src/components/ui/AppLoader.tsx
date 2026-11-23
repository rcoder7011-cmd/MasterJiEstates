import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export interface AppLoaderProps {
  size?: 'small' | 'large';
  color?: keyof typeof colors | string;
  message?: string;
  fullScreen?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const AppLoader: React.FC<AppLoaderProps> = ({
  size = 'small',
  color = 'primary',
  message,
  fullScreen = false,
  style,
}) => {
  const resolvedColor = (colors as Record<string, string>)[color] || color;

  return (
    <View
      style={[
        styles.container,
        fullScreen ? styles.fullScreenContainer : null,
        style,
      ]}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={message || 'Loading'}
    >
      <ActivityIndicator size={size} color={resolvedColor} />
      {message ? (
        <Text style={[typography.bodySmall, styles.messageText]}>
          {message}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  fullScreenContainer: {
    flex: 1,
    minHeight: 200,
  },
  messageText: {
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});

