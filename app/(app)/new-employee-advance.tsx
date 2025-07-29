import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, Switch } from 'react-native';
import { createEmployeeAdvance } from '@/services/erpnext';
import { useNetwork } from '@/context/NetworkContext';
import { theme } from '@/constants/theme';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Picker } from '@react-native-picker/picker';

export default function NewEmployeeAdvanceScreen() {
  const { isConnected } = useNetwork();
  const { user } = useAuth();
  const [purpose, setPurpose] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [modeOfPayment, setModeOfPayment] = useState('');
  const [repayFromSalary, setRepayFromSalary] = useState(false);
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState('');
  const [advanceAccount, setAdvanceAccount] = useState('');

  useEffect(() => {
    if (user) {
      setCompany(user.company);
      // Assuming a default advance account, this might need to be fetched
      setAdvanceAccount('Employee Advances - P');
    }
  }, [user]);

  const handleCreateEmployeeAdvance = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to create an employee advance.');
      return;
    }
    if (isConnected === null) {
      Alert.alert('Error', 'Cannot create employee advance while network status is unknown.');
      return;
    }
    if (!purpose || !advanceAmount) {
      Alert.alert('Error', 'Purpose and Advance Amount are required.');
      return;
    }
    setLoading(true);
    try {
      const result = await createEmployeeAdvance({
        employee: user.employee_id,
        company: company,
        purpose: purpose,
        advance_amount: parseFloat(advanceAmount),
        mode_of_payment: modeOfPayment,
        repay_unclaimed_amount_from_salary: repayFromSalary,
        // These fields are based on the screenshot, might need adjustments
        posting_date: new Date().toISOString().slice(0, 10),
        advance_account: advanceAccount,
      });
      Alert.alert('Success', 'Employee advance created successfully.');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create employee advance.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Purpose</Text>
      <TextInput
        style={styles.input}
        value={purpose}
        onChangeText={setPurpose}
        placeholder="Enter purpose"
      />
      <Text style={styles.label}>Advance Amount</Text>
      <TextInput
        style={styles.input}
        value={advanceAmount}
        onChangeText={setAdvanceAmount}
        placeholder="Enter advance amount"
        keyboardType="numeric"
      />
      <Text style={styles.label}>Mode of Payment</Text>
      <Picker
        selectedValue={modeOfPayment}
        style={styles.input}
        onValueChange={(itemValue) => setModeOfPayment(itemValue)}
      >
        <Picker.Item label="Select Mode of Payment" value="" />
        <Picker.Item label="Cash" value="Cash" />
        <Picker.Item label="Bank" value="Bank" />
      </Picker>
      <View style={styles.switchContainer}>
        <Text style={styles.label}>Repay Unclaimed Amount from Salary</Text>
        <Switch
          value={repayFromSalary}
          onValueChange={setRepayFromSalary}
        />
      </View>
      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
      ) : (
        <TouchableOpacity style={styles.createButton} onPress={handleCreateEmployeeAdvance}>
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
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
});
