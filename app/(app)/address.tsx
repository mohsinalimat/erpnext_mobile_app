import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { fetchDocTypeData } from '@/services/api';
import { theme } from '@/constants/theme';
import { router, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function AddressScreen() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAddresses = async () => {
    try {
      const data = await fetchDocTypeData('Address', [
        'name',
        'address_line1',
        'address_line2',
        'city',
        'state',
        'country',
      ]);
      setAddresses(data);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, [])
  );

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemTitle}>{item.address_line1}</Text>
      <Text style={styles.itemSubtitle}>
        {item.city}, {item.state}, {item.country}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={addresses}
        renderItem={renderItem}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.listContainer}
      />
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => router.push('/(app)/new-address')}
      >
        <Feather name="plus" size={24} color={theme.colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  itemContainer: {
    backgroundColor: theme.colors.white,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  itemSubtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  createButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: theme.colors.primary[500],
    borderRadius: 50,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
