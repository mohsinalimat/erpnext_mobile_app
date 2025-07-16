import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getSalesOrderByName } from '@/services/erpnext';
import { theme } from '@/constants/theme';

export default function SalesOrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const [salesOrder, setSalesOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      async function fetchSalesOrder() {
        try {
          const data = await getSalesOrderByName(id as string);
          setSalesOrder(data);
        } catch (err: any) {
          setError(err.message || 'Failed to load sales order details');
        } finally {
          setLoading(false);
        }
      }
      fetchSalesOrder();
    }
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!salesOrder) {
    return (
      <View style={styles.center}>
        <Text>Sales Order not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sales Order: {salesOrder.name}</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Details</Text>
        <Text>Customer: {salesOrder.customer}</Text>
        <Text>Date: {salesOrder.transaction_date}</Text>
        <Text>Status: {salesOrder.status}</Text>
        <Text>Total: ৳{salesOrder.grand_total}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  errorText: {
    color: theme.colors.error[500],
  },
  container: {
    padding: 16,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    backgroundColor: theme.colors.white,
    padding: 16,
    borderRadius: 8,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});
