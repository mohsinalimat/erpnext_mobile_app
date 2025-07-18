import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { theme } from '@/constants/theme';
import { router } from 'expo-router';
import { createDoc } from '@/services/api';

export default function NewAddressScreen() {
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSaveAddress = async () => {
    if (!addressLine1 || !city || !country) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      await createDoc('Address', {
        address_line1: addressLine1,
        address_line2: addressLine2,
        city,
        state,
        country,
      });
      Alert.alert('Success', 'Address saved successfully.');
      router.back();
    } catch (error) {
      console.error('Error saving address:', error);
      Alert.alert('Error', 'Failed to save address.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Address Line 1</Text>
      <TextInput
        style={styles.input}
        value={addressLine1}
        onChangeText={setAddressLine1}
        placeholder="Enter address line 1"
        placeholderTextColor={theme.colors.text.secondary}
      />
      <Text style={styles.label}>Address Line 2</Text>
      <TextInput
        style={styles.input}
        value={addressLine2}
        onChangeText={setAddressLine2}
        placeholder="Enter address line 2"
        placeholderTextColor={theme.colors.text.secondary}
      />
      <Text style={styles.label}>City</Text>
      <TextInput
        style={styles.input}
        value={city}
        onChangeText={setCity}
        placeholder="Enter city"
        placeholderTextColor={theme.colors.text.secondary}
      />
      <Text style={styles.label}>State</Text>
      <TextInput
        style={styles.input}
        value={state}
        onChangeText={setState}
        placeholder="Enter state"
        placeholderTextColor={theme.colors.text.secondary}
      />
      <Text style={styles.label}>Country</Text>
      <TextInput
        style={styles.input}
        value={country}
        onChangeText={setCountry}
        placeholder="Enter country"
        placeholderTextColor={theme.colors.text.secondary}
      />
      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSaveAddress}
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
