import React from 'react';
import { View, StyleSheet } from 'react-native';
import BottomNavigation from '../navigation/BottomNavigation';

interface MainLayoutProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
}

export default function MainLayout({ children, showBottomNav = true }: MainLayoutProps) {
  return (
    <View style={styles.container}>
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
  content: {
    flex: 1,
    paddingBottom: 100, // Space for bottom navigation
  },
});
