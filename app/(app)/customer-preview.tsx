import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { theme } from '@/constants/theme';

export default function CustomerPreviewScreen() {
  const { id } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Customer Preview</Text>
      <Text style={styles.detailText}>Displaying details for Customer ID: {id}</Text>
      {/* Add more customer details here */}
    </View>
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
