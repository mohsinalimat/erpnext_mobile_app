import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { get_list } from '../../services/erpnext';
import { useAuth } from '../../context/AuthContext';

interface Expense {
  id: string;
  type: string;
  amount: string;
  date: string;
  status: 'Draft' | 'Rejected' | 'Paid';
}

const ExpenseSummary = () => (
  <View style={styles.summaryContainer}>
    <Text style={styles.summaryTitle}>Expense Claim Summary</Text>
    <View style={styles.summaryDetails}>
      <View>
        <Text style={styles.summaryLabel}>Total Expense Amount</Text>
        <Text style={styles.summaryAmount}>₹ 8,200</Text>
      </View>
      <View style={styles.summaryStatus}>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Pending</Text>
          <Text style={styles.statusValue}>₹ 7,200</Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Approved</Text>
          <Text style={styles.statusValue}>₹ 1,000</Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Rejected</Text>
          <Text style={styles.statusValue}>₹ 0</Text>
        </View>
      </View>
    </View>
    <TouchableOpacity style={styles.claimButton}>
      <Text style={styles.claimButtonText}>Claim an Expense</Text>
    </TouchableOpacity>
  </View>
);

const statusStyles = {
  draft: {
    backgroundColor: '#e0e0e0',
  },
  rejected: {
    backgroundColor: '#f8d7da',
  },
  paid: {
    backgroundColor: '#d4edda',
  },
};

const RecentExpenses = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await get_list({
          doctype: 'Expense Claim',
          fields: ['name', 'expense_type', 'total_claimed_amount', 'posting_date', 'status'],
          filters: [['employee', '=', user?.employee_id]],
        });
        const formattedExpenses = response.data.map((expense: any) => ({
          id: expense.name,
          type: expense.expense_type,
          amount: expense.total_claimed_amount,
          date: new Date(expense.posting_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
          status: expense.status,
        }));
        setExpenses(formattedExpenses);
      } catch (error) {
        console.error('Failed to fetch expenses:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.employee_id) {
      fetchExpenses();
    }
  }, [user]);

  const renderItem = ({ item }: { item: Expense }) => (
    <TouchableOpacity style={styles.expenseItem} onPress={() => router.push(`/expense-claim?name=${item.id}`)}>
      <Feather name="dollar-sign" size={24} color="black" />
      <View style={styles.expenseDetails}>
        <Text style={styles.expenseType}>{item.type}</Text>
        <Text style={styles.expenseDate}>{item.amount} · {item.date}</Text>
      </View>
      <View style={[styles.statusBadge, statusStyles[item.status.toLowerCase() as keyof typeof statusStyles]]}>
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
      <Feather name="chevron-right" size={24} color="gray" />
    </TouchableOpacity>
  );

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 20 }} />;
  }

  return (
    <View style={styles.recentExpensesContainer}>
      <Text style={styles.recentExpensesTitle}>Recent Expenses</Text>
      <FlatList
        data={expenses}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
};


const ExpensesScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <ExpenseSummary />
      <RecentExpenses />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  summaryContainer: {
    backgroundColor: 'white',
    padding: 16,
    margin: 16,
    borderRadius: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryDetails: {
    marginBottom: 16,
  },
  summaryLabel: {
    color: 'gray',
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  summaryStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statusItem: {
    alignItems: 'center',
  },
  statusLabel: {
    color: 'gray',
  },
  statusValue: {
    fontWeight: 'bold',
  },
  claimButton: {
    backgroundColor: 'black',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  claimButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  recentExpensesContainer: {
    margin: 16,
  },
  recentExpensesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  expenseDetails: {
    flex: 1,
    marginLeft: 16,
  },
  expenseType: {
    fontWeight: 'bold',
  },
  expenseDate: {
    color: 'gray',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
  },
});

export default ExpensesScreen;
