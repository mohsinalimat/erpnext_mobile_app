import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { theme } from '@/constants/theme';
import {
  Users,
  ShoppingCart,
  Package,
  FileText,
} from 'lucide-react-native';
import ModuleCard from '@/components/modules/ModuleCard';

export default function ModulesScreen() {
  const modules = [
    {
      id: 'customers',
      title: 'Customers',
      icon: Users,
      color: theme.colors.primary[500],
      route: '/(tabs)/modules/customers',
    },
    {
      id: 'items',
      title: 'Items',
      icon: Package,
      color: theme.colors.green[500],
      route: '/(tabs)/modules/items',
    },
    {
      id: 'sales',
      title: 'Sales',
      icon: ShoppingCart,
      color: theme.colors.blue[500],
      route: '/(tabs)/modules/sales-orders',
    },
    {
      id: 'quotations',
      title: 'Quotations',
      icon: FileText,
      color: theme.colors.yellow[500],
      route: '/(tabs)/modules/quotations',
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.sectionTitle}>Modules</Text>
      <View style={styles.moduleGrid}>
        {modules.map((module) => (
          <ModuleCard
            key={module.id}
            title={module.title}
            icon={module.icon}
            color={module.color}
            route={module.route}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: theme.colors.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  moduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
