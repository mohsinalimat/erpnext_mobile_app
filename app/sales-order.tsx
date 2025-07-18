import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Pressable, TextInput, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getSalesOrders } from '@/services/offline';
import { useTheme } from '@/context/ThemeContext';
import { useNetwork } from '@/context/NetworkContext';
import { router } from 'expo-router';

export default function SalesOrderScreen() {
  const { theme } = useTheme();
  const { isConnected } = useNetwork();
  const [salesOrders, setSalesOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSalesOrders = useMemo(() => {
    return salesOrders.filter(order =>
      order.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [salesOrders, searchQuery]);

  useEffect(() => {
    async function fetchSalesOrders() {
      if (isConnected === null) return;
      try {
        const data = await getSalesOrders(isConnected, [], '["name", "customer_name", "transaction_date", "status", "grand_total"]');
        setSalesOrders(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load sales orders');
      } finally {
        setLoading(false);
      }
    }
    fetchSalesOrders();
  }, [isConnected]);

  const styles = useMemo(() => StyleSheet.create({
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
      elevation: 2,
      backgroundColor: theme.colors.white,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    itemTitle: {
      fontWeight: 'bold',
      fontSize: 16,
      color: theme.colors.text.primary,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    itemFooter: {
        marginTop: 8,
        alignItems: 'flex-end',
    }
  }), [theme]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'To Deliver and Bill':
        return theme.colors.yellow[500];
      case 'Completed':
        return theme.colors.green[500];
      case 'Cancelled':
        return theme.colors.red[500];
      default:
        return theme.colors.gray[500];
    }
  };

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
    <Pressable onPress={() => router.push(`/sales-order/${item.name}` as any)}>
      <View style={[styles.itemContainer, { backgroundColor: theme.colors.white }]}>
        <View style={styles.itemHeader}>
            <Text style={[styles.itemTitle]}>{item.name}</Text>
            <Text style={{ color: getStatusColor(item.status), fontWeight: 'bold' }}>{item.status}</Text>
        </View>
        <View style={styles.itemRow}>
            <Text style={{ color: theme.colors.text.secondary }}>{item.customer_name}</Text>
            <Text style={{ color: theme.colors.text.secondary }}>{item.transaction_date}</Text>
        </View>
        <View style={styles.itemFooter}>
            <Text style={{ color: theme.colors.text.primary, fontSize: 16, fontWeight: 'bold' }}>
                Total: ৳{item.grand_total}
            </Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={{flex: 1}}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by customer or order ID"
          placeholderTextColor={theme.colors.text.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/new-sales-order')}>
          <Feather name="plus" size={24} color={theme.colors.white} />
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        </View>
      ) : filteredSalesOrders.length === 0 ? (
        <View style={styles.center}>
          <Text>No sales orders found.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredSalesOrders}
          keyExtractor={(item) => item.name}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}
