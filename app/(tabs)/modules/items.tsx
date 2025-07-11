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
  Image,
} from 'react-native';
import { theme } from '@/constants/theme';
import { Search, Plus, Package, DollarSign, BarChart3, Tag } from 'lucide-react-native';
import api from '@/services/api';

interface Item {
  name: string;
  item_name: string;
  item_code: string;
  item_group: string;
  stock_uom: string;
  standard_rate: number;
  is_stock_item: number;
  disabled: number;
  image?: string;
  description?: string;
}

export default function ItemsScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);

  const fetchItems = async () => {
    try {
      const response = await api.get('/api/resource/Item', {
        params: {
          fields: JSON.stringify([
            'name',
            'item_name',
            'item_code',
            'item_group',
            'stock_uom',
            'standard_rate',
            'is_stock_item',
            'disabled',
            'image',
            'description'
          ]),
          limit_page_length: 100,
          order_by: 'creation desc',
        },
      });
      
      const itemData = response.data.data || [];
      setItems(itemData);
      setFilteredItems(itemData);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredItems(items);
    } else {
      const filtered = items.filter(item =>
        item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.item_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.item_group.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredItems(filtered);
    }
  }, [searchQuery, items]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchItems();
  };

  const renderItemCard = ({ item }: { item: Item }) => (
    <TouchableOpacity style={[styles.itemCard, item.disabled && styles.disabledCard]}>
      <View style={styles.itemHeader}>
        <View style={styles.itemImageContainer}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.itemImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Package size={24} color={theme.colors.gray[400]} />
            </View>
          )}
        </View>
        
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.item_name}</Text>
          <Text style={styles.itemCode}>{item.item_code}</Text>
          
          <View style={styles.itemTags}>
            <View style={styles.tag}>
              <Tag size={12} color={theme.colors.primary[600]} />
              <Text style={styles.tagText}>{item.item_group}</Text>
            </View>
            {item.is_stock_item === 1 && (
              <View style={[styles.tag, styles.stockTag]}>
                <BarChart3 size={12} color={theme.colors.success[600]} />
                <Text style={[styles.tagText, { color: theme.colors.success[600] }]}>Stock Item</Text>
              </View>
            )}
            {item.disabled === 1 && (
              <View style={[styles.tag, styles.disabledTag]}>
                <Text style={[styles.tagText, { color: theme.colors.error[600] }]}>Disabled</Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={styles.price}>
            {item.standard_rate ? `₹${item.standard_rate.toLocaleString()}` : 'No Price'}
          </Text>
          <Text style={styles.uom}>per {item.stock_uom}</Text>
        </View>
      </View>
      
      {item.description && (
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        <Text style={styles.loadingText}>Loading items...</Text>
      </View>
    );
  }

  const stockItems = items.filter(item => item.is_stock_item === 1).length;
  const activeItems = items.filter(item => item.disabled === 0).length;
  const avgPrice = items.length > 0 
    ? items.reduce((sum, item) => sum + (item.standard_rate || 0), 0) / items.length 
    : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={theme.colors.gray[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search items..."
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
          <Text style={styles.statNumber}>{items.length}</Text>
          <Text style={styles.statLabel}>Total Items</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stockItems}</Text>
          <Text style={styles.statLabel}>Stock Items</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{activeItems}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>₹{avgPrice.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Avg Price</Text>
        </View>
      </View>

      <FlatList
        data={filteredItems}
        renderItem={renderItemCard}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No items found</Text>
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
  itemCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  disabledCard: {
    opacity: 0.6,
    borderColor: theme.colors.error[200],
  },
  itemHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  itemImageContainer: {
    marginRight: 12,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: theme.colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  itemCode: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text.secondary,
    marginBottom: 8,
  },
  itemTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  stockTag: {
    backgroundColor: theme.colors.success[100],
  },
  disabledTag: {
    backgroundColor: theme.colors.error[100],
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary[600],
    marginLeft: 4,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: theme.colors.success[600],
  },
  uom: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text.secondary,
    lineHeight: 20,
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