import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { getCustomers, getItems, getItemPrice, getSalesTaxesAndChargesTemplates, getSalesTaxesAndChargesTemplateByName, getCustomerContacts, getCustomerAddresses } from '@/services/erpnext';
import { createQuotation } from '@/services/offline';
import { Feather } from '@expo/vector-icons';
import { useNetwork } from '@/context/NetworkContext';
import { theme } from '@/constants/theme';
import { router, useLocalSearchParams } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

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
  qty: number;
  rate: number;
  amount: number;
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
  const [items, setItems] = useState<QuotationItem[]>([{ key: 1, item_code: '', qty: 1, rate: 0, amount: 0 }]);
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [salesTaxesAndChargesTemplates, setSalesTaxesAndChargesTemplates] = useState<SalesTaxesAndChargesTemplate[]>([]);
  const [selectedSalesTaxesAndChargesTemplate, setSelectedSalesTaxesAndChargesTemplate] = useState('');
  const [taxes, setTaxes] = useState<SalesTax[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showValidTillPicker, setShowValidTillPicker] = useState(false);
  const params = useLocalSearchParams();

  useEffect(() => {
    if (params.create) {
      handleCreateQuotation();
    }
  }, [params.create]);

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

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      if (selectedCustomer) {
        try {
          const [contactList, addressList] = await Promise.all([
            getCustomerContacts(selectedCustomer),
            getCustomerAddresses(selectedCustomer),
          ]);
          setContacts(contactList);
          setAddresses(addressList);
        } catch (error) {
          Alert.alert('Error', 'Failed to fetch customer details.');
        }
      } else {
        setContacts([]);
        setAddresses([]);
      }
    };
    fetchCustomerDetails();
  }, [selectedCustomer]);

  const calculateTaxes = (currentItems: QuotationItem[], template: any) => {
    if (!template || !template.taxes) {
      return [];
    }

    const newTaxes: SalesTax[] = template.taxes.map((tax: any) => {
      const totalRate = currentItems.reduce((acc, item) => acc + item.rate, 0);
      const totalQty = currentItems.reduce((acc, item) => acc + item.qty, 0);
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
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch item price.');
        newItems[index].rate = 0;
      }
    }

    newItems[index].amount = (newItems[index].qty || 0) * (newItems[index].rate || 0);
    setItems(newItems);

    if (selectedSalesTaxesAndChargesTemplate) {
      const template = await getSalesTaxesAndChargesTemplateByName(selectedSalesTaxesAndChargesTemplate);
      setTaxes(calculateTaxes(newItems, template));
    }
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

  const addNewItem = () => {
    setItems([...items, { key: items.length + 1, item_code: '', qty: 1, rate: 0, amount: 0 }]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const calculateSubTotal = () => {
    return items.reduce((total, item) => total + item.amount, 0);
  };

  const calculateTotalTaxes = () => {
    return taxes.reduce((total, tax) => total + tax.total, 0);
  };

  const calculateGrandTotal = () => {
    return calculateSubTotal() + calculateTotalTaxes();
  };

  const handleCreateQuotation = async () => {
    if (isConnected === null) {
      Alert.alert('Error', 'Cannot create quotation while network status is unknown.');
      return;
    }
    if (!selectedCustomer) {
      Alert.alert('Error', 'Customer is required.');
      return;
    }
    setLoading(true);
    try {
      const quotationData = {
        customer: selectedCustomer,
        contact_person: selectedContact,
        shipping_address: selectedAddress,
        transaction_date: date.toISOString().slice(0, 10),
        valid_till: validTill.toISOString().slice(0, 10),
        items: items.map(({ key, ...rest }) => rest),
        taxes: taxes,
        grand_total: calculateGrandTotal(),
        status: 'Draft',
      };
      const result = await createQuotation(isConnected, quotationData);
      if (result.offline) {
        Alert.alert('Success', 'Quotation data saved locally and will be synced when online.');
      } else {
        Alert.alert('Success', 'Quotation created successfully.');
      }
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create quotation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <Text style={styles.label}>Customer</Text>
        <Picker
          selectedValue={selectedCustomer}
          onValueChange={(itemValue) => setSelectedCustomer(itemValue)}
          style={styles.input}
        >
          <Picker.Item label="Select Customer" value="" />
          {customers.map((customer) => (
            <Picker.Item key={customer.name} label={customer.customer_name} value={customer.name} />
          ))}
        </Picker>

        <Text style={styles.label}>Primary Contact</Text>
        <Picker
          selectedValue={selectedContact}
          onValueChange={(itemValue) => setSelectedContact(itemValue)}
          style={styles.input}
          enabled={!!selectedCustomer}
        >
          <Picker.Item label="Select Contact" value="" />
          {contacts.map((contact) => (
            <Picker.Item key={contact.name} label={`${contact.first_name} ${contact.last_name || ''}`} value={contact.name} />
          ))}
        </Picker>

        <Text style={styles.label}>Shipping Address</Text>
        <Picker
          selectedValue={selectedAddress}
          onValueChange={(itemValue) => setSelectedAddress(itemValue)}
          style={styles.input}
          enabled={!!selectedCustomer}
        >
          <Picker.Item label="Select Address" value="" />
          {addresses.map((address) => (
            <Picker.Item key={address.name} label={`${address.address_line1}, ${address.city}`} value={address.name} />
          ))}
        </Picker>

        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <Text style={styles.label}>Date</Text>
          <TextInput
            style={styles.input}
            value={date.toLocaleDateString()}
            editable={false}
          />
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

        <TouchableOpacity onPress={() => setShowValidTillPicker(true)}>
          <Text style={styles.label}>Valid Till</Text>
          <TextInput
            style={styles.input}
            value={validTill.toLocaleDateString()}
            editable={false}
          />
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
          <Text style={[styles.tableHeaderText, styles.actionHeaderText]}></Text>
        </View>
        {items.map((item, index) => (
          <View key={item.key} style={styles.tableRow}>
            <View style={styles.itemCell}>
              <Picker
                selectedValue={item.item_code}
                onValueChange={(itemValue) => handleItemChange(itemValue, index, 'item_code')}
              >
                <Picker.Item label="Select Item" value="" />
                {allItems.map((i) => (
                  <Picker.Item key={i.name} label={i.item_name} value={i.name} />
                ))}
              </Picker>
            </View>
            <TextInput
              style={[styles.tableCell, styles.qtyCell]}
              placeholder="Qty"
              keyboardType="numeric"
              value={String(item.qty)}
              onChangeText={(text) => handleItemChange(Number(text), index, 'qty')}
            />
            <TextInput
              style={[styles.tableCell, styles.rateCell]}
              placeholder="Rate"
              keyboardType="numeric"
              value={String(item.rate)}
              editable={false}
            />
            <TextInput
              style={[styles.tableCell, styles.amountCell]}
              placeholder="Amount"
              keyboardType="numeric"
              value={String(item.amount)}
              editable={false}
            />
            <TouchableOpacity onPress={() => removeItem(index)} style={styles.deleteButton}>
              <Feather name="trash-2" size={24} color={theme.colors.error[500]} />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity onPress={addNewItem} style={styles.addItemButton}>
          <Feather name="plus" size={24} color={theme.colors.white} />
          <Text style={styles.addItemButtonText}>Add New Item</Text>
        </TouchableOpacity>

        <Text style={styles.subHeader}>Sales Taxes and Charges</Text>
        <Picker
          selectedValue={selectedSalesTaxesAndChargesTemplate}
          onValueChange={(itemValue) => handleTemplateChange(itemValue)}
          style={styles.input}
        >
          <Picker.Item label="Select Template" value="" />
          {salesTaxesAndChargesTemplates.map((template) => (
            <Picker.Item key={template.name} label={template.title} value={template.name} />
          ))}
        </Picker>

        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>Type</Text>
          <Text style={styles.tableHeaderText}>Tax Rate</Text>
          <Text style={styles.tableHeaderText}>Amount</Text>
          <Text style={styles.tableHeaderText}>Total</Text>
        </View>
        {taxes.map((tax, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.tableCell}>{tax.type}</Text>
            <Text style={styles.tableCell}>{tax.rate}%</Text>
            <Text style={styles.tableCell}>{tax.amount.toFixed(2)}</Text>
            <Text style={styles.tableCell}>{tax.total.toFixed(2)}</Text>
          </View>
        ))}

        <View style={styles.totalsContainer}>
          <Text style={styles.subTotal}>Subtotal: {calculateSubTotal()}</Text>
          <Text style={styles.subTotal}>Total Taxes: {calculateTotalTaxes()}</Text>
          <Text style={styles.grandTotal}>Grand Total: {calculateGrandTotal()}</Text>
        </View>

        {loading && <ActivityIndicator size="large" color={theme.colors.primary[500]} />}
        <TouchableOpacity onPress={handleCreateQuotation} style={styles.createButton}>
          <Text style={styles.createButtonText}>Create Quotation</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
  subHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
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
  itemHeaderText: {
    flex: 3,
  },
  qtyHeaderText: {
    flex: 1.5,
  },
  rateHeaderText: {
    flex: 1.5,
  },
  amountHeaderText: {
    flex: 1.5,
  },
  actionHeaderText: {
    flex: 1,
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
  itemCell: {
    flex: 3,
  },
  qtyCell: {
    flex: 1.5,
  },
  rateCell: {
    flex: 1.5,
  },
  amountCell: {
    flex: 1.5,
  },
  deleteButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary[500],
    padding: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginVertical: 8,
  },
  addItemButtonText: {
    color: theme.colors.white,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  totalsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[300],
  },
  subTotal: {
    fontSize: 16,
    textAlign: 'right',
    marginBottom: 8,
  },
  grandTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'right',
    marginTop: 8,
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
