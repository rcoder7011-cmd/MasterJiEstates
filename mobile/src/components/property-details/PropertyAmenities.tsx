/**
 * PropertyAmenities Component
 * Displays available verified amenities and architectural highlights with contextual icons.
 * Returns null if property specifies no amenities.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { AppText } from '../ui/AppText';
import { AppIcon, IconName } from '../ui/AppIcon';
import { useTranslation } from '../../hooks/useTranslation';

export interface PropertyAmenitiesProps {
  amenities?: string[];
}

function resolveAmenityIcon(name: string): IconName {
  const lower = name.toLowerCase();
  if (lower.includes('park')) return 'Car';
  if (lower.includes('security') || lower.includes('guard')) return 'Shield';
  if (lower.includes('power') || lower.includes('backup') || lower.includes('electricity')) return 'Zap';
  if (lower.includes('cctv') || lower.includes('camera')) return 'Video';
  if (lower.includes('ac') || lower.includes('air') || lower.includes('conditioning')) return 'Wind';
  if (lower.includes('lift') || lower.includes('elevator')) return 'Layers';
  if (lower.includes('balcony') || lower.includes('deck')) return 'Maximize2';
  if (lower.includes('club') || lower.includes('hall')) return 'Building2';
  if (lower.includes('gym') || lower.includes('fitness') || lower.includes('sport')) return 'TrendingUp';
  return 'Check';
}

export const PropertyAmenities: React.FC<PropertyAmenitiesProps> = ({
  amenities,
}) => {
  const { t } = useTranslation();

  if (!amenities || !Array.isArray(amenities) || amenities.length === 0) {
    return null;
  }

  const validAmenities = amenities.filter((item) => typeof item === 'string' && item.trim() !== '');

  if (validAmenities.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headingRow}>
        <AppIcon name="Sparkles" size="sm" color="primary" />
        <AppText variant="h3" color="primary" style={styles.headingText}>
          {t('propertyDetails.amenitiesTitle', 'Amenities & Features')}
        </AppText>
      </View>

      <View style={styles.chipsWrap}>
        {validAmenities.map((item, index) => {
          const icon = resolveAmenityIcon(item);
          return (
            <View key={`amenity-${index}`} style={styles.chip}>
              <View style={styles.iconCircle}>
                <AppIcon name={icon} size="xs" color="secondaryDark" />
              </View>
              <AppText variant="bodySmall" color="textPrimary" weight="600">
                {item}
              </AppText>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  headingText: {
    marginLeft: spacing.xs,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 7,
    paddingHorizontal: spacing.sm,
    gap: 8,
  },
  iconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.secondarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
