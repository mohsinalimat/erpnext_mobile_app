import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { theme } from '@/constants/theme';
import { Home, Search, ShoppingCart, User } from 'lucide-react-native';

const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const centerIndex = Math.floor(state.routes.length / 2);

  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const getIcon = () => {
          switch (route.name) {
            case 'index':
              return <Home color={isFocused ? theme.colors.primary[500] : theme.colors.gray[500]} />;
            case 'search':
              return <Search color={isFocused ? theme.colors.primary[500] : theme.colors.gray[500]} />;
            case 'reports':
              return <ShoppingCart color={isFocused ? theme.colors.primary[500] : theme.colors.gray[500]} />;
            case 'settings':
              return <User color={isFocused ? theme.colors.primary[500] : theme.colors.gray[500]} />;
            default:
              return null;
          }
        };

        if (index === centerIndex) {
          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => navigation.navigate('modules')}
              style={styles.centerButton}
            >
              <Home color={theme.colors.white} />
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabButton}
          >
            {getIcon()}
            <Text style={{ color: isFocused ? theme.colors.primary[500] : theme.colors.gray[500] }}>
              {label.toString()}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 80,
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -5 },
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modulesButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modulesIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  centerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
  },
});

export default CustomTabBar;
