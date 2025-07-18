import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { createCustomer } from '@/services/offline';
import { useNetwork } from '@/context/NetworkContext';
import { theme } from '@/constants/theme';
import { router } from 'expo-router';

export default function NewCustomerScreen() {
  const { isConnected } = useNetwork();
  const [customerName, setCustomerName] = useState('');
  const [customerGroup, setCustomerGroup] = useState('All Customer Groups');
  const [territory, setTerritory] = useState('All Territories');
  const [loading, setLoading] = useState(false);

  const handleCreateCustomer = async () => {
    if (isConnected === null) {
      Alert.alert('Error', 'Cannot create customer while network status is unknown.');
      return;
    }
    if (!customerName) {
      Alert.alert('Error', 'Customer name is required.');
      return;
    }
    setLoading(true);
    try {
      const result = await createCustomer(isConnected, {
        customer_name: customerName,
        customer_group: customerGroup,
        territory: territory,
      });
      if (result.offline) {
        Alert.alert('Success', 'Customer data saved locally and will be synced when online.');
      } else {
        Alert.alert('Success', 'Customer created successfully.');
      }
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create customer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Customer Name</Text>
      <TextInput
        style={styles.input}
        value={customerName}
        onChangeText={setCustomerName}
        placeholder="Enter customer name"
      />
      <Text style={styles.label}>Customer Group</Text>
      <TextInput
        style={styles.input}
        value={customerGroup}
        onChangeText={setCustomerGroup}
        placeholder="Enter customer group"
      />
        <Text style={styles.label}>Territory</Text>
        <TextInput
            style={styles.input}
            value={territory}
            onChangeText={setTerritory}
            placeholder="Enter territory"
        />
      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
      ) : (
        <Button title="Create Customer" onPress={handleCreateCustomer} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: theme.colors.background,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.colors.white,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
});
