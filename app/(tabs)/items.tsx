import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Button, Pressable } from 'react-native';
import { getItems } from '@/services/erpnext';
import { theme } from '@/constants/theme';
import { router } from 'expo-router';

export default function ItemsScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchItems() {
      try {
        const data = await getItems();
        setItems(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load items');
      } finally {
        setLoading(false);
      }
    }
    fetchItems();
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

  if (items.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No items found.</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: any }) => (
    <Pressable onPress={() => router.push(`/item/${item.name}`)}>
      <View style={styles.itemContainer}>
        <Text style={styles.itemTitle}>{item.item_name || item.name}</Text>
        <Text>Group: {item.item_group}</Text>
      </View>
    </Pressable>
  );

  return (
    <View style={{flex: 1}}>
      <View style={{ padding: 10 }}>
        <Button title="New Item" onPress={() => router.push('/new-item')} />
      </View>
      <FlatList
        data={items}
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
    backgroundColor: theme.colors.background,
  },
  errorText: {
    color: theme.colors.error[500],
  },
  listContainer: {
    padding: 16,
    backgroundColor: theme.colors.background,
  },
  itemContainer: {
    backgroundColor: theme.colors.white,
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: theme.colors.shadow,
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
