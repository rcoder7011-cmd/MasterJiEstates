/**
 * PropertyLocation Component
 * Displays verified address, interactive OpenFreeMap with property marker,
 * and external Google Maps turn-by-turn navigation (no API key required).
 */

import React from 'react';
import { View, Pressable, StyleSheet, Linking } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { AppText } from '../ui/AppText';
import { AppIcon } from '../ui/AppIcon';
import { AppCard } from '../ui/AppCard';
import { MapLibreWebView } from '../map/MapLibreWebView';
import { openGoogleMapsDirections } from '../../services/locationService';
import { useTranslation } from '../../hooks/useTranslation';

export interface PropertyLocationProps {
  locality: string;
  city: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  formattedAddress?: string;
  title?: string;
}

export const PropertyLocation: React.FC<PropertyLocationProps> = ({
  locality,
  city,
  address,
  latitude,
  longitude,
  formattedAddress,
  title,
}) => {
  const { t } = useTranslation();

  const hasCoordinates =
    typeof latitude === 'number' &&
    !isNaN(latitude) &&
    typeof longitude === 'number' &&
    !isNaN(longitude);

  const handleOpenDirections = async () => {
    if (hasCoordinates) {
      await openGoogleMapsDirections(latitude, longitude, title || locality);
    } else {
      const fullQuery = `${address}, ${locality}, ${city}`;
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        fullQuery
      )}`;
      Linking.openURL(mapsUrl).catch(() => {});
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headingRow}>
        <AppIcon name="MapPin" size="sm" color="primary" />
        <AppText variant="h3" color="primary" style={styles.headingText}>
          {t('propertyDetails.locationTitle', 'Location & Neighborhood')}
        </AppText>
      </View>

      <AppCard variant="default" style={styles.card}>
        {/* Interactive Map View (Rendered when coordinates exist) */}
        {hasCoordinates && (
          <View style={styles.mapWrapper}>
            <MapLibreWebView
              mode="view"
              latitude={latitude}
              longitude={longitude}
              zoom={14}
              height={200}
              markers={[
                {
                  id: 'prop-target',
                  latitude,
                  longitude,
                  title: title || locality,
                  locality,
                },
              ]}
              interactive
            />
          </View>
        )}

        <View style={styles.locationContent}>
          <View style={styles.iconCircle}>
            <AppIcon name="MapPin" size="md" color="secondary" />
          </View>

          <View style={styles.detailsCol}>
            <AppText variant="h3" color="textPrimary">
              {locality}
            </AppText>
            <AppText variant="bodySmall" color="textSecondary" style={styles.addressText}>
              {formattedAddress || address}
            </AppText>
            <AppText variant="caption" color="primary" weight="600" style={styles.cityText}>
              {city}, National Capital Region (NCR)
            </AppText>

            {hasCoordinates && (
              <View style={styles.coordsBadge}>
                <AppText variant="caption" color="textMuted">
                  GPS: {latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E
                </AppText>
              </View>
            )}
          </View>
        </View>

        {/* Get Directions / Open in Google Maps Action */}
        <Pressable
          onPress={handleOpenDirections}
          accessible
          accessibilityRole="button"
          accessibilityLabel={
            hasCoordinates
              ? t('propertyDetails.getDirections', 'Get turn-by-turn directions in Google Maps')
              : t('propertyDetails.openInMaps', 'Search property in Google Maps')
          }
          style={({ pressed }) => [
            styles.mapsActionBtn,
            pressed ? styles.btnPressed : null,
          ]}
        >
          <AppIcon name="Compass" size="xs" color="secondaryDark" />
          <AppText variant="caption" color="secondaryDark" weight="700">
            {hasCoordinates
              ? t('propertyDetails.getDirections', 'Get Directions (Google Maps)')
              : t('propertyDetails.openInMaps', 'Open in Google Maps')}
          </AppText>
          <AppIcon name="ChevronRight" size="xs" color="secondaryDark" />
        </Pressable>
      </AppCard>
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
  card: {
    padding: spacing.md,
  },
  mapWrapper: {
    marginBottom: spacing.md,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginTop: 2,
  },
  detailsCol: {
    flex: 1,
  },
  addressText: {
    marginTop: 2,
    lineHeight: 18,
  },
  cityText: {
    marginTop: 4,
  },
  coordsBadge: {
    marginTop: 4,
  },
  mapsActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  btnPressed: {
    opacity: 0.7,
  },
});
