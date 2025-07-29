import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getExpenseClaimByName } from '../../services/erpnext';

export default function ExpenseClaimScreen() {
  const router = useRouter();
  const { name } = useLocalSearchParams();
  const [expenseClaim, setExpenseClaim] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpenseClaim = async () => {
      try {
        const response = await getExpenseClaimByName(name as string);
        setExpenseClaim(response);
      } catch (error) {
        console.error('Failed to fetch expense claim:', error);
      } finally {
        setLoading(false);
      }
    };

    if (name) {
      fetchExpenseClaim();
    }
  }, [name]);

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  if (!expenseClaim) {
    return (
      <View style={styles.container}>
        <Text>Expense claim not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Expense Claim</Text>
        <Feather name="more-vertical" size={24} color="black" />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>ID</Text>
            <Text style={styles.value}>{expenseClaim.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Posting Date</Text>
            <Text style={styles.value}>{new Date(expenseClaim.posting_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Employee</Text>
            <Text style={styles.value}>{expenseClaim.employee_name}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Expenses</Text>
          {expenseClaim.expenses.map((expense: any, index: number) => (
            <View key={index}>
              <View style={styles.expenseItem}>
                <Text style={styles.expenseType}>{expense.expense_type}</Text>
                <Text style={styles.expenseAmount}>₹ {expense.claim_amount}</Text>
              </View>
              <Text style={styles.expenseDetails}>Sanctioned: ₹ {expense.sanctioned_amount} · {new Date(expense.expense_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Total Claimed Amount</Text>
            <Text style={styles.value}>₹ {expenseClaim.total_claimed_amount}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Total Sanctioned Amount</Text>
            <Text style={styles.value}>₹ {expenseClaim.total_sanctioned_amount}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Total Taxes and Charges</Text>
            <Text style={styles.value}>₹ {expenseClaim.total_taxes_and_charges}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Total Advance Amount</Text>
            <Text style={styles.value}>₹ {expenseClaim.total_advance_amount}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Grand Total</Text>
            <Text style={styles.value}>₹ {expenseClaim.grand_total}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Status</Text>
            <Text style={styles.value}>{expenseClaim.status}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Approval Status</Text>
            <Text style={styles.value}>{expenseClaim.approval_status}</Text>
          </View>
          {expenseClaim.attachments?.length > 0 && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Attachments</Text>
              <Text style={styles.value}>{expenseClaim.attachments[0].file_url.split('/').pop()}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.rejectButton]}>
          <Feather name="x" size={16} color="#EF4444" />
          <Text style={[styles.buttonText, styles.rejectButtonText]}>Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.approveButton]}>
          <Feather name="check" size={16} color="white" />
          <Text style={[styles.buttonText, styles.approveButtonText]}>Approve</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    margin: 16,
    marginBottom: 0,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: 'gray',
  },
  value: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  expenseType: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  expenseDetails: {
    fontSize: 12,
    color: 'gray',
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: 'white',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  rejectButton: {
    backgroundColor: '#FEE2E2',
  },
  approveButton: {
    backgroundColor: '#10B981',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  rejectButtonText: {
    color: '#EF4444',
  },
  approveButtonText: {
    color: '#10B981',
  },
});
