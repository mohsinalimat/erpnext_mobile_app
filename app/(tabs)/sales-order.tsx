import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Button, Pressable } from 'react-native';
import { getSalesOrders } from '@/services/erpnext';
import { useTheme } from '@/context/ThemeContext';
import { router } from 'expo-router';

export default function SalesOrderScreen() {
  const { theme } = useTheme();
  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSalesOrders() {
      try {
        const data = await getSalesOrders();
        setSalesOrders(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load sales orders');
      } finally {
        setLoading(false);
      }
    }
    fetchSalesOrders();
  }, []);

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

  if (salesOrders.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No sales orders found.</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: any }) => (
    <Pressable onPress={() => router.push(`/sales-order/${item.name}`)}>
      <View style={[styles.itemContainer, { backgroundColor: theme.colors.white }]}>
        <Text style={[styles.itemTitle, { color: theme.colors.text.primary }]}>Sales Order: {item.name}</Text>
        <Text style={{ color: theme.colors.text.secondary }}>Customer: {item.customer}</Text>
        <Text style={{ color: theme.colors.text.secondary }}>Date: {item.transaction_date}</Text>
        <Text style={{ color: theme.colors.text.secondary }}>Status: {item.status}</Text>
        <Text style={{ color: theme.colors.text.primary }}>Total: ৳{item.grand_total}</Text>
      </View>
    </Pressable>
  );

  return (
    <View style={{flex: 1}}>
      <View style={{ padding: 10 }}>
        <Button title="New Sales Order" onPress={() => router.push('/new-sales-order')} />
      </View>
      <FlatList
        data={salesOrders}
        keyExtractor={(item) => item.name}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
  },
  listContainer: {
    padding: 16,
  },
  itemContainer: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 16,
  },
});
