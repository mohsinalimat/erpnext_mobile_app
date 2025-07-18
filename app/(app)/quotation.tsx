import React, { useCallback, useState, useMemo } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Pressable, TextInput, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getQuotations } from '@/services/offline';
import { useTheme } from '@/context/ThemeContext';
import { useNetwork } from '@/context/NetworkContext';
import { router, useFocusEffect } from 'expo-router';
import MainLayout from '@/components/layout/MainLayout';

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

  const handlePreview = (quotation: Quotation) => {
    router.push(`/quotation-detail?id=${quotation.name}` as any);
  };

  const handleDetail = (quotation: Quotation) => {
    router.push(`/quotation-detail?id=${quotation.name}` as any);
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
      alignItems: 'center',
      marginBottom: 8,
    },
    itemDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    itemTitle: {
      fontWeight: 'bold',
      fontSize: 16,
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
    <Pressable onPress={() => handleDetail(item)}>
      <View style={styles.itemContainer}>
        <View style={styles.itemHeader}>
          <Text style={[styles.itemTitle, { color: theme.colors.text.primary }]}>
            {item.name}
          </Text>
          <Text style={[styles.itemTitle, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
        <Text style={{ color: theme.colors.text.secondary, marginBottom: 8 }}>
          {item.customer_name}
        </Text>
        <View style={styles.itemDetails}>
          <Text style={{ color: theme.colors.text.secondary }}>Date: {item.transaction_date}</Text>
          <Text style={{ color: theme.colors.text.secondary }}>Valid Till: {item.valid_till}</Text>
        </View>
        <Text style={{ color: theme.colors.text.primary, fontWeight: 'bold', marginTop: 8 }}>
          ৳{item.grand_total}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <MainLayout>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by customer or quotation ID"
          placeholderTextColor={theme.colors.text.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/new-quotation')}>
          <Feather name="plus" size={24} color={theme.colors.white} />
        </TouchableOpacity>
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
    </MainLayout>
  );
}
