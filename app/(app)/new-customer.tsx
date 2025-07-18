import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { createCustomer } from '@/services/offline';
import { useNetwork } from '@/context/NetworkContext';
import { theme } from '@/constants/theme';
import { router } from 'expo-router';
import DropDownPicker from 'react-native-dropdown-picker';
import { fetchDocTypeData } from '@/services/api';
import { Feather } from '@expo/vector-icons';

interface NameData {
  name: string;
  full_name?: string; // Added full_name for User doctype
}

export default function NewCustomerScreen() {
  const { isConnected } = useNetwork();
  const [customerName, setCustomerName] = useState('');
  const [customerType, setCustomerType] = useState(null);
  const [customerGroup, setCustomerGroup] = useState(null);
  const [territory, setTerritory] = useState(null);
  const [city, setCity] = useState(null);
  const [accountManager, setAccountManager] = useState(null);
  const [billingCurrency, setBillingCurrency] = useState('BDT');
  const [primaryContact, setPrimaryContact] = useState('');
  const [addresses, setAddresses] = useState<any[]>([]); // To store selected addresses

  const [loading, setLoading] = useState(false);
  const [dropdownLoading, setDropdownLoading] = useState(true);

  const [openCustomerType, setOpenCustomerType] = useState(false);
  const [openCustomerGroup, setOpenCustomerGroup] = useState(false);
  const [openTerritory, setOpenTerritory] = useState(false);
  const [openCity, setOpenCity] = useState(false);
  const [openAccountManager, setOpenAccountManager] = useState(false);
  const [openBillingCurrency, setOpenBillingCurrency] = useState(false);

  const [customerTypes, setCustomerTypes] = useState<{label: string, value: string}[]>([]);
  const [customerGroups, setCustomerGroups] = useState<{label: string, value: string}[]>([]);
  const [territories, setTerritories] = useState<{label: string, value: string}[]>([]);
  const [cities, setCities] = useState<{label: string, value: string}[]>([]);
  const [accountManagers, setAccountManagers] = useState<{label: string, value: string}[]>([]);
  const [currencies, setCurrencies] = useState<{label: string, value: string}[]>([]);

  const fetchDropdownData = useCallback(async () => {
    if (isConnected === null) return;
    setDropdownLoading(true);
    try {
      const [
        customerGroupData,
        territoryData,
        cityData,
        accountManagerData,
        currencyData,
      ] = await Promise.all([
        fetchDocTypeData('Customer Group', ['name']),
        fetchDocTypeData('Territory', ['name']),
        fetchDocTypeData('Territory', ['name']), // Using Territory for City as per user feedback
        fetchDocTypeData('User', ['full_name'], [['enabled', '=', 1]]),
        fetchDocTypeData('Currency', ['name']),
      ]);

      const staticCustomerTypes = ['Company', 'Individual', 'Partnership'];
      setCustomerTypes(staticCustomerTypes.map(t => ({ label: t, value: t })));

      setCustomerGroups(customerGroupData.map((d: NameData) => ({ label: d.name, value: d.name })));
      setTerritories(territoryData.map((d: NameData) => ({ label: d.name, value: d.name })));
      setCities(cityData.map((d: NameData) => ({ label: d.name, value: d.name })));
      setAccountManagers(accountManagerData.map((d: NameData) => ({ label: d.full_name || d.name, value: d.full_name || d.name })));
      setCurrencies(currencyData.map((d: NameData) => ({ label: d.name, value: d.name })));

    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      Alert.alert('Error', 'Failed to load dropdown data.');
    } finally {
      setDropdownLoading(false);
    }
  }, [isConnected]);

  useEffect(() => {
    fetchDropdownData();
  }, [fetchDropdownData]);

  const handleCreateCustomer = async () => {
    if (isConnected === null) {
      Alert.alert('Error', 'Cannot create customer while network status is unknown.');
      return;
    }
    if (!customerName) {
      Alert.alert('Error', 'Customer name is required.');
      return;
    }
    setLoading(true);
    try {
      const result = await createCustomer(isConnected, {
        customer_name: customerName,
        customer_type: customerType,
        customer_group: customerGroup,
        territory: territory,
        city: city,
        account_manager: accountManager,
        billing_currency: billingCurrency,
        primary_contact: primaryContact,
        addresses: addresses, // Pass addresses
      });
      if (result.offline) {
        Alert.alert('Success', 'Customer data saved locally and will be synced when online.');
      } else {
        Alert.alert('Success', 'Customer created successfully.');
      }
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create customer.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = () => {
    router.push('/(app)/address');
  };

  const handleAddContact = () => {
    router.push('/(app)/contact');
  };

  if (dropdownLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        <Text style={{ color: theme.colors.text.primary, marginTop: 10 }}>Loading fields...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContentContainer}
      >
        <Text style={styles.label}>Customer Name</Text>
        <TextInput
          style={styles.input}
          value={customerName}
          onChangeText={setCustomerName}
          placeholder="Enter customer name"
          placeholderTextColor={theme.colors.text.secondary}
        />

        <Text style={styles.label}>Customer Type</Text>
        <DropDownPicker
          open={openCustomerType}
          value={customerType}
          items={customerTypes}
          setOpen={setOpenCustomerType}
          setValue={setCustomerType}
          setItems={setCustomerTypes}
          searchable={true}
          placeholder="Select Customer Type"
          style={styles.pickerContainer}
          listMode="MODAL"
        />

        <Text style={styles.label}>Customer Group</Text>
        <DropDownPicker
          open={openCustomerGroup}
          value={customerGroup}
          items={customerGroups}
          setOpen={setOpenCustomerGroup}
          setValue={setCustomerGroup}
          setItems={setCustomerGroups}
          searchable={true}
          placeholder="Select Customer Group"
          style={styles.pickerContainer}
          listMode="MODAL"
        />

        <Text style={styles.label}>Territory</Text>
        <DropDownPicker
          open={openTerritory}
          value={territory}
          items={territories}
          setOpen={setOpenTerritory}
          setValue={setTerritory}
          setItems={setTerritories}
          searchable={true}
          placeholder="Select Territory"
          style={styles.pickerContainer}
          listMode="MODAL"
        />

        <Text style={styles.label}>City</Text>
        <DropDownPicker
          open={openCity}
          value={city}
          items={cities}
          setOpen={setOpenCity}
          setValue={setCity}
          setItems={setCities}
          searchable={true}
          placeholder="Select City"
          style={styles.pickerContainer}
          listMode="MODAL"
        />

        <Text style={styles.label}>Account Manager</Text>
        <DropDownPicker
          open={openAccountManager}
          value={accountManager}
          items={accountManagers}
          setOpen={setOpenAccountManager}
          setValue={setAccountManager}
          setItems={setAccountManagers}
          searchable={true}
          placeholder="Select Account Manager"
          style={styles.pickerContainer}
          listMode="MODAL"
        />

        <Text style={styles.label}>Billing Currency</Text>
        <DropDownPicker
          open={openBillingCurrency}
          value={billingCurrency}
          items={currencies}
          setOpen={setOpenBillingCurrency}
          setValue={setBillingCurrency}
          setItems={setCurrencies}
          searchable={true}
          placeholder="Select Billing Currency"
          style={styles.pickerContainer}
          listMode="MODAL"
        />

        <Text style={styles.label}>Primary Contact</Text>
        <View style={styles.addressContainer}>
          <TextInput
            style={[styles.input, styles.addressInput]}
            placeholder="Select or add contact"
            placeholderTextColor={theme.colors.text.secondary}
            value={primaryContact}
            editable={false}
          />
          <TouchableOpacity onPress={handleAddContact} style={styles.addAddressButton}>
            <Feather name="plus" size={24} color={theme.colors.white} />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Address</Text>
        <View style={styles.addressContainer}>
          <TextInput
            style={[styles.input, styles.addressInput]}
            placeholder="Select or add address"
            placeholderTextColor={theme.colors.text.secondary}
            value={addresses.map(addr => addr.address_line1).join(', ')} // Display selected addresses
            editable={false} // Make it non-editable as it's for display
          />
          <TouchableOpacity onPress={handleAddAddress} style={styles.addAddressButton}>
            <Feather name="plus" size={24} color={theme.colors.white} />
          </TouchableOpacity>
        </View>
        {addresses.length > 0 && (
          <View style={styles.selectedAddressesContainer}>
            {addresses.map((addr, index) => (
              <Text key={index} style={styles.selectedAddressText}>
                {addr.address_line1}
              </Text>
            ))}
          </View>
        )}
      </ScrollView>
      <View style={styles.buttonContainer}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        ) : (
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateCustomer}
          >
            <Text style={styles.createButtonText}>Save</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 16,
    backgroundColor: theme.colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  pickerContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
  },
  picker: {
    height: 50,
    width: '100%',
    color: theme.colors.text.primary,
  },
  pickerItem: {
    color: theme.colors.text.primary,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  addressInput: {
    flex: 1,
    marginBottom: 0, // Remove bottom margin as it's part of a row
    marginRight: 10,
  },
  addAddressButton: {
    backgroundColor: theme.colors.primary[500],
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedAddressesContainer: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: theme.colors.gray[100],
    borderRadius: 8,
  },
  selectedAddressText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 5,
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: theme.colors.background,
  },
  createButton: {
    backgroundColor: theme.colors.primary[500],
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
