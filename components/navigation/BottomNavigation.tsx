import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Feather } from '@expo/vector-icons';

interface NavItem {
  name: string;
  icon: string;
  route: string;
  label: string;
}

const navItems: NavItem[] = [
  {
    name: 'home',
    icon: 'home',
    route: '/(app)/mainmenu',
    label: 'Home'
  },
  {
    name: 'customers',
    icon: 'users',
    route: '/customers',
    label: 'Customers'
  },
  {
    name: 'quotation',
    icon: 'file-text',
    route: '/quotation',
    label: 'Quotations'
  },
  {
    name: 'sales-order',
    icon: 'shopping-cart',
    route: '/sales-order',
    label: 'Orders'
  },
  {
    name: 'profile',
    icon: 'user',
    route: '/profile',
    label: 'Profile'
  }
];

export default function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const handlePress = (route: string) => {
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        {navItems.map((item, index) => {
          const isActive = pathname === item.route;
          const isCenter = index === 2; // Middle item (Quotations)
          
          return (
            <TouchableOpacity
              key={item.name}
              style={[
                styles.navItem,
                isCenter && styles.centerItem
              ]}
              onPress={() => handlePress(item.route)}
            >
              <View style={[
                styles.iconContainer,
                isCenter && styles.centerIconContainer,
                isActive && !isCenter && styles.activeIconContainer
              ]}>
                <Feather
                  name={item.icon as any}
                  size={isCenter ? 28 : 24}
                  color={isCenter ? 'white' : isActive ? '#3B82F6' : '#6B7280'}
                />
              </View>
              <Text style={[
                styles.label,
                isActive && !isCenter && styles.activeLabel,
                isCenter && styles.centerLabel
              ]}>
                {item.label}
              </Text>
              {isActive && !isCenter && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    paddingVertical: 12,
    paddingHorizontal: 20,
    paddingBottom: 34, // Extra padding for safe area
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  centerItem: {
    marginTop: -20,
  },
  iconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  centerIconContainer: {
    width: 56,
    height: 56,
    backgroundColor: '#3B82F6',
    borderRadius: 28,
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  activeIconContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '500',
  },
  activeLabel: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  centerLabel: {
    color: 'white',
    fontWeight: '600',
    marginTop: 6,
  },
  activeIndicator: {
    width: 4,
    height: 4,
    backgroundColor: '#10B981',
    borderRadius: 2,
    marginTop: 2,
  },
});
