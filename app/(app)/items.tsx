import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Pressable, TextInput, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getItems } from '@/services/offline';
import { useTheme } from '@/context/ThemeContext';
import { useNetwork } from '@/context/NetworkContext';
import { router } from 'expo-router';

export default function ItemsScreen() {
  const { theme } = useTheme();
  const { isConnected } = useNetwork();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    return items.filter(item =>
      (item.item_name || item.name).toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.item_group.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  useEffect(() => {
    async function fetchItems() {
      if (isConnected === null) return;
      try {
        const data = await getItems(isConnected);
        setItems(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load items');
      } finally {
        setLoading(false);
      }
    }
    fetchItems();
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
    itemTitle: {
      fontWeight: 'bold',
      marginBottom: 8,
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

  const renderItem = ({ item }: { item: any }) => (
    <Pressable onPress={() => router.push({ pathname: '/item-preview', params: { id: item.name } } as any)}>
      <View style={[styles.itemContainer, { backgroundColor: theme.colors.white }]}>
        <Text style={[styles.itemTitle, { color: theme.colors.text.primary }]}>{item.item_name || item.name}</Text>
        <Text style={{ color: theme.colors.text.secondary }}>Group: {item.item_group}</Text>
      </View>
    </Pressable>
  );

  return (
    <View style={{flex: 1}}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by item name or group"
          placeholderTextColor={theme.colors.text.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/new-item')}>
          <Feather name="plus" size={24} color={theme.colors.white} />
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        </View>
      ) : filteredItems.length === 0 ? (
        <View style={styles.center}>
          <Text>No items found.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.name}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}
