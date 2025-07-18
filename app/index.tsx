import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import LoadingAnimation from '@/components/common/LoadingAnimation';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function Index() {
  const { isAuthenticated, isInitialized } = useAuth();

  if (!isInitialized) {
    return <LoadingAnimation />;
  }

  if (!isAuthenticated) {
    router.replace('/login');
    return null; // Or a loading indicator, as the redirect happens immediately
  }

  const menuItems = [
    {
      title: 'Customers',
      subtitle: 'Manage customers',
      icon: 'users',
      color: '#8B5CF6',
      route: '/customers'
    },
    {
      title: 'Items',
      subtitle: 'Product catalog',
      icon: 'package',
      color: '#F59E0B',
      route: '/items'
    },
    {
      title: 'Quotations',
      subtitle: 'Sales quotes',
      icon: 'file-text',
      color: '#EF4444',
      route: '/quotation'
    },
    {
      title: 'Sales Orders',
      subtitle: 'Order management',
      icon: 'shopping-cart',
      color: '#10B981',
      route: '/sales-order'
    },
    {
      title: 'Tasks',
      subtitle: 'Task management',
      icon: 'check-square',
      color: '#3B82F6',
      route: '/tasks'
    },
    {
      title: 'Profile',
      subtitle: 'User profile',
      icon: 'user',
      color: '#6366F1',
      route: '/profile'
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Prime ERP Mobile</Text>
        <TouchableOpacity onPress={() => router.push('/settings' as any)}>
          <Feather name="settings" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.gridContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.card, { backgroundColor: item.color }]}
              onPress={() => router.push(item.route as any)}
            >
              <View style={styles.cardContent}>
                <Feather name={item.icon as any} size={32} color="white" />
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.additionalButtons}>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/home' as any)}>
            <Feather name="home" size={20} color="white" />
            <Text style={styles.secondaryButtonText}>Dashboard</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/check-in-out' as any)}>
            <Feather name="clock" size={20} color="white" />
            <Text style={styles.secondaryButtonText}>Check In/Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5ca01',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    width: '48%',
    height: 140,
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    justifyContent: 'space-between',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  cardSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  additionalButtons: {
    marginBottom: 40,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
});
