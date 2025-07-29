
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useNetwork } from '@/context/NetworkContext';
import PrimaryButton from '@/components/common/PrimaryButton';
import { getQuotationByName, createSalesOrder } from '@/services/erpnext';


export default function QuotationDetailScreen() {
  const { theme } = useTheme();
  const { isConnected } = useNetwork();
  const { id } = useLocalSearchParams();
  const [quotation, setQuotation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function fetchQuotation() {
      setLoading(true);
      try {
        const data = await getQuotationByName(id as string);
        setQuotation(data);
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Failed to load quotation');
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchQuotation();
  }, [id]);

  const handleCreateSalesOrder = async () => {
    if (!quotation) return;
    if (isConnected === false) {
      Alert.alert('Offline', 'Cannot create sales order while offline.');
      return;
    }
    setCreating(true);
    try {
      // Prepare sales order data from quotation
      const salesOrderData = {
        customer: quotation.customer_name,
        transaction_date: new Date().toISOString().slice(0, 10),
        order_type: quotation.order_type || 'Sales',
        items: quotation.items?.map((item: any) => ({
          item_code: item.item_code,
          qty: item.qty,
          rate: item.rate,
          amount: item.amount,
        })) || [],
        // Add more fields as needed
        quotation: quotation.name,
      };
      const salesOrder = await createSalesOrder(salesOrderData);
      Alert.alert('Success', `Sales Order ${salesOrder.name} created!`, [
        { text: 'View', onPress: () => router.push({ pathname: '/(app)/sales-order-preview', params: { id: salesOrder.name } }) },
        { text: 'OK' },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create sales order');
    } finally {
      setCreating(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: theme.colors.background,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
      marginBottom: 16,
    },
    text: {
      fontSize: 16,
      color: theme.colors.text.secondary,
      marginBottom: 8,
    },
    button: {
      marginTop: 24,
    },
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  if (!quotation) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Quotation not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quotation Details</Text>
      <Text style={styles.text}>Quotation ID: {quotation.name}</Text>
      <Text style={styles.text}>Customer: {quotation.customer_name}</Text>
      <Text style={styles.text}>Date: {quotation.transaction_date}</Text>
      <Text style={styles.text}>Status: {quotation.status}</Text>
      <Text style={styles.text}>Grand Total: {quotation.grand_total}</Text>
      <View style={styles.button}>
        <PrimaryButton
          title={creating ? 'Creating Sales Order...' : 'Create Sales Order'}
          onPress={handleCreateSalesOrder}
          disabled={creating}
          loading={creating}
        />
      </View>
    </View>
  );
}
