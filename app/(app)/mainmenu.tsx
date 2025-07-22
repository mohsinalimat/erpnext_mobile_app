import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import LoadingAnimation from '../../components/common/LoadingAnimation';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function MainMenu() {
  const { isAuthenticated, isInitialized } = useAuth();

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isInitialized, isAuthenticated]);

  if (!isInitialized || !isAuthenticated) {
    return <LoadingAnimation />;
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
      title: 'Address',
      subtitle: 'Address book',
      icon: 'map-pin',
      color: '#10B981',
      route: '/address'
    },
    {
      title: 'Contact',
      subtitle: 'Contact book',
      icon: 'phone',
      color: '#F59E0B',
      route: '/contact'
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
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Main Menu</Text>
          <Text style={styles.headerSubtitle}>Select an option to continue</Text>
        </View>
        <View style={styles.gridContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() => router.push(item.route as any)}
            >
              <View style={[styles.cardIcon, { backgroundColor: item.color }]}>
                <Feather name={item.icon as any} size={32} color="white" />
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.additionalButtons}>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/home' as any)}>
            <Feather name="home" size={20} color="#3B82F6" />
            <Text style={styles.secondaryButtonText}>Dashboard</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/check-in-out' as any)}>
            <Feather name="clock" size={20} color="#3B82F6" />
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
    backgroundColor: '#F3F4F6',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: 'white',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  card: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    height: 180,
  },
  cardIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  additionalButtons: {
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 30,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  secondaryButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
});
