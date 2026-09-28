import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack initialRouteName="get-started">
      <Stack.Screen name="get-started" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="role" options={{ title: 'Select Your Role' }} />
    </Stack>
  );
}
