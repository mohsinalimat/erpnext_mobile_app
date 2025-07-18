import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';

export default function QuotationDetailScreen() {
  const { theme } = useTheme();
  const { id } = useLocalSearchParams();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: theme.colors.background,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
      marginBottom: 16,
    },
    text: {
      fontSize: 16,
      color: theme.colors.text.secondary,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quotation Details</Text>
      <Text style={styles.text}>Quotation ID: {id}</Text>
      <Text style={styles.text}>Customer:</Text>
      <Text style={styles.text}>Date:</Text>
    </View>
  );
}
