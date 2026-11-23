/**
 * PropertySortModal Component
 * Clean bottom sheet / modal for choosing property sorting criteria.
 */

import React from 'react';
import {
  Modal,
  View,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { AppText } from '../ui/AppText';
import { AppIcon } from '../ui/AppIcon';
import { AppDivider } from '../ui/AppDivider';
import { PropertySortOption } from '../../types/property';
import { SORT_OPTIONS } from '../../constants/propertyFilters';

export interface PropertySortModalProps {
  visible: boolean;
  selectedSort: PropertySortOption;
  onSelectSort: (option: PropertySortOption) => void;
  onClose: () => void;
}

export const PropertySortModal: React.FC<PropertySortModalProps> = ({
  visible,
  selectedSort,
  onSelectSort,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.header}>
                <AppText variant="h3" color="primary">
                  Sort Properties
                </AppText>
                <Pressable
                  onPress={onClose}
                  hitSlop={8}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel="Close sort menu"
                  style={styles.closeBtn}
                >
                  <AppIcon name="X" size="sm" color="textSecondary" />
                </Pressable>
              </View>

              <AppDivider spacing="sm" />

              {/* Options */}
              <View style={styles.optionsList}>
                {SORT_OPTIONS.map((option) => {
                  const isSelected = selectedSort === option.id;

                  return (
                    <Pressable
                      key={option.id}
                      onPress={() => {
                        onSelectSort(option.id);
                        onClose();
                      }}
                      accessible
                      accessibilityRole="button"
                      accessibilityLabel={`Sort by ${option.label}`}
                      style={({ pressed }) => [
                        styles.optionRow,
                        isSelected ? styles.optionSelected : null,
                        pressed ? styles.optionPressed : null,
                      ]}
                    >
                      <AppText
                        variant="body"
                        color={isSelected ? 'primary' : 'textPrimary'}
                        weight={isSelected ? '700' : '400'}
                      >
                        {option.label}
                      </AppText>

                      {isSelected ? (
                        <AppIcon name="Check" size="sm" color="primary" />
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 43, 79, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.xs,
  },
  closeBtn: {
    padding: 4,
  },
  optionsList: {
    marginTop: spacing.xs,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  optionSelected: {
    backgroundColor: colors.primarySubtle,
  },
  optionPressed: {
    opacity: 0.7,
  },
});

