/**
 * PropertySpecifications Component
 * Key architectural specifications displayed in a clean, compact grid.
 * Strictly hides fields that are not applicable (e.g., bedrooms/bathrooms for plots).
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { AppText } from '../ui/AppText';
import { AppIcon, IconName } from '../ui/AppIcon';
import { PropertyItem } from '../../types/property';
import { useTranslation } from '../../hooks/useTranslation';

export interface PropertySpecificationsProps {
  property: PropertyItem;
}

interface SpecItem {
  id: string;
  label: string;
  value: string;
  icon: IconName;
}

export const PropertySpecifications: React.FC<PropertySpecificationsProps> = ({
  property,
}) => {
  const { t } = useTranslation();
  const specs: SpecItem[] = [];

  const isPlot =
    property.propertyType === 'plot' ||
    property.subType?.toLowerCase().includes('plot') ||
    property.subType?.toLowerCase().includes('land');
  const isCommercial =
    property.propertyType === 'commercial' ||
    property.subType?.toLowerCase().includes('commercial');

  // 1. Bedrooms (Residential only)
  if (!isPlot && !isCommercial && property.bedrooms) {
    specs.push({
      id: 'bedrooms',
      label: t('propertyDetails.bedrooms', 'Bedrooms'),
      value: property.bedrooms,
      icon: 'Bed',
    });
  }

  // 2. Bathrooms (Residential only)
  if (!isPlot && !isCommercial && property.bathrooms !== undefined) {
    specs.push({
      id: 'bathrooms',
      label: t('propertyDetails.bathrooms', 'Bathrooms'),
      value: `${property.bathrooms} Baths`,
      icon: 'Home',
    });
  }

  // 3. Balconies (Residential only)
  if (!isPlot && !isCommercial && property.balconies !== undefined) {
    specs.push({
      id: 'balconies',
      label: t('propertyDetails.balconies', 'Balconies'),
      value: `${property.balconies} Balconies`,
      icon: 'Maximize2',
    });
  }

  // 4. Area Specs (Plot area for plots, Built-up/Carpet for apartments/commercial)
  if (property.plotArea) {
    specs.push({
      id: 'plotArea',
      label: t('propertyDetails.plotArea', 'Plot Area'),
      value: property.plotArea,
      icon: 'Maximize2',
    });
  } else if (property.carpetArea) {
    specs.push({
      id: 'carpetArea',
      label: t('propertyDetails.carpetArea', 'Carpet Area'),
      value: property.carpetArea,
      icon: 'Maximize2',
    });
  } else if (property.area) {
    specs.push({
      id: 'superArea',
      label: t('propertyDetails.superArea', 'Super Area'),
      value: property.area,
      icon: 'Maximize2',
    });
  }

  // 5. Floor Level
  if (!isPlot && property.floor) {
    specs.push({
      id: 'floor',
      label: t('propertyDetails.floor', 'Floor'),
      value: property.floor,
      icon: 'Layers',
    });
  }

  // 6. Direction / Facing
  if (property.facing) {
    specs.push({
      id: 'facing',
      label: t('propertyDetails.facing', 'Facing'),
      value: property.facing,
      icon: 'Compass',
    });
  }

  // 7. Furnishing Status
  if (!isPlot && property.furnishingStatus) {
    specs.push({
      id: 'furnishing',
      label: t('propertyDetails.furnishing', 'Furnishing'),
      value: property.furnishingStatus,
      icon: 'Home',
    });
  }

  // 8. Reserved Parking
  if (!isPlot && property.parking) {
    specs.push({
      id: 'parking',
      label: t('propertyDetails.parking', 'Parking'),
      value: property.parking,
      icon: 'Car',
    });
  }

  // 9. Property Age or Possession
  if (property.possession) {
    specs.push({
      id: 'possession',
      label: t('propertyDetails.possession', 'Possession'),
      value: property.possession,
      icon: 'Calendar',
    });
  } else if (property.propertyAge) {
    specs.push({
      id: 'propertyAge',
      label: t('propertyDetails.propertyAge', 'Property Age'),
      value: property.propertyAge,
      icon: 'Calendar',
    });
  }

  if (specs.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headingRow}>
        <AppIcon name="Layers" size="sm" color="primary" />
        <AppText variant="h3" color="primary" style={styles.headingText}>
          {t('propertyDetails.overviewTitle', 'Property Overview & Specifications')}
        </AppText>
      </View>

      <View style={styles.grid}>
        {specs.map((item) => (
          <View key={item.id} style={styles.gridItem}>
            <View style={styles.iconCircle}>
              <AppIcon name={item.icon} size="xs" color="primary" />
            </View>
            <View style={styles.textWrap}>
              <AppText variant="caption" color="textSecondary">
                {item.label}
              </AppText>
              <AppText variant="bodySmall" color="primary" weight="700" numberOfLines={1}>
                {item.value}
              </AppText>
            </View>
          </View>
        ))}
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  gridItem: {
    width: '48.5%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
});
