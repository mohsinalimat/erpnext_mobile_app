import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import BottomNavigation from '../navigation/BottomNavigation';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

interface MainLayoutProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
}

export default function MainLayout({ children, showBottomNav = true }: MainLayoutProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Prime ERP</Text>
        <TouchableOpacity onPress={() => router.push('/settings' as any)}>
          <Feather name="settings" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        {children}
      </View>
      {showBottomNav && <BottomNavigation />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#f5ca01',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
  content: {
    flex: 1,
    paddingBottom: 100, // Space for bottom navigation
  },
});
