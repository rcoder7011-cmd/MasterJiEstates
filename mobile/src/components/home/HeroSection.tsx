import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Image,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { AppText } from '../ui/AppText';
import { AppIcon } from '../ui/AppIcon';
import { useTranslation } from '../../hooks/useTranslation';
import {
  searchAddressSuggestions,
  LocationSuggestion,
} from '../../services/locationService';

export const HeroSection: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleQueryChange = (text: string) => {
    setQuery(text);
    const trimmed = text.trim();

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (trimmed.length < 3) {
      setSuggestions([]);
      setIsLoading(false);
      setShowDropdown(false);
      return;
    }

    setIsLoading(true);
    setShowDropdown(true);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const results = await searchAddressSuggestions(trimmed, 5);
        setSuggestions(results);
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowDropdown(false);
    setIsLoading(false);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  };

  const handleSubmitSearch = () => {
    const trimmed = query.trim();
    setShowDropdown(false);
    if (trimmed) {
      router.push({
        pathname: '/explore',
        params: { searchQuery: trimmed },
      });
    } else {
      router.push('/explore');
    }
  };

  const handleSelectSuggestion = (suggestion: LocationSuggestion) => {
    setShowDropdown(false);
    const searchTarget = suggestion.locality || suggestion.city || suggestion.area || query.trim();
    router.push({
      pathname: '/explore',
      params: {
        searchQuery: searchTarget,
        city: suggestion.city !== 'Delhi NCR' ? suggestion.city : undefined,
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Visual Property Banner Container */}
      <View style={styles.bannerWrapper}>
        <Image
          source={require('../../../assets/images/hero-banner.png')}
          style={styles.bannerImage}
          resizeMode="cover"
          accessibilityLabel="MJ Estates Modern Architecture Banner"
        />
        {/* Soft Contrast Gradient Overlay */}
        <View style={styles.overlay} />

        {/* Hero Content Overlay */}
        <View style={styles.contentOverlay}>
          <View style={styles.tagBadge}>
            <AppText variant="caption" color="textOnGold" weight="700">
              TRUSTED REAL ESTATE ADVISORY
            </AppText>
          </View>
          <AppText variant="h1" color="textInverse" style={styles.heading}>
            Find Your Perfect Property
          </AppText>
          <AppText variant="bodySmall" color="textInverse" style={styles.subtext}>
            Discover verified homes, luxury plots and commercial spaces.
          </AppText>
        </View>
      </View>

      {/* Interactive Search Bar Section */}
      <View style={styles.searchSectionWrapper}>
        <View style={styles.searchBar}>
          <Pressable
            onPress={handleSubmitSearch}
            accessible
            accessibilityRole="button"
            accessibilityLabel={t('common.search', 'Search')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <AppIcon name="Search" size="sm" color="secondary" />
          </Pressable>

          <TextInput
            value={query}
            onChangeText={handleQueryChange}
            onSubmitEditing={handleSubmitSearch}
            placeholder={t('home.searchPlaceholder', 'Search city, locality, project, or ID...')}
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            returnKeyType="search"
            autoCorrect={false}
            accessible
            accessibilityLabel={t('home.searchPlaceholder', 'Search properties')}
          />

          {isLoading ? (
            <ActivityIndicator size="small" color={colors.secondary} style={styles.loadingSpinner} />
          ) : query.length > 0 ? (
            <Pressable
              onPress={handleClear}
              accessible
              accessibilityRole="button"
              accessibilityLabel={t('home.clearSearch', 'Clear search')}
              style={styles.clearBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <AppIcon name="X" size="xs" color="textSecondary" />
            </Pressable>
          ) : null}

          <Pressable
            onPress={() => router.push('/explore')}
            accessible
            accessibilityRole="button"
            accessibilityLabel={t('common.filter', 'Open Explore Filters')}
            style={styles.filterBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <AppIcon name="Filter" size="xs" color="textInverse" />
          </Pressable>
        </View>

        {/* Autocomplete Suggestions Dropdown */}
        {showDropdown && (
          <View style={styles.suggestionsContainer}>
            {suggestions.length > 0 ? (
              suggestions.map((item, idx) => (
                <Pressable
                  key={item.placeId || `${item.locality}-${item.city}-${idx}`}
                  onPress={() => handleSelectSuggestion(item)}
                  style={({ pressed }) => [
                    styles.suggestionRow,
                    idx < suggestions.length - 1 ? styles.suggestionDivider : null,
                    pressed ? styles.suggestionPressed : null,
                  ]}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel={`${item.locality || item.city}, ${item.formattedAddress}`}
                >
                  <View style={styles.suggestionIconWrap}>
                    <AppIcon name="MapPin" size="xs" color="secondary" />
                  </View>
                  <View style={styles.suggestionTextWrap}>
                    <AppText variant="bodySmall" weight="700" color="primary" numberOfLines={1}>
                      {item.locality || item.city}
                    </AppText>
                    <AppText variant="caption" color="textSecondary" numberOfLines={1}>
                      {item.formattedAddress}
                    </AppText>
                  </View>
                </Pressable>
              ))
            ) : !isLoading && query.trim().length >= 3 ? (
              <View style={styles.emptySuggestionRow}>
                <AppText variant="caption" color="textSecondary">
                  {t('home.noSuggestions', 'No locations matching your query')}
                </AppText>
              </View>
            ) : null}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  bannerWrapper: {
    position: 'relative',
    height: 180,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.primary,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(12, 26, 48, 0.65)',
  },
  contentOverlay: {
    ...StyleSheet.absoluteFill,
    padding: spacing.lg,
    justifyContent: 'flex-end',
  },
  tagBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.xs,
    marginBottom: spacing.xs,
  },
  heading: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    color: colors.textInverse,
    marginBottom: 4,
  },
  subtext: {
    opacity: 0.9,
  },
  searchSectionWrapper: {
    position: 'relative',
    zIndex: 10,
    marginTop: -spacing.md,
    marginHorizontal: spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    height: 50,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 14,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  loadingSpinner: {
    marginRight: spacing.xs,
  },
  clearBtn: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  filterBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  suggestionsContainer: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 4,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  suggestionDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  suggestionPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  suggestionIconWrap: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.secondarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  suggestionTextWrap: {
    flex: 1,
  },
  emptySuggestionRow: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
});
