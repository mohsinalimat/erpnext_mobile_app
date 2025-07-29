import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { menuItems } from '../../services/menu-items';
import { router } from 'expo-router';

const CustomDrawer = (props: any) => {
  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.header}>
        <Text style={styles.title}>Menu</Text>
      </View>
      {menuItems.map((category, index) => (
        <View key={index}>
          <Text style={styles.categoryTitle}>{category.title}</Text>
          {category.items.map((item, itemIndex) => (
            <DrawerItem
              key={itemIndex}
              label={item.name}
              onPress={() => router.push(item.route as any)}
            />
          ))}
        </View>
      ))}
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  categoryTitle: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6c757d',
  },
});

export default CustomDrawer;
