import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { createSalesOrder } from '@/services/erpnext';
import { theme } from '@/constants/theme';
import { router } from 'expo-router';

export default function NewSalesOrderScreen() {
    const [customer, setCustomer] = useState('');
    const [status, setStatus] = useState('Draft');
    const [grandTotal, setGrandTotal] = useState('0');
  const [loading, setLoading] = useState(false);

  const handleCreateSalesOrder = async () => {
    if (!customer) {
      Alert.alert('Error', 'Customer is required.');
      return;
    }
    setLoading(true);
    try {
      await createSalesOrder({
        customer: customer,
        status: status,
        grand_total: grandTotal,
        transaction_date: new Date().toISOString().slice(0, 10),
      });
      Alert.alert('Success', 'Sales Order created successfully.');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create sales order.');
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
        <Button title="Create Sales Order" onPress={handleCreateSalesOrder} />
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
