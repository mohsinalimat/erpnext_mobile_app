import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps, ViewStyle, TextStyle } from 'react-native';
import { theme } from '@/constants/theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({ title, variant = 'primary', style, textStyle, ...props }) => {
  const buttonStyles = [styles.button, styles[`${variant}Button`], style];
  const textStyles = [styles.buttonText, styles[`${variant}ButtonText`], textStyle];

  return (
    <TouchableOpacity style={buttonStyles} {...props}>
      <Text style={textStyles}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  primaryButton: {
    backgroundColor: 'black',
  },
  primaryButtonText: {
    color: theme.colors.white,
  },
  secondaryButton: {
    backgroundColor: theme.colors.gray[200],
  },
  secondaryButtonText: {
    color: theme.colors.text.primary,
  },
  dangerButton: {
    backgroundColor: theme.colors.red[500],
  },
  dangerButtonText: {
    color: theme.colors.white,
  },
});

export default Button;
