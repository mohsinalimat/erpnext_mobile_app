import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { createCustomer } from '@/services/offline';
import { useNetwork } from '@/context/NetworkContext';
import { theme } from '@/constants/theme';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import DropDownPicker from 'react-native-dropdown-picker';
import { fetchDocTypeData } from '@/services/api';
import { Feather } from '@expo/vector-icons';

interface NameData {
  name: string;
  full_name?: string; // Added full_name for User doctype
}

const uniqueBy = <T,>(items: T[], keyExtractor: (item: T) => string | undefined): T[] => {
  const seen = new Set<string>();
  return items.filter(item => {
    const key = keyExtractor(item);
    if (key === undefined || key === null) {
      return true; // Keep items that don't have a key
    }
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

export default function NewCustomerScreen2() {
  const { isConnected } = useNetwork();
  const navigation = useNavigation();
  const [customerName, setCustomerName] = useState('');
  const [customerType, setCustomerType] = useState(null);
  const [customerGroup, setCustomerGroup] = useState(null);
  const [territory, setTerritory] = useState(null);
  const [city, setCity] = useState(null);
  const [accountManager, setAccountManager] = useState(null);
  const [billingCurrency, setBillingCurrency] = useState('BDT');
  const [primaryContact, setPrimaryContact] = useState<string | null>(null);
  const [primaryAddress, setPrimaryAddress] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<any[]>([]); // To store selected addresses
  const params = useLocalSearchParams();

  const [loading, setLoading] = useState(false);
  const [dropdownLoading, setDropdownLoading] = useState(true);

  const [openCustomerType, setOpenCustomerType] = useState(false);
  const [openCustomerGroup, setOpenCustomerGroup] = useState(false);
  const [openTerritory, setOpenTerritory] = useState(false);
  const [openCity, setOpenCity] = useState(false);
  const [openAccountManager, setOpenAccountManager] = useState(false);
  const [openBillingCurrency, setOpenBillingCurrency] = useState(false);
  const [openPrimaryContact, setOpenPrimaryContact] = useState(false);
  const [openAddress, setOpenAddress] = useState(false);

  const [customerTypes, setCustomerTypes] = useState<{label: string, value: string}[]>([]);
  const [customerGroups, setCustomerGroups] = useState<{label: string, value: string}[]>([]);
  const [territories, setTerritories] = useState<{label: string, value: string}[]>([]);
  const [cities, setCities] = useState<{label: string, value: string}[]>([]);
  const [accountManagers, setAccountManagers] = useState<{label: string, value: string}[]>([]);
  const [currencies, setCurrencies] = useState<{label: string, value: string}[]>([]);
  const [primaryContacts, setPrimaryContacts] = useState<any[]>([]);
  const [addressItems, setAddressItems] = useState<{label: string, value: string}[]>([]);
  const [allAddressObjects, setAllAddressObjects] = useState<any[]>([]);

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
        contactData,
        addressData,
      ] = await Promise.all([
        fetchDocTypeData('Customer Group', ['name']),
        fetchDocTypeData('Territory', ['name']),
        fetchDocTypeData('Territory', ['name']), // Using Territory for City as per user feedback
        fetchDocTypeData('User', ['name', 'full_name'], [['enabled', '=', 1]]),
        fetchDocTypeData('Currency', ['name']),
        fetchDocTypeData('Contact', ['name', 'full_name', 'email_id', 'mobile_no', 'phone', 'address']),
        fetchDocTypeData('Address', ['name', 'address_line1']),
      ]);

      const staticCustomerTypes = ['Company', 'Individual', 'Partnership'];
      setCustomerTypes(staticCustomerTypes.map(t => ({ label: t, value: t })));

      setCustomerGroups(uniqueBy(customerGroupData as NameData[], d => d.name).map((d: NameData) => ({ label: d.name, value: d.name })));
      setTerritories(uniqueBy(territoryData as NameData[], d => d.name).map((d: NameData) => ({ label: d.name, value: d.name })));
      setCities(uniqueBy(cityData as NameData[], d => d.name).map((d: NameData) => ({ label: d.name, value: d.name })));
      setAccountManagers(uniqueBy(accountManagerData as NameData[], d => d.name).map((d: NameData) => ({ label: d.full_name || d.name, value: d.name })));
      setCurrencies(uniqueBy(currencyData as NameData[], d => d.name).map((d: NameData) => ({ label: d.name, value: d.name })));
      const contactsWithDetails = uniqueBy(contactData as any[], d => d.name);
      setPrimaryContacts(contactsWithDetails.map((d: any) => ({ label: d.full_name || d.name, value: d.name, ...d })));
      const uniqueAddresses = uniqueBy(addressData as any[], d => d.name);
      setAddressItems(uniqueAddresses.map((d: any) => ({ label: d.address_line1, value: d.name })));
      setAllAddressObjects(uniqueAddresses);

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

  useEffect(() => {
    if (params.selectedContact) {
      setPrimaryContact(params.selectedContact as any);
    }
    if (params.selectedAddress) {
      const newAddress = JSON.parse(params.selectedAddress as string);
      setAddresses(prev => {
        if (prev.find(a => a.name === newAddress.name)) return prev;
        return [...prev, newAddress];
      });
      setAllAddressObjects(prev => {
        if (prev.find(a => a.name === newAddress.name)) return prev;
        return [...prev, newAddress];
      });
      setAddressItems(prev => {
        if (prev.find(i => i.value === newAddress.name)) return prev;
        return [...prev, { label: newAddress.address_line1, value: newAddress.name }];
      });
    }
  }, [params]);

  const handleCreateCustomer = useCallback(async () => {
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
        primary_address: primaryAddress,
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
  }, [isConnected, customerName, customerType, customerGroup, territory, city, accountManager, billingCurrency, primaryContact, primaryAddress, addresses]);

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
        <DropDownPicker
          open={openPrimaryContact}
          value={primaryContact}
          items={primaryContacts}
          setOpen={setOpenPrimaryContact}
          setValue={setPrimaryContact}
          setItems={setPrimaryContacts}
          searchable={true}
          placeholder="Select Primary Contact"
          style={styles.pickerContainer}
          listMode="MODAL"
        />

        <Text style={styles.label}>Primary Address</Text>
        <DropDownPicker
          open={openAddress}
          value={primaryAddress}
          items={addressItems}
          setOpen={setOpenAddress}
          setValue={setPrimaryAddress}
          setItems={setAddressItems}
          searchable={true}
          placeholder="Select Primary Address"
          style={styles.pickerContainer}
          listMode="MODAL"
        />
      </ScrollView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleCreateCustomer} style={styles.createButton} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={theme.colors.white} />
          ) : (
            <Text style={styles.createButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.gray[50],
  },
  scrollContentContainer: {
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.gray[50],
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: theme.colors.gray[700],
  },
  input: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    color: theme.colors.text.primary,
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
  },
  pickerContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    zIndex: 1000,
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
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
