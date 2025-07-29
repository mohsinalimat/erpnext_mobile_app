import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { createExpenseClaim } from '@/services/erpnext';
import { useNetwork } from '@/context/NetworkContext';
import { theme } from '@/constants/theme';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Picker } from '@react-native-picker/picker';

export default function NewExpenseClaimScreen() {
  const { isConnected } = useNetwork();
  const { user } = useAuth();
  const [expenseType, setExpenseType] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState('');

  useEffect(() => {
    if (user) {
      setCompany(user.company);
    }
  }, [user]);

  const handleCreateExpenseClaim = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to create an expense claim.');
      return;
    }
    if (isConnected === null) {
      Alert.alert('Error', 'Cannot create expense claim while network status is unknown.');
      return;
    }
    if (!expenseType || !amount) {
      Alert.alert('Error', 'Expense Type and Amount are required.');
      return;
    }
    setLoading(true);
    try {
      await createExpenseClaim({
        employee: user.employee_id,
        company: company,
        expense_type: expenseType,
        amount: parseFloat(amount),
        description: description,
        posting_date: new Date().toISOString().slice(0, 10),
      });
      Alert.alert('Success', 'Expense claim created successfully.');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create expense claim.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Expense Type</Text>
      <Picker
        selectedValue={expenseType}
        style={styles.input}
        onValueChange={(itemValue) => setExpenseType(itemValue)}
      >
        <Picker.Item label="Select Expense Type" value="" />
        <Picker.Item label="Travel" value="Travel" />
        <Picker.Item label="Food" value="Food" />
        <Picker.Item label="Other" value="Other" />
      </Picker>
      <Text style={styles.label}>Amount</Text>
      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        placeholder="Enter amount"
        keyboardType="numeric"
      />
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder="Enter description"
      />
      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
      ) : (
        <TouchableOpacity style={styles.createButton} onPress={handleCreateExpenseClaim}>
          <Text style={styles.createButtonText}>Submit</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: theme.colors.background,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.colors.white,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  createButton: {
    backgroundColor: 'black',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
