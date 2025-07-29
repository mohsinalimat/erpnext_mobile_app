import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, Modal, FlatList, TouchableOpacity, Platform } from 'react-native';
import { getItems, getCustomers } from '@/services/offline';
import { getItemPrice } from '@/services/erpnext';
import { useNetwork } from '@/context/NetworkContext';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import Card from '@/components/common/Card';
import FormField from '@/components/common/FormField';
import Button from '@/components/common/Button';
import { theme } from '@/constants/theme';

export default function NewSalesOrderScreen() {
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

    const handleSave = async () => {
        if (!customer || !date || !deliveryDate) {
            Alert.alert('Error', 'Please fill all required fields.');
            return;
        }

        const params = {
            customer,
            customer_name: customerName,
            po_no: poNo,
            po_date: formatDate(poDate),
            transaction_date: formatDate(date),
            delivery_date: formatDate(deliveryDate),
            items: JSON.stringify(items.map(item => ({ ...item, item_name: undefined }))),
        };

        setLoading(true);
        try {
            await router.push({
                pathname: '/sales-order-preview',
                params: params as any,
            });
        } catch (error) {
            console.error('Failed to navigate:', error);
            Alert.alert('Error', 'Failed to navigate to preview screen.');
        } finally {
            setLoading(false);
        }
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

    return (
        <ScrollView style={styles.container}>
            <Card>
                <TouchableOpacity onPress={() => setCustomerModalVisible(true)}>
                    <FormField
                        label="Customer"
                        value={customerName}
                        editable={false}
                        placeholder="Select Customer"
                        placeholderTextColor={theme.colors.text.secondary}
                    />
                </TouchableOpacity>
                <FormField
                    label="Customer's Purchase Order"
                    value={poNo}
                    onChangeText={setPoNo}
                    placeholder="Enter PO number"
                    placeholderTextColor={theme.colors.text.secondary}
                />
                <TouchableOpacity onPress={() => showDatepickerFor('poDate')}>
                    <FormField
                        label="Customer's Purchase Order Date"
                        value={formatDate(poDate)}
                        editable={false}
                        placeholder="Select Date"
                        placeholderTextColor={theme.colors.text.secondary}
                    />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => showDatepickerFor('date')}>
                    <FormField
                        label="*Date"
                        value={formatDate(date)}
                        editable={false}
                        placeholder="Select Date"
                        placeholderTextColor={theme.colors.text.secondary}
                    />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => showDatepickerFor('deliveryDate')}>
                    <FormField
                        label="*Delivery Date"
                        value={formatDate(deliveryDate)}
                        editable={false}
                        placeholder="Select Date"
                        placeholderTextColor={theme.colors.text.secondary}
                    />
                </TouchableOpacity>
            </Card>

            <Card>
                <Text style={styles.label}>Items</Text>
                {items.map((item, index) => (
                    <View key={index} style={styles.itemContainer}>
                        <TouchableOpacity onPress={() => openItemModal(index)}>
                            <FormField
                                label="Item"
                                value={item.item_name}
                                editable={false}
                                placeholder="Select Item"
                                placeholderTextColor={theme.colors.text.secondary}
                            />
                        </TouchableOpacity>
                        <View style={styles.itemRow}>
                            <FormField
                                style={styles.itemInput}
                                value={item.qty}
                                onChangeText={(value) => handleItemChange(index, 'qty', value)}
                                placeholder="Quantity"
                                keyboardType="numeric"
                                placeholderTextColor={theme.colors.text.secondary}
                            />
                            <FormField
                                style={styles.itemInput}
                                value={item.rate}
                                onChangeText={(value) => handleItemChange(index, 'rate', value)}
                                placeholder="Rate"
                                keyboardType="numeric"
                                placeholderTextColor={theme.colors.text.secondary}
                            />
                            <FormField
                                style={[styles.itemInput, { marginRight: 0 }]}
                                value={item.amount}
                                editable={false}
                                placeholder="Amount"
                                placeholderTextColor={theme.colors.text.secondary}
                            />
                        </View>
                    </View>
                ))}
                <TouchableOpacity style={styles.addRowButton} onPress={addItem}>
                    <Text style={styles.addRowButtonText}>Add Item</Text>
                </TouchableOpacity>
            </Card>

            <Button
                title={loading ? 'Saving...' : 'Save'}
                onPress={handleSave}
                disabled={loading}
                style={{ marginBottom: 16 }}
            />

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
                        <FormField
                            style={styles.searchInput}
                            placeholder="Search for an item..."
                            value={itemSearchQuery}
                            onChangeText={setItemSearchQuery}
                            placeholderTextColor={theme.colors.text.secondary}
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
                        <FormField
                            style={styles.searchInput}
                            placeholder="Search for a customer..."
                            value={customerSearchQuery}
                            onChangeText={setCustomerSearchQuery}
                            placeholderTextColor={theme.colors.text.secondary}
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
    itemContainer: {
        marginBottom: 16,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    itemInput: {
        flex: 1,
        marginRight: 8,
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
        marginBottom: 16,
    },
    itemText: {
        padding: 12,
        fontSize: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.gray[200],
    },
    addRowButton: {
        backgroundColor: 'black',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 16,
    },
    addRowButtonText: {
        color: theme.colors.white,
        fontSize: 16,
    },
});
