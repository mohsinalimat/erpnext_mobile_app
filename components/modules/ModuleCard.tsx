import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '@/constants/theme';
import { Video as LucideIcon } from 'lucide-react-native';
import { router } from 'expo-router';

interface ModuleCardProps {
  title: string;
  icon: LucideIcon;
  color: string;
  route: string;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ title, icon: Icon, color, route }) => {
  const handlePress = () => {
    router.push(route as any);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <Icon size={24} color={theme.colors.white} />
      </View>
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '30%',
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
});

export default ModuleCard;