import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Button, Pressable } from 'react-native';
import { getCustomers } from '@/services/erpnext';
import { useTheme } from '@/context/ThemeContext';
import { router } from 'expo-router';

export default function CustomersScreen() {
  const { theme } = useTheme();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const data = await getCustomers();
        setCustomers(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load customers');
      } finally {
        setLoading(false);
      }
    }
    fetchCustomers();
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

  if (customers.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No customers found.</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: any }) => (
    <Pressable onPress={() => router.push(`/customer/${item.name}`)}>
      <View style={[styles.itemContainer, { backgroundColor: theme.colors.white }]}>
        <Text style={[styles.itemTitle, { color: theme.colors.text.primary }]}>{item.customer_name || item.name}</Text>
        <Text style={{ color: theme.colors.text.secondary }}>Group: {item.customer_group}</Text>
      </View>
    </Pressable>
  );

  return (
    <View style={{flex: 1}}>
      <View style={{ padding: 10 }}>
        <Button title="New Customer" onPress={() => router.push('/new-customer')} />
      </View>
      <FlatList
        data={customers}
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
