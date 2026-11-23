import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../src/theme/colors';
import { DevAuthProvider } from '../src/context/DevAuthContext';
import { AuthProvider } from '../src/context/AuthContext';
import { LanguageProvider } from '../src/context/LanguageContext';
import { SavedPropertiesProvider } from '../src/context/SavedPropertiesContext';
import { AdminPropertyProvider } from '../src/context/AdminPropertyContext';
import { CompareProvider } from '../src/context/CompareContext';
import { RecentlyViewedProvider } from '../src/context/RecentlyViewedContext';
import { NotificationProvider } from '../src/context/NotificationContext';
import { analyticsService } from '../src/services/analyticsService';

export default function RootLayout() {
  useEffect(() => {
    analyticsService.trackAppOpened();
  }, []);

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <SavedPropertiesProvider>
          <CompareProvider>
            <RecentlyViewedProvider>
              <AdminPropertyProvider>
                <AuthProvider>
                  <NotificationProvider>
                    <DevAuthProvider>
                    <StatusBar style="dark" />
                  <Stack
                    screenOptions={{
                      headerShown: false,
                      contentStyle: { backgroundColor: colors.background },
                      animation: 'slide_from_right',
                    }}
                  >
                    <Stack.Screen name="index" />
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen
                      name="property/[id]"
                      options={{
                        headerShown: false,
                        presentation: 'card',
                      }}
                    />
                    <Stack.Screen
                      name="property/compare"
                      options={{
                        headerShown: false,
                        presentation: 'card',
                      }}
                    />
                    <Stack.Screen
                      name="property/recently-viewed"
                      options={{
                        headerShown: false,
                        presentation: 'card',
                      }}
                    />
                    <Stack.Screen
                      name="property/create"
                      options={{
                        headerShown: false,
                        presentation: 'card',
                      }}
                    />
                <Stack.Screen
                  name="property/sell"
                  options={{
                    headerShown: false,
                    presentation: 'card',
                  }}
                />
                <Stack.Screen
                  name="auth/login"
                  options={{
                    headerShown: false,
                    presentation: 'card',
                  }}
                />
                <Stack.Screen
                  name="auth/signup"
                  options={{
                    headerShown: false,
                    presentation: 'card',
                  }}
                />
                <Stack.Screen
                  name="auth/verify-otp"
                  options={{
                    headerShown: false,
                    presentation: 'card',
                  }}
                />
                <Stack.Screen
                  name="auth/verify-email-otp"
                  options={{
                    headerShown: false,
                    presentation: 'card',
                  }}
                />
                <Stack.Screen
                  name="auth/forgot-password"
                  options={{
                    headerShown: false,
                    presentation: 'card',
                  }}
                />
                <Stack.Screen
                  name="profile/edit"
                  options={{
                    headerShown: false,
                    presentation: 'card',
                  }}
                />
                <Stack.Screen
                  name="profile/language"
                  options={{
                    headerShown: false,
                    presentation: 'card',
                  }}
                />
                <Stack.Screen
                  name="profile/enquiries"
                  options={{
                    headerShown: false,
                    presentation: 'card',
                  }}
                />
                <Stack.Screen
                  name="profile/preferences"
                  options={{
                    headerShown: false,
                    presentation: 'card',
                  }}
                />
                <Stack.Screen
                  name="profile/about"
                  options={{
                    headerShown: false,
                    presentation: 'card',
                  }}
                />
                <Stack.Screen
                  name="extra-services"
                  options={{
                    headerShown: false,
                    presentation: 'card',
                  }}
                />
                <Stack.Screen
                  name="profile/services"
                  options={{
                    headerShown: false,
                    presentation: 'card',
                  }}
                />
                <Stack.Screen
                  name="admin"
                  options={{
                    headerShown: false,
                  }}
                />
                <Stack.Screen
                  name="founder"
                  options={{
                    headerShown: false,
                  }}
                />
                <Stack.Screen
                  name="dev-showcase"
                  options={{
                    headerShown: false,
                    presentation: 'modal',
                  }}
                />
                <Stack.Screen
                  name="notifications"
                  options={{
                    headerShown: false,
                    presentation: 'card',
                  }}
                />
                <Stack.Screen
                  name="property/saved-searches"
                  options={{
                    headerShown: false,
                    presentation: 'card',
                  }}
                />
                <Stack.Screen
                  name="+not-found"
                  options={{
                    headerShown: false,
                  }}
                />
              </Stack>
            </DevAuthProvider>
          </NotificationProvider>
        </AuthProvider>
      </AdminPropertyProvider>
      </RecentlyViewedProvider>
    </CompareProvider>
  </SavedPropertiesProvider>
</LanguageProvider>
  </SafeAreaProvider>
  );
}
