import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { AuthProvider, useAuth } from "@/contexts/auth-context";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <RootNavigator />
      </ThemeProvider>
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
        initialRouteName="index"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />

        <Stack.Screen name="profile" />

        <Stack.Screen name="profile-details" />

        <Stack.Screen name="edit-profile" />

        <Stack.Screen name="change-password" />

        <Stack.Screen name="notifications" />
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
