import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import {
  AppearanceProvider,
  useAppearance,
} from "@/contexts/appearance-context";
import { AuthProvider, useAuth } from "@/contexts/auth-context";

import { BookingProvider } from "../features/booking/context";
import { AuthRefresh } from "../features/booking/screens";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppearanceProvider>
        <AppContent />
      </AppearanceProvider>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const { appearance, isAppearanceLoading } = useAppearance();

  if (isAppearanceLoading) {
    return null;
  }

  const isDark = appearance === "dark";

  return (
    <AuthProvider>
      <BookingProvider>
        <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
          <AuthRefresh />

          <StatusBar style={isDark ? "light" : "dark"} />

          <RootNavigator />
        </ThemeProvider>
      </BookingProvider>
    </AuthProvider>
  );
}

function RootNavigator() {
  const { session, account, isLoading } = useAuth();

  const canUseApp = !!session && !!account?.role;

  if (isLoading) {
    return null;
  }

  if (canUseApp) {
    return (
      <Stack
        initialRouteName="account/index"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="account/index" />
        <Stack.Screen name="account/profile" />
        <Stack.Screen name="account/profile-details" />
        <Stack.Screen name="account/edit-profile" />
        <Stack.Screen name="account/change-password" />
        <Stack.Screen name="account/notifications" />
        <Stack.Screen name="account/notification-details" />
        <Stack.Screen name="account/notification-preferences" />
        <Stack.Screen name="account/app-appearance" />
      </Stack>
    );
  }

  return (
    <Stack
      initialRouteName="(auth)"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(auth)" />
    </Stack>
  );
}
