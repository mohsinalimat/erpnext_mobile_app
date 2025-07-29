import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, ExternalPathString } from 'expo-router';
import { getSalarySlips, getYearToDateSalaryData, getCompanyCurrency } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function SalarySlipsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [salarySlips, setSalarySlips] = useState<any[]>([]);
  const [yearToDateSalary, setYearToDateSalary] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    const fetchSalaryData = async () => {
      if (user) {
        try {
          setLoading(true);
          const slips = await getSalarySlips(user.employee_id);
          setSalarySlips(slips);

          const companyCurrency = await getCompanyCurrency(user.company);
          setCurrency(companyCurrency);

          const currentYear = new Date().getFullYear();
          const ytdSalaryData = await getYearToDateSalaryData(user.employee_id, currentYear);
          
          const totalEarnings = ytdSalaryData.reduce((acc: number, slip: any) => {
            const earnings = slip.earnings.reduce((sum: number, item: any) => sum + item.amount, 0);
            return acc + earnings;
          }, 0);

          const totalDeductions = ytdSalaryData.reduce((acc: number, slip: any) => {
            const deductions = slip.deductions.reduce((sum: number, item: any) => sum + item.amount, 0);
            return acc + deductions;
          }, 0);

          setYearToDateSalary(totalEarnings - totalDeductions);
        } catch (error) {
          console.error('Failed to fetch salary data:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchSalaryData();
  }, [user]);

  const handleSlipPress = (slipId: string) => {
    router.push({ pathname: `/(app)/salary-slip-detail` as ExternalPathString, params: { slipId } });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Salary Slips</Text>
        <View style={styles.headerIcons}>
          <Feather name="bell" size={24} color="black" />
          <View style={styles.avatar} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Year To Date</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <Text style={styles.cardAmount}>{currency} {yearToDateSalary?.toLocaleString('en-IN') || 'N/A'}</Text>
        )}
        <View style={styles.dateRangeContainer}>
          <Text style={styles.dateRange}>Apr 2023 - Mar 2024</Text>
          <Feather name="chevron-down" size={20} color="gray" />
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {salarySlips.map((slip) => (
          <TouchableOpacity key={slip.name} style={styles.slipItem} onPress={() => handleSlipPress(slip.name)}>
            <View style={styles.slipIconContainer}>
              <Feather name="briefcase" size={24} color="#4A5568" />
            </View>
            <View style={styles.slipInfo}>
              <Text style={styles.slipMonth}>{new Date(slip.posting_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</Text>
              <Text style={styles.slipGrossPay}>Gross Pay: {currency} {slip.gross_pay}</Text>
            </View>
            <View style={styles.slipNetPayContainer}>
              <Text style={styles.slipNetPay}>{currency} {slip.net_pay}</Text>
              <Feather name="chevron-right" size={20} color="gray" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D1D5DB',
    marginLeft: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    margin: 16,
  },
  cardTitle: {
    fontSize: 16,
    color: 'gray',
  },
  cardAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 4,
  },
  dateRange: {
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
    marginHorizontal: 16,
  },
  slipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  slipIconContainer: {
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    padding: 8,
    marginRight: 12,
  },
  slipInfo: {
    flex: 1,
  },
  slipMonth: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  slipGrossPay: {
    fontSize: 14,
    color: 'gray',
  },
  slipNetPayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slipNetPay: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
});
