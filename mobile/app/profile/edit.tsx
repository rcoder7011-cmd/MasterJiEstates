/**
 * Edit Profile Screen — app/profile/edit.tsx
 * Allows authenticated customers to update their name and view verified contact credentials.
 * Enforces security constraints preventing direct modification of verified phone/email without OTP verification.
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
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
  AppInput,
  AppButton,
  AppHeader,
  AppIcon,
  AppDivider,
} from '../../src/components';
import { colors } from '../../src/theme/colors';
import { spacing, layout } from '../../src/theme/spacing';
import { radius } from '../../src/theme/radius';
import { useAuth } from '../../src/hooks/useAuth';
import { useTranslation } from '../../src/hooks/useTranslation';
import { maskPhoneNumber, maskEmail } from '../../src/utils/validation';
import { updateUserProfile } from '../../src/services/profileService';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, updateUser } = useAuth();
  const { t } = useTranslation();

  const [name, setName] = useState(user?.name || '');
  const [nameError, setNameError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // If not logged in, show guest prompt
  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <AppHeader
          title={t('profile.editProfile', 'Edit Profile')}
          showBack
          onBackPress={() => router.back()}
        />
        <View style={styles.guestContainer}>
          <AppCard style={styles.guestCard}>
            <View style={styles.guestIconCircle}>
              <AppIcon name="Lock" size="lg" color="primary" />
            </View>
            <AppText variant="h2" color="primary" align="center" style={styles.guestTitle}>
              {t('auth.guest', 'Sign In Required')}
            </AppText>
            <AppText variant="bodySmall" color="textSecondary" align="center" style={styles.guestDesc}>
              {t('auth.guestSubtitle', 'Please sign in to view and update your personal account details.')}
            </AppText>
            <AppButton
              title={t('auth.signIn', 'Sign In to Your Account')}
              variant="primary"
              size="md"
              leftIcon={<AppIcon name="User" size="sm" color="textInverse" />}
              onPress={() =>
                router.push({
                  pathname: '/auth/login',
                  params: { redirect: '/profile/edit' },
                })
              }
              style={styles.guestBtn}
            />
          </AppCard>
        </View>
      </SafeAreaView>
    );
  }

  const handleSave = async () => {
    setNameError(null);
    setSuccessMessage(null);

    const trimmed = name.trim();
    if (!trimmed) {
      setNameError(t('profile.fullNamePlaceholder', 'Please enter your full name.'));
      return;
    }
    if (trimmed.length < 2) {
      setNameError('Full name must be at least 2 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await updateUserProfile(user, { name: trimmed });
      if (response.success && response.user) {
        updateUser(response.user);
        setSuccessMessage(t('profile.profileUpdated', 'Profile updated successfully!'));
        Alert.alert(
          t('common.success', 'Success'),
          t('profile.profileUpdated', 'Your profile details have been successfully updated.'),
          [{ text: t('common.close', 'OK'), onPress: () => router.back() }]
        );
      } else {
        setNameError(response.error || 'Failed to update profile. Please try again.');
      }
    } catch {
      setNameError('An unexpected error occurred while saving your profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <AppHeader
        title={t('profile.editProfile', 'Edit Profile')}
        subtitle={t('profile.personalInfo', 'Personal Information')}
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
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarCircle}>
              <AppText variant="h1" color="textInverse">
                {name.trim() ? name.trim().charAt(0).toUpperCase() : 'U'}
              </AppText>
            </View>
            <View style={styles.avatarBadge}>
              <AppIcon name="Shield" size="xs" color="secondary" />
              <AppText variant="caption" color="secondaryDark" weight="700">
                VERIFIED PROFILE
              </AppText>
            </View>
          </View>

          {successMessage && (
            <View style={styles.successBanner}>
              <AppIcon name="CheckCircle" size="sm" color="success" />
              <AppText variant="bodySmall" color="success" weight="600" style={styles.successText}>
                {successMessage}
              </AppText>
            </View>
          )}

          {/* Edit Form */}
          <AppCard style={styles.formCard}>
            <AppText variant="h3" color="primary" style={styles.sectionTitle}>
              {t('profile.personalInfo', 'Personal Information')}
            </AppText>
            <AppDivider spacing="sm" />

            {/* Full Name Field */}
            <View style={styles.fieldWrapper}>
              <AppInput
                label={t('profile.fullName', 'Full Name')}
                placeholder={t('profile.fullNamePlaceholder', 'Enter your full name')}
                value={name}
                onChangeText={(val) => {
                  setName(val);
                  if (nameError) setNameError(null);
                }}
                error={nameError || undefined}
                leftIcon={<AppIcon name="User" size="sm" color="textSecondary" />}
                autoCapitalize="words"
              />
            </View>

            {/* Mobile Number Field (Security Protected) */}
            <View style={styles.fieldWrapper}>
              <View style={styles.labelRow}>
                <AppText variant="bodySmall" color="textPrimary" weight="600">
                  {t('profile.mobileNumber', 'Mobile Number')}
                </AppText>
                <View style={styles.statusBadge}>
                  <AppText variant="caption" color={user.phone ? 'success' : 'textSecondary'} weight="700">
                    {user.phone ? t('common.verified', 'VERIFIED') : t('common.unverified', 'UNVERIFIED')}
                  </AppText>
                </View>
              </View>

              <View style={styles.readOnlyBox}>
                <AppIcon name="Phone" size="sm" color="textSecondary" />
                <AppText variant="body" color="primary" style={styles.readOnlyText}>
                  {user.phone ? maskPhoneNumber(user.phone) : 'Not provided'}
                </AppText>
                <AppIcon name="Lock" size="xs" color="textSecondary" />
              </View>

              <AppText variant="caption" color="textSecondary" style={styles.securityNote}>
                {t('profile.verifiedNote', 'To update your phone number, a new mobile OTP verification is required.')}
              </AppText>
            </View>

            {/* Email Field (Security Protected) */}
            <View style={styles.fieldWrapper}>
              <View style={styles.labelRow}>
                <AppText variant="bodySmall" color="textPrimary" weight="600">
                  {t('profile.emailAddress', 'Email Address')}
                </AppText>
                <View style={styles.statusBadge}>
                  <AppText variant="caption" color={user.email ? 'success' : 'textSecondary'} weight="700">
                    {user.email ? t('common.verified', 'VERIFIED') : t('common.unverified', 'UNVERIFIED')}
                  </AppText>
                </View>
              </View>

              <View style={styles.readOnlyBox}>
                <AppIcon name="Mail" size="sm" color="textSecondary" />
                <AppText variant="body" color="primary" style={styles.readOnlyText}>
                  {user.email ? maskEmail(user.email) : 'Not provided'}
                </AppText>
                <AppIcon name="Lock" size="xs" color="textSecondary" />
              </View>

              <AppText variant="caption" color="textSecondary" style={styles.securityNote}>
                {t('profile.verifiedNote', 'To update your email, a new email OTP verification is required.')}
              </AppText>
            </View>
          </AppCard>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <AppButton
              title={t('profile.saveChanges', 'Save Changes')}
              variant="primary"
              size="lg"
              loading={isSubmitting}
              onPress={handleSave}
              style={styles.saveBtn}
            />

            <AppButton
              title={t('common.cancel', 'Cancel')}
              variant="outline"
              size="md"
              disabled={isSubmitting}
              onPress={() => router.back()}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
    backgroundColor: colors.secondarySubtle,
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successSubtle,
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
  },
  successText: {
    marginLeft: spacing.sm,
  },
  formCard: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
  },
  fieldWrapper: {
    marginBottom: spacing.lg,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: radius.xs,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  readOnlyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  readOnlyText: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 15,
  },
  securityNote: {
    marginTop: spacing.xs,
    lineHeight: 16,
  },
  actionsContainer: {
    gap: spacing.sm,
    marginBottom: spacing.xxl,
  },
  saveBtn: {
    marginBottom: spacing.xxs,
  },
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  guestCard: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  guestIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  guestTitle: {
    marginBottom: spacing.xs,
  },
  guestDesc: {
    marginBottom: spacing.xl,
    lineHeight: 18,
  },
  guestBtn: {
    width: '100%',
  },
});

