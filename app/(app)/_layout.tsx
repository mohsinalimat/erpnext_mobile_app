import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="address" options={{ title: 'Address' }} />
      <Stack.Screen name="check-in-out" options={{ title: 'Check In/Out' }} />
      <Stack.Screen name="contact" options={{ title: 'Contact' }} />
      <Stack.Screen name="customer-preview" options={{ title: 'Customer Preview' }} />
      <Stack.Screen name="customers" options={{ title: 'Customers' }} />
      <Stack.Screen name="home" options={{ title: 'Home' }} />
      <Stack.Screen name="item-preview" options={{ title: 'Item Preview' }} />
      <Stack.Screen name="items" options={{ title: 'Items' }} />
      <Stack.Screen name="mainmenu" options={{ title: 'Main Menu' }} />
      <Stack.Screen name="new-address" options={{ title: 'New Address' }} />
      <Stack.Screen name="new-contact" options={{ title: 'New Contact' }} />
      <Stack.Screen name="new-customer" options={{ title: 'New Customer' }} />
      <Stack.Screen name="new-item" options={{ title: 'New Item' }} />
      <Stack.Screen name="new-quotation" options={{ title: 'New Quotation' }} />
      <Stack.Screen name="new-sales-order" options={{ title: 'New Sales Order' }} />
      <Stack.Screen name="new-task" options={{ title: 'New Task' }} />
      <Stack.Screen name="profile" options={{ title: 'Profile' }} />
      <Stack.Screen name="quotation-detail" options={{ title: 'Quotation Detail' }} />
      <Stack.Screen name="quotation" options={{ title: 'Quotation' }} />
      <Stack.Screen name="sales-order-preview" options={{ title: 'Sales Order Preview' }} />
      <Stack.Screen name="sales-order" options={{ title: 'Sales Order' }} />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      <Stack.Screen name="task-preview" options={{ title: 'Task Preview' }} />
      <Stack.Screen name="tasks" options={{ title: 'Tasks' }} />
    </Stack>
  );
}
