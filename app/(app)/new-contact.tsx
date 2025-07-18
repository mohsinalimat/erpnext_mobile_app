import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { theme } from '@/constants/theme';
import { router } from 'expo-router';
import { createDoc } from '@/services/api';

export default function NewContactScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSaveContact = async () => {
    if (!firstName || !email) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      await createDoc('Contact', {
        first_name: firstName,
        last_name: lastName,
        email_id: email,
        mobile_no: mobile,
      });
      Alert.alert('Success', 'Contact saved successfully.');
      router.back();
    } catch (error) {
      console.error('Error saving contact:', error);
      Alert.alert('Error', 'Failed to save contact.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>First Name</Text>
      <TextInput
        style={styles.input}
        value={firstName}
        onChangeText={setFirstName}
        placeholder="Enter first name"
        placeholderTextColor={theme.colors.text.secondary}
      />
      <Text style={styles.label}>Last Name</Text>
      <TextInput
        style={styles.input}
        value={lastName}
        onChangeText={setLastName}
        placeholder="Enter last name"
        placeholderTextColor={theme.colors.text.secondary}
      />
      <Text style={styles.label}>Email Address</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Enter email address"
        placeholderTextColor={theme.colors.text.secondary}
        keyboardType="email-address"
      />
      <Text style={styles.label}>Mobile No</Text>
      <TextInput
        style={styles.input}
        value={mobile}
        onChangeText={setMobile}
        placeholder="Enter mobile number"
        placeholderTextColor={theme.colors.text.secondary}
        keyboardType="phone-pad"
      />
      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSaveContact}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Save'}</Text>
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
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: theme.colors.text.primary,
  },
  input: {
    backgroundColor: theme.colors.white,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  saveButton: {
    backgroundColor: theme.colors.primary[500],
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
