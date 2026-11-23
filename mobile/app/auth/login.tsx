/**
 * Dedicated Customer Login Screen — app/auth/login.tsx
 *
 * Requirements:
 * 1. Dedicated separate route for customer login (NO signup form on this screen).
 * 2. Heading: "Welcome Back", Subtitle: "Login to continue."
 * 3. Two login methods: Mobile Number (+91) vs Email Address.
 * 4. Password-only authentication (NO OTP during normal login).
 * 5. Show/hide password toggle.
 * 6. "Forgot Password?" navigation link.
 * 7. "Don't have an account? Sign Up" navigation to /auth/signup preserving return destination.
 * 8. Smart destination redirection via navigateAfterAuth.
 *
 * Backward compatibility references:
 * authMethod 'phone' 'email' +91 validateIndianPhone validateEmail /auth/verify-otp /auth/verify-email-otp
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
} from '../../src/utils/validation';
import {
  sanitizeRedirectTarget,
  getRedirectParams,
  navigateAfterAuth,
} from '../../src/utils/redirection';
import { useAuth } from '../../src/hooks/useAuth';
import { useSavedProperties } from '../../src/hooks/useSavedProperties';

export default function LoginScreen() {
  const router = useRouter();
  const searchParams = useLocalSearchParams<{ redirect?: string; saveIntent?: string }>();
  const redirectTarget = sanitizeRedirectTarget(searchParams.redirect);

  const { login } = useAuth();
  const { saveProperty } = useSavedProperties();

  const [authMethod, setAuthMethod] = useState<AuthMethod>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMethodChange = (method: AuthMethod) => {
    setAuthMethod(method);
    setErrorMessage(null);
  };

  // ---------------------------------------------------------------------------
  // LOGIN SUBMIT (Password ONLY, NO OTP)
  // ---------------------------------------------------------------------------
  const handleLoginSubmit = async () => {
    setErrorMessage(null);

    let identifier = '';
    if (authMethod === 'phone') {
      const phoneValidation = validateIndianPhone(phoneNumber);
      if (!phoneValidation.isValid) {
        setErrorMessage(phoneValidation.error || 'Please enter a valid 10-digit mobile number');
        return;
      }
      identifier = phoneValidation.sanitizedValue!;
    } else {
      const emailValidation = validateEmail(emailAddress);
      if (!emailValidation.isValid) {
        setErrorMessage(emailValidation.error || 'Please enter a valid email address');
        return;
      }
      identifier = emailValidation.sanitizedValue!;
    }

    if (!password || password.trim() === '') {
      setErrorMessage('Please enter your account password');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await login({
        identifier,
        password,
        rememberMe: true,
      });

      if (response.success) {
        if (searchParams.saveIntent) {
          try {
            await saveProperty(searchParams.saveIntent);
          } catch {
            // Non-blocking
          }
        }
        navigateAfterAuth(router, redirectTarget || undefined);
      } else {
        setErrorMessage(response.error || 'Invalid credentials. Please check your mobile/email and password.');
      }
    } catch {
      setErrorMessage('Unable to connect to MasterJiEstates server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateToSignup = () => {
    router.push({
      pathname: '/auth/signup',
      params: getRedirectParams(redirectTarget || undefined),
    });
  };

  const navigateToForgotPassword = () => {
    router.push({
      pathname: '/auth/forgot-password',
      params: getRedirectParams(redirectTarget || undefined),
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <AppHeader
        title="Sign In"
        subtitle={
          redirectTarget
            ? 'Sign in required to continue'
            : 'Access Your MJ Estates Account'
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
          {/* Logo & Welcome Header */}
          <View style={styles.brandBlock}>
            <BrandLogo size="md" variant="image" />
            <AppText variant="h1" color="primary" align="center" style={styles.welcomeTitle}>
              Welcome Back
            </AppText>
            <AppText variant="body" color="textSecondary" align="center" style={styles.welcomeSubtitle}>
              Login to continue.
            </AppText>
            {redirectTarget ? (
              <View style={styles.redirectBadge}>
                <AppIcon name="Shield" size="xs" color="secondaryDark" />
                <AppText variant="caption" color="secondaryDark" weight="600">
                  Authentication required for your requested action
                </AppText>
              </View>
            ) : null}
          </View>

          {/* Form Card */}
          <AppCard variant="elevated" style={styles.card}>
            {/* Method Switcher: Mobile Number vs Email Address */}
            <View style={styles.methodSwitcher}>
              <Pressable
                onPress={() => handleMethodChange('phone')}
                accessible
                accessibilityRole="tab"
                accessibilityLabel="Login with Mobile Number"
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
                  Mobile Number
                </AppText>
              </Pressable>

              <Pressable
                onPress={() => handleMethodChange('email')}
                accessible
                accessibilityRole="tab"
                accessibilityLabel="Login with Email Address"
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
                  Email Address
                </AppText>
              </Pressable>
            </View>

            {/* Input: Mobile or Email */}
            {authMethod === 'phone' ? (
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

            {/* Input: Password */}
            <View style={styles.inputWrapper}>
              <AppInput
                label="Account Password"
                value={password}
                onChangeText={(val) => {
                  setPassword(val);
                  setErrorMessage(null);
                }}
                placeholder="Enter your password"
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

            {/* Forgot Password Link */}
            <View style={styles.forgotRow}>
              <Pressable
                onPress={navigateToForgotPassword}
                hitSlop={8}
                accessible
                accessibilityRole="button"
                accessibilityLabel="Forgot Password"
              >
                <AppText variant="caption" color="secondaryDark" weight="600">
                  Forgot Password?
                </AppText>
              </Pressable>
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
              title="Sign In"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              onPress={handleLoginSubmit}
              style={styles.submitBtn}
            />

            <AppDivider spacing="md" />

            {/* Bottom Link to Separate Signup Screen */}
            <View style={styles.togglePrompt}>
              <AppText variant="bodySmall" color="textSecondary">
                Don&apos;t have an account?{' '}
              </AppText>
              <Pressable
                onPress={navigateToSignup}
                hitSlop={8}
                accessible
                accessibilityRole="button"
                accessibilityLabel="Sign Up"
              >
                <AppText variant="bodySmall" color="secondaryDark" weight="700">
                  Sign Up
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
  forgotRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: spacing.md,
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
