import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { createLeaveApplication } from '@/services/erpnext';
import { useNetwork } from '@/context/NetworkContext';
import { theme } from '@/constants/theme';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function NewLeaveApplicationScreen() {
  const { isConnected } = useNetwork();
  const { user } = useAuth();
  const [leaveType, setLeaveType] = useState('');
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);

  const handleCreateLeaveApplication = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a leave application.');
      return;
    }
    if (isConnected === null) {
      Alert.alert('Error', 'Cannot create leave application while network status is unknown.');
      return;
    }
    if (!leaveType || !reason) {
      Alert.alert('Error', 'Leave Type and Reason are required.');
      return;
    }
    setLoading(true);
    try {
      await createLeaveApplication({
        employee: user.employee_id,
        leave_type: leaveType,
        from_date: fromDate.toISOString().slice(0, 10),
        to_date: toDate.toISOString().slice(0, 10),
        reason: reason,
      });
      Alert.alert('Success', 'Leave application created successfully.');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create leave application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Leave Type</Text>
      <Picker
        selectedValue={leaveType}
        style={styles.input}
        onValueChange={(itemValue) => setLeaveType(itemValue)}
      >
        <Picker.Item label="Select Leave Type" value="" />
        <Picker.Item label="Annual Leave" value="Annual Leave" />
        <Picker.Item label="Sick Leave" value="Sick Leave" />
        <Picker.Item label="Casual Leave" value="Casual Leave" />
      </Picker>
      <Text style={styles.label}>From Date</Text>
      <TouchableOpacity onPress={() => setShowFromDatePicker(true)}>
        <Text style={styles.input}>{fromDate.toDateString()}</Text>
      </TouchableOpacity>
      {showFromDatePicker && (
        <DateTimePicker
          value={fromDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            const currentDate = selectedDate || fromDate;
            setShowFromDatePicker(false);
            setFromDate(currentDate);
          }}
        />
      )}
      <Text style={styles.label}>To Date</Text>
      <TouchableOpacity onPress={() => setShowToDatePicker(true)}>
        <Text style={styles.input}>{toDate.toDateString()}</Text>
      </TouchableOpacity>
      {showToDatePicker && (
        <DateTimePicker
          value={toDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            const currentDate = selectedDate || toDate;
            setShowToDatePicker(false);
            setToDate(currentDate);
          }}
        />
      )}
      <Text style={styles.label}>Reason</Text>
      <TextInput
        style={styles.input}
        value={reason}
        onChangeText={setReason}
        placeholder="Enter reason"
      />
      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
      ) : (
        <TouchableOpacity style={styles.createButton} onPress={handleCreateLeaveApplication}>
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
