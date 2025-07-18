import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="sales-order-preview" options={{ headerShown: true, title: 'Sales Order Preview' }} />
      {/* Other screens will be automatically discovered or can be added here */}
    </Stack>
  );
}
