import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { verifyLicense } from '../../services/license';
import { useRouter } from 'expo-router';

const LicenseScreen = () => {
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleVerify = async () => {
    setLoading(true);
    const isValid = await verifyLicense(licenseKey);
    setLoading(false);

    if (isValid) {
      Alert.alert('Success', 'License activated successfully.');
      router.replace('/(app)/home');
    } else {
      Alert.alert('Error', 'Invalid license key. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activate License</Text>
      <Text style={styles.subtitle}>Your 30-day trial has expired. Please enter a license key to continue.</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter License Key"
        value={licenseKey}
        onChangeText={setLicenseKey}
        autoCapitalize="none"
      />
      <Button title={loading ? 'Verifying...' : 'Verify License'} onPress={handleVerify} disabled={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
});

export default LicenseScreen;
