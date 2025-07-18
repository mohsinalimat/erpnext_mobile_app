import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert, ScrollView, Modal, FlatList, TouchableOpacity, Platform } from 'react-native';
import { getItems, getCustomers } from '@/services/offline';
import { getItemPrice } from '@/services/erpnext';
import { useTheme } from '@/context/ThemeContext';
import { useNetwork } from '@/context/NetworkContext';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function NewSalesOrderScreen() {
    const { theme } = useTheme();
    const { isConnected } = useNetwork();
    const [customer, setCustomer] = useState('');
    const [customerName, setCustomerName] = useState('Select Customer');
    const [customerList, setCustomerList] = useState<any[]>([]);
    const [isCustomerModalVisible, setCustomerModalVisible] = useState(false);
    const [customerSearchQuery, setCustomerSearchQuery] = useState('');
    const [poNo, setPoNo] = useState('');
    const [poDate, setPoDate] = useState(new Date());
    const [date, setDate] = useState(new Date());
    const [deliveryDate, setDeliveryDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerField, setDatePickerField] = useState('');

    const [items, setItems] = useState([{ item_code: '', qty: '1', rate: '0', amount: '0', item_name: 'Select Item' }]);
    const [itemList, setItemList] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isItemModalVisible, setItemModalVisible] = useState(false);
    const [currentItemIndex, setCurrentItemIndex] = useState(0);
    const [itemSearchQuery, setItemSearchQuery] = useState('');

    const filteredItems = useMemo(() => {
        return itemList.filter(item =>
            item.item_name.toLowerCase().includes(itemSearchQuery.toLowerCase()) ||
            item.name.toLowerCase().includes(itemSearchQuery.toLowerCase())
        );
    }, [itemList, itemSearchQuery]);

    const filteredCustomers = useMemo(() => {
        return customerList.filter(c =>
            c.customer_name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
            c.name.toLowerCase().includes(customerSearchQuery.toLowerCase())
        );
    }, [customerList, customerSearchQuery]);

    useEffect(() => {
        async function fetchData() {
            if (isConnected === null) return;
            try {
                const itemsData = await getItems(isConnected, [], '["name", "item_name"]');
                setItemList(itemsData);
                const customersData = await getCustomers(isConnected, [], '["name", "customer_name"]');
                setCustomerList(customersData);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
        }
        fetchData();
    }, [isConnected]);

    const formatDate = (d: Date): string => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            if (datePickerField === 'poDate') {
                setPoDate(selectedDate);
            } else if (datePickerField === 'date') {
                setDate(selectedDate);
            } else {
                setDeliveryDate(selectedDate);
            }
        }
    };

    const showDatepickerFor = (field: string) => {
        setDatePickerField(field);
        setShowDatePicker(true);
    };

    const handlePreview = () => {
        if (!customer || !date || !deliveryDate) {
            Alert.alert('Error', 'Please fill all required fields.');
            return;
        }

        const params = {
            customer,
            customerName,
            poNo,
            poDate: formatDate(poDate),
            date: formatDate(date),
            deliveryDate: formatDate(deliveryDate),
            items: JSON.stringify(items),
        };

        router.push({
            pathname: '/sales-order-preview',
            params,
        });
    };

    const handleItemChange = async (index: number, field: string, value: string, itemName?: string) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };

        if (field === 'item_code') {
            newItems[index].item_name = itemName || 'Select Item';
            if (value) {
                try {
                    const priceDetails = await getItemPrice(value);
                    if (priceDetails && priceDetails.price_list_rate) {
                        newItems[index].rate = priceDetails.price_list_rate.toString();
                    } else {
                        newItems[index].rate = '0';
                    }
                } catch (error) {
                    console.error('Failed to fetch item price:', error);
                    newItems[index].rate = '0';
                }
            } else {
                newItems[index].rate = '0';
            }
        }

        if (field === 'qty' || field === 'rate' || field === 'item_code') {
            const qty = parseFloat(newItems[index].qty) || 0;
            const rate = parseFloat(newItems[index].rate) || 0;
            newItems[index].amount = (qty * rate).toFixed(2);
        }
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { item_code: '', qty: '1', rate: '0', amount: '0', item_name: 'Select Item' }]);
    };

    const openItemModal = (index: number) => {
        setCurrentItemIndex(index);
        setItemModalVisible(true);
    };

    const onSelectItem = (item: any) => {
        handleItemChange(currentItemIndex, 'item_code', item.name, item.item_name);
        setItemModalVisible(false);
        setItemSearchQuery('');
    };

    const onSelectCustomer = (customer: any) => {
        setCustomer(customer.name);
        setCustomerName(customer.customer_name);
        setCustomerModalVisible(false);
        setCustomerSearchQuery('');
    };

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
        itemContainer: {
            marginBottom: 16,
            padding: 12,
            borderRadius: 8,
            backgroundColor: theme.colors.gray[100],
        },
        itemRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        itemInput: {
            flex: 1,
            backgroundColor: theme.colors.white,
            padding: 8,
            borderRadius: 4,
            marginRight: 8,
            fontSize: 14,
        },
        modalContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
        },
        modalContent: {
            width: '90%',
            height: '80%',
            backgroundColor: theme.colors.background,
            borderRadius: 8,
            padding: 16,
        },
        searchInput: {
            backgroundColor: theme.colors.white,
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
            fontSize: 16,
        },
        itemText: {
            padding: 12,
            fontSize: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.gray[200],
        },
        pickerButton: {
            backgroundColor: theme.colors.white,
            padding: 12,
            borderRadius: 8,
            marginBottom: 8,
            justifyContent: 'center',
        },
        pickerButtonText: {
            fontSize: 16,
            color: theme.colors.text.primary,
        },
        saveButton: {
            backgroundColor: theme.colors.primary[500],
            paddingVertical: 12,
            paddingHorizontal: 15,
            borderRadius: 8,
            alignItems: 'center',
            marginTop: 16,
        },
        saveButtonText: {
            color: theme.colors.white,
            fontSize: 16,
            fontWeight: 'bold',
        },
    });

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.label}>Customer</Text>
            <TouchableOpacity onPress={() => setCustomerModalVisible(true)} style={styles.pickerButton}>
                <Text style={styles.pickerButtonText}>{customerName}</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Customer's Purchase Order</Text>
            <TextInput style={styles.input} value={poNo} onChangeText={setPoNo} placeholder="Enter PO number" />

            <Text style={styles.label}>Customer's Purchase Order Date</Text>
            <TouchableOpacity onPress={() => showDatepickerFor('poDate')} style={styles.pickerButton}>
                <Text style={styles.pickerButtonText}>{formatDate(poDate)}</Text>
            </TouchableOpacity>

            <Text style={styles.label}>*Date</Text>
            <TouchableOpacity onPress={() => showDatepickerFor('date')} style={styles.pickerButton}>
                <Text style={styles.pickerButtonText}>{formatDate(date)}</Text>
            </TouchableOpacity>

            <Text style={styles.label}>*Delivery Date</Text>
            <TouchableOpacity onPress={() => showDatepickerFor('deliveryDate')} style={styles.pickerButton}>
                <Text style={styles.pickerButtonText}>{formatDate(deliveryDate)}</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Items</Text>
            {items.map((item, index) => (
                <View key={index} style={styles.itemContainer}>
                    <TouchableOpacity onPress={() => openItemModal(index)} style={styles.pickerButton}>
                        <Text style={styles.pickerButtonText}>{item.item_name}</Text>
                    </TouchableOpacity>
                    <View style={styles.itemRow}>
                        <TextInput
                            style={styles.itemInput}
                            value={item.qty}
                            onChangeText={(value) => handleItemChange(index, 'qty', value)}
                            placeholder="Quantity"
                            keyboardType="numeric"
                        />
                        <TextInput
                            style={styles.itemInput}
                            value={item.rate}
                            onChangeText={(value) => handleItemChange(index, 'rate', value)}
                            placeholder="Rate"
                            keyboardType="numeric"
                        />
                        <TextInput
                            style={[styles.itemInput, { marginRight: 0 }]}
                            value={item.amount}
                            editable={false}
                            placeholder="Amount"
                        />
                    </View>
                </View>
            ))}
            <Button title="Add Item" onPress={addItem} />

            {loading ? (
                <ActivityIndicator size="large" color={theme.colors.primary[500]} style={{ marginTop: 16 }} />
            ) : (
                <TouchableOpacity onPress={handlePreview} style={styles.saveButton}>
                    <Text style={styles.saveButtonText}>Preview</Text>
                </TouchableOpacity>
            )}

            {showDatePicker && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={datePickerField === 'poDate' ? poDate : datePickerField === 'date' ? date : deliveryDate}
                    mode="date"
                    is24Hour={true}
                    display="default"
                    onChange={onDateChange}
                />
            )}

            <Modal
                animationType="slide"
                transparent={true}
                visible={isItemModalVisible}
                onRequestClose={() => setItemModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search for an item..."
                            value={itemSearchQuery}
                            onChangeText={setItemSearchQuery}
                        />
                        <FlatList
                            data={filteredItems}
                            keyExtractor={(item) => item.name}
                            renderItem={({ item }) => (
                                <TouchableOpacity onPress={() => onSelectItem(item)}>
                                    <Text style={styles.itemText}>{item.item_name} ({item.name})</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <Button title="Close" onPress={() => setItemModalVisible(false)} />
                    </View>
                </View>
            </Modal>

            <Modal
                animationType="slide"
                transparent={true}
                visible={isCustomerModalVisible}
                onRequestClose={() => setCustomerModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search for a customer..."
                            value={customerSearchQuery}
                            onChangeText={setCustomerSearchQuery}
                        />
                        <FlatList
                            data={filteredCustomers}
                            keyExtractor={(c) => c.name}
                            renderItem={({ item }) => (
                                <TouchableOpacity onPress={() => onSelectCustomer(item)}>
                                    <Text style={styles.itemText}>{item.customer_name} ({item.name})</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <Button title="Close" onPress={() => setCustomerModalVisible(false)} />
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}
