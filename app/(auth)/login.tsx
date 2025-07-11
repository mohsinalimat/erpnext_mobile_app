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
  ScrollView,
  Image,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { theme } from '@/constants/theme';
import { Eye, EyeOff, Server } from 'lucide-react-native';

export default function LoginScreen() {
  const [serverUrl, setServerUrl] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [serverUrlError, setServerUrlError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { signIn, isLoading, error } = useAuth();

  const validateForm = () => {
    let isValid = true;

    // Reset errors
    setServerUrlError('');
    setEmailError('');
    setPasswordError('');

    // Validate server URL
    if (!serverUrl) {
      setServerUrlError('Server URL is required');
      isValid = false;
    } else {
      try {
        new URL(serverUrl);
      } catch (e) {
        setServerUrlError('Invalid URL format');
        isValid = false;
      }
    }

    // Validate email
    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Invalid email format');
      isValid = false;
    }

    // Validate password
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (validateForm()) {
      await signIn(serverUrl, email, password);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: 'https://erpnext.com/files/erpnext-logo.png' }}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>ERPNext Mobile</Text>
          <Text style={styles.subtitle}>Access your business anywhere</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Server color={theme.colors.gray[500]} size={20} />
            <TextInput
              style={styles.input}
              placeholder="ERPNext Server URL"
              value={serverUrl}
              onChangeText={setServerUrl}
              autoCapitalize="none"
              keyboardType="url"
              placeholderTextColor={theme.colors.gray[400]}
            />
          </View>
          {serverUrlError ? <Text style={styles.errorText}>{serverUrlError}</Text> : null}

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

          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>*</Text>
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor={theme.colors.gray[400]}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff color={theme.colors.gray[500]} size={20} />
              ) : (
                <Eye color={theme.colors.gray[500]} size={20} />
              )}
            </TouchableOpacity>
          </View>
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text.secondary,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray[100],
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  input: {
    flex: 1,
    height: 56,
    paddingLeft: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text.primary,
  },
  inputIcon: {
    fontSize: 20,
    color: theme.colors.gray[500],
  },
  eyeIcon: {
    padding: 8,
  },
  errorText: {
    color: theme.colors.error[500],
    fontSize: 14,
    marginTop: -8,
    marginBottom: 16,
    fontFamily: 'Inter-Regular',
  },
  loginButton: {
    backgroundColor: theme.colors.primary[500],
    borderRadius: 8,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});