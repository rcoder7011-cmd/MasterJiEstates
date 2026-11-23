/**
 * Forgot Password Screen — app/auth/forgot-password.tsx
 * Allows recovering account access via registered Mobile Number or Email.
 * Enforces single-use 6-digit OTP verification and password strength rules.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  AppText,
  AppCard,
  AppButton,
  AppInput,
  AppHeader,
  AppIcon,
  BrandLogo,
  AppDivider,
} from '../../src/components';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { radius } from '../../src/theme/radius';
import { AuthMethod } from '../../src/types/auth';
import {
  validateIndianPhone,
  validateEmail,
  validateOtp,
  validatePassword,
  validateConfirmPassword,
  maskPhoneNumber,
  maskEmail,
} from '../../src/utils/validation';
import {
  sanitizeRedirectTarget,
  getRedirectParams,
} from '../../src/utils/redirection';
import { useAuth } from '../../src/hooks/useAuth';

const RESEND_COOLDOWN_SECONDS = 60;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const searchParams = useLocalSearchParams<{ redirect?: string }>();
  const redirectTarget = sanitizeRedirectTarget(searchParams.redirect);
  const { requestPasswordReset, resetPassword } = useAuth();

  const [method, setMethod] = useState<AuthMethod>('phone');
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Active contact destination
  const activeDestination = method === 'phone' ? phoneNumber : emailAddress;

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((c) => c - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendRecoveryCode = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    let sanitized = '';
    if (method === 'phone') {
      const v = validateIndianPhone(phoneNumber);
      if (!v.isValid) {
        setErrorMessage(v.error || 'Please enter a valid 10-digit mobile number');
        return;
      }
      sanitized = v.sanitizedValue!;
    } else {
      const v = validateEmail(emailAddress);
      if (!v.isValid) {
        setErrorMessage(v.error || 'Please enter a valid email address');
        return;
      }
      sanitized = v.sanitizedValue!;
    }

    setIsSubmitting(true);
    try {
      const res = await requestPasswordReset({
        identifier: sanitized,
        type: method,
      });

      if (res.success) {
        setStep('verify');
        setCountdown(RESEND_COOLDOWN_SECONDS);
        setSuccessMessage(res.message || 'Recovery code dispatched successfully.');
      } else {
        setErrorMessage(res.error || 'Failed to dispatch recovery code.');
      }
    } catch {
      setErrorMessage('Unable to connect to recovery service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    setErrorMessage(null);

    const otpValidation = validateOtp(otpCode);
    if (!otpValidation.isValid) {
      setErrorMessage(otpValidation.error || 'Please enter the 6-digit code');
      return;
    }

    const passValidation = validatePassword(newPassword);
    if (!passValidation.isValid) {
      setErrorMessage(passValidation.error || 'Please enter a strong password');
      return;
    }

    const matchValidation = validateConfirmPassword(newPassword, confirmPassword);
    if (!matchValidation.isValid) {
      setErrorMessage(matchValidation.error || 'Passwords do not match');
      return;
    }

    const identifier = method === 'phone' ? phoneNumber.replace(/\D/g, '') : emailAddress.trim().toLowerCase();

    setIsSubmitting(true);
    try {
      const res = await resetPassword({
        identifier,
        type: method,
        otp: otpValidation.sanitizedValue!,
        newPassword,
      });

      if (res.success) {
        setSuccessMessage('Password reset successfully! Returning to login...');
        setTimeout(() => {
          router.replace({
            pathname: '/auth/login',
            params: getRedirectParams(redirectTarget || undefined),
          });
        }, 1500);
      } else {
        setErrorMessage(res.error || 'Failed to reset password. Please check your code.');
      }
    } catch {
      setErrorMessage('Unable to reset password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordValidation = validatePassword(newPassword);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <AppHeader
        title="Reset Password"
        subtitle="Account Recovery & Security"
        showBack
        onBackPress={() => {
          if (step === 'verify') {
            setStep('request');
          } else {
            router.back();
          }
        }}
      />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.brandBlock}>
            <BrandLogo size="md" variant="image" />
            <AppText variant="h1" color="primary" align="center" style={styles.title}>
              {step === 'request' ? 'Forgot Your Password?' : 'Enter Recovery Code'}
            </AppText>
            <AppText variant="body" color="textSecondary" align="center" style={styles.subtitle}>
              {step === 'request'
                ? 'Select your registered contact method to receive a single-use verification code.'
                : `Enter the 6-digit code sent to ${
                    method === 'phone'
                      ? maskPhoneNumber(activeDestination)
                      : maskEmail(activeDestination)
                  } and choose a new password.`}
            </AppText>
          </View>

          <AppCard variant="elevated" style={styles.card}>
            {step === 'request' ? (
              <>
                {/* Method Switcher */}
                <View style={styles.methodSwitcher}>
                  <Pressable
                    onPress={() => {
                      setMethod('phone');
                      setErrorMessage(null);
                    }}
                    style={[
                      styles.methodTab,
                      method === 'phone' ? styles.methodTabActive : null,
                    ]}
                  >
                    <AppIcon
                      name="Phone"
                      size="xs"
                      color={method === 'phone' ? 'primary' : 'textSecondary'}
                    />
                    <AppText
                      variant="caption"
                      color={method === 'phone' ? 'primary' : 'textSecondary'}
                      weight={method === 'phone' ? '700' : '500'}
                    >
                      Mobile Phone
                    </AppText>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      setMethod('email');
                      setErrorMessage(null);
                    }}
                    style={[
                      styles.methodTab,
                      method === 'email' ? styles.methodTabActive : null,
                    ]}
                  >
                    <AppIcon
                      name="Mail"
                      size="xs"
                      color={method === 'email' ? 'primary' : 'textSecondary'}
                    />
                    <AppText
                      variant="caption"
                      color={method === 'email' ? 'primary' : 'textSecondary'}
                      weight={method === 'email' ? '700' : '500'}
                    >
                      Email Address
                    </AppText>
                  </Pressable>
                </View>

                {method === 'phone' ? (
                  <View style={styles.inputWrapper}>
                    <AppInput
                      label="Registered Mobile Number"
                      value={phoneNumber}
                      onChangeText={(val) => {
                        setPhoneNumber(val);
                        setErrorMessage(null);
                      }}
                      placeholder="98765 43210"
                      keyboardType="phone-pad"
                      maxLength={14}
                      leftIcon={<AppText variant="bodySmall" weight="700" color="primary">+91 </AppText>}
                    />
                  </View>
                ) : (
                  <View style={styles.inputWrapper}>
                    <AppInput
                      label="Registered Email Address"
                      value={emailAddress}
                      onChangeText={(val) => {
                        setEmailAddress(val);
                        setErrorMessage(null);
                      }}
                      placeholder="name@example.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      leftIcon={<AppIcon name="Mail" size="sm" color="textSecondary" />}
                    />
                  </View>
                )}

                {errorMessage ? (
                  <View style={styles.errorBox}>
                    <AppIcon name="AlertCircle" size="xs" color="error" />
                    <AppText variant="caption" color="error" style={styles.errorText}>
                      {errorMessage}
                    </AppText>
                  </View>
                ) : null}

                <AppButton
                  title="Send Recovery Code"
                  variant="primary"
                  size="lg"
                  loading={isSubmitting}
                  onPress={handleSendRecoveryCode}
                  style={styles.submitBtn}
                />
              </>
            ) : (
              <>
                {/* Step 2: Verify Code & Set New Password */}
                {successMessage ? (
                  <View style={styles.successBox}>
                    <AppIcon name="CheckCircle" size="xs" color="success" />
                    <AppText variant="caption" color="success" style={styles.successText}>
                      {successMessage}
                    </AppText>
                  </View>
                ) : null}

                <View style={styles.inputWrapper}>
                  <AppInput
                    label="6-Digit Verification Code"
                    value={otpCode}
                    onChangeText={(val) => {
                      setOtpCode(val.replace(/\D/g, '').slice(0, 6));
                      setErrorMessage(null);
                    }}
                    placeholder="123456"
                    keyboardType="number-pad"
                    maxLength={6}
                    leftIcon={<AppIcon name="Key" size="sm" color="textSecondary" />}
                  />
                </View>

                {/* Resend Cooldown */}
                <View style={styles.resendRow}>
                  {countdown > 0 ? (
                    <AppText variant="caption" color="textSecondary">
                      Resend code in {countdown}s
                    </AppText>
                  ) : (
                    <Pressable onPress={handleSendRecoveryCode} disabled={isSubmitting}>
                      <AppText variant="caption" color="secondaryDark" weight="700">
                        Resend Code
                      </AppText>
                    </Pressable>
                  )}
                </View>

                <AppDivider spacing="sm" />

                {/* New Password */}
                <View style={styles.inputWrapper}>
                  <AppInput
                    label="New Password"
                    value={newPassword}
                    onChangeText={(val) => {
                      setNewPassword(val);
                      setErrorMessage(null);
                    }}
                    placeholder="Min. 8 characters"
                    secureTextEntry={!showPassword}
                    rightIcon={
                      <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                        <AppIcon
                          name={showPassword ? 'EyeOff' : 'Eye'}
                          size="sm"
                          color="textSecondary"
                        />
                      </Pressable>
                    }
                  />
                </View>

                {/* Real-time criteria checklist */}
                {newPassword.length > 0 ? (
                  <View style={styles.criteriaBox}>
                    <AppText variant="caption" color="textSecondary" weight="600" style={styles.criteriaTitle}>
                      Password Requirements:
                    </AppText>
                    <View style={styles.criteriaItem}>
                      <AppIcon
                        name={passwordValidation.criteria.hasMinLength ? 'Check' : 'AlertCircle'}
                        size="xs"
                        color={passwordValidation.criteria.hasMinLength ? 'success' : 'textMuted'}
                      />
                      <AppText variant="caption" color={passwordValidation.criteria.hasMinLength ? 'success' : 'textMuted'}>
                        At least 8 characters
                      </AppText>
                    </View>
                    <View style={styles.criteriaItem}>
                      <AppIcon
                        name={passwordValidation.criteria.hasUppercase ? 'Check' : 'AlertCircle'}
                        size="xs"
                        color={passwordValidation.criteria.hasUppercase ? 'success' : 'textMuted'}
                      />
                      <AppText variant="caption" color={passwordValidation.criteria.hasUppercase ? 'success' : 'textMuted'}>
                        One uppercase letter (A-Z)
                      </AppText>
                    </View>
                    <View style={styles.criteriaItem}>
                      <AppIcon
                        name={passwordValidation.criteria.hasLowercase ? 'Check' : 'AlertCircle'}
                        size="xs"
                        color={passwordValidation.criteria.hasLowercase ? 'success' : 'textMuted'}
                      />
                      <AppText variant="caption" color={passwordValidation.criteria.hasLowercase ? 'success' : 'textMuted'}>
                        One lowercase letter (a-z)
                      </AppText>
                    </View>
                    <View style={styles.criteriaItem}>
                      <AppIcon
                        name={passwordValidation.criteria.hasNumber ? 'Check' : 'AlertCircle'}
                        size="xs"
                        color={passwordValidation.criteria.hasNumber ? 'success' : 'textMuted'}
                      />
                      <AppText variant="caption" color={passwordValidation.criteria.hasNumber ? 'success' : 'textMuted'}>
                        One numeric digit (0-9)
                      </AppText>
                    </View>
                    <View style={styles.criteriaItem}>
                      <AppIcon
                        name={passwordValidation.criteria.hasSpecial ? 'Check' : 'AlertCircle'}
                        size="xs"
                        color={passwordValidation.criteria.hasSpecial ? 'success' : 'textMuted'}
                      />
                      <AppText variant="caption" color={passwordValidation.criteria.hasSpecial ? 'success' : 'textMuted'}>
                        One special character (!@#$%^&*)
                      </AppText>
                    </View>
                  </View>
                ) : null}

                {/* Confirm Password */}
                <View style={styles.inputWrapper}>
                  <AppInput
                    label="Confirm New Password"
                    value={confirmPassword}
                    onChangeText={(val) => {
                      setConfirmPassword(val);
                      setErrorMessage(null);
                    }}
                    placeholder="Re-enter new password"
                    secureTextEntry={!showConfirmPassword}
                    rightIcon={
                      <Pressable
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        hitSlop={8}
                      >
                        <AppIcon
                          name={showConfirmPassword ? 'EyeOff' : 'Eye'}
                          size="sm"
                          color="textSecondary"
                        />
                      </Pressable>
                    }
                  />
                </View>

                {errorMessage ? (
                  <View style={styles.errorBox}>
                    <AppIcon name="AlertCircle" size="xs" color="error" />
                    <AppText variant="caption" color="error" style={styles.errorText}>
                      {errorMessage}
                    </AppText>
                  </View>
                ) : null}

                <AppButton
                  title="Reset Password"
                  variant="primary"
                  size="lg"
                  loading={isSubmitting}
                  onPress={handleResetPassword}
                  style={styles.submitBtn}
                />
              </>
            )}

            <Pressable
              onPress={() =>
                router.replace({
                  pathname: '/auth/login',
                  params: getRedirectParams(redirectTarget || undefined),
                })
              }
              style={styles.backToLogin}
            >
              <AppText variant="bodySmall" color="secondaryDark" weight="600">
                Back to Sign In
              </AppText>
            </Pressable>
          </AppCard>
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
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  brandBlock: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  subtitle: {
    paddingHorizontal: spacing.md,
    lineHeight: 20,
  },
  card: {
    padding: spacing.lg,
  },
  methodSwitcher: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  methodTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  methodTabActive: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceMuted,
  },
  inputWrapper: {
    marginBottom: spacing.md,
  },
  submitBtn: {
    marginTop: spacing.sm,
  },
  backToLogin: {
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingVertical: spacing.xs,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: '#FEF2F2',
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
    marginBottom: spacing.md,
  },
  errorText: {
    flex: 1,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: '#F0FDF4',
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.success,
    marginBottom: spacing.md,
  },
  successText: {
    flex: 1,
  },
  resendRow: {
    alignItems: 'flex-end',
    marginBottom: spacing.sm,
  },
  criteriaBox: {
    backgroundColor: colors.surfaceMuted,
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
    gap: 4,
  },
  criteriaTitle: {
    marginBottom: 2,
  },
  criteriaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
