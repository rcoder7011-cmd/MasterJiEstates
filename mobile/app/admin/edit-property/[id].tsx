/**
 * Edit Property Screen — app/admin/edit-property/[id].tsx
 * Loads existing listing data, validates updates, handles invalid IDs,
 * persists modifications locally, and provides quick deletion.
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AppText,
  AppCard,
  AppButton,
  AppInput,
  AppHeader,
  AppIcon,
  AppDivider,
  AppLoader,
  MediaSection,
  LocationPickerModal,
  LocationPickerResult,
} from '../../../src/components';
import { colors } from '../../../src/theme/colors';
import { spacing, layout } from '../../../src/theme/spacing';
import { radius } from '../../../src/theme/radius';
import { useAdminProperties } from '../../../src/hooks/useAdminProperties';
import { formatIndianCurrency } from '../../../src/utils/formatting';
import {
  PropertyStatus,
  TransactionType,
  PropertyCategoryType,
  PropertyItem,
} from '../../../src/types/property';
import { MediaAsset } from '../../../src/types/media';

interface EditFormProps {
  property: PropertyItem;
  onSave: (updates: Partial<PropertyItem>) => Promise<void>;
  onDelete: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

function EditPropertyForm({
  property,
  onSave,
  onDelete,
  onCancel,
  isSubmitting,
}: EditFormProps) {
  const [title, setTitle] = useState(property.title || '');
  const [description, setDescription] = useState(property.description || '');
  const [transaction, setTransaction] = useState<TransactionType>(property.transaction || 'buy');
  const [propertyType, setPropertyType] = useState<PropertyCategoryType>(property.propertyType || 'residential');
  const [status, setStatus] = useState<PropertyStatus>(property.status || 'available');

  const [city, setCity] = useState(property.city || '');
  const [locality, setLocality] = useState(property.locality || '');
  const [address, setAddress] = useState(property.address || '');
  const [latitude, setLatitude] = useState<number | null>(property.latitude ?? null);
  const [longitude, setLongitude] = useState<number | null>(property.longitude ?? null);
  const [formattedAddress, setFormattedAddress] = useState(property.formattedAddress || '');
  const [isLocationPickerVisible, setIsLocationPickerVisible] = useState(false);

  const [priceStr, setPriceStr] = useState(property.price ? property.price.toString() : '');
  const [bedrooms, setBedrooms] = useState(property.bedrooms || '3 BHK');
  const [bathroomsStr, setBathroomsStr] = useState(property.bathrooms ? property.bathrooms.toString() : '2');
  const [areaStr, setAreaStr] = useState(property.area || property.builtUpArea || '');
  const [furnishing, setFurnishing] = useState<'Unfurnished' | 'Semi-Furnished' | 'Fully Furnished'>(
    property.furnishingStatus || 'Semi-Furnished'
  );
  const [parking, setParking] = useState(property.parking || '');
  const [floor, setFloor] = useState(property.floor || '');

  // Media Assets (Preserve remote assets while allowing local additions/removals)
  const [images, setImages] = useState<MediaAsset[]>(() => {
    return property.images && property.images.length > 0
      ? property.images.map((url, idx) => ({
          id: `existing-img-${idx}-${url.slice(-8)}`,
          uri: url,
          name: `Photo ${idx + 1}`,
          type: 'image',
          isCover: idx === 0,
          isRemote: true,
        }))
      : [];
  });

  const [video, setVideo] = useState<MediaAsset | null>(() => {
    return property.videoUrl
      ? {
          id: 'existing-video',
          uri: property.videoUrl,
          name: 'Property Video Tour',
          type: 'video',
          isRemote: true,
        }
      : null;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const numericPrice = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;

  const validate = (): boolean => {
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
      errs.area = 'Property area is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFormSubmit = () => {
    if (!validate()) {
      Alert.alert('Incomplete Form', 'Please resolve the highlighted fields before saving.');
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      transaction,
      propertyType,
      price: numericPrice,
      priceUnit: transaction === 'rent' ? 'per_month' : 'total',
      city: city.trim(),
      locality: locality.trim(),
      address: address.trim(),
      latitude: latitude ?? undefined,
      longitude: longitude ?? undefined,
      formattedAddress: formattedAddress.trim() || undefined,
      country: 'India',
      area: areaStr.trim().includes('sq ft') ? areaStr.trim() : `${areaStr.trim()} sq ft`,
      builtUpArea: areaStr.trim(),
      bedrooms: propertyType === 'residential' ? bedrooms : undefined,
      bathrooms: propertyType === 'residential' ? parseInt(bathroomsStr, 10) || 2 : undefined,
      furnishingStatus: propertyType === 'residential' ? furnishing : undefined,
      parking: parking.trim() || undefined,
      floor: floor.trim() || undefined,
      status,
      images: images.map((img) => img.uri),
      videoUrl: video ? video.uri : undefined,
      videoThumbnail: video ? (images[0]?.uri || property.videoThumbnail) : undefined,
    });
  };

  return (
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
              Listing Status *
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
              label="Full Address"
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
              label="Floor"
              value={floor}
              onChangeText={setFloor}
            />
          </View>

          <View style={styles.fieldWrapper}>
            <AppInput
              label="Parking Bays"
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
            title="Save Changes"
            variant="secondary"
            size="lg"
            loading={isSubmitting}
            leftIcon={<AppIcon name="Check" size="sm" color="textOnGold" />}
            onPress={handleFormSubmit}
            style={styles.saveBtn}
          />

          <AppButton
            title="Cancel"
            variant="outline"
            size="md"
            disabled={isSubmitting}
            onPress={onCancel}
          />

          <AppButton
            title="Delete This Property"
            variant="outline"
            size="md"
            leftIcon={<AppIcon name="Trash2" size="sm" color="error" />}
            onPress={onDelete}
            style={styles.deleteActionBtn}
          />
        </View>
      </ScrollView>

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
    </KeyboardAvoidingView>
  );
}

export default function EditPropertyScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getPropertyById, editProperty, removeProperty, isLoading } = useAdminProperties();

  const property = id ? getPropertyById(id) : null;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Invalid Property ID Fallback
  if (!isLoading && !property) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <AppHeader
          title="Edit Property"
          subtitle="Invalid Property ID"
          showBack
          onBackPress={() => router.back()}
        />
        <View style={styles.notFoundContainer}>
          <AppCard style={styles.notFoundCard}>
            <View style={styles.notFoundIconCircle}>
              <AppIcon name="AlertCircle" size="lg" color="error" />
            </View>
            <AppText variant="h2" color="primary" align="center" style={styles.notFoundTitle}>
              Property Not Found
            </AppText>
            <AppText variant="bodySmall" color="textSecondary" align="center" style={styles.notFoundDesc}>
              The property record with ID #{id} could not be resolved in the administrative inventory.
            </AppText>
            <AppButton
              title="Return to Inventory List"
              variant="primary"
              size="md"
              leftIcon={<AppIcon name="ArrowLeft" size="sm" color="textInverse" />}
              onPress={() => router.replace('/admin/properties')}
            />
          </AppCard>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading && !property) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppHeader title="Edit Property" subtitle="Loading..." />
        <AppLoader fullScreen message="Loading property details..." />
      </SafeAreaView>
    );
  }

  const handleSave = async (updates: Partial<PropertyItem>) => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      const result = await editProperty(id, updates);
      if (result) {
        Alert.alert(
          'Property Updated',
          `"${result.title}" has been successfully updated in the inventory catalog.`,
          [
            {
              text: 'OK',
              onPress: () => router.replace('/admin/properties'),
            },
          ]
        );
      } else {
        Alert.alert('Update Failed', 'Property could not be updated.');
      }
    } catch {
      Alert.alert('Error', 'An unexpected error occurred while updating the property.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!property) return;

    Alert.alert(
      'Delete Property',
      `Are you sure you want to permanently delete "${property.title}" (ID: #${property.id})? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Property',
          style: 'destructive',
          onPress: async () => {
            const success = await removeProperty(property.id);
            if (success) {
              Alert.alert('Deleted', `"${property.title}" has been deleted.`, [
                {
                  text: 'OK',
                  onPress: () => router.replace('/admin/properties'),
                },
              ]);
            } else {
              Alert.alert('Error', 'Failed to delete property.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <AppHeader
        title="Edit Property"
        subtitle={`Editing Listing #${id}`}
        showBack
        onBackPress={() => router.back()}
      />

      <EditPropertyForm
        key={property!.id}
        property={property!}
        onSave={handleSave}
        onDelete={handleDelete}
        onCancel={() => router.back()}
        isSubmitting={isSubmitting}
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
  actionsContainer: {
    gap: spacing.sm,
    marginBottom: spacing.xxl,
  },
  saveBtn: {
    marginBottom: spacing.xxs,
  },
  deleteActionBtn: {
    borderColor: colors.error,
    marginTop: spacing.md,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  notFoundCard: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  notFoundIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.errorSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  notFoundTitle: {
    marginBottom: spacing.xs,
  },
  notFoundDesc: {
    marginBottom: spacing.xl,
    lineHeight: 18,
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
