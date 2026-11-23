import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../src/theme/colors';
import { spacing, layout } from '../../src/theme/spacing';
import {
  HomeHeader,
  HeroSection,
  PropertyCategories,
  PropertyTypeSection,
  FeaturedProperties,
  LatestProperties,
  PopularLocations,
  QuickContact,
  AppText,
} from '../../src/components';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* 1. Top Header: Branding, Location Coverage Badge & Profile Entry */}
      <HomeHeader />

      {/* Main Home Screen Scrollable Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Hero Section & Interactive Autocomplete Search */}
        <HeroSection />

        {/* 3. Primary Actions: Buy, Rent & Sell / List */}
        <PropertyCategories />

        {/* 4. Curated Featured Properties (Real Backend Data Carousel) */}
        <FeaturedProperties />

        {/* 5. Recently Added / Latest Properties (Real Backend Data) */}
        <LatestProperties />

        {/* 6. Popular Locations (Key Delhi-NCR Corridors) */}
        <PopularLocations />

        {/* 7. Property Asset Classes (Residential, Commercial, Land / Plot) */}
        <PropertyTypeSection />

        {/* 8. Quick Direct Consultation (Call & WhatsApp) */}
        <QuickContact />

        {/* 9. Footer Brand Note */}
        <View style={styles.footerBrand}>
          <AppText variant="caption" color="textMuted" align="center">
            MJ Estates • Trusted Real Estate Brokerage & Advisory{'\n'}
            Serving Delhi, UP, Ghaziabad, Noida, Gurugram & Indirapuram
          </AppText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.xs,
    paddingBottom: spacing.huge + spacing.xl, // Safe padding preventing bottom tab overlap
  },
  footerBrand: {
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
});
