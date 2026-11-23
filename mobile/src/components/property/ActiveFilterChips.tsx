/**
 * ActiveFilterChips Component
 * Horizontal scrolling list of currently applied filter tags with 1-tap removal.
 */

import React from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { AppText } from '../ui/AppText';
import { AppIcon } from '../ui/AppIcon';
import { ActiveFilterChip } from '../../types/property';

export interface ActiveFilterChipsProps {
  chips: ActiveFilterChip[];
  onRemoveChip: (chip: ActiveFilterChip) => void;
  onClearAll: () => void;
}

export const ActiveFilterChips: React.FC<ActiveFilterChipsProps> = ({
  chips,
  onRemoveChip,
  onClearAll,
}) => {
  if (!chips || chips.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {chips.map((chip) => (
          <View key={chip.id} style={styles.chip}>
            <AppText variant="caption" color="primary" weight="600" style={styles.chipLabel}>
              {chip.label}
            </AppText>
            <Pressable
              onPress={() => onRemoveChip(chip)}
              hitSlop={6}
              accessible
              accessibilityRole="button"
              accessibilityLabel={`Remove filter ${chip.label}`}
              style={styles.removeBtn}
            >
              <AppIcon name="X" size="xs" color="primary" />
            </Pressable>
          </View>
        ))}

        {chips.length > 1 ? (
          <Pressable
            onPress={onClearAll}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Clear all filters"
            style={styles.clearAllBtn}
          >
            <AppText variant="caption" color="secondaryDark" weight="700">
              Clear All
            </AppText>
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySubtle,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.full,
    paddingVertical: 4,
    paddingLeft: spacing.sm,
    paddingRight: 6,
  },
  chipLabel: {
    fontSize: 12,
    marginRight: 4,
  },
  removeBtn: {
    padding: 2,
  },
  clearAllBtn: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    marginLeft: 2,
  },
});

