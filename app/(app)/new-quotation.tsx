import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { createQuotation } from '@/services/offline';
import { useNetwork } from '@/context/NetworkContext';
import { theme } from '@/constants/theme';
import { router } from 'expo-router';

export default function NewQuotationScreen() {
  const { isConnected } = useNetwork();
  const [customer, setCustomer] = useState('');
  const [status, setStatus] = useState('Draft');
  const [grandTotal, setGrandTotal] = useState('0');
  const [loading, setLoading] = useState(false);

  const handleCreateQuotation = async () => {
    if (isConnected === null) {
      Alert.alert('Error', 'Cannot create quotation while network status is unknown.');
      return;
    }
    if (!customer) {
      Alert.alert('Error', 'Customer is required.');
      return;
    }
    setLoading(true);
    try {
      const result = await createQuotation(isConnected, {
        customer: customer,
        status: status,
        grand_total: parseFloat(grandTotal) || 0,
        transaction_date: new Date().toISOString().slice(0, 10),
      });
      if (result.offline) {
        Alert.alert('Success', 'Quotation data saved locally and will be synced when online.');
      } else {
        Alert.alert('Success', 'Quotation created successfully.');
      }
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create quotation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Customer</Text>
      <TextInput
        style={styles.input}
        value={customer}
        onChangeText={setCustomer}
        placeholder="Enter customer name"
      />
      <Text style={styles.label}>Status</Text>
      <TextInput
        style={styles.input}
        value={status}
        onChangeText={setStatus}
        placeholder="Enter status"
      />
        <Text style={styles.label}>Grand Total</Text>
        <TextInput
            style={styles.input}
            value={grandTotal}
            onChangeText={setGrandTotal}
            placeholder="Enter grand total"
            keyboardType="numeric"
        />
      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
      ) : (
        <Button title="Create Quotation" onPress={handleCreateQuotation} />
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
