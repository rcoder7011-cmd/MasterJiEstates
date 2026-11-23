import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing as spacingTokens } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export interface AppDividerProps {
  orientation?: 'horizontal' | 'vertical';
  color?: keyof typeof colors | string;
  spacing?: keyof typeof spacingTokens | number;
  thickness?: number;
  label?: string;
  style?: StyleProp<ViewStyle>;
}

export const AppDivider: React.FC<AppDividerProps> = ({
  orientation = 'horizontal',
  color = 'border',
  spacing = 'md',
  thickness = 1,
  label,
  style,
}) => {
  const resolvedColor = (colors as Record<string, string>)[color] || color;
  const marginSize =
    typeof spacing === 'number'
      ? spacing
      : spacingTokens[spacing] || spacingTokens.md;

  if (orientation === 'vertical') {
    return (
      <View
        style={[
          styles.verticalLine,
          {
            backgroundColor: resolvedColor,
            width: thickness,
            marginHorizontal: marginSize,
          },
          style,
        ]}
      />
    );
  }

  if (label) {
    return (
      <View style={[styles.labelContainer, { marginVertical: marginSize }, style]}>
        <View
          style={[
            styles.horizontalLine,
            { backgroundColor: resolvedColor, height: thickness },
          ]}
        />
        <Text style={[typography.caption, styles.labelText]}>{label}</Text>
        <View
          style={[
            styles.horizontalLine,
            { backgroundColor: resolvedColor, height: thickness },
          ]}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.horizontalLine,
        {
          backgroundColor: resolvedColor,
          height: thickness,
          marginVertical: marginSize,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  horizontalLine: {
    width: '100%',
  },
  verticalLine: {
    height: '100%',
    alignSelf: 'stretch',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  labelText: {
    marginHorizontal: spacingTokens.md,
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});

