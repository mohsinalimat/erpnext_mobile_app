import { Stack } from 'expo-router';

export default function ModulesLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="customers"
        options={{
          title: 'Customers',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="sales-orders"
        options={{
          title: 'Sales Orders',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="quotations"
        options={{
          title: 'Quotations',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="items"
        options={{
          title: 'Items',
          headerShown: true,
        }}
      />
    </Stack>
  );
}