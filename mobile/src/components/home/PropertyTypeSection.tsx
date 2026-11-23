import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { AppText } from '../ui/AppText';
import { AppIcon } from '../ui/AppIcon';
import { PROPERTY_TYPES, PropertyTypeItem } from '../../constants/propertyCategories';

export const PropertyTypeSection: React.FC = () => {
  const router = useRouter();

  const handleTypePress = (item: PropertyTypeItem) => {
    router.push({
      pathname: '/explore',
      params: { type: item.typeParam },
    });
  };

  return (
    <View style={styles.container}>
      <AppText variant="caption" color="textGold" weight="700" style={styles.sectionEyebrow}>
        PROPERTY ASSET CLASSES
      </AppText>
      <AppText variant="h2" color="primary" style={styles.sectionTitle}>
        Explore by Property Type
      </AppText>

      <View style={styles.grid}>
        {PROPERTY_TYPES.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => handleTypePress(item)}
            accessible
            accessibilityRole="button"
            accessibilityLabel={`${item.title} - ${item.subtitle}`}
            style={({ pressed }) => [styles.typeCard, pressed ? styles.cardPressed : null]}
          >
            <View style={styles.iconBox}>
              <AppIcon name={item.icon} size="md" color="primary" />
            </View>
            <View style={styles.textBox}>
              <AppText variant="h3" color="primary" style={styles.typeTitle}>
                {item.title}
              </AppText>
              <AppText variant="caption" color="textSecondary">
                {item.subtitle}
              </AppText>
            </View>
            <AppIcon name="ChevronRight" size="xs" color="textMuted" />
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  sectionEyebrow: {
    letterSpacing: 1,
    marginBottom: 2,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  grid: {
    gap: spacing.sm,
  },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  textBox: {
    flex: 1,
  },
  typeTitle: {
    fontSize: 15,
    marginBottom: 2,
  },
});

