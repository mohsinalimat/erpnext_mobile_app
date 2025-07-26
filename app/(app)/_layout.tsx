import { Stack, router, usePathname } from 'expo-router';
import { Button, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import MainLayout from '../../components/layout/MainLayout';
import { theme } from '@/constants/theme';

const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const noLayoutScreens = ['/new-quotation'];

  if (noLayoutScreens.includes(pathname)) {
    return <View style={{ flex: 1, backgroundColor: theme.colors.background }}>{children}</View>;
  }

  return <MainLayout>{children}</MainLayout>;
};

export default function AppLayout() {
  return (
    <LayoutWrapper>
      <Stack>
        <Stack.Screen
          name="address"
          options={{
            title: 'Address',
            headerRight: () => (
              <TouchableOpacity
                style={styles.button}
                onPress={() => router.push('/(app)/new-address')}
              >
                <Text style={styles.buttonText}>+ Add Address</Text>
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen name="check-in-out" options={{ title: 'Check In/Out' }} />
        <Stack.Screen name="contact" options={{ title: 'Contact' }} />
        <Stack.Screen name="customer-preview" options={{ title: 'Customer Preview' }} />
        <Stack.Screen name="customers" options={{ title: 'Customers' }} />
        <Stack.Screen name="home" options={{ title: 'Home' }} />
        <Stack.Screen name="item-preview" options={{ title: 'Item Preview' }} />
        <Stack.Screen name="items" options={{ title: 'Items' }} />
        <Stack.Screen name="mainmenu" options={{ title: 'Prime ERP Mobile', headerShown: false }} />
        <Stack.Screen name="new-address" options={{ title: 'New Address' }} />
        <Stack.Screen name="new-contact" options={{ title: 'New Contact' }} />
        <Stack.Screen name="new-customer" options={{ title: 'New Customer' }} />
        <Stack.Screen
          name="new-item"
          options={{
            title: 'New Item',
            headerRight: () => (
              <Button
                onPress={() => router.push({ pathname: '/(app)/new-item', params: { create: 'true' } })}
                title="Create"
              />
            ),
          }}
        />
        <Stack.Screen
          name="new-quotation"
          options={{
            title: 'New Quotation',
            headerRight: () => (
              <TouchableOpacity
                style={styles.button}
                onPress={() => router.push({ pathname: '/(app)/new-quotation', params: { create: 'true' } })}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            ),
          }}
        />
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
    </LayoutWrapper>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.black,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 10,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
