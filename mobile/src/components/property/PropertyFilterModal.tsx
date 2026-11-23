/**
 * PropertyFilterModal Component
 * Comprehensive filter interface with transaction modes, property asset classes,
 * dynamic budget presets, city selector, conditional bedroom multi-select, and property status.
 */

import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { AppText } from '../ui/AppText';
import { AppIcon } from '../ui/AppIcon';
import { AppButton } from '../ui/AppButton';
import { AppDivider } from '../ui/AppDivider';
import {
  PropertyFilterState,
  TransactionType,
  PropertyCategoryType,
  PropertyStatus,
  BedroomOption,
  PropertyItem,
} from '../../types/property';
import {
  DEFAULT_FILTER_STATE,
  TRANSACTION_FILTER_OPTIONS,
  PROPERTY_TYPE_FILTER_OPTIONS,
  BEDROOM_OPTIONS,
  STATUS_FILTER_OPTIONS,
  CITY_OPTIONS,
  BUY_BUDGET_PRESETS,
  RENT_BUDGET_PRESETS,
  BudgetPreset,
} from '../../constants/propertyFilters';
import { filterProperties, getActiveFilterCount } from '../../utils/propertyFiltering';

export interface PropertyFilterModalProps {
  visible: boolean;
  filters: PropertyFilterState;
  properties: PropertyItem[];
  onApply: (newFilters: PropertyFilterState) => void;
  onClose: () => void;
  onReset: () => void;
}

export const PropertyFilterModal: React.FC<PropertyFilterModalProps> = ({
  visible,
  filters,
  properties,
  onApply,
  onClose,
  onReset,
}) => {
  // Local draft state for atomic Apply
  const [draftFilters, setDraftFilters] = useState<PropertyFilterState>(filters);
  const [prevVisible, setPrevVisible] = useState(visible);

  // Sync draft state with props on modal open without useEffect cascading renders
  if (visible && !prevVisible) {
    setPrevVisible(true);
    setDraftFilters(filters);
  } else if (!visible && prevVisible) {
    setPrevVisible(false);
  }

  // Derived matching preview count
  const previewMatchCount = useMemo(() => {
    return filterProperties(properties, draftFilters).length;
  }, [properties, draftFilters]);

  const activeCount = useMemo(() => {
    return getActiveFilterCount(draftFilters);
  }, [draftFilters]);

  // Handle bedroom toggle
  const toggleBedroom = (opt: BedroomOption) => {
    setDraftFilters((prev) => {
      const exists = prev.bedrooms.includes(opt);
      const newBedrooms = exists
        ? prev.bedrooms.filter((b) => b !== opt)
        : [...prev.bedrooms, opt];
      return { ...prev, bedrooms: newBedrooms };
    });
  };

  // Handle budget preset selection
  const selectBudgetPreset = (preset: BudgetPreset) => {
    setDraftFilters((prev) => {
      // Toggle off if already selected
      if (prev.minPrice === preset.min && prev.maxPrice === preset.max) {
        return { ...prev, minPrice: null, maxPrice: null };
      }
      return { ...prev, minPrice: preset.min, maxPrice: preset.max };
    });
  };

  // Conditional Bedroom Visibility:
  // Only show when property type is 'residential' or 'all'
  const showBedroomsFilter =
    draftFilters.propertyType === 'residential' || draftFilters.propertyType === 'all';

  // Choose appropriate budget presets based on transaction
  const budgetPresets =
    draftFilters.transaction === 'rent' ? RENT_BUDGET_PRESETS : BUY_BUDGET_PRESETS;

  const handleApply = () => {
    onApply(draftFilters);
    onClose();
  };

  const handleReset = () => {
    setDraftFilters(DEFAULT_FILTER_STATE);
    onReset();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Modal Top Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleWrap}>
            <AppText variant="h2" color="primary">
              Filter Properties
            </AppText>
            {activeCount > 0 ? (
              <View style={styles.activeBadge}>
                <AppText variant="caption" color="textInverse" weight="700">
                  {activeCount} active
                </AppText>
              </View>
            ) : null}
          </View>

          <Pressable
            onPress={onClose}
            hitSlop={10}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Close filter modal"
            style={styles.closeBtn}
          >
            <AppIcon name="X" size="md" color="textPrimary" />
          </Pressable>
        </View>

        <AppDivider spacing="none" />

        {/* Scrollable Filter Body */}
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 1. Transaction Mode (Buy / Rent / Sell) */}
          <View style={styles.section}>
            <AppText variant="h3" color="primary" style={styles.sectionHeading}>
              Transaction Mode
            </AppText>
            <View style={styles.chipsRow}>
              {TRANSACTION_FILTER_OPTIONS.map((opt) => {
                const isSelected = draftFilters.transaction === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() =>
                      setDraftFilters((prev) => ({
                        ...prev,
                        transaction: opt.id as TransactionType | 'all',
                      }))
                    }
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel={`Select transaction ${opt.label}`}
                    style={[
                      styles.chip,
                      isSelected ? styles.chipSelected : null,
                    ]}
                  >
                    <AppText
                      variant="bodySmall"
                      color={isSelected ? 'textInverse' : 'textPrimary'}
                      weight={isSelected ? '700' : '500'}
                    >
                      {opt.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <AppDivider spacing="md" />

          {/* 2. Property Type (Residential / Commercial / Plot) */}
          <View style={styles.section}>
            <AppText variant="h3" color="primary" style={styles.sectionHeading}>
              Property Type
            </AppText>
            <View style={styles.chipsRow}>
              {PROPERTY_TYPE_FILTER_OPTIONS.map((opt) => {
                const isSelected = draftFilters.propertyType === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() =>
                      setDraftFilters((prev) => ({
                        ...prev,
                        propertyType: opt.id as PropertyCategoryType | 'all',
                        // Clear bedroom selections if switching to commercial or plot
                        bedrooms:
                          opt.id === 'commercial' || opt.id === 'plot'
                            ? []
                            : prev.bedrooms,
                      }))
                    }
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel={`Select property type ${opt.label}`}
                    style={[
                      styles.chip,
                      isSelected ? styles.chipSelected : null,
                    ]}
                  >
                    <AppText
                      variant="bodySmall"
                      color={isSelected ? 'textInverse' : 'textPrimary'}
                      weight={isSelected ? '700' : '500'}
                    >
                      {opt.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <AppDivider spacing="md" />

          {/* 3. Budget Range Presets */}
          <View style={styles.section}>
            <AppText variant="h3" color="primary" style={styles.sectionHeading}>
              Budget Range {draftFilters.transaction === 'rent' ? '(Monthly)' : ''}
            </AppText>
            <View style={styles.chipsRow}>
              {budgetPresets.map((preset) => {
                const isSelected =
                  draftFilters.minPrice === preset.min &&
                  draftFilters.maxPrice === preset.max;

                return (
                  <Pressable
                    key={preset.id}
                    onPress={() => selectBudgetPreset(preset)}
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel={`Select budget ${preset.label}`}
                    style={[
                      styles.chip,
                      isSelected ? styles.chipGoldSelected : null,
                    ]}
                  >
                    <AppText
                      variant="bodySmall"
                      color={isSelected ? 'textOnGold' : 'textPrimary'}
                      weight={isSelected ? '700' : '500'}
                    >
                      {preset.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <AppDivider spacing="md" />

          {/* 4. Location (City) */}
          <View style={styles.section}>
            <AppText variant="h3" color="primary" style={styles.sectionHeading}>
              Location / City
            </AppText>
            <View style={styles.chipsRow}>
              {CITY_OPTIONS.map((city) => {
                const isSelected =
                  city === 'All Cities'
                    ? draftFilters.city === 'all' || draftFilters.city === 'All Cities' || draftFilters.city === ''
                    : draftFilters.city.toLowerCase() === city.toLowerCase();

                return (
                  <Pressable
                    key={city}
                    onPress={() =>
                      setDraftFilters((prev) => ({
                        ...prev,
                        city: city === 'All Cities' ? 'all' : city,
                      }))
                    }
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel={`Select city ${city}`}
                    style={[
                      styles.chip,
                      isSelected ? styles.chipSelected : null,
                    ]}
                  >
                    <AppText
                      variant="bodySmall"
                      color={isSelected ? 'textInverse' : 'textPrimary'}
                      weight={isSelected ? '700' : '500'}
                    >
                      {city}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* 5. Bedrooms Filter (CONDITIONAL: Hidden for Commercial and Land/Plot) */}
          {showBedroomsFilter ? (
            <>
              <AppDivider spacing="md" />
              <View style={styles.section}>
                <View style={styles.bedroomTitleRow}>
                  <AppText variant="h3" color="primary" style={styles.sectionHeading}>
                    Bedrooms (BHK)
                  </AppText>
                  <AppText variant="caption" color="textMuted">
                    Multi-select
                  </AppText>
                </View>
                <View style={styles.chipsRow}>
                  {BEDROOM_OPTIONS.map((opt) => {
                    const isSelected = draftFilters.bedrooms.includes(opt.id);

                    return (
                      <Pressable
                        key={opt.id}
                        onPress={() => toggleBedroom(opt.id)}
                        accessible
                        accessibilityRole="button"
                        accessibilityLabel={`Toggle ${opt.label}`}
                        style={[
                          styles.chip,
                          isSelected ? styles.chipSelected : null,
                        ]}
                      >
                        <AppText
                          variant="bodySmall"
                          color={isSelected ? 'textInverse' : 'textPrimary'}
                          weight={isSelected ? '700' : '500'}
                        >
                          {opt.label}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </>
          ) : null}

          <AppDivider spacing="md" />

          {/* 6. Property Availability Status */}
          <View style={styles.section}>
            <AppText variant="h3" color="primary" style={styles.sectionHeading}>
              Property Status
            </AppText>
            <View style={styles.chipsRow}>
              {STATUS_FILTER_OPTIONS.map((opt) => {
                const isSelected = draftFilters.status === opt.id;

                return (
                  <Pressable
                    key={opt.id}
                    onPress={() =>
                      setDraftFilters((prev) => ({
                        ...prev,
                        status: opt.id as PropertyStatus | 'all',
                      }))
                    }
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel={`Select status ${opt.label}`}
                    style={[
                      styles.chip,
                      isSelected ? styles.chipSelected : null,
                    ]}
                  >
                    <AppText
                      variant="bodySmall"
                      color={isSelected ? 'textInverse' : 'textPrimary'}
                      weight={isSelected ? '700' : '500'}
                    >
                      {opt.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </ScrollView>

        {/* Sticky Action Footer */}
        <View style={styles.footer}>
          <AppButton
            title="Reset All"
            variant="outline"
            size="md"
            onPress={handleReset}
            style={styles.resetBtn}
          />
          <AppButton
            title={`Apply (${previewMatchCount} Results)`}
            variant="primary"
            size="md"
            onPress={handleApply}
            style={styles.applyBtn}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  activeBadge: {
    backgroundColor: colors.secondaryDark,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  closeBtn: {
    padding: 6,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  section: {
    marginVertical: spacing.xs,
  },
  sectionHeading: {
    marginBottom: spacing.sm,
  },
  bedroomTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipGoldSelected: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondaryDark,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  resetBtn: {
    flex: 1,
  },
  applyBtn: {
    flex: 2,
  },
});
