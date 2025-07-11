import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Video as LucideIcon } from 'lucide-react-native';

interface TabBarIconProps {
  Icon: LucideIcon;
  color: string;
  size?: number;
}

const TabBarIcon: React.FC<TabBarIconProps> = ({ Icon, color, size = 24 }) => {
  return (
    <View style={styles.container}>
      <Icon size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TabBarIcon;