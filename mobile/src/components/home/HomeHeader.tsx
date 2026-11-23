import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { spacing, layout } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { BrandLogo } from '../ui/BrandLogo';
import { AppIcon } from '../ui/AppIcon';
import { AppText } from '../ui/AppText';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';
import { useNotifications } from '../../hooks/useNotifications';

export const HomeHeader: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { t } = useTranslation();
  const { unreadCount } = useNotifications();

  const handleNotificationPress = () => {
    router.push('/notifications' as any);
  };

  const getUserInitial = (): string => {
    if (!user) return 'U';
    if (user.fullName && user.fullName.trim().length > 0) {
      return user.fullName.trim()[0].toUpperCase();
    }
    if (user.email && user.email.trim().length > 0) {
      return user.email.trim()[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <View style={styles.container}>
      {/* Brand Logo & Location Coverage Badge */}
      <View style={styles.leftCol}>
        <BrandLogo size="sm" variant="image" />
        <View style={styles.locationBadgeRow}>
          <AppIcon name="MapPin" size="xs" color="secondary" />
          <AppText variant="caption" color="textSecondary" weight="600" style={styles.locationText}>
            {t('home.locationBadge', 'Delhi NCR')}
          </AppText>
        </View>
      </View>

      {/* Action Icons: Notifications (No fake dot) & Profile Avatar */}
      <View style={styles.rightActions}>
        <Pressable
          onPress={handleNotificationPress}
          accessible
          accessibilityRole="button"
          accessibilityLabel={t('settings.notificationsTitle', 'Notifications')}
          style={({ pressed }) => [styles.iconBtn, pressed ? styles.pressedBtn : null]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <AppIcon name="Bell" size="sm" color="primary" />
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <AppText variant="caption" color="textInverse" weight="700" style={styles.unreadText}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </AppText>
            </View>
          )}
        </Pressable>

        <Pressable
          onPress={() => router.push(isAuthenticated ? '/profile' : '/auth/login')}
          accessible
          accessibilityRole="button"
          accessibilityLabel={
            isAuthenticated
              ? t('profile.title', 'My Profile')
              : t('auth.login', 'Login to MJ Estates')
          }
          style={({ pressed }) => [
            styles.avatarBtn,
            !isAuthenticated ? styles.guestAvatarBtn : null,
            pressed ? styles.pressedBtn : null,
          ]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {isAuthenticated ? (
            <AppText variant="caption" color="textInverse" weight="700" style={styles.initialText}>
              {getUserInitial()}
            </AppText>
          ) : (
            <AppIcon name="User" size="sm" color="primary" />
          )}
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  leftCol: {
    alignItems: 'flex-start',
  },
  locationBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  locationText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  unreadText: {
    fontSize: 9,
    lineHeight: 11,
  },
  avatarBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.secondary,
  },
  guestAvatarBtn: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.border,
  },
  initialText: {
    fontSize: 14,
    color: colors.textInverse,
  },
  pressedBtn: {
    opacity: 0.75,
  },
});
