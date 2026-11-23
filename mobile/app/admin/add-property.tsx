/**
 * Add Property Screen — app/admin/add-property.tsx
 * Comprehensive administrative intake form supporting the full MJ Estates data model:
 * Basic Info, Location, Pricing, Dynamic Specifications, and placeholder media assignment.
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  AppText,
  AppCard,
  AppButton,
  AppInput,
  AppHeader,
  AppIcon,
  AppDivider,
  MediaSection,
  LocationPickerModal,
  LocationPickerResult,
} from '../../src/components';
import { colors } from '../../src/theme/colors';
import { spacing, layout } from '../../src/theme/spacing';
import { radius } from '../../src/theme/radius';
import { useAdminProperties } from '../../src/hooks/useAdminProperties';
import { formatIndianCurrency } from '../../src/utils/formatting';
import {
  PropertyStatus,
  TransactionType,
  PropertyCategoryType,
  CreatePropertyInput,
} from '../../src/types/property';
import { MediaAsset } from '../../src/types/media';

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';

export default function AddPropertyScreen() {
  const router = useRouter();
  const { addProperty } = useAdminProperties();

  // Basic Information
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [transaction, setTransaction] = useState<TransactionType>('buy');
  const [propertyType, setPropertyType] = useState<PropertyCategoryType>('residential');
  const [status, setStatus] = useState<PropertyStatus>('available');

  // Location
  const [city, setCity] = useState('Delhi NCR');
  const [locality, setLocality] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [formattedAddress, setFormattedAddress] = useState('');
  const [isLocationPickerVisible, setIsLocationPickerVisible] = useState(false);

  // Pricing
  const [priceStr, setPriceStr] = useState('');

  // Specifications
  const [bedrooms, setBedrooms] = useState('3 BHK');
  const [bathroomsStr, setBathroomsStr] = useState('3');
  const [areaStr, setAreaStr] = useState('');
  const [furnishing, setFurnishing] = useState<'Unfurnished' | 'Semi-Furnished' | 'Fully Furnished'>(
    'Semi-Furnished'
  );
  const [parking, setParking] = useState('2 Dedicated Covered');
  const [floor, setFloor] = useState('4th Floor');
  const [totalFloorsStr, setTotalFloorsStr] = useState('14');

  // Media Assets (Images & Optional Video Tour)
  const [images, setImages] = useState<MediaAsset[]>([]);
  const [video, setVideo] = useState<MediaAsset | null>(null);

  // Validation & Loading
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const numericPrice = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!title.trim()) {
      errs.title = 'Property title is required';
    } else if (title.trim().length < 5) {
      errs.title = 'Title must be at least 5 characters long';
    }

    if (!locality.trim()) {
      errs.locality = 'Locality or sector is required';
    }

    if (!city.trim()) {
      errs.city = 'City is required';
    }

    if (!priceStr.trim()) {
      errs.price = 'Price is required';
    } else if (isNaN(numericPrice) || numericPrice <= 0) {
      errs.price = 'Enter a valid numeric price';
    }

    if (!areaStr.trim()) {
      errs.area = 'Property area is required (e.g. 1850 sq ft)';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Incomplete Form', 'Please resolve the highlighted fields before saving.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreatePropertyInput = {
        title: title.trim(),
        description: description.trim() || `${bedrooms} ${propertyType} property located in ${locality}, ${city}. Verified ownership documentation and clear titles.`,
        transaction,
        propertyType,
        subType: propertyType === 'residential' ? 'Luxury Apartment' : propertyType === 'commercial' ? 'Commercial Suite' : 'Residential Plot',
        price: numericPrice,
        priceUnit: transaction === 'rent' ? 'per_month' : 'total',
        city: city.trim(),
        locality: locality.trim(),
        address: address.trim() || `${locality}, ${city}`,
        latitude: latitude ?? undefined,
        longitude: longitude ?? undefined,
        formattedAddress: formattedAddress.trim() || undefined,
        country: 'India',
        area: areaStr.trim().includes('sq ft') ? areaStr.trim() : `${areaStr.trim()} sq ft`,
        builtUpArea: areaStr.trim(),
        carpetArea: `${Math.round(numericPrice > 0 ? 0.8 * (parseFloat(areaStr) || 1200) : 1000)} sq ft`,
        bedrooms: propertyType === 'residential' ? bedrooms : undefined,
        bathrooms: propertyType === 'residential' ? parseInt(bathroomsStr, 10) || 2 : undefined,
        furnishingStatus: propertyType === 'residential' ? furnishing : undefined,
        parking: parking.trim() || undefined,
        floor: floor.trim() || undefined,
        totalFloors: parseInt(totalFloorsStr, 10) || undefined,
        status,
        images: images.length > 0 ? images.map((img) => img.uri) : [PLACEHOLDER_IMAGE],
        videoUrl: video ? video.uri : undefined,
        videoThumbnail: video ? (images[0]?.uri || PLACEHOLDER_IMAGE) : undefined,
      };

      const created = await addProperty(payload);
      Alert.alert(
        'Property Created',
        `"${created.title}" (ID: #${created.id}) has been added to the inventory catalog.`,
        [
          {
            text: 'OK',
            onPress: () => router.replace('/admin/properties'),
          },
        ]
      );
    } catch {
      Alert.alert('Creation Failed', 'Unable to create property. Please verify your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <AppHeader
        title="Add Property"
        subtitle="New Listing Intake"
        showBack
        onBackPress={() => router.back()}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* SECTION 1: BASIC INFORMATION */}
          <AppCard style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <AppIcon name="Building" size="sm" color="primary" />
              <AppText variant="h3" color="primary" style={styles.sectionTitle}>
                1. Basic Information
              </AppText>
            </View>
            <AppDivider spacing="sm" />

            <View style={styles.fieldWrapper}>
              <AppInput
                label="Property Title *"
                placeholder="e.g. 3 BHK Luxury Apartment in DLF Phase 5"
                value={title}
                onChangeText={(val) => {
                  setTitle(val);
                  if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
                }}
                error={errors.title}
              />
            </View>

            <View style={styles.fieldWrapper}>
              <AppInput
                label="Description"
                placeholder="Comprehensive property description and highlights..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Transaction Purpose Selector */}
            <View style={styles.fieldWrapper}>
              <AppText variant="bodySmall" color="textPrimary" weight="600" style={styles.label}>
                Purpose / Transaction Type *
              </AppText>
              <View style={styles.segmentedRow}>
                {(['buy', 'rent'] as const).map((trx) => {
                  const isSelected = transaction === trx;
                  return (
                    <Pressable
                      key={trx}
                      onPress={() => setTransaction(trx)}
                      style={[styles.segmentBtn, isSelected ? styles.segmentSelected : null]}
                    >
                      <AppText
                        variant="bodySmall"
                        color={isSelected ? 'textInverse' : 'textPrimary'}
                        weight="700"
                      >
                        {trx === 'buy' ? 'For Sale (Buy)' : 'For Rent'}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Property Type Selector */}
            <View style={styles.fieldWrapper}>
              <AppText variant="bodySmall" color="textPrimary" weight="600" style={styles.label}>
                Property Category *
              </AppText>
              <View style={styles.segmentedRow}>
                {(['residential', 'commercial', 'plot'] as const).map((type) => {
                  const isSelected = propertyType === type;
                  return (
                    <Pressable
                      key={type}
                      onPress={() => setPropertyType(type)}
                      style={[styles.segmentBtn, isSelected ? styles.segmentSelected : null]}
                    >
                      <AppText
                        variant="caption"
                        color={isSelected ? 'textInverse' : 'textPrimary'}
                        weight="700"
                      >
                        {type === 'residential' ? 'Residential' : type === 'commercial' ? 'Commercial' : 'Plot / Land'}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Status Selector */}
            <View style={styles.fieldWrapper}>
              <AppText variant="bodySmall" color="textPrimary" weight="600" style={styles.label}>
                Initial Listing Status *
              </AppText>
              <View style={styles.segmentedRow}>
                {(['available', 'sold', 'rented'] as const).map((st) => {
                  const isSelected = status === st;
                  return (
                    <Pressable
                      key={st}
                      onPress={() => setStatus(st)}
                      style={[styles.segmentBtn, isSelected ? styles.segmentSelected : null]}
                    >
                      <AppText
                        variant="caption"
                        color={isSelected ? 'textInverse' : 'textPrimary'}
                        weight="700"
                      >
                        {st.toUpperCase()}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </AppCard>

          {/* SECTION 2: LOCATION */}
          <AppCard style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <AppIcon name="MapPin" size="sm" color="primary" />
              <AppText variant="h3" color="primary" style={styles.sectionTitle}>
                2. Location & Address
              </AppText>
            </View>
            <AppDivider spacing="sm" />

            <Pressable
              onPress={() => setIsLocationPickerVisible(true)}
              style={({ pressed }) => [
                styles.mapTriggerBtn,
                pressed ? styles.mapTriggerBtnPressed : null,
              ]}
            >
              <AppIcon name="MapPin" size="sm" color="primary" />
              <View style={styles.mapTriggerTextWrapper}>
                <AppText variant="bodySmall" color="primary" weight="700">
                  {latitude && longitude ? 'Adjust Location on Map' : 'Pick on OpenFreeMap'}
                </AppText>
                <AppText variant="caption" color="textSecondary">
                  {latitude && longitude
                    ? `${latitude.toFixed(4)}°, ${longitude.toFixed(4)}° • Tap to modify`
                    : 'Search address or drop pin on vector map'}
                </AppText>
              </View>
              <AppIcon name="ChevronRight" size="xs" color="primary" />
            </Pressable>

            {latitude && longitude && (
              <View style={styles.coordsCard}>
                <View style={styles.coordsBadgeRow}>
                  <AppIcon name="CheckCircle" size="xs" color="success" />
                  <AppText variant="caption" color="success" weight="700">
                    GEOTAGGED: {latitude.toFixed(4)}°, {longitude.toFixed(4)}°
                  </AppText>
                </View>
                {formattedAddress ? (
                  <AppText variant="caption" color="textSecondary" style={styles.coordsAddress}>
                    {formattedAddress}
                  </AppText>
                ) : null}
              </View>
            )}

            <View style={styles.fieldWrapper}>
              <AppInput
                label="City / Region *"
                placeholder="e.g. Delhi NCR, Gurugram, Noida"
                value={city}
                onChangeText={(val) => {
                  setCity(val);
                  if (errors.city) setErrors((prev) => ({ ...prev, city: '' }));
                }}
                error={errors.city}
              />
            </View>

            <View style={styles.fieldWrapper}>
              <AppInput
                label="Locality / Sector *"
                placeholder="e.g. DLF Phase 5, Golf Course Road"
                value={locality}
                onChangeText={(val) => {
                  setLocality(val);
                  if (errors.locality) setErrors((prev) => ({ ...prev, locality: '' }));
                }}
                error={errors.locality}
              />
            </View>

            <View style={styles.fieldWrapper}>
              <AppInput
                label="Full Address / Landmark"
                placeholder="e.g. Tower B, The Crest, Sector 54"
                value={address}
                onChangeText={setAddress}
              />
            </View>
          </AppCard>

          {/* SECTION 3: PRICING */}
          <AppCard style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <AppIcon name="Tag" size="sm" color="primary" />
              <AppText variant="h3" color="primary" style={styles.sectionTitle}>
                3. Pricing & Valuation
              </AppText>
            </View>
            <AppDivider spacing="sm" />

            <View style={styles.fieldWrapper}>
              <AppInput
                label={transaction === 'rent' ? 'Monthly Rent (in ₹) *' : 'Demand Price (in ₹) *'}
                placeholder="e.g. 25000000 for ₹2.5 Cr"
                value={priceStr}
                onChangeText={(val) => {
                  setPriceStr(val);
                  if (errors.price) setErrors((prev) => ({ ...prev, price: '' }));
                }}
                error={errors.price}
                keyboardType="numeric"
              />
              {numericPrice > 0 && (
                <View style={styles.pricePreviewBox}>
                  <AppText variant="caption" color="textSecondary">
                    Formatted Price Preview:
                  </AppText>
                  <AppText variant="body" color="primary" weight="700">
                    {formatIndianCurrency(numericPrice)}
                    {transaction === 'rent' ? ' / month' : ''}
                  </AppText>
                </View>
              )}
            </View>
          </AppCard>

          {/* SECTION 4: SPECIFICATIONS */}
          <AppCard style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <AppIcon name="Maximize2" size="sm" color="primary" />
              <AppText variant="h3" color="primary" style={styles.sectionTitle}>
                4. Specifications & Dimensions
              </AppText>
            </View>
            <AppDivider spacing="sm" />

            <View style={styles.fieldWrapper}>
              <AppInput
                label="Super Built-up / Carpet Area *"
                placeholder="e.g. 2450 sq ft"
                value={areaStr}
                onChangeText={(val) => {
                  setAreaStr(val);
                  if (errors.area) setErrors((prev) => ({ ...prev, area: '' }));
                }}
                error={errors.area}
              />
            </View>

            {propertyType === 'residential' && (
              <>
                <View style={styles.fieldWrapper}>
                  <AppText variant="bodySmall" color="textPrimary" weight="600" style={styles.label}>
                    Bedrooms
                  </AppText>
                  <View style={styles.segmentedRow}>
                    {['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK'].map((bhk) => {
                      const isSelected = bedrooms === bhk;
                      return (
                        <Pressable
                          key={bhk}
                          onPress={() => setBedrooms(bhk)}
                          style={[styles.smallPill, isSelected ? styles.pillActive : null]}
                        >
                          <AppText
                            variant="caption"
                            color={isSelected ? 'textInverse' : 'textPrimary'}
                            weight="700"
                          >
                            {bhk}
                          </AppText>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.fieldWrapper}>
                  <AppInput
                    label="Bathrooms"
                    placeholder="e.g. 3"
                    value={bathroomsStr}
                    onChangeText={setBathroomsStr}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.fieldWrapper}>
                  <AppText variant="bodySmall" color="textPrimary" weight="600" style={styles.label}>
                    Furnishing Status
                  </AppText>
                  <View style={styles.segmentedRow}>
                    {(['Unfurnished', 'Semi-Furnished', 'Fully Furnished'] as const).map((f) => {
                      const isSelected = furnishing === f;
                      return (
                        <Pressable
                          key={f}
                          onPress={() => setFurnishing(f)}
                          style={[styles.segmentBtn, isSelected ? styles.segmentSelected : null]}
                        >
                          <AppText
                            variant="caption"
                            color={isSelected ? 'textInverse' : 'textPrimary'}
                            weight="700"
                          >
                            {f}
                          </AppText>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </>
            )}

            <View style={styles.fieldWrapper}>
              <AppInput
                label="Property Floor"
                placeholder="e.g. 4th Floor"
                value={floor}
                onChangeText={setFloor}
              />
            </View>

            <View style={styles.fieldWrapper}>
              <AppInput
                label="Total Floors in Building"
                placeholder="e.g. 14"
                value={totalFloorsStr}
                onChangeText={setTotalFloorsStr}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.fieldWrapper}>
              <AppInput
                label="Parking Bays"
                placeholder="e.g. 2 Dedicated Covered"
                value={parking}
                onChangeText={setParking}
              />
            </View>
          </AppCard>

          {/* SECTION 5: PROPERTY MEDIA */}
          <MediaSection
            images={images}
            onImagesChange={(newImages) => {
              setImages(newImages);
              if (errors.images) setErrors((prev) => ({ ...prev, images: '' }));
            }}
            video={video}
            onVideoChange={setVideo}
            disabled={isSubmitting}
            error={errors.images}
            stepNumber={5}
          />

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <AppButton
              title="Save & Publish to Inventory"
              variant="secondary"
              size="lg"
              loading={isSubmitting}
              leftIcon={<AppIcon name="Check" size="sm" color="textOnGold" />}
              onPress={handleSave}
              style={styles.saveBtn}
            />

            <AppButton
              title="Cancel"
              variant="outline"
              size="md"
              disabled={isSubmitting}
              onPress={() => router.back()}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <LocationPickerModal
        visible={isLocationPickerVisible}
        onClose={() => setIsLocationPickerVisible(false)}
        onConfirm={(res: LocationPickerResult) => {
          setLatitude(res.latitude);
          setLongitude(res.longitude);
          setFormattedAddress(res.formattedAddress);
          if (res.locality) setLocality(res.locality);
          if (res.city) setCity(res.city);
          if (res.formattedAddress && !address) setAddress(res.formattedAddress);
          setIsLocationPickerVisible(false);
        }}
        initialLatitude={latitude ?? undefined}
        initialLongitude={longitude ?? undefined}
        initialLocality={locality}
        initialCity={city}
        initialAddress={address}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.lg,
  },
  sectionCard: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sectionTitle: {
    marginLeft: spacing.xxs,
  },
  fieldWrapper: {
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.xs,
  },
  segmentedRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  smallPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pricePreviewBox: {
    marginTop: spacing.xs,
    padding: spacing.sm,
    backgroundColor: colors.primarySubtle,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mediaNoticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  mediaNoticeText: {
    lineHeight: 18,
  },
  actionsContainer: {
    gap: spacing.sm,
    marginBottom: spacing.xxl,
  },
  saveBtn: {
    marginBottom: spacing.xxs,
  },
  mapTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm + 2,
    backgroundColor: '#F8FAFC',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.sm,
  },
  mapTriggerBtnPressed: {
    backgroundColor: '#EFF6FF',
    borderColor: colors.primary,
  },
  mapTriggerTextWrapper: {
    flex: 1,
    gap: 2,
  },
  coordsCard: {
    backgroundColor: '#F0FDF4',
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: spacing.sm,
    gap: 4,
  },
  coordsBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  coordsAddress: {
    color: '#15803D',
    lineHeight: 16,
  },
});
