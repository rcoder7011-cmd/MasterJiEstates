/**
 * PropertyFullScreenViewer Component
 * High-immersion full-screen modal viewer for photo gallery inspection.
 */

import React, { useState } from 'react';
import {
  Modal,
  View,
  Image,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { AppText } from '../ui/AppText';
import { AppIcon } from '../ui/AppIcon';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface PropertyFullScreenViewerProps {
  visible: boolean;
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

export const PropertyFullScreenViewer: React.FC<PropertyFullScreenViewerProps> = ({
  visible,
  images,
  initialIndex = 0,
  onClose,
}) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  if (!visible || !images || images.length === 0) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        {/* Top Header Bar */}
        <View style={styles.topBar}>
          <Pressable
            onPress={onClose}
            hitSlop={12}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Close full screen image viewer"
            style={styles.closeBtn}
          >
            <AppIcon name="X" size="md" color="textInverse" />
          </Pressable>

          <View style={styles.counterBadge}>
            <AppText variant="caption" color="textInverse" weight="700">
              {activeIndex + 1} / {images.length}
            </AppText>
          </View>
        </View>

        {/* Full Screen Image Slider */}
        <FlatList
          data={images}
          horizontal
          pagingEnabled
          initialScrollIndex={initialIndex < images.length ? initialIndex : 0}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const newIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
            setActiveIndex(newIndex);
          }}
          keyExtractor={(_, index) => `fullscreen-img-${index}`}
          renderItem={({ item }) => (
            <View style={styles.imageWrap}>
              <Image
                source={{ uri: item }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            </View>
          )}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    zIndex: 10,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  imageWrap: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 140,
  },
});
