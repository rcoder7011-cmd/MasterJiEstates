/**
 * Dedicated Customer Signup Screen — app/auth/signup.tsx
 *
 * Requirements:
 * 1. Dedicated separate route for customer registration.
 * 2. Heading: "Create Account", Subtitle: "Join MJ Estates."
 * 3. Two signup methods: Continue with Mobile Number vs Continue with Email / Gmail.
 * 4. Fields: Full Name, Mobile/Email, Password, Confirm Password.
 * 5. Show/hide password toggles.
 * 6. Real-time password strength criteria.
 * 7. OTP sent strictly to selected contact method (SMS for mobile, email for email).
 * 8. Account created ONLY after OTP verification on verify screen.
 * 9. "Already have an account? Login" navigation to /auth/login preserving return destination.
 * 10. Smart destination redirection preserved throughout flow.
 */

import React, { useState } from 'react';
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
  validatePassword,
  validateConfirmPassword,
} from '../../src/utils/validation';
import {
  sanitizeRedirectTarget,
  getRedirectParams,
} from '../../src/utils/redirection';
import { useAuth } from '../../src/hooks/useAuth';

export default function SignupScreen() {
  const router = useRouter();
  const searchParams = useLocalSearchParams<{ redirect?: string }>();
  const redirectTarget = sanitizeRedirectTarget(searchParams.redirect);

  const { requestOtp } = useAuth();

  const [authMethod, setAuthMethod] = useState<AuthMethod>('phone');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMethodChange = (method: AuthMethod) => {
    setAuthMethod(method);
    setErrorMessage(null);
  };

  // ---------------------------------------------------------------------------
  // SIGN UP SUBMIT (OTP + Password Required)
  // ---------------------------------------------------------------------------
  const handleSignupSubmit = async () => {
    setErrorMessage(null);

    // Full name validation
    const cleanName = fullName.trim();
    if (!cleanName || cleanName.length < 2) {
      setErrorMessage('Please enter your full name (at least 2 characters)');
      return;
    }

    let destination = '';
    if (authMethod === 'phone') {
      const phoneValidation = validateIndianPhone(phoneNumber);
      if (!phoneValidation.isValid) {
        setErrorMessage(phoneValidation.error || 'Please enter a valid 10-digit mobile number');
        return;
      }
      destination = phoneValidation.sanitizedValue!;
    } else {
      const emailValidation = validateEmail(emailAddress);
      if (!emailValidation.isValid) {
        setErrorMessage(emailValidation.error || 'Please enter a valid email address');
        return;
      }
      destination = emailValidation.sanitizedValue!;
    }

    // Password strength validation
    const passValidation = validatePassword(password);
    if (!passValidation.isValid) {
      setErrorMessage(passValidation.error || 'Please choose a stronger password meeting all requirements');
      return;
    }

    // Confirm password match
    const matchValidation = validateConfirmPassword(password, confirmPassword);
    if (!matchValidation.isValid) {
      setErrorMessage(matchValidation.error || 'Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await requestOtp({
        method: authMethod,
        destination,
        fullName: cleanName,
        mode: 'signup',
        purpose: 'signup',
      });

      if (response.success) {
        const nextParams: Record<string, string> = {
          destination,
          method: authMethod,
          mode: 'signup',
          fullName: cleanName,
          password,
          ...getRedirectParams(redirectTarget || undefined),
        };

        if (authMethod === 'phone') {
          router.push({
            pathname: '/auth/verify-otp',
            params: nextParams,
          });
        } else {
          router.push({
            pathname: '/auth/verify-email-otp',
            params: nextParams,
          });
        }
      } else {
        setErrorMessage(response.error || 'Failed to dispatch verification code');
      }
    } catch {
      setErrorMessage('Unable to connect to verification service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateToLogin = () => {
    router.push({
      pathname: '/auth/login',
      params: getRedirectParams(redirectTarget || undefined),
    });
  };

  const passwordValidation = validatePassword(password);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <AppHeader
        title="Create Account"
        subtitle={
          redirectTarget
            ? 'Sign up required to continue'
            : 'Join MasterJiEstates'
        }
        showBack
        onBackPress={() => router.back()}
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
          {/* Logo & Header */}
          <View style={styles.brandBlock}>
            <BrandLogo size="md" variant="image" />
            <AppText variant="h1" color="primary" align="center" style={styles.welcomeTitle}>
              Create Account
            </AppText>
            <AppText variant="body" color="textSecondary" align="center" style={styles.welcomeSubtitle}>
              Join MJ Estates.
            </AppText>
            {redirectTarget ? (
              <View style={styles.redirectBadge}>
                <AppIcon name="Shield" size="xs" color="secondaryDark" />
                <AppText variant="caption" color="secondaryDark" weight="600">
                  Registration required for your requested action
                </AppText>
              </View>
            ) : null}
          </View>

          {/* Form Card */}
          <AppCard variant="elevated" style={styles.card}>
            {/* Method Switcher: Mobile vs Email */}
            <View style={styles.methodSwitcher}>
              <Pressable
                onPress={() => handleMethodChange('phone')}
                accessible
                accessibilityRole="tab"
                accessibilityLabel="Sign up with Mobile Number"
                style={[
                  styles.methodTab,
                  authMethod === 'phone' ? styles.methodTabActive : null,
                ]}
              >
                <AppIcon
                  name="Phone"
                  size="xs"
                  color={authMethod === 'phone' ? 'primary' : 'textSecondary'}
                />
                <AppText
                  variant="caption"
                  color={authMethod === 'phone' ? 'primary' : 'textSecondary'}
                  weight={authMethod === 'phone' ? '700' : '500'}
                >
                  Continue with Mobile
                </AppText>
              </Pressable>

              <Pressable
                onPress={() => handleMethodChange('email')}
                accessible
                accessibilityRole="tab"
                accessibilityLabel="Sign up with Email Address"
                style={[
                  styles.methodTab,
                  authMethod === 'email' ? styles.methodTabActive : null,
                ]}
              >
                <AppIcon
                  name="Mail"
                  size="xs"
                  color={authMethod === 'email' ? 'primary' : 'textSecondary'}
                />
                <AppText
                  variant="caption"
                  color={authMethod === 'email' ? 'primary' : 'textSecondary'}
                  weight={authMethod === 'email' ? '700' : '500'}
                >
                  Continue with Email
                </AppText>
              </Pressable>
            </View>

            {/* Input: Full Name */}
            <View style={styles.inputWrapper}>
              <AppInput
                label="Full Name"
                value={fullName}
                onChangeText={(val) => {
                  setFullName(val);
                  setErrorMessage(null);
                }}
                placeholder="Enter your full name"
                autoCapitalize="words"
                leftIcon={<AppIcon name="User" size="sm" color="textSecondary" />}
              />
            </View>

            {/* Input: Mobile or Email */}
            {authMethod === 'phone' ? (
              <View style={styles.inputWrapper}>
                <AppInput
                  label="Mobile Number"
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
                  label="Email Address"
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

            {/* Input: Password */}
            <View style={styles.inputWrapper}>
              <AppInput
                label="Create Password"
                value={password}
                onChangeText={(val) => {
                  setPassword(val);
                  setErrorMessage(null);
                }}
                placeholder="Min. 8 characters"
                secureTextEntry={!showPassword}
                leftIcon={<AppIcon name="Lock" size="sm" color="textSecondary" />}
                rightIcon={
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={8}
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <AppIcon
                      name={showPassword ? 'EyeOff' : 'Eye'}
                      size="sm"
                      color="textSecondary"
                    />
                  </Pressable>
                }
              />
            </View>

            {/* Password Criteria Checklist */}
            {password.length > 0 ? (
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

            {/* Input: Confirm Password */}
            <View style={styles.inputWrapper}>
              <AppInput
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={(val) => {
                  setConfirmPassword(val);
                  setErrorMessage(null);
                }}
                placeholder="Re-enter password"
                secureTextEntry={!showConfirmPassword}
                leftIcon={<AppIcon name="Lock" size="sm" color="textSecondary" />}
                rightIcon={
                  <Pressable
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    hitSlop={8}
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
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

            {/* Error Message */}
            {errorMessage ? (
              <View style={styles.errorBox}>
                <AppIcon name="AlertCircle" size="xs" color="error" />
                <AppText variant="caption" color="error" style={styles.errorText}>
                  {errorMessage}
                </AppText>
              </View>
            ) : null}

            {/* Submit Button */}
            <AppButton
              title={`Verify with ${authMethod === 'phone' ? 'SMS' : 'Email'} OTP`}
              variant="primary"
              size="lg"
              loading={isSubmitting}
              onPress={handleSignupSubmit}
              style={styles.submitBtn}
            />

            <AppDivider spacing="md" />

            {/* Bottom Link to Login Screen */}
            <View style={styles.togglePrompt}>
              <AppText variant="bodySmall" color="textSecondary">
                Already have an account?{' '}
              </AppText>
              <Pressable
                onPress={navigateToLogin}
                hitSlop={8}
                accessible
                accessibilityRole="button"
                accessibilityLabel="Login"
              >
                <AppText variant="bodySmall" color="secondaryDark" weight="700">
                  Login
                </AppText>
              </Pressable>
            </View>
          </AppCard>

          {/* Secure Trust Footer */}
          <View style={styles.trustFooter}>
            <AppIcon name="Shield" size="xs" color="textMuted" />
            <AppText variant="caption" color="textMuted">
              Protected by MasterJiEstates Secure Authentication
            </AppText>
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
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  brandBlock: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingTop: spacing.xs,
  },
  welcomeTitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  welcomeSubtitle: {
    paddingHorizontal: spacing.lg,
    lineHeight: 20,
  },
  redirectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    marginTop: spacing.sm,
  },
  card: {
    padding: spacing.md,
  },
  methodSwitcher: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: 3,
    marginBottom: spacing.md,
  },
  methodTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  methodTabActive: {
    backgroundColor: colors.surface,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  inputWrapper: {
    marginBottom: spacing.sm,
  },
  criteriaBox: {
    backgroundColor: colors.surfaceMuted,
    padding: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    gap: 4,
  },
  criteriaTitle: {
    marginBottom: 2,
  },
  criteriaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.errorSubtle,
    padding: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  errorText: {
    flex: 1,
  },
  submitBtn: {
    marginTop: spacing.xs,
  },
  togglePrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xs,
  },
  trustFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.lg,
  },
});

