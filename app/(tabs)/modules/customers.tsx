import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { theme } from '@/constants/theme';
import { Search, Plus, Phone, Mail, MapPin, Building } from 'lucide-react-native';
import api from '@/services/api';

interface Customer {
  name: string;
  customer_name: string;
  customer_type: string;
  territory: string;
  customer_group: string;
  mobile_no?: string;
  email_id?: string;
  creation: string;
}

export default function CustomersScreen() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/api/resource/Customer', {
        params: {
          fields: JSON.stringify([
            'name',
            'customer_name',
            'customer_type',
            'territory',
            'customer_group',
            'mobile_no',
            'email_id',
            'creation'
          ]),
          limit_page_length: 100,
          order_by: 'creation desc',
        },
      });
      
      const customerData = response.data.data || [];
      setCustomers(customerData);
      setFilteredCustomers(customerData);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(customer =>
        customer.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.customer_group.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCustomers(filtered);
    }
  }, [searchQuery, customers]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCustomers();
  };

  const renderCustomerItem = ({ item }: { item: Customer }) => (
    <TouchableOpacity style={styles.customerCard}>
      <View style={styles.customerHeader}>
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{item.customer_name}</Text>
          <Text style={styles.customerId}>{item.name}</Text>
        </View>
        <View style={styles.customerTypeContainer}>
          <Text style={styles.customerType}>{item.customer_type}</Text>
        </View>
      </View>
      
      <View style={styles.customerDetails}>
        <View style={styles.detailRow}>
          <Building size={14} color={theme.colors.text.secondary} />
          <Text style={styles.detailText}>{item.customer_group}</Text>
        </View>
        <View style={styles.detailRow}>
          <MapPin size={14} color={theme.colors.text.secondary} />
          <Text style={styles.detailText}>{item.territory}</Text>
        </View>
        {item.mobile_no && (
          <View style={styles.detailRow}>
            <Phone size={14} color={theme.colors.text.secondary} />
            <Text style={styles.detailText}>{item.mobile_no}</Text>
          </View>
        )}
        {item.email_id && (
          <View style={styles.detailRow}>
            <Mail size={14} color={theme.colors.text.secondary} />
            <Text style={styles.detailText}>{item.email_id}</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.creationDate}>
        Created: {new Date(item.creation).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        <Text style={styles.loadingText}>Loading customers...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={theme.colors.gray[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search customers..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={theme.colors.gray[400]}
          />
        </View>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={20} color={theme.colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{customers.length}</Text>
          <Text style={styles.statLabel}>Total Customers</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {customers.filter(c => c.customer_type === 'Company').length}
          </Text>
          <Text style={styles.statLabel}>Companies</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {customers.filter(c => c.customer_type === 'Individual').length}
          </Text>
          <Text style={styles.statLabel}>Individuals</Text>
        </View>
      </View>

      <FlatList
        data={filteredCustomers}
        renderItem={renderCustomerItem}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No customers found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray[100],
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    marginLeft: 8,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text.primary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: theme.colors.primary[500],
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
  },
  customerCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  customerId: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text.secondary,
  },
  customerTypeContainer: {
    backgroundColor: theme.colors.primary[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  customerType: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary[700],
  },
  customerDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text.secondary,
    marginLeft: 8,
  },
  creationDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text.tertiary,
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text.secondary,
  },
});