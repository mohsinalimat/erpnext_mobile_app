import React, { useCallback, useState, useMemo } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Pressable, TextInput, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getQuotations } from '@/services/offline';
import { useTheme } from '@/context/ThemeContext';
import { useNetwork } from '@/context/NetworkContext';
import { router, useFocusEffect } from 'expo-router';
interface Quotation {
  name: string;
  customer_name: string;
  transaction_date: string;
  status: string;
  grand_total: number;
  valid_till: string;
}

export default function QuotationScreen() {
  const { theme } = useTheme();
  const { isConnected } = useNetwork();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredQuotations = useMemo(() => {
    return quotations.filter(quotation =>
      quotation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quotation.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [quotations, searchQuery]);

  useFocusEffect(
    useCallback(() => {
      async function fetchQuotations() {
        if (isConnected === null) return;
        try {
          setLoading(true);
          const data = await getQuotations(isConnected);
          setQuotations(data);
        } catch (err: any) {
          setError(err.message || 'Failed to load quotations');
        } finally {
          setLoading(false);
        }
      }
      fetchQuotations();
    }, [isConnected])
  );

  const handleDetail = (quotation: Quotation) => {
    router.push({ pathname: '/(app)/quotation-detail', params: { id: quotation.name } } as any);
  };

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
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    itemContainer: {
      backgroundColor: theme.colors.white,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    itemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    itemTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
      flex: 1,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusText: {
      color: theme.colors.white,
      fontWeight: 'bold',
      fontSize: 12,
    },
    itemBody: {
      marginBottom: 12,
    },
    customerName: {
      fontSize: 16,
      color: theme.colors.text.secondary,
      marginBottom: 8,
    },
    itemFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: theme.colors.gray[200],
      paddingTop: 12,
    },
    dateText: {
      fontSize: 14,
      color: theme.colors.text.secondary,
    },
    totalText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.primary[500],
    },
  }), [theme]);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return theme.colors.gray[500];
      case 'Submitted':
        return theme.colors.blue[500];
      case 'Ordered':
        return theme.colors.green[500];
      case 'Cancelled':
      case 'Lost':
      case 'Rejected':
        return theme.colors.red[500];
      default:
        return theme.colors.text.secondary;
    }
  };

  const renderItem = ({ item }: { item: Quotation }) => (
    <Pressable onPress={() => handleDetail(item)} style={styles.itemContainer}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle}>{item.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <View style={styles.itemBody}>
        <Text style={styles.customerName}>{item.customer_name}</Text>
      </View>
      <View style={styles.itemFooter}>
        <View>
          <Text style={styles.dateText}>Date: {item.transaction_date}</Text>
          <Text style={styles.dateText}>Valid Till: {item.valid_till}</Text>
        </View>
        <Text style={styles.totalText}>৳{item.grand_total.toFixed(2)}</Text>
      </View>
    </Pressable>
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by customer or quotation ID"
          placeholderTextColor={theme.colors.text.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        </View>
      ) : filteredQuotations.length === 0 ? (
        <View style={styles.center}>
          <Text>No quotations found.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredQuotations}
          keyExtractor={(item) => item.name}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}
