import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { createItem } from '@/services/offline';
import { useNetwork } from '@/context/NetworkContext';
import { theme } from '@/constants/theme';
import { router } from 'expo-router';

export default function NewItemScreen() {
  const { isConnected } = useNetwork();
  const [itemName, setItemName] = useState('');
  const [itemGroup, setItemGroup] = useState('All Item Groups');
  const [stockUom, setStockUom] = useState('Nos');
  const [loading, setLoading] = useState(false);

  const handleCreateItem = async () => {
    if (isConnected === null) {
      Alert.alert('Error', 'Cannot create item while network status is unknown.');
      return;
    }
    if (!itemName) {
      Alert.alert('Error', 'Item name is required.');
      return;
    }
    setLoading(true);
    try {
      const result = await createItem(isConnected, {
        item_name: itemName,
        item_group: itemGroup,
        stock_uom: stockUom,
      });
      if (result.offline) {
        Alert.alert('Success', 'Item data saved locally and will be synced when online.');
      } else {
        Alert.alert('Success', 'Item created successfully.');
      }
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create item.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Item Name</Text>
      <TextInput
        style={styles.input}
        value={itemName}
        onChangeText={setItemName}
        placeholder="Enter item name"
      />
      <Text style={styles.label}>Item Group</Text>
      <TextInput
        style={styles.input}
        value={itemGroup}
        onChangeText={setItemGroup}
        placeholder="Enter item group"
      />
        <Text style={styles.label}>Stock UOM</Text>
        <TextInput
            style={styles.input}
            value={stockUom}
            onChangeText={setStockUom}
            placeholder="Enter stock UOM"
        />
      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
      ) : (
        <Button title="Create Item" onPress={handleCreateItem} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: theme.colors.background,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.colors.white,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
});
