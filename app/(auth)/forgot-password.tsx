import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { theme } from '@/constants/theme';
import { Link } from 'expo-router';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    let isValid = true;
    setEmailError('');

    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Invalid email format');
      isValid = false;
    }

    return isValid;
  };

  const handleSendResetLink = async () => {
    if (validateForm()) {
      setIsLoading(true);
      // Mock API call
      setTimeout(() => {
        setIsLoading(false);
        Alert.alert(
          'Password Reset',
          `A password reset link has been sent to ${email}.`
        );
      }, 2000);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>
          Enter your email address and we'll send you a link to reset your
          password.
        </Text>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>@</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor={theme.colors.gray[400]}
            />
          </View>
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

          <TouchableOpacity
            style={styles.button}
            onPress={handleSendResetLink}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Send Reset Link</Text>
            )}
          </TouchableOpacity>
        </View>

        <Link href="/(auth)/login" style={styles.backToLoginButton}>
          <Text style={styles.backToLoginText}>Back to Login</Text>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5ca01',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#1A202C',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: '#4A5568',
    marginBottom: 32,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  input: {
    flex: 1,
    height: 56,
    paddingLeft: 16,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#1A202C',
  },
  inputIcon: {
    fontSize: 20,
    color: '#A0AEC0',
  },
  errorText: {
    color: '#E53E3E',
    fontSize: 14,
    marginTop: -12,
    marginBottom: 16,
    paddingLeft: 4,
    fontFamily: 'Inter-Regular',
  },
  button: {
    backgroundColor: '#4299E1',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  backToLoginButton: {
    marginTop: 24,
  },
  backToLoginText: {
    color: '#4A5568',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
});
