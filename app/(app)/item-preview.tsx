import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import MainLayout from '@/components/layout/MainLayout';
import { theme } from '@/constants/theme';

export default function ItemPreviewScreen() {
  const { id } = useLocalSearchParams();

  return (
    <MainLayout>
      <View style={styles.container}>
        <Text style={styles.title}>Item Preview</Text>
        <Text style={styles.detailText}>Displaying details for Item ID: {id}</Text>
        {/* Add more item details here */}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: theme.colors.text.primary,
  },
  detailText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
});
