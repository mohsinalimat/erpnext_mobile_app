import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useNetwork } from '@/context/NetworkContext';
import { createSalesOrder } from '@/services/offline';

interface SalesOrderItem {
    item_code: string;
    item_name: string;
    qty: number;
    rate: number;
    amount: number;
}

export default function SalesOrderPreviewScreen() {
    const { theme } = useTheme();
    const { isConnected } = useNetwork();
    const params = useLocalSearchParams();
    const [loading, setLoading] = useState(false);

    const customerName = params.customerName as string;
    const poNo = params.poNo as string;
    const poDate = params.poDate as string;
    const date = params.date as string;
    const deliveryDate = params.deliveryDate as string;
    let items: SalesOrderItem[] = [];
    try {
        if (typeof params.items === 'string') {
            const parsedItems = JSON.parse(params.items);
            if (Array.isArray(parsedItems)) {
                items = parsedItems.map(item => ({
                    item_code: String(item.item_code || ''),
                    item_name: String(item.item_name || ''),
                    qty: parseFloat(item.qty) || 0,
                    rate: parseFloat(item.rate) || 0,
                    amount: parseFloat(item.amount) || 0,
                }));
            } else {
                console.warn('Parsed items is not an array:', parsedItems);
            }
        } else {
            console.warn('Items parameter is not a valid JSON string:', params.items);
        }
    } catch (e) {
        console.error('Failed to parse items parameter:', e);
    }
    const customer = params.customer as string;

    const totalAmount = items.reduce((acc: number, item: SalesOrderItem) => {
        const amount = parseFloat(String(item.amount));
        return acc + (isNaN(amount) ? 0 : amount);
    }, 0);

    const handleConfirmAndCreate = async () => {
        if (isConnected === null) {
            Alert.alert('Error', 'Cannot create sales order while network status is unknown.');
            return;
        }
        setLoading(true);
        try {
            const result = await createSalesOrder(isConnected, {
                customer,
                po_no: poNo,
                po_date: poDate,
                transaction_date: date,
                delivery_date: deliveryDate,
                items: items.map((item: SalesOrderItem) => ({
                    item_code: item.item_code,
                    qty: item.qty,
                    rate: item.rate,
                    amount: item.amount,
                })),
            });
            if (result.offline) {
                Alert.alert('Success', 'Sales Order data saved locally and will be synced when online.');
            } else {
                Alert.alert('Success', 'Sales Order created successfully.');
            }
            router.replace('/sales-order');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to create sales order.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        router.back();
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            padding: 16,
            backgroundColor: theme.colors.background,
        },
        card: {
            backgroundColor: theme.colors.white,
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
        },
        title: {
            fontSize: 20,
            fontWeight: 'bold',
            marginBottom: 16,
            color: theme.colors.text.primary,
        },
        label: {
            fontSize: 16,
            color: theme.colors.text.secondary,
        },
        value: {
            fontSize: 16,
            fontWeight: 'bold',
            color: theme.colors.text.primary,
            marginBottom: 8,
        },
        itemContainer: {
            paddingVertical: 8,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.gray[200],
        },
        itemText: {
            fontSize: 14,
            color: theme.colors.text.primary,
        },
        totalContainer: {
            marginTop: 16,
            alignItems: 'flex-end',
        },
        totalText: {
            fontSize: 18,
            fontWeight: 'bold',
            color: theme.colors.text.primary,
        },
        buttonContainer: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginTop: 24,
        },
        button: {
            paddingVertical: 12,
            paddingHorizontal: 32,
            borderRadius: 8,
            alignItems: 'center',
        },
        confirmButton: {
            backgroundColor: theme.colors.primary[500],
        },
        editButton: {
            backgroundColor: theme.colors.gray[300],
        },
        buttonText: {
            color: theme.colors.white,
            fontSize: 16,
            fontWeight: 'bold',
        },
    });

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Sales Order Preview</Text>

            <View style={styles.card}>
                <Text style={styles.label}>Customer</Text>
                <Text style={styles.value}>{customerName}</Text>
                <Text style={styles.label}>PO Number</Text>
                <Text style={styles.value}>{poNo || 'N/A'}</Text>
                <Text style={styles.label}>PO Date</Text>
                <Text style={styles.value}>{poDate}</Text>
                <Text style={styles.label}>Transaction Date</Text>
                <Text style={styles.value}>{date}</Text>
                <Text style={styles.label}>Delivery Date</Text>
                <Text style={styles.value}>{deliveryDate}</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.title}>Items</Text>
                {items.map((item: SalesOrderItem, index: number) => (
                    <View key={index} style={styles.itemContainer}>
                        <Text style={styles.itemText}>{item.item_name}</Text>
                        <Text style={styles.itemText}>Qty: {item.qty} @ Rate: {item.rate}</Text>
                        <Text style={styles.itemText}>Amount: {item.amount}</Text>
                    </View>
                ))}
                <View style={styles.totalContainer}>
                    <Text style={styles.totalText}>Total: {totalAmount.toFixed(2)}</Text>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={theme.colors.primary[500]} />
            ) : (
                <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={handleEdit} style={[styles.button, styles.editButton]}>
                        <Text style={[styles.buttonText, { color: theme.colors.text.primary }]}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleConfirmAndCreate} style={[styles.button, styles.confirmButton]}>
                        <Text style={styles.buttonText}>Confirm & Create</Text>
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );
}
