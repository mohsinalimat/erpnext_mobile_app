import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Modal, FlatList } from 'react-native';
import { getCustomers, getItems, getItemPrice, getSalesTaxesAndChargesTemplates, getSalesTaxesAndChargesTemplateByName, getCustomerContacts, getCustomerAddresses, uploadFile } from '@/services/erpnext';
import { createQuotation } from '@/services/erpnext';
import { Feather } from '@expo/vector-icons';
import { useNetwork } from '@/context/NetworkContext';
import { theme } from '@/constants/theme';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

interface Customer {
  name: string;
  customer_name: string;
}

interface Item {
  name: string;
  item_name: string;
}

interface QuotationItem {
  key: number;
  item_code: string;
  qty: number | string;
  rate: number | string;
  amount: number;
  rate_is_editable?: boolean;
  q_image?: string;
}

interface SalesTax {
  type: string;
  rate: number;
  amount: number;
  total: number;
}

interface SalesTaxesAndChargesTemplate {
  name: string;
  title: string;
}

interface Contact {
  name: string;
  first_name: string;
  last_name?: string;
}

interface Address {
  name: string;
  address_line1: string;
  city: string;
}

export default function NewQuotationScreen() {
  const { isConnected } = useNetwork();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState('');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [date, setDate] = useState(new Date());
  const [validTill, setValidTill] = useState(new Date(new Date().setDate(new Date().getDate() + 7)));
  const [items, setItems] = useState<QuotationItem[]>([{ key: 1, item_code: '', qty: 1, rate: 0, amount: 0, rate_is_editable: true }]);
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [salesTaxesAndChargesTemplates, setSalesTaxesAndChargesTemplates] = useState<SalesTaxesAndChargesTemplate[]>([]);
  const [selectedSalesTaxesAndChargesTemplate, setSelectedSalesTaxesAndChargesTemplate] = useState('');
  const [taxes, setTaxes] = useState<SalesTax[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showValidTillPicker, setShowValidTillPicker] = useState(false);
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const params = useLocalSearchParams();

  const handleImagePick = async (index: number) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const newItems = [...items];
      try {
        const uploadedImageUrl = await uploadFile(result.assets[0].uri);
        newItems[index].q_image = uploadedImageUrl;
        setItems(newItems);
      } catch (error) {
        Alert.alert('Error', 'Failed to upload image.');
      }
    }
  };

  useEffect(() => {
    if (params.customer && typeof params.customer === 'string') {
      setSelectedCustomer(params.customer);
    }
  }, [params.customer]);

  useEffect(() => {
    const fetchContactsAndAddresses = async () => {
      if (selectedCustomer) {
        try {
          const [contactList, addressList] = await Promise.all([
            getCustomerContacts(selectedCustomer),
            getCustomerAddresses(selectedCustomer),
          ]);
          setContacts(contactList);
          setAddresses(addressList);
        } catch (error) {
          Alert.alert('Error', 'Failed to fetch contacts and addresses.');
        }
      } else {
        setContacts([]);
        setAddresses([]);
      }
    };
    fetchContactsAndAddresses();
  }, [selectedCustomer]);

  const handleItemChange = async (value: string | number, index: number, field: keyof QuotationItem) => {
    const newItems = [...items];
    const item = newItems[index];

    if (typeof field === 'string' && field in item) {
      // @ts-ignore
      item[field] = value;
    }

    if (field === 'item_code' && typeof value === 'string' && value) {
      try {
        const price = await getItemPrice(value);
        newItems[index].rate = price?.price_list_rate || 0;
        newItems[index].rate_is_editable = !price?.price_list_rate;
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch item price.');
        newItems[index].rate = 0;
        newItems[index].rate_is_editable = true;
      }
    } else if (field === 'item_code') {
      newItems[index].rate = 0;
      newItems[index].rate_is_editable = true;
    }

    const qty = parseFloat(String(newItems[index].qty)) || 0;
    const rate = parseFloat(String(newItems[index].rate)) || 0;
    newItems[index].amount = qty * rate;
    setItems(newItems);

    if (selectedSalesTaxesAndChargesTemplate) {
      const template = await getSalesTaxesAndChargesTemplateByName(selectedSalesTaxesAndChargesTemplate);
      setTaxes(calculateTaxes(newItems, template));
    }
  };

  const addNewItem = () => {
    setItems([...items, { key: items.length + 1, item_code: '', qty: 1, rate: 0, amount: 0, rate_is_editable: true, q_image: '' }]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleTemplateChange = async (templateName: string) => {
    setSelectedSalesTaxesAndChargesTemplate(templateName);
    if (templateName) {
      try {
        const template = await getSalesTaxesAndChargesTemplateByName(templateName);
        setTaxes(calculateTaxes(items, template));
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch sales taxes and charges template details.');
      }
    } else {
      setTaxes([]);
    }
  };

  const calculateTaxes = (currentItems: QuotationItem[], template: any) => {
    if (!template || !template.taxes) {
      return [];
    }

    const newTaxes: SalesTax[] = template.taxes.map((tax: any) => {
      const totalRate = currentItems.reduce((acc, item) => acc + (parseFloat(String(item.rate)) || 0), 0);
      const totalQty = currentItems.reduce((acc, item) => acc + (parseFloat(String(item.qty)) || 0), 0);
      const amount = (tax.rate * totalRate) / 100;
      const total = amount * totalQty;
      return {
        type: tax.charge_type,
        rate: tax.rate,
        amount: amount,
        total: total,
      };
    });
    return newTaxes;
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [customerList, itemList, templates] = await Promise.all([
          getCustomers(),
          getItems(),
          getSalesTaxesAndChargesTemplates(),
        ]);
        setCustomers(customerList);
        setAllItems(itemList);
        setSalesTaxesAndChargesTemplates(templates);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch initial data.');
      }
    };
    fetchInitialData();
  }, []);

  const handleSave = async () => {
    if (!selectedCustomer) {
      Alert.alert('Error', 'Please select a customer.');
      return;
    }
    if (items.some(item => !item.item_code || !item.qty || !item.rate)) {
      Alert.alert('Error', 'Please fill all item details.');
      return;
    }

    setLoading(true);
    try {
      const quotationData = {
        party_name: selectedCustomer,
        contact_person: selectedContact,
        shipping_address_name: selectedAddress,
        transaction_date: date.toISOString().split('T')[0],
        order_type: 'Sales',
        items: items.map(item => ({
          item_code: item.item_code,
          qty: item.qty,
          rate: item.rate,
          q_image: item.q_image,
        })),
        taxes_and_charges: selectedSalesTaxesAndChargesTemplate,
      };
      await createQuotation(quotationData);
      Alert.alert('Success', 'Quotation created successfully.');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to create quotation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Quotation</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          <Text style={[styles.headerSave, loading && styles.disabled]}>Save</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.container}>
        <Text style={styles.label}>Customer</Text>
        <Picker
          selectedValue={selectedCustomer}
          onValueChange={(itemValue) => setSelectedCustomer(itemValue)}
          style={styles.input}
        >
          <Picker.Item label="Select Customer" value="" />
          {customers.map(c => <Picker.Item key={c.name} label={c.customer_name} value={c.name} />)}
        </Picker>

        <Text style={styles.label}>Contact</Text>
        <Picker
          selectedValue={selectedContact}
          onValueChange={(itemValue) => setSelectedContact(itemValue)}
          style={styles.input}
          enabled={!!selectedCustomer}
        >
          <Picker.Item label="Select Contact" value="" />
          {contacts.map(c => <Picker.Item key={c.name} label={`${c.first_name} ${c.last_name || ''}`} value={c.name} />)}
        </Picker>

        <Text style={styles.label}>Address</Text>
        <Picker
          selectedValue={selectedAddress}
          onValueChange={(itemValue) => setSelectedAddress(itemValue)}
          style={styles.input}
          enabled={!!selectedCustomer}
        >
          <Picker.Item label="Select Address" value="" />
          {addresses.map(a => <Picker.Item key={a.name} label={`${a.address_line1}, ${a.city}`} value={a.name} />)}
        </Picker>

        <Text style={styles.label}>Date</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <Text style={styles.input}>{date.toDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setDate(selectedDate);
              }
            }}
          />
        )}

        <Text style={styles.label}>Valid Till</Text>
        <TouchableOpacity onPress={() => setShowValidTillPicker(true)}>
          <Text style={styles.input}>{validTill.toDateString()}</Text>
        </TouchableOpacity>
        {showValidTillPicker && (
          <DateTimePicker
            value={validTill}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowValidTillPicker(false);
              if (selectedDate) {
                setValidTill(selectedDate);
              }
            }}
          />
        )}

        <Text style={styles.subHeader}>Items</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.itemHeaderText]}>Item</Text>
          <Text style={[styles.tableHeaderText, styles.qtyHeaderText]}>Qty</Text>
          <Text style={[styles.tableHeaderText, styles.rateHeaderText]}>Rate</Text>
          <Text style={[styles.tableHeaderText, styles.amountHeaderText]}>Amount</Text>
          <Text style={[styles.tableHeaderText, styles.actionHeaderText]}>Image</Text>
          <Text style={[styles.tableHeaderText, styles.actionHeaderText]}> </Text>
        </View>
        {items.map((item, index) => (
          <View key={item.key} style={styles.tableRow}>
            <TouchableOpacity
              style={styles.itemCell}
              onPress={() => {
                setCurrentItemIndex(index);
                setItemModalVisible(true);
              }}
            >
              <Text style={styles.tableCell}>{item.item_code || 'Select Item'}</Text>
            </TouchableOpacity>
            <TextInput
              style={[styles.tableCell, styles.qtyCell]}
              value={String(item.qty)}
              onChangeText={(value) => handleItemChange(value, index, 'qty')}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.tableCell, styles.rateCell]}
              value={String(item.rate)}
              onChangeText={(value) => handleItemChange(value, index, 'rate')}
              keyboardType="numeric"
              editable={item.rate_is_editable}
            />
            <Text style={[styles.tableCell, styles.amountCell]}>{item.amount.toFixed(2)}</Text>
            <TouchableOpacity onPress={() => handleImagePick(index)} style={styles.deleteButton}>
              <Feather name="camera" size={20} color={theme.colors.primary[500]} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => removeItem(index)} style={styles.deleteButton}>
              <Feather name="trash-2" size={20} color={theme.colors.error[500]} />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity onPress={addNewItem} style={styles.addItemButton}>
          <Text style={styles.addItemButtonText}>Add New Item</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Sales Taxes and Charges Template</Text>
        <Picker
          selectedValue={selectedSalesTaxesAndChargesTemplate}
          onValueChange={(itemValue) => handleTemplateChange(itemValue)}
          style={styles.input}
        >
          <Picker.Item label="Select Template" value="" />
          {salesTaxesAndChargesTemplates.map(t => <Picker.Item key={t.name} label={t.title} value={t.name} />)}
        </Picker>

        {taxes.length > 0 && (
          <View>
            <Text style={styles.subHeader}>Taxes</Text>
            {taxes.map((tax, index) => (
              <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text>{tax.type} @ {tax.rate}%</Text>
                <Text>{tax.total.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        )}

        {loading && <ActivityIndicator size="large" color={theme.colors.primary[500]} />}
      </ScrollView>
      <Modal
        visible={itemModalVisible}
        animationType="slide"
        onRequestClose={() => setItemModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for an item..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <FlatList
            data={allItems.filter(i => i.item_name.toLowerCase().includes(searchQuery.toLowerCase()))}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  if (currentItemIndex !== null) {
                    handleItemChange(item.name, currentItemIndex, 'item_code');
                  }
                  setItemModalVisible(false);
                  setSearchQuery('');
                }}
              >
                <Text>{item.item_name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: theme.colors.background,
  },
  modalContainer: {
    flex: 1,
    padding: 16,
  },
  searchInput: {
    backgroundColor: theme.colors.white,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  itemText: {
    padding: 12,
    fontSize: 16,
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSave: {
    fontSize: 18,
    color: theme.colors.primary[500],
    fontWeight: 'bold',
  },
  disabled: {
    color: theme.colors.gray[400],
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[300],
  },
  tableHeaderText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  tableCell: {
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  itemHeaderText: {
    flex: 2.5,
  },
  qtyHeaderText: {
    flex: 1,
  },
  rateHeaderText: {
    flex: 1.2,
  },
  amountHeaderText: {
    flex: 1.2,
  },
  actionHeaderText: {
    flex: 0.8,
  },
  itemCell: {
    flex: 2.5,
  },
  qtyCell: {
    flex: 1,
  },
  rateCell: {
    flex: 1.2,
  },
  amountCell: {
    flex: 1.2,
  },
  deleteButton: {
    flex: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addItemButton: {
    backgroundColor: theme.colors.gray[200],
    padding: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginVertical: 8,
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    alignItems: 'center',
  },
  addItemButtonText: {
    color: 'black',
    fontWeight: 'bold'
  },
  subHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
});
