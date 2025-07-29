import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Pressable, TextInput, TouchableOpacity, RefreshControl } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getCustomers } from '@/services/offline';
import { useTheme } from '@/context/ThemeContext';
import { useNetwork } from '@/context/NetworkContext';
import { router } from 'expo-router';
export default function CustomersScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { isConnected } = useNetwork();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer =>
      (customer.customer_name || customer.name).toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.customer_group.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [customers, searchQuery]);

  const fetchCustomers = useCallback(async () => {
    if (isConnected === null) return;
    try {
      const data = await getCustomers(isConnected);
      setCustomers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load customers');
    }
  }, [isConnected]);

  useEffect(() => {
    setLoading(true);
    fetchCustomers().finally(() => setLoading(false));
  }, [fetchCustomers]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCustomers();
    setRefreshing(false);
  }, [fetchCustomers]);

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

  const renderItem = ({ item }: { item: any }) => (
    <Pressable onPress={() => router.push({ pathname: '/(app)/customer-preview', params: { id: item.name } } as any)}>
      <View style={styles.itemContainer}>
        <View style={styles.itemHeader}>
          <Feather name="user" size={24} color={theme.colors.primary[500]} />
          <Text style={styles.itemTitle}>{item.customer_name || item.name}</Text>
        </View>
        <View style={styles.itemRow}>
          <Feather name="tag" size={16} color={theme.colors.text.secondary} />
          <Text style={styles.itemSubtitle}>Group: {item.customer_group}</Text>
        </View>
        <View style={styles.itemRow}>
          <Feather name="map-pin" size={16} color={theme.colors.text.secondary} />
          <Text style={styles.itemSubtitle}>Territory: {item.territory}</Text>
        </View>
        <View style={styles.itemRow}>
          <Feather name="info" size={16} color={theme.colors.text.secondary} />
          <Text style={styles.itemSubtitle}>Type: {item.customer_type}</Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by customer name or group"
          placeholderTextColor={theme.colors.text.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/new-customer' as any)}>
          <Feather name="plus" size={24} color={theme.colors.white} />
        </TouchableOpacity>
      </View>
      {filteredCustomers.length === 0 ? (
        <View style={styles.center}>
          <Text>No customers found.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCustomers}
          keyExtractor={(item) => item.name}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: theme.colors.background,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: theme.colors.gray[300],
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: theme.colors.white,
    color: theme.colors.text.primary,
    marginRight: 10,
  },
  addButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.primary[500],
  },
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
    elevation: 3,
    backgroundColor: theme.colors.white,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: theme.colors.text.primary,
    marginLeft: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginLeft: 8,
  },
});
