import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '@/constants/theme';

interface DashboardCardProps {
  title: string;
  value: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  color: string;
  containerStyle?: ViewStyle;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
  color,
  containerStyle,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Feather name={icon} size={24} color={theme.colors.text.secondary} />
      </View>
      <Text style={[styles.value, { color }]}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    ...theme.shadows.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.text.secondary,
  },
  value: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: theme.colors.primary[500],
  },
});

export default DashboardCard;
