/**
 * PropertySearchBar Component
 * Responsive search bar with instant clear action, filter modal trigger,
 * and sort trigger for Explore screen.
 */

import React from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { AppIcon } from '../ui/AppIcon';
import { AppText } from '../ui/AppText';

export interface PropertySearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onFilterPress: () => void;
  onSortPress: () => void;
  activeFilterCount?: number;
  placeholder?: string;
}

export const PropertySearchBar: React.FC<PropertySearchBarProps> = ({
  value,
  onChangeText,
  onFilterPress,
  onSortPress,
  activeFilterCount = 0,
  placeholder = 'Search by sector, city, title...',
}) => {
  return (
    <View style={styles.container}>
      {/* Search Input Box */}
      <View style={styles.inputContainer}>
        <AppIcon name="Search" size="sm" color="textMuted" />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          style={styles.textInput}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="never"
        />
        {value.length > 0 ? (
          <Pressable
            onPress={() => onChangeText('')}
            hitSlop={8}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Clear search text"
            style={styles.clearBtn}
          >
            <AppIcon name="X" size="xs" color="textMuted" />
          </Pressable>
        ) : null}
      </View>

      {/* Filter Action Trigger Button */}
      <Pressable
        onPress={onFilterPress}
        accessible
        accessibilityRole="button"
        accessibilityLabel={`Filter properties. ${activeFilterCount} filters active`}
        style={({ pressed }) => [
          styles.actionBtn,
          activeFilterCount > 0 ? styles.activeFilterBtn : null,
          pressed ? styles.btnPressed : null,
        ]}
      >
        <AppIcon
          name="SlidersHorizontal"
          size="sm"
          color={activeFilterCount > 0 ? 'textInverse' : 'primary'}
        />
        {activeFilterCount > 0 ? (
          <View style={styles.badgeWrap}>
            <AppText variant="caption" color="textInverse" weight="800" style={styles.badgeText}>
              {activeFilterCount}
            </AppText>
          </View>
        ) : null}
      </Pressable>

      {/* Sort Action Trigger Button */}
      <Pressable
        onPress={onSortPress}
        accessible
        accessibilityRole="button"
        accessibilityLabel="Sort properties"
        style={({ pressed }) => [
          styles.actionBtn,
          pressed ? styles.btnPressed : null,
        ]}
      >
        <AppIcon name="ArrowUpDown" size="sm" color="primary" />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    height: 44,
  },
  textInput: {
    flex: 1,
    marginLeft: spacing.xs,
    fontSize: 14,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeFilterBtn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  btnPressed: {
    opacity: 0.8,
  },
  badgeWrap: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.secondaryDark,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  badgeText: {
    fontSize: 10,
    lineHeight: 12,
  },
});
