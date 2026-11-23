import React, { useState, useEffect } from 'react';
import { View, FlatList, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { AppText } from '../ui/AppText';
import { AppIcon } from '../ui/AppIcon';
import { PropertyPreviewCard } from './PropertyPreviewCard';
import { fetchFeaturedProperties } from '../../services/propertyService';
import { PREVIEW_FEATURED_PROPERTIES } from '../../constants/propertyCategories';
import { PropertyItem } from '../../types/property';
import { useTranslation } from '../../hooks/useTranslation';

export const FeaturedProperties: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadFeatured() {
      try {
        const data = await fetchFeaturedProperties();
        if (isMounted) {
          if (data && data.length > 0) {
            setProperties(data);
          } else if (PREVIEW_FEATURED_PROPERTIES && PREVIEW_FEATURED_PROPERTIES.length > 0) {
            setProperties(PREVIEW_FEATURED_PROPERTIES as any);
          }
        }
      } catch {
        if (isMounted && PREVIEW_FEATURED_PROPERTIES) {
          setProperties(PREVIEW_FEATURED_PROPERTIES as any);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadFeatured();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSeeAll = () => {
    router.push({
      pathname: '/explore',
      params: { featured: 'true' },
    });
  };

  return (
    <View style={styles.container}>
      {/* Section Header with 'See All' Action */}
      <View style={styles.headerRow}>
        <View>
          <View style={styles.eyebrowRow}>
            <AppIcon name="Sparkles" size="xs" color="secondary" />
            <AppText variant="caption" color="textGold" weight="700" style={styles.eyebrowText}>
              {t('home.featuredEyebrow', 'CURATED SELECTION')}
            </AppText>
          </View>
          <AppText variant="h2" color="primary">
            {t('home.featuredTitle', 'Featured Properties')}
          </AppText>
        </View>

        <Pressable
          onPress={handleSeeAll}
          accessible
          accessibilityRole="button"
          accessibilityLabel={t('home.seeAll', 'See All featured properties')}
          style={({ pressed }) => [styles.seeAllBtn, pressed ? styles.btnPressed : null]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <AppText variant="button" color="secondary" style={styles.seeAllText}>
            {t('home.seeAll', 'See All')}
          </AppText>
          <AppIcon name="ArrowRight" size="xs" color="secondary" />
        </Pressable>
      </View>

      {/* Content: Loading Skeleton / Carousel / Empty State */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.secondary} />
          <AppText variant="caption" color="textMuted" style={styles.loadingText}>
            {t('home.loadingProperties', 'Loading premium properties...')}
          </AppText>
        </View>
      ) : properties.length > 0 ? (
        <FlatList
          data={properties}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <PropertyPreviewCard property={item} layout="carousel" />
          )}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <AppIcon name="Building" size="md" color="textMuted" />
          <AppText variant="bodySmall" color="textSecondary" style={styles.emptyText}>
            {t('home.noFeaturedFound', 'No featured properties available right now.')}
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
  carouselContent: {
    paddingRight: spacing.lg,
  },
  separator: {
    width: spacing.md,
  },
  loadingContainer: {
    height: 180,
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
