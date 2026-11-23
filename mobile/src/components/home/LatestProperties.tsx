import React, { useState, useEffect } from 'react';
import { View, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { AppText } from '../ui/AppText';
import { AppIcon } from '../ui/AppIcon';
import { PropertyPreviewCard } from './PropertyPreviewCard';
import { fetchLatestProperties } from '../../services/propertyService';
import { PREVIEW_LATEST_PROPERTIES } from '../../constants/propertyCategories';
import { PropertyItem } from '../../types/property';
import { useTranslation } from '../../hooks/useTranslation';

export const LatestProperties: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadLatest() {
      try {
        const data = await fetchLatestProperties(6);
        if (isMounted) {
          if (data && data.length > 0) {
            setProperties(data);
          } else if (PREVIEW_LATEST_PROPERTIES && PREVIEW_LATEST_PROPERTIES.length > 0) {
            setProperties(PREVIEW_LATEST_PROPERTIES as any);
          }
        }
      } catch {
        if (isMounted && PREVIEW_LATEST_PROPERTIES) {
          setProperties(PREVIEW_LATEST_PROPERTIES as any);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadLatest();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleViewAll = () => {
    router.push({
      pathname: '/explore',
      params: { sort: 'newest' },
    });
  };

  return (
    <View style={styles.container}>
      {/* Section Header with 'View All' */}
      <View style={styles.headerRow}>
        <View>
          <View style={styles.eyebrowRow}>
            <AppIcon name="Clock" size="xs" color="primary" />
            <AppText variant="caption" color="primary" weight="700" style={styles.eyebrowText}>
              {t('home.latestEyebrow', 'NEW ARRIVALS')}
            </AppText>
          </View>
          <AppText variant="h2" color="primary">
            {t('home.latestTitle', 'Recently Added')}
          </AppText>
        </View>

        <Pressable
          onPress={handleViewAll}
          accessible
          accessibilityRole="button"
          accessibilityLabel={t('home.viewAll', 'View All newly added properties')}
          style={({ pressed }) => [styles.seeAllBtn, pressed ? styles.btnPressed : null]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <AppText variant="button" color="primary" style={styles.seeAllText}>
            {t('home.viewAll', 'View All')}
          </AppText>
          <AppIcon name="ArrowRight" size="xs" color="primary" />
        </Pressable>
      </View>

      {/* Vertical Property Stack or Empty State */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <AppText variant="caption" color="textMuted" style={styles.loadingText}>
            {t('home.loadingProperties', 'Loading premium properties...')}
          </AppText>
        </View>
      ) : properties.length > 0 ? (
        <View style={styles.list}>
          {properties.map((prop) => (
            <PropertyPreviewCard key={prop.id} property={prop} layout="vertical" />
          ))}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <AppIcon name="Building" size="md" color="textMuted" />
          <AppText variant="bodySmall" color="textSecondary" style={styles.emptyText}>
            {t('home.noLatestFound', 'No new property listings found at this moment.')}
          </AppText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  eyebrowText: {
    letterSpacing: 1,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingBottom: 2,
  },
  btnPressed: {
    opacity: 0.6,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
  },
  list: {
    width: '100%',
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  loadingText: {
    marginTop: spacing.xs,
  },
  emptyContainer: {
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
