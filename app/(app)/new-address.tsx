import React, { useState, useLayoutEffect, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ScrollView, Modal, FlatList, TouchableWithoutFeedback } from 'react-native';
import { theme } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';
import { router, useNavigation } from 'expo-router';
import { createDoc, fetchDocTypeData, searchDoctype } from '@/services/api';
import Checkbox from 'expo-checkbox';
import { useDebounce } from '@/hooks/useDebounce';

interface LinkNameData {
  id: string;
  title: string;
}

export default function NewAddressScreen() {
  const navigation = useNavigation();
  const [addressTitle, setAddressTitle] = useState('');
  const [addressType, setAddressType] = useState('Billing');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [googleMapLink, setGoogleMapLink] = useState('');
  const [phone, setPhone] = useState('');
  const [fax, setFax] = useState('');
  const [taxCategory, setTaxCategory] = useState('');
  const [isPreferredBilling, setIsPreferredBilling] = useState(false);
  const [isPreferredShipping, setIsPreferredShipping] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [isCompanyAddress, setIsCompanyAddress] = useState(false);
  const [loading, setLoading] = useState(false);
  const [links, setLinks] = useState([{ id: 1, link_doctype: '', link_name: '', link_title: '' }]);
  const [docTypes, setDocTypes] = useState<string[]>([]);
  const [isDocTypeModalVisible, setIsDocTypeModalVisible] = useState(false);
  const [isLinkNameModalVisible, setIsLinkNameModalVisible] = useState(false);
  const [linkNameData, setLinkNameData] = useState<LinkNameData[]>([]);
  const [docTypeSearchQuery, setDocTypeSearchQuery] = useState('');
  const [linkNameSearchQuery, setLinkNameSearchQuery] = useState('');
  const [currentRowId, setCurrentRowId] = useState<number | null>(null);
  const [currentLink, setCurrentLink] = useState<any>(null);

  const debouncedLinkNameSearchQuery = useDebounce(linkNameSearchQuery, 500);

  useEffect(() => {
    const loadDocTypes = async () => {
      try {
        const data = await fetchDocTypeData('DocType', ['name'], [['issingle', '=', 0]]);
        setDocTypes(data.map((d: any) => d.name));
      } catch (error) {
        console.error('Error fetching doctypes:', error);
      }
    };
    loadDocTypes();
  }, []);

  useEffect(() => {
    const searchLinkNames = async () => {
      if (debouncedLinkNameSearchQuery.length > 0) {
        const currentLink = links.find(l => l.id === currentRowId);
        if (currentLink) {
          const data = await searchDoctype(currentLink.link_doctype, debouncedLinkNameSearchQuery);
          setLinkNameData(data);
        }
      } else {
        setLinkNameData([]);
      }
    };
    searchLinkNames();
  }, [debouncedLinkNameSearchQuery, currentRowId]);

  useEffect(() => {
    console.log('Links state updated:', links);
  }, [links]);

  const handleAddRow = () => {
    setLinks([...links, { id: links.length + 1, link_doctype: '', link_name: '', link_title: '' }]);
  };

  const handleRemoveRow = (id: number) => {
    setLinks(links.filter(row => row.id !== id));
  };

  const handleLinkChange = (id: number, field: string, value: string) => {
    setLinks(prevLinks => 
      prevLinks.map(row => 
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  };

  const handleSaveAddress = async () => {
    if (!addressTitle || !addressLine1 || !city || !country) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      await createDoc('Address', {
        address_title: addressTitle,
        address_type: addressType,
        address_line1: addressLine1,
        address_line2: addressLine2,
        city,
        state,
        country,
        pincode: postalCode,
        email_id: emailAddress,
        map_location: googleMapLink,
        phone,
        fax,
        tax_category: taxCategory,
        is_primary_address: isPreferredBilling,
        is_shipping_address: isPreferredShipping,
        disabled,
        is_your_company_address: isCompanyAddress,
        links: links.map(({ id, ...rest }) => rest),
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

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleSaveAddress} disabled={loading} style={{ backgroundColor: 'black', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginRight: 15 }}>
          <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>{loading ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, loading, handleSaveAddress]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Address Title</Text>
      <TextInput
        style={styles.input}
        value={addressTitle}
        onChangeText={setAddressTitle}
        placeholder="Enter Address Title"
        placeholderTextColor={theme.colors.text.secondary}
      />
      <Text style={styles.label}>Address Type</Text>
      <TextInput
        style={styles.input}
        value={addressType}
        onChangeText={setAddressType}
        placeholder="Enter Address Type"
        placeholderTextColor={theme.colors.text.secondary}
      />
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
      <Text style={styles.label}>City/Town</Text>
      <TextInput
        style={styles.input}
        value={city}
        onChangeText={setCity}
        placeholder="Enter city"
        placeholderTextColor={theme.colors.text.secondary}
      />
      <Text style={styles.label}>State/Province</Text>
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
      <Text style={styles.label}>Postal Code</Text>
      <TextInput
        style={styles.input}
        value={postalCode}
        onChangeText={setPostalCode}
        placeholder="Enter postal code"
        placeholderTextColor={theme.colors.text.secondary}
      />
      <Text style={styles.label}>Email Address</Text>
      <TextInput
        style={styles.input}
        value={emailAddress}
        onChangeText={setEmailAddress}
        placeholder="Enter email address"
        placeholderTextColor={theme.colors.text.secondary}
        keyboardType="email-address"
      />
      <Text style={styles.label}>Google Map Link</Text>
      <TextInput
        style={styles.input}
        value={googleMapLink}
        onChangeText={setGoogleMapLink}
        placeholder="Enter Google Map Link"
        placeholderTextColor={theme.colors.text.secondary}
      />
      <Text style={styles.label}>Phone</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        placeholder="Enter phone number"
        placeholderTextColor={theme.colors.text.secondary}
        keyboardType="phone-pad"
      />
      <Text style={styles.label}>Fax</Text>
      <TextInput
        style={styles.input}
        value={fax}
        onChangeText={setFax}
        placeholder="Enter fax number"
        placeholderTextColor={theme.colors.text.secondary}
      />
      <Text style={styles.label}>Tax Category</Text>
      <TextInput
        style={styles.input}
        value={taxCategory}
        onChangeText={setTaxCategory}
        placeholder="Enter tax category"
        placeholderTextColor={theme.colors.text.secondary}
      />
      <View style={styles.checkboxContainer}>
        <Checkbox style={styles.checkbox} value={isPreferredBilling} onValueChange={setIsPreferredBilling} />
        <Text style={styles.checkboxLabel}>Preferred Billing Address</Text>
      </View>
      <View style={styles.checkboxContainer}>
        <Checkbox style={styles.checkbox} value={isPreferredShipping} onValueChange={setIsPreferredShipping} />
        <Text style={styles.checkboxLabel}>Preferred Shipping Address</Text>
      </View>
      <View style={styles.checkboxContainer}>
        <Checkbox style={styles.checkbox} value={disabled} onValueChange={setDisabled} />
        <Text style={styles.checkboxLabel}>Disabled</Text>
      </View>
      <View style={styles.checkboxContainer}>
        <Checkbox style={styles.checkbox} value={isCompanyAddress} onValueChange={setIsCompanyAddress} />
        <Text style={styles.checkboxLabel}>Is Your Company Address</Text>
      </View>

      <Text style={styles.label}>Links</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, { flex: 0.5 }]}>No.</Text>
          <Text style={styles.tableHeaderText}>Link Document Type</Text>
          <Text style={styles.tableHeaderText}>Link Name</Text>
          <Text style={styles.tableHeaderText}>Link Title</Text>
          <Text style={[styles.tableHeaderText, { flex: 0.5 }]}></Text>
        </View>
        {links.map((row, index) => (
          <View key={`${row.id}-${row.link_doctype}-${row.link_name}`} style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 0.5 }]}>{index + 1}</Text>
            <TouchableOpacity
              style={styles.tableInput}
              onPress={() => {
                setCurrentRowId(row.id);
                setCurrentLink(row);
                setIsDocTypeModalVisible(true);
              }}
            >
              <Text>{row.link_doctype || 'Select Document Type'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tableInput}
              onPress={() => {
                if (row.link_doctype) {
                  setCurrentRowId(row.id);
                  setCurrentLink(row);
                  setIsLinkNameModalVisible(true);
                } else {
                  Alert.alert('Error', 'Please select a Link Document Type first.');
                }
              }}
            >
              <Text>{row.link_name || 'Select Link Name'}</Text>
            </TouchableOpacity>
            <TextInput
              style={[styles.tableInput, { backgroundColor: theme.colors.gray[100] }]}
              value={row.link_title}
              editable={false}
              placeholder="Link Title"
            />
            <TouchableOpacity onPress={() => handleRemoveRow(row.id)} style={[styles.tableCell, { flex: 0.5, alignItems: 'center' }]}>
              <Feather name="trash-2" size={20} color={theme.colors.error[500]} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <TouchableOpacity onPress={handleAddRow} style={styles.addRowButton}>
        <Text style={styles.addRowButtonText}>Add Row</Text>
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={isDocTypeModalVisible}
        onRequestClose={() => setIsDocTypeModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsDocTypeModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TextInput
                style={styles.input}
                placeholder="Search DocType..."
                value={docTypeSearchQuery}
                onChangeText={setDocTypeSearchQuery}
              />
              <FlatList
                data={docTypes.filter(d => d.toLowerCase().includes(docTypeSearchQuery.toLowerCase()))}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      if (currentLink) {
                        const newLink = { ...currentLink, link_doctype: item, link_name: '', link_title: '' };
                        const newLinks = links.map(l => (l.id === currentLink.id ? newLink : l));
                        setLinks(newLinks);
                      }
                      setIsDocTypeModalVisible(false);
                      setDocTypeSearchQuery('');
                    }}
                  >
                    <Text>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        transparent={true}
        visible={isLinkNameModalVisible}
        onRequestClose={() => setIsLinkNameModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsLinkNameModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TextInput
                style={styles.input}
                placeholder="Search..."
                value={linkNameSearchQuery}
                onChangeText={setLinkNameSearchQuery}
              />
              <FlatList
                data={linkNameData}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      if (currentLink) {
                        const newLink = { ...currentLink, link_name: item.id, link_title: item.title };
                        const newLinks = links.map(l => (l.id === currentLink.id ? newLink : l));
                        setLinks(newLinks);
                      }
                      setIsLinkNameModalVisible(false);
                      setLinkNameSearchQuery('');
                      setLinkNameData([]);
                    }}
                  >
                    <Text>{item.title}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </ScrollView>
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
  checkboxContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  checkbox: {
    marginRight: 8,
  },
  checkboxLabel: {
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  table: {
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: 8,
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: theme.colors.gray[100],
    padding: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  tableHeaderText: {
    flex: 1,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[300],
  },
  tableCell: {
    flex: 1,
    color: theme.colors.text.primary,
  },
  tableInput: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: 4,
    marginHorizontal: 4,
  },
  addRowButton: {
    backgroundColor: theme.colors.primary[500],
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  addRowButtonText: {
    color: theme.colors.white,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    padding: 16,
    width: '80%',
    maxHeight: '60%',
  },
  modalItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
});
