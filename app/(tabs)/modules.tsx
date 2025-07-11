import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '@/constants/theme';
import { 
  Users, 
  ShoppingCart, 
  Package, 
  FileText, 
  Calendar, 
  Briefcase,
  HeartPulse,
  Wrench,
  Building,
  ArrowRight
} from 'lucide-react-native';
import ModuleCard from '@/components/modules/ModuleCard';

export default function ModulesScreen() {
  const modules = [
    {
      id: 'customers',
      title: 'Customers',
      description: 'Manage customer data and interactions',
      icon: Users,
      color: theme.colors.primary[500],
      route: '/(tabs)/modules/customers',
    },
    {
      id: 'sales',
      title: 'Sales',
      description: 'Orders, invoices, and payments',
      icon: ShoppingCart,
      color: theme.colors.blue[500],
      route: '/(tabs)/modules/sales-orders',
    },
    {
      id: 'inventory',
      title: 'Inventory',
      description: 'Stock levels and warehouse management',
      icon: Package,
      color: theme.colors.green[500],
      route: '/(tabs)/modules/items',
    },
    {
      id: 'accounting',
      title: 'Accounting',
      description: 'Financial reports and statements',
      icon: FileText,
      color: theme.colors.yellow[500],
      route: '/(tabs)/modules/quotations',
    },
    {
      id: 'hr',
      title: 'Human Resources',
      description: 'Employees, leaves, and payroll',
      icon: HeartPulse,
      color: theme.colors.red[500],
      route: '/hr',
    },
    {
      id: 'projects',
      title: 'Projects',
      description: 'Track projects, tasks, and timesheets',
      icon: Briefcase,
      color: theme.colors.purple[500],
      route: '/projects',
    },
    {
      id: 'calendar',
      title: 'Calendar',
      description: 'Schedule and manage appointments',
      icon: Calendar,
      color: theme.colors.teal[500],
      route: '/calendar',
    },
    {
      id: 'manufacturing',
      title: 'Manufacturing',
      description: 'Production planning and execution',
      icon: Wrench,
      color: theme.colors.indigo[500],
      route: '/manufacturing',
    },
    {
      id: 'assets',
      title: 'Assets',
      description: 'Track and manage company assets',
      icon: Building,
      color: theme.colors.orange[500],
      route: '/assets',
    },
  ];

  const recentModules = [
    'customers',
    'sales',
    'inventory',
  ];

  const getModuleById = (id) => modules.find(module => module.id === id);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {recentModules.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent</Text>
          <View style={styles.recentContainer}>
            {recentModules.map((moduleId) => {
              const module = getModuleById(moduleId);
              if (!module) return null;
              
              return (
                <TouchableOpacity key={module.id} style={styles.recentItem}>
                  <View style={[styles.recentIcon, { backgroundColor: module.color }]}>
                    <module.icon size={18} color={theme.colors.white} />
                  </View>
                  <Text style={styles.recentText}>{module.title}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>All Modules</Text>
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
      </View>

      <View style={styles.section}>
        <View style={styles.customSection}>
          <View>
            <Text style={styles.customTitle}>Need a custom module?</Text>
            <Text style={styles.customDescription}>
              Contact your system administrator to add custom modules to your ERPNext instance.
            </Text>
          </View>
          <TouchableOpacity style={styles.customButton}>
            <ArrowRight size={20} color={theme.colors.white} />
          </TouchableOpacity>
        </View>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  recentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    marginBottom: 12,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  recentIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  recentText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.text.primary,
  },
  moduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  customSection: {
    backgroundColor: theme.colors.primary[50],
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary[100],
  },
  customTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  customDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text.secondary,
    maxWidth: '80%',
  },
  customButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
});