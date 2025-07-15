import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { getTheme } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { Home, Search, Plus, FileText, Users, ShoppingBag, Settings, User, CheckCircle } from 'lucide-react-native';

const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const { darkMode } = useTheme();
  const { translations } = useLanguage();
  const theme = getTheme(darkMode);
  const styles = getStyles(theme);
  const [modalVisible, setModalVisible] = useState(false);
  const centerIndex = Math.floor(state.routes.length / 2);

  const menuItems: { label: string; icon: React.ReactNode; route: string }[] = [
    { label: translations.quotation, icon: <FileText color={theme.colors.text.secondary} />, route: 'quotation' },
    { label: translations.sales_order, icon: <ShoppingBag color={theme.colors.text.secondary} />, route: 'sales-order' },
    { label: translations.customers, icon: <Users color={theme.colors.text.secondary} />, route: 'customers' },
    { label: translations.items, icon: <ShoppingBag color={theme.colors.text.secondary} />, route: 'items' },
    { label: translations.tasks, icon: <FileText color={theme.colors.text.secondary} />, route: 'tasks' },
    { label: translations.check_in_out, icon: <CheckCircle color={theme.colors.text.secondary} />, route: 'check-in-out' },
  ];

  const handleMenuItemPress = (route: string) => {
    setModalVisible(false);
    navigation.navigate(route);
  };

  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setModalVisible(false)}
        >
          <View style={styles.modalView}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={() => handleMenuItemPress(item.route)}
              >
                {item.icon}
                <Text style={styles.menuItemText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <View style={styles.container}>
        {state.routes.map((route, index) => {
          // Filter to show only main tabs in the tab bar
          const mainTabs = ['index', 'profile'];
          if (!mainTabs.includes(route.name) && index !== centerIndex) {
            return null;
          }

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
                return <Home color={isFocused ? theme.colors.primary[500] : theme.colors.text.secondary} />;
              case 'profile':
                return <User color={isFocused ? theme.colors.primary[500] : theme.colors.text.secondary} />;
              default:
                return null;
            }
          };

          if (index === centerIndex) {
            return (
              <TouchableOpacity
                key={route.key}
                onPress={() => setModalVisible(true)}
                style={styles.centerButton}
              >
                <Plus color={theme.colors.white} />
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
              <Text style={{ color: isFocused ? theme.colors.primary[500] : theme.colors.text.secondary, marginTop: 4 }}>
                {label.toString()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
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
    left: '50%',
    marginLeft: -30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    width: '100%',
  },
  menuItemText: {
    marginLeft: 15,
    fontSize: 18,
    color: theme.colors.text.primary,
  },
});

export default CustomTabBar;
