import React from 'react';
import { View, FlatList, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { AppText } from '../ui/AppText';
import { AppIcon, IconName } from '../ui/AppIcon';
import { useTranslation } from '../../hooks/useTranslation';

interface PopularLocationItem {
  id: string;
  nameKey: string;
  defaultName: string;
  city: string;
  corridor: string;
  icon: IconName;
  badge?: string;
}

const POPULAR_LOCATIONS: PopularLocationItem[] = [
  {
    id: 'noida',
    nameKey: 'home.noida',
    defaultName: 'Noida',
    city: 'Noida',
    corridor: 'Expressway & Sectors 43-152',
    icon: 'Building',
    badge: 'High Demand',
  },
  {
    id: 'greater-noida',
    nameKey: 'home.greaterNoida',
    defaultName: 'Greater Noida',
    city: 'Greater Noida',
    corridor: 'Jaypee Greens & Pari Chowk',
    icon: 'Compass',
  },
  {
    id: 'gurugram',
    nameKey: 'home.gurugram',
    defaultName: 'Gurugram',
    city: 'Gurugram',
    corridor: 'Golf Course Rd & Cyber City',
    icon: 'Briefcase',
    badge: 'Luxury',
  },
  {
    id: 'delhi',
    nameKey: 'home.delhi',
    defaultName: 'Delhi',
    city: 'Delhi',
    corridor: 'South Delhi & Central Hubs',
    icon: 'Building2',
  },
  {
    id: 'ghaziabad',
    nameKey: 'home.ghaziabad',
    defaultName: 'Ghaziabad',
    city: 'Ghaziabad',
    corridor: 'Indirapuram & Vaishali',
    icon: 'Home',
  },
];

export const PopularLocations: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const handleLocationPress = (city: string) => {
    router.push({
      pathname: '/explore',
      params: { city },
    });
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <View>
          <View style={styles.eyebrowRow}>
            <AppIcon name="MapPin" size="xs" color="secondary" />
            <AppText variant="caption" color="textGold" weight="700" style={styles.eyebrowText}>
              {t('home.popularLocationsEyebrow', 'PRIME CORRIDORS')}
            </AppText>
          </View>
          <AppText variant="h2" color="primary">
            {t('home.popularLocationsTitle', 'Popular Locations')}
          </AppText>
        </View>

        <Pressable
          onPress={() => router.push('/explore')}
          accessible
          accessibilityRole="button"
          accessibilityLabel={t('home.seeAll', 'See All locations in Explore')}
          style={({ pressed }) => [styles.seeAllBtn, pressed ? styles.btnPressed : null]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <AppText variant="button" color="secondary" style={styles.seeAllText}>
            {t('home.seeAll', 'See All')}
          </AppText>
          <AppIcon name="ArrowRight" size="xs" color="secondary" />
        </Pressable>
      </View>

      {/* Horizontal Carousel of Location Cards */}
      <FlatList
        data={POPULAR_LOCATIONS}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => {
          const localizedName = t(item.nameKey, item.defaultName);
          return (
            <Pressable
              onPress={() => handleLocationPress(item.city)}
              accessible
              accessibilityRole="button"
              accessibilityLabel={`${localizedName}, ${item.corridor}`}
              style={({ pressed }) => [
                styles.locationCard,
                pressed ? styles.cardPressed : null,
              ]}
            >
              <View style={styles.topRow}>
                <View style={styles.iconWrap}>
                  <AppIcon name={item.icon} size="sm" color="primary" />
                </View>
                {item.badge ? (
                  <View style={styles.badge}>
                    <AppText variant="caption" color="secondaryDark" weight="700" style={styles.badgeText}>
                      {item.badge}
                    </AppText>
                  </View>
                ) : null}
              </View>

              <AppText variant="h3" color="primary" numberOfLines={1} style={styles.cityName}>
                {localizedName}
              </AppText>

              <AppText variant="caption" color="textSecondary" numberOfLines={2} style={styles.corridorText}>
                {item.corridor}
              </AppText>

              <View style={styles.exploreLinkRow}>
                <AppText variant="caption" color="secondaryDark" weight="700">
                  {t('common.viewProperty', 'Explore Listings')}
                </AppText>
                <AppIcon name="ChevronRight" size="xs" color="secondaryDark" />
              </View>
            </Pressable>
          );
        }}
      />
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
  locationCard: {
    width: 200,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'space-between',
  },
  cardPressed: {
    backgroundColor: colors.surfaceMuted,
    transform: [{ scale: 0.98 }],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    backgroundColor: colors.secondarySubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  badgeText: {
    fontSize: 9,
  },
  cityName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  corridorText: {
    fontSize: 11,
    lineHeight: 15,
    marginBottom: spacing.sm,
    minHeight: 30,
  },
  exploreLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
});
