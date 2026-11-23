/**
 * In-App Notification Center — mobile/app/notifications.tsx
 *
 * Displays genuine platform alerts:
 * - Enquiry responses & status updates
 * - Site visit confirmations & schedule notices
 * - New property matches from saved searches
 * - System & compliance announcements
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  AppText,
  AppCard,
  AppButton,
  AppHeader,
  AppIcon,
} from '../src/components';
import { colors } from '../src/theme/colors';
import { spacing, layout } from '../src/theme/spacing';
import { radius } from '../src/theme/radius';
import { useNotifications } from '../src/hooks/useNotifications';
import { useAuth } from '../src/hooks/useAuth';
import { useTranslation } from '../src/hooks/useTranslation';
import { NotificationItem, NotificationType } from '../src/types/notification';

function formatRelativeTime(dateString: string): string {
  try {
    const now = Date.now();
    const past = new Date(dateString).getTime();
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return 'Recent';
  }
}

function getNotificationTypeBadge(type: NotificationType): {
  label: string;
  icon: 'MessageSquare' | 'Compass' | 'Building' | 'Shield' | 'Bell';
  color: string;
  bgColor: string;
} {
  switch (type) {
    case 'enquiry_update':
      return {
        label: 'ENQUIRY',
        icon: 'MessageSquare',
        color: colors.primary,
        bgColor: colors.primarySubtle,
      };
    case 'site_visit_update':
      return {
        label: 'SITE VISIT',
        icon: 'Compass',
        color: colors.secondaryDark,
        bgColor: colors.secondarySubtle,
      };
    case 'new_matching_property':
      return {
        label: 'NEW MATCH',
        icon: 'Building',
        color: colors.secondaryDark,
        bgColor: colors.secondarySubtle,
      };
    case 'saved_property_update':
      return {
        label: 'SAVED HOME',
        icon: 'Building',
        color: colors.primary,
        bgColor: colors.primarySubtle,
      };
    case 'system_announcement':
    default:
      return {
        label: 'NOTICE',
        icon: 'Shield',
        color: colors.textSecondary,
        bgColor: colors.surfaceMuted,
      };
  }
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const {
    notifications,
    unreadCount,
    isLoading,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshNotifications();
    setIsRefreshing(false);
  };

  const handleNotificationPress = useCallback(
    async (item: NotificationItem) => {
      if (!item.read) {
        await markAsRead(item.id);
      }

      // Deep link routing based on notification payload
      if (item.data?.route) {
        router.push(item.data.route as any);
      } else if (item.data?.propertyId) {
        router.push(`/property/${item.data.propertyId}` as any);
      } else if (item.type === 'enquiry_update' || item.type === 'site_visit_update') {
        router.push('/profile/enquiries' as any);
      }
    },
    [markAsRead, router]
  );

  const handleConfirmDelete = useCallback(
    (id: string) => {
      Alert.alert(
        t('notifications.deleteTitle', 'Delete Notification'),
        t('notifications.deleteConfirm', 'Are you sure you want to remove this notification?'),
        [
          { text: t('common.cancel', 'Cancel'), style: 'cancel' },
          {
            text: t('common.delete', 'Delete'),
            style: 'destructive',
            onPress: () => deleteNotification(id),
          },
        ]
      );
    },
    [deleteNotification, t]
  );

  // Unauthenticated Guest State
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <AppHeader
          title={t('notifications.title', 'Notifications')}
          showBack
          onBackPress={() => router.back()}
        />
        <View style={styles.guestContainer}>
          <AppCard style={styles.guestCard}>
            <View style={styles.guestIconCircle}>
              <AppIcon name="Bell" size="xl" color="secondary" />
            </View>
            <AppText variant="h2" color="primary" align="center" style={styles.guestTitle}>
              {t('notifications.signInTitle', 'Stay Updated on Your Consultations')}
            </AppText>
            <AppText variant="body" color="textSecondary" align="center" style={styles.guestDesc}>
              {t(
                'notifications.signInDesc',
                'Sign in to receive instant updates on your enquiries, site visit confirmations, and matching property alerts.'
              )}
            </AppText>
            <AppButton
              title={t('auth.signIn', 'Sign In to Your Account')}
              variant="primary"
              size="md"
              leftIcon={<AppIcon name="User" size="sm" color="textInverse" />}
              onPress={() =>
                router.push({
                  pathname: '/auth/login',
                  params: { redirect: '/notifications' },
                })
              }
              style={styles.signInBtn}
            />
          </AppCard>
        </View>
      </SafeAreaView>
    );
  }

  const renderItem = useCallback(
    ({ item }: { item: NotificationItem }) => {
      const badge = getNotificationTypeBadge(item.type);

      return (
        <Pressable
          style={[styles.itemCard, !item.read && styles.unreadCard]}
          onPress={() => handleNotificationPress(item)}
          accessibilityRole="button"
          accessibilityLabel={`${item.title}, ${item.message}`}
        >
          <View style={styles.itemHeader}>
            <View style={[styles.typeBadge, { backgroundColor: badge.bgColor }]}>
              <AppIcon name={badge.icon} size="xs" color={badge.color as any} />
              <AppText
                variant="caption"
                weight="700"
                style={[styles.typeBadgeText, { color: badge.color }]}
              >
                {badge.label}
              </AppText>
            </View>

            <View style={styles.headerRight}>
              <AppText variant="caption" color="textMuted">
                {formatRelativeTime(item.createdAt)}
              </AppText>
              {!item.read && <View style={styles.unreadDot} />}
              <Pressable
                hitSlop={8}
                onPress={() => handleConfirmDelete(item.id)}
                style={styles.deleteBtn}
                accessibilityRole="button"
                accessibilityLabel="Delete notification"
              >
                <AppIcon name="X" size="xs" color="textMuted" />
              </Pressable>
            </View>
          </View>

          <AppText
            variant="body"
            color="primary"
            weight={item.read ? '600' : '700'}
            style={styles.itemTitle}
          >
            {item.title}
          </AppText>

          <AppText variant="bodySmall" color="textSecondary" style={styles.itemMessage}>
            {item.message}
          </AppText>

          {item.data?.propertyTitle ? (
            <View style={styles.propertyReference}>
              <AppIcon name="Building" size="xs" color="secondary" />
              <AppText variant="caption" color="secondaryDark" weight="600" numberOfLines={1}>
                {item.data.propertyTitle}
              </AppText>
            </View>
          ) : null}
        </Pressable>
      );
    },
    [handleConfirmDelete, handleNotificationPress]
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <AppHeader
        title={t('notifications.title', 'Notifications')}
        subtitle={
          unreadCount > 0
            ? `${unreadCount} unread update${unreadCount === 1 ? '' : 's'}`
            : t('notifications.allCaughtUp', 'All updates caught up')
        }
        showBack
        onBackPress={() => router.back()}
        rightAction={
          unreadCount > 0 ? (
            <Pressable
              style={styles.markAllBtn}
              onPress={markAllAsRead}
              accessibilityRole="button"
              accessibilityLabel="Mark all as read"
            >
              <AppText variant="caption" color="primary" weight="700">
                {t('notifications.markAllRead', 'Mark All Read')}
              </AppText>
            </Pressable>
          ) : undefined
        }
      />

      {isLoading && notifications.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.secondary} />
          <AppText variant="bodySmall" color="textSecondary" style={styles.loadingText}>
            Loading notifications...
          </AppText>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.secondary]}
              tintColor={colors.secondary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <AppIcon name="Bell" size="xl" color="textMuted" />
              </View>
              <AppText variant="h3" color="primary" align="center" style={styles.emptyTitle}>
                {t('notifications.emptyTitle', 'No Notifications Yet')}
              </AppText>
              <AppText variant="body" color="textSecondary" align="center" style={styles.emptyDesc}>
                {t(
                  'notifications.emptyDesc',
                  'When you enquire about a home, request a site tour, or save a search, all genuine status alerts will appear here.'
                )}
              </AppText>
              <AppButton
                title={t('home.exploreAll', 'Explore Properties')}
                variant="outline"
                size="sm"
                leftIcon={<AppIcon name="Building" size="xs" color="primary" />}
                onPress={() => router.push('/(tabs)/explore')}
                style={styles.emptyBtn}
              />
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.md,
    flexGrow: 1,
  },
  markAllBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.xs,
    backgroundColor: colors.primarySubtle,
  },
  itemCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  unreadCard: {
    borderColor: colors.borderGold,
    backgroundColor: colors.surface,
    borderLeftWidth: 3,
    borderLeftColor: colors.secondary,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  typeBadgeText: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary,
  },
  deleteBtn: {
    padding: 2,
    marginLeft: 4,
  },
  itemTitle: {
    marginBottom: 4,
  },
  itemMessage: {
    lineHeight: 19,
    marginBottom: spacing.xs,
  },
  propertyReference: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    backgroundColor: colors.secondarySubtle,
    paddingHorizontal: spacing.xs,
    paddingVertical: 3,
    borderRadius: radius.xs,
    alignSelf: 'flex-start',
    marginTop: spacing.xxs,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    marginBottom: spacing.xs,
  },
  emptyDesc: {
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  emptyBtn: {
    minWidth: 160,
  },
  guestContainer: {
    flex: 1,
    paddingHorizontal: layout.screenPaddingHorizontal,
    justifyContent: 'center',
  },
  guestCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  guestIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.secondarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  guestTitle: {
    marginBottom: spacing.xs,
  },
  guestDesc: {
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  signInBtn: {
    width: '100%',
  },
});
