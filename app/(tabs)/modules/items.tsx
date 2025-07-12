import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { theme } from '@/constants/theme';
import { Plus, Search, Filter } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { getItems } from '@/services/erpnext';

interface Item {
  name: string;
  item_name: string;
  item_group: string;
}

export default function ItemsScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const itemList = await getItems();
        setItems(itemList);
        setFilteredItems(itemList);
      } catch (e: any) {
        setError(e.message || 'Failed to fetch items');
        console.error('Failed to fetch items error:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  useEffect(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = items.filter(
      (item) =>
        item.item_name.toLowerCase().includes(lowercasedQuery) ||
        item.name.toLowerCase().includes(lowercasedQuery) ||
        item.item_group.toLowerCase().includes(lowercasedQuery)
    );
    setFilteredItems(filtered);
  }, [searchQuery, items]);

  const handleFilter = () => {
    setIsFilterModalVisible(true);
  };

  const applyFilter = (value: string) => {
    setIsFilterModalVisible(false);
    const filtered = items.filter((item) => item.item_group === value);
    setFilteredItems(filtered);
  };

  const uniqueItemGroups = useMemo(() => {
    return [...new Set(items.map((item) => item.item_group))];
  }, [items]);

  const renderFilterItem = useCallback(({ item }: { item: string }) => (
    <TouchableOpacity style={styles.filterItem} onPress={() => applyFilter(item)}>
      <Text style={styles.filterText}>{item}</Text>
    </TouchableOpacity>
  ), [applyFilter]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        <Text style={styles.loadingText}>Loading items...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
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
            placeholder="Search items..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={theme.colors.gray[400]}
          />
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/(tabs)/modules/new-item')}
        >
          <Plus size={24} color={theme.colors.white} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton} onPress={handleFilter}>
          <Filter size={24} color={theme.colors.gray[700]} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <View style={styles.itemItem}>
            <Text style={styles.itemName}>{item.item_name}</Text>
            <Text style={styles.itemGroup}>{item.item_group}</Text>
          </View>
        )}
      />
      <Modal
        visible={isFilterModalVisible}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Filter by Item Group</Text>
          <FlatList
            data={uniqueItemGroups}
            keyExtractor={(item) => item}
            renderItem={renderFilterItem}
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsFilterModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
  errorText: {
    color: theme.colors.error[500],
    fontSize: 16,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
    backgroundColor: theme.colors.primary[500],
    borderRadius: 8,
    padding: 8,
  },
  filterButton: {
    padding: 8,
  },
  itemItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  itemName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text.primary,
  },
  itemGroup: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text.secondary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  filterItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
    width: '100%',
  },
  filterText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text.primary,
  },
  closeButton: {
    backgroundColor: theme.colors.primary[500],
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  closeButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.white,
    textAlign: 'center',
  },
});
