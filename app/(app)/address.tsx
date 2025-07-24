import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { fetchDocTypeData } from '@/services/api';
import { theme } from '@/constants/theme';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function AddressScreen() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const params = useLocalSearchParams();
  const fromNewCustomer = params.from === '/(app)/new-customer';

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

  const handleSelectAddress = (address: any) => {
    if (fromNewCustomer) {
      router.push({
        pathname: '/(app)/new-customer',
        params: { selectedAddress: JSON.stringify(address) },
      });
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => handleSelectAddress(item)} disabled={!fromNewCustomer}>
      <View style={styles.itemContainer}>
        <View style={styles.itemHeader}>
          <Feather name="map-pin" size={24} color={theme.colors.primary[500]} />
          <Text style={styles.itemTitle}>{item.address_line1}</Text>
        </View>
        {item.address_line2 && (
          <View style={styles.itemRow}>
            <Feather name="map-pin" size={16} color={theme.colors.text.secondary} />
            <Text style={styles.itemSubtitle}>{item.address_line2}</Text>
          </View>
        )}
        <View style={styles.itemRow}>
          <Feather name="map" size={16} color={theme.colors.text.secondary} />
          <Text style={styles.itemSubtitle}>
            {item.city}, {item.state}, {item.country}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
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
      {addresses.length > 0 ? (
        <FlatList
          data={addresses}
          renderItem={renderItem}
          keyExtractor={(item) => item.name}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.center}>
          <Text>No addresses found.</Text>
        </View>
      )}
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginLeft: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginLeft: 8,
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
