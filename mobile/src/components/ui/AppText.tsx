import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { typography, TypographyVariant } from '../../theme/typography';
import { colors } from '../../theme/colors';

export interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: keyof typeof colors | string;
  weight?: TextStyle['fontWeight'];
  align?: 'left' | 'center' | 'right';
  children?: React.ReactNode;
}

export const AppText: React.FC<AppTextProps> = ({
  variant = 'body',
  color = 'textPrimary',
  weight,
  align = 'left',
  style,
  children,
  ...rest
}) => {
  const variantStyle = typography[variant];

  // Resolve color token if matching, else use literal color string
  const resolvedColor = (colors as Record<string, string>)[color] || color;

  return (
    <Text
      style={[
        variantStyle,
        { color: resolvedColor, textAlign: align },
        weight ? { fontWeight: weight } : null,
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
};

