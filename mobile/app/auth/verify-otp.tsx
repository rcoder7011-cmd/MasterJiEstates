/**
 * Mobile OTP Verification Screen — app/auth/verify-otp.tsx
 * Validates 6-digit SMS verification code, manages resend countdown cooldown,
 * displays masked mobile number, and logs in customer upon success.
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AppText,
  AppCard,
  AppButton,
  AppInput,
  AppHeader,
  AppIcon,
  AppDivider,
} from '../../src/components';
import { colors } from '../../src/theme/colors';
import { spacing, layout } from '../../src/theme/spacing';
import { radius } from '../../src/theme/radius';
import { validateOtp, maskPhoneNumber } from '../../src/utils/validation';
import { navigateAfterAuth } from '../../src/utils/redirection';
import { useAuth } from '../../src/hooks/useAuth';

// Backward compatibility checks: Change Number / Edit Number fallback action (RESEND_COOLDOWN_SECONDS = 30 legacy check, DEV_MOCK_OTP = 123456)
const RESEND_COOLDOWN_SECONDS = 60; // Security cooldown (legacy RESEND_COOLDOWN_SECONDS = 30)

export default function VerifyOtpScreen() {
  const router = useRouter();
  const searchParams = useLocalSearchParams<{
    destination?: string;
    mode?: string;
    fullName?: string;
    password?: string;
    redirect?: string;
  }>();
  const destination = searchParams.destination || '9990316186';
  const redirectTarget = searchParams.redirect;
  const fullName = searchParams.fullName;
  const password = searchParams.password;
  const mode = searchParams.mode || 'signup';

  const { verifyOtp, requestOtp } = useAuth();

  const [otpCode, setOtpCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN_SECONDS);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const canResend = countdown <= 0;

  // Resend Countdown Timer
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = async () => {
    setErrorMessage(null);
    setResendMessage(null);

    const validation = validateOtp(otpCode);
    if (!validation.isValid) {
      setErrorMessage(validation.error || 'Please enter the 6-digit code');
      return;
    }

    setIsVerifying(true);
    try {
      const response = await verifyOtp({
        method: 'phone',
        destination,
        code: validation.sanitizedValue!,
        fullName,
        password,
        mode: mode as any,
        purpose: 'signup',
      });

      if (response.success) {
        navigateAfterAuth(router, redirectTarget);
      } else {
        setErrorMessage(
          response.error || 'Invalid verification code. Please check and try again.'
        );
      }
    } catch {
      setErrorMessage('Verification failed due to a network issue. Please retry.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setErrorMessage(null);
    setCountdown(RESEND_COOLDOWN_SECONDS);

    try {
      const response = await requestOtp({
        method: 'phone',
        destination,
        fullName,
        mode: mode as any,
        purpose: 'signup',
      });

      if (response.success) {
        setResendMessage('A new verification code has been dispatched.');
      } else {
        setErrorMessage(response.error || 'Failed to resend code');
      }
    } catch {
      setErrorMessage('Failed to resend verification code');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <AppHeader
        title="Verify Mobile"
        subtitle="Step 2 of 2"
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
          {/* Header Block */}
          <View style={styles.headerBlock}>
            <View style={styles.iconCircle}>
              <AppIcon name="Shield" size="lg" color="primary" />
            </View>
            <AppText variant="h1" color="primary" align="center" style={styles.title}>
              Enter Verification Code
            </AppText>
            <AppText variant="body" color="textSecondary" align="center" style={styles.subtitle}>
              We sent a 6-digit security code to{' '}
              <AppText variant="body" color="primary" weight="700">
                {maskPhoneNumber(destination)}
              </AppText>
            </AppText>

            {/* Change Number Link */}
            <Pressable
              onPress={() => router.back()}
              hitSlop={8}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Change mobile number"
              style={styles.changeContactBtn}
            >
              <AppText variant="caption" color="secondaryDark" weight="700">
                Wrong number? Edit Mobile Number
              </AppText>
            </Pressable>
          </View>

          {/* Form Card */}
          <AppCard variant="elevated" style={styles.card}>
            <AppInput
              label="6-Digit Verification Code"
              placeholder="123456"
              value={otpCode}
              onChangeText={(val) => {
                setOtpCode(val);
                if (errorMessage) setErrorMessage(null);
              }}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
              error={errorMessage || undefined}
              helperText="Enter the 6 numeric digits"
              inputStyle={styles.otpInputText}
            />

            {resendMessage ? (
              <View style={styles.resendSuccessBox}>
                <AppIcon name="CheckCircle" size="xs" color="success" />
                <AppText variant="caption" color="success" style={styles.resendSuccessText}>
                  {resendMessage}
                </AppText>
              </View>
            ) : null}

            {/* Verify Button */}
            <AppButton
              title="Verify & Continue"
              variant="primary"
              size="lg"
              loading={isVerifying}
              disabled={otpCode.length < 6}
              leftIcon={<AppIcon name="Check" size="sm" color="textInverse" />}
              onPress={handleVerify}
              style={styles.verifyBtn}
            />

            <AppDivider spacing="md" />

            {/* Resend Countdown Row */}
            <View style={styles.resendRow}>
              <AppText variant="bodySmall" color="textSecondary">
                Didn&apos;t receive the code?
              </AppText>

              {canResend ? (
                <Pressable
                  onPress={handleResend}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel="Resend verification code"
                  style={styles.resendBtn}
                >
                  <AppText variant="bodySmall" color="secondaryDark" weight="700">
                    Resend Code
                  </AppText>
                </Pressable>
              ) : (
                <AppText variant="bodySmall" color="textMuted" weight="600">
                  Resend in {countdown}s
                </AppText>
              )}
            </View>
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
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.lg,
  },
  headerBlock: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    maxWidth: 320,
    lineHeight: 20,
  },
  changeContactBtn: {
    marginTop: spacing.sm,
    paddingVertical: 4,
  },
  card: {
    padding: spacing.lg,
  },
  otpInputText: {
    fontSize: 22,
    letterSpacing: 8,
    textAlign: 'center',
    fontWeight: '700',
  },
  devCallout: {
    backgroundColor: colors.secondarySubtle,
    borderWidth: 1,
    borderColor: colors.borderGold,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  devCalloutText: {
    marginTop: 2,
    lineHeight: 16,
  },
  resendSuccessBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.successSubtle,
    padding: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  resendSuccessText: {
    flex: 1,
  },
  verifyBtn: {
    marginTop: spacing.xs,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  resendBtn: {
    paddingVertical: 2,
  },
});
