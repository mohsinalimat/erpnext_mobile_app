import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import { TriangleAlert as AlertTriangle, CircleAlert as AlertCircle, Info } from 'lucide-react-native';

interface AlertCardProps {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error';
}

const AlertCard: React.FC<AlertCardProps> = ({ title, message, type }) => {
  // Determine alert color and icon based on type
  let backgroundColor, borderColor, textColor, icon;
  
  switch (type) {
    case 'warning':
      backgroundColor = theme.colors.warning[50];
      borderColor = theme.colors.warning[300];
      textColor = theme.colors.warning[700];
      icon = <AlertTriangle size={20} color={theme.colors.warning[500]} />;
      break;
    case 'error':
      backgroundColor = theme.colors.error[50];
      borderColor = theme.colors.error[300];
      textColor = theme.colors.error[700];
      icon = <AlertCircle size={20} color={theme.colors.error[500]} />;
      break;
    case 'info':
    default:
      backgroundColor = theme.colors.primary[50];
      borderColor = theme.colors.primary[300];
      textColor = theme.colors.primary[700];
      icon = <Info size={20} color={theme.colors.primary[500]} />;
      break;
  }

  return (
    <View style={[styles.container, { backgroundColor, borderColor }]}>
      <View style={styles.iconContainer}>{icon}</View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: textColor }]}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  iconContainer: {
    marginRight: 12,
    paddingTop: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text.secondary,
  },
});

export default AlertCard;