import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getQuotationByName } from '@/services/erpnext';
import { theme } from '@/constants/theme';

export default function QuotationDetailScreen() {
  const { id } = useLocalSearchParams();
  const [quotation, setQuotation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      async function fetchQuotation() {
        try {
          const data = await getQuotationByName(id as string);
          setQuotation(data);
        } catch (err: any) {
          setError(err.message || 'Failed to load quotation details');
        } finally {
          setLoading(false);
        }
      }
      fetchQuotation();
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

  if (!quotation) {
    return (
      <View style={styles.center}>
        <Text>Quotation not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Quotation: {quotation.name}</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Details</Text>
        <Text>Customer: {quotation.customer}</Text>
        <Text>Date: {quotation.transaction_date}</Text>
        <Text>Status: {quotation.status}</Text>
        <Text>Total: ৳{quotation.grand_total}</Text>
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
