import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { AuthProvider, useAuth } from "@/contexts/auth-context";

import { BookingProvider } from "../features/booking/context";
import { AuthRefresh } from "../features/booking/screens";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <BookingProvider>
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <AuthRefresh />

            <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

            <AnimatedSplashOverlay />

            <RootNavigator />
          </ThemeProvider>
        </BookingProvider>
      </AuthProvider>
    </SafeAreaProvider>
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
