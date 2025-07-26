import React from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNavigation from '../navigation/BottomNavigation';
import { theme } from '@/constants/theme';

interface MainLayoutProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
}

export default function MainLayout({ children, showBottomNav = true }: MainLayoutProps) {
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? -64 : 0}
      >
        <View style={styles.content}>{children}</View>
      </KeyboardAvoidingView>
      {showBottomNav && <BottomNavigation />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
