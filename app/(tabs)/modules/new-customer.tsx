import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { theme } from '@/constants/theme';
import api from '@/services/api';
import { useRouter } from 'expo-router';

export default function NewCustomerScreen() {
  const [customerName, setCustomerName] = useState('');
  const [customerGroup, setCustomerGroup] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    if (!customerName || !customerGroup) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/resource/Customer', {
        customer_name: customerName,
        customer_group: customerGroup,
      });
      Alert.alert('Success', 'Customer created successfully.');
      router.back();
    } catch (error: any) {
      console.error('Failed to create customer:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to create customer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>New Customer</Text>
      <TextInput
        style={styles.input}
        placeholder="Customer Name"
        value={customerName}
        onChangeText={setCustomerName}
        placeholderTextColor={theme.colors.gray[400]}
      />
      <TextInput
        style={styles.input}
        placeholder="Customer Group"
        value={customerGroup}
        onChangeText={setCustomerGroup}
        placeholderTextColor={theme.colors.gray[400]}
      />
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Saving...' : 'Save'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: theme.colors.text.primary,
    marginBottom: 24,
  },
  input: {
    height: 50,
    borderColor: theme.colors.gray[300],
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  button: {
    backgroundColor: theme.colors.primary[500],
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: theme.colors.primary[300],
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});
