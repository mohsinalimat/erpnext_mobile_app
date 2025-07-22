import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import MainLayout from '@/components/layout/MainLayout';
import { theme } from '@/constants/theme';
import { getItemByName } from '@/services/erpnext';
import { useNetwork } from '@/context/NetworkContext';

interface Item {
  item_name: string;
  item_group: string;
  stock_uom: string;
  item_type: string;
}

export default function ItemPreviewScreen() {
  const { item: itemString } = useLocalSearchParams();
  const item = JSON.parse(itemString as string);

  return (
    <MainLayout>
      <View style={styles.container}>
        <Text style={styles.title}>{item.item_name}</Text>
        <View style={styles.detailsContainer}>
          <Text style={styles.label}>Item Group</Text>
          <Text style={styles.value}>{item.item_group}</Text>
          <Text style={styles.label}>Stock UOM</Text>
          <Text style={styles.value}>{item.stock_uom}</Text>
          <Text style={styles.label}>Item Type</Text>
          <Text style={styles.value}>{item.item_type}</Text>
        </View>
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: theme.colors.text.primary,
  },
  detailsContainer: {
    backgroundColor: theme.colors.white,
    padding: 16,
    borderRadius: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.secondary,
    marginTop: 8,
  },
  value: {
    fontSize: 16,
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
});
