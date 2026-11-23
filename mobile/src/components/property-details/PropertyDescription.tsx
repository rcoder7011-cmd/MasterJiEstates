/**
 * PropertyDescription Component
 * Displays property description with interactive Read More / Read Less toggle,
 * HTML tag sanitization, and line break preservation.
 */

import React, { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { spacing } from '../../theme/spacing';
import { AppText } from '../ui/AppText';
import { AppIcon } from '../ui/AppIcon';
import { useTranslation } from '../../hooks/useTranslation';

export interface PropertyDescriptionProps {
  description?: string;
}

const TRUNCATE_LENGTH = 180;

export const PropertyDescription: React.FC<PropertyDescriptionProps> = ({
  description,
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!description || description.trim() === '') {
    return null;
  }

  // Sanitize any accidental HTML tags (e.g. from web CMS)
  const cleanDescription = description
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .trim();

  if (cleanDescription.length === 0) {
    return null;
  }

  const isLong = cleanDescription.length > TRUNCATE_LENGTH;
  const displayedText = isLong && !isExpanded
    ? `${cleanDescription.slice(0, TRUNCATE_LENGTH).trim()}...`
    : cleanDescription;

  return (
    <View style={styles.container}>
      <View style={styles.headingRow}>
        <AppIcon name="Info" size="sm" color="primary" />
        <AppText variant="h3" color="primary" style={styles.headingText}>
          {t('propertyDetails.aboutTitle', 'About This Property')}
        </AppText>
      </View>

      <AppText variant="body" color="textSecondary" style={styles.bodyText}>
        {displayedText}
      </AppText>

      {isLong ? (
        <Pressable
          onPress={() => setIsExpanded(!isExpanded)}
          accessible
          accessibilityRole="button"
          accessibilityLabel={isExpanded ? t('propertyDetails.readLess', 'Show Less') : t('propertyDetails.readMore', 'Read More')}
          style={styles.toggleBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <AppText variant="caption" color="secondaryDark" weight="700">
            {isExpanded ? t('propertyDetails.readLess', 'Show Less') : t('propertyDetails.readMore', 'Read More')}
          </AppText>
          <AppIcon
            name={isExpanded ? 'ChevronRight' : 'ChevronDown'}
            size="xs"
            color="secondaryDark"
          />
        </Pressable>
      ) : null}
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
  bodyText: {
    lineHeight: 22,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
});
