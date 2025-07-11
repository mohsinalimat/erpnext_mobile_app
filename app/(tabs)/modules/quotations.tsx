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
import { Search, Plus, Calendar, DollarSign, User, FileText } from 'lucide-react-native';
import api from '@/services/api';

interface Quotation {
  name: string;
  customer_name: string;
  transaction_date: string;
  valid_till: string;
  status: string;
  grand_total: number;
  currency: string;
  quotation_to: string;
}

const statusColors = {
  'Draft': theme.colors.gray[500],
  'Open': theme.colors.blue[500],
  'Replied': theme.colors.warning[500],
  'Partially Ordered': theme.colors.purple[500],
  'Ordered': theme.colors.success[500],
  'Lost': theme.colors.error[500],
  'Cancelled': theme.colors.error[500],
};

export default function QuotationsScreen() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredQuotations, setFilteredQuotations] = useState<Quotation[]>([]);

  const fetchQuotations = async () => {
    try {
      const response = await api.get('/api/resource/Quotation', {
        params: {
          fields: JSON.stringify([
            'name',
            'customer_name',
            'transaction_date',
            'valid_till',
            'status',
            'grand_total',
            'currency',
            'quotation_to'
          ]),
          limit_page_length: 100,
          order_by: 'creation desc',
        },
      });
      
      const quotationData = response.data.data || [];
      setQuotations(quotationData);
      setFilteredQuotations(quotationData);
    } catch (error) {
      console.error('Error fetching quotations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredQuotations(quotations);
    } else {
      const filtered = quotations.filter(quotation =>
        quotation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quotation.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quotation.status.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredQuotations(filtered);
    }
  }, [searchQuery, quotations]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchQuotations();
  };

  const getStatusColor = (status: string) => {
    return statusColors[status] || theme.colors.gray[500];
  };

  const isExpired = (validTill: string) => {
    return new Date(validTill) < new Date();
  };

  const renderQuotationItem = ({ item }: { item: Quotation }) => {
    const expired = isExpired(item.valid_till);
    
    return (
      <TouchableOpacity style={[styles.quotationCard, expired && styles.expiredCard]}>
        <View style={styles.quotationHeader}>
          <View style={styles.quotationInfo}>
            <Text style={styles.quotationNumber}>{item.name}</Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                {item.status}
              </Text>
              {expired && (
                <Text style={styles.expiredText}>• EXPIRED</Text>
              )}
            </View>
          </View>
          <View style={styles.amountContainer}>
            <Text style={styles.amount}>
              {item.currency} {item.grand_total?.toLocaleString() || '0'}
            </Text>
          </View>
        </View>
        
        <View style={styles.quotationDetails}>
          <View style={styles.detailRow}>
            <User size={14} color={theme.colors.text.secondary} />
            <Text style={styles.detailText}>{item.customer_name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Calendar size={14} color={theme.colors.text.secondary} />
            <Text style={styles.detailText}>
              Date: {new Date(item.transaction_date).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Calendar size={14} color={expired ? theme.colors.error[500] : theme.colors.text.secondary} />
            <Text style={[styles.detailText, expired && { color: theme.colors.error[500] }]}>
              Valid till: {new Date(item.valid_till).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <FileText size={14} color={theme.colors.text.secondary} />
            <Text style={styles.detailText}>To: {item.quotation_to}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        <Text style={styles.loadingText}>Loading quotations...</Text>
      </View>
    );
  }

  const totalValue = quotations.reduce((sum, quotation) => sum + (quotation.grand_total || 0), 0);
  const openQuotations = quotations.filter(q => q.status === 'Open').length;
  const expiredQuotations = quotations.filter(q => isExpired(q.valid_till)).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={theme.colors.gray[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search quotations..."
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
          <Text style={styles.statNumber}>{quotations.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{openQuotations}</Text>
          <Text style={styles.statLabel}>Open</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.colors.error[500] }]}>
            {expiredQuotations}
          </Text>
          <Text style={styles.statLabel}>Expired</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {totalValue.toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>Total Value</Text>
        </View>
      </View>

      <FlatList
        data={filteredQuotations}
        renderItem={renderQuotationItem}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No quotations found</Text>
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
    fontSize: 18,
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
  quotationCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  expiredCard: {
    borderColor: theme.colors.error[200],
    backgroundColor: theme.colors.error[50],
  },
  quotationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  quotationInfo: {
    flex: 1,
  },
  quotationNumber: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text.primary,
    marginBottom: 6,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  expiredText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: theme.colors.error[500],
    marginLeft: 4,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: theme.colors.success[600],
  },
  quotationDetails: {
    marginBottom: 8,
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