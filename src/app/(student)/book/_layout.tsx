import { Stack } from 'expo-router';

export default function BookLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="reserve" />
      <Stack.Screen name="reservations" />
      <Stack.Screen name="reservation-details" />
      <Stack.Screen name="edit-reservation" />
    </Stack>
  );
}