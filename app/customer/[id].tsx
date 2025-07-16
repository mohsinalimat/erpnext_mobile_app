import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getCustomerByName } from '@/services/erpnext';
import { theme } from '@/constants/theme';

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      async function fetchCustomer() {
        try {
          const data = await getCustomerByName(id as string);
          setCustomer(data);
        } catch (err: any) {
          setError(err.message || 'Failed to load customer details');
        } finally {
          setLoading(false);
        }
      }
      fetchCustomer();
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

  if (!customer) {
    return (
      <View style={styles.center}>
        <Text>Customer not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Customer: {customer.name}</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Details</Text>
        <Text>Name: {customer.customer_name}</Text>
        <Text>Group: {customer.customer_group}</Text>
        <Text>Territory: {customer.territory}</Text>
        <Text>Type: {customer.customer_type}</Text>
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
