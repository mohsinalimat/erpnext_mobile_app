import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getSalarySlipDetail, getYearToDateSalaryData } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function SalarySlipDetailScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { slipId } = useLocalSearchParams();
  const [slip, setSlip] = useState<any>(null);
  const [ytdEarnings, setYtdEarnings] = useState<any>({});
  const [ytdDeductions, setYtdDeductions] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSlipDetail = async () => {
      if (slipId && user) {
        const detail = await getSalarySlipDetail(slipId as string);
        setSlip(detail);

        const ytdData = await getYearToDateSalaryData(user.employee_id, new Date().getFullYear());
        const earnings: any = {};
        const deductions: any = {};
        ytdData.forEach((s: any) => {
          s.earnings.forEach((e: any) => {
            earnings[e.salary_component] = (earnings[e.salary_component] || 0) + e.amount;
          });
          s.deductions.forEach((d: any) => {
            deductions[d.salary_component] = (deductions[d.salary_component] || 0) + d.amount;
          });
        });
        setYtdEarnings(earnings);
        setYtdDeductions(deductions);

        setLoading(false);
      }
    };
    fetchSlipDetail();
  }, [slipId, user]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!slip) {
    return (
      <View style={styles.container}>
        <Text>Salary slip not found.</Text>
      </View>
    );
  }

  const totalEarnings = slip.earnings.reduce((acc: number, item: any) => acc + item.amount, 0);
  const totalDeductions = slip.deductions.reduce((acc: number, item: any) => acc + item.amount, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{slip.name}</Text>
        <View style={styles.headerIcons}>
          <Text style={styles.submittedText}>{slip.status}</Text>
          <Feather name="more-vertical" size={24} color="black" />
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Details</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, styles.activeTab]}>
          <Text style={[styles.tabText, styles.activeTabText]}>Earnings & Deductions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Net Pay Info</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Earnings</Text>
          <Text style={styles.sectionAmount}>₹ {totalEarnings.toLocaleString()}</Text>
        </View>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>Component</Text>
          <Text style={styles.tableHeaderText}>Amount</Text>
          <Text style={styles.tableHeaderText}>YTD Amount</Text>
        </View>
        {slip.earnings.map((item: any, index: number) => (
          <View key={index} style={styles.item}>
            <Text style={styles.itemText}>{item.salary_component}</Text>
            <Text style={styles.itemAmount}>₹ {item.amount.toLocaleString()}</Text>
            <Text style={styles.itemAmount}>₹ {(ytdEarnings[item.salary_component] || 0).toLocaleString()}</Text>
          </View>
        ))}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Deductions</Text>
          <Text style={styles.sectionAmount}>₹ {totalDeductions.toLocaleString()}</Text>
        </View>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>Component</Text>
          <Text style={styles.tableHeaderText}>Amount</Text>
          <Text style={styles.tableHeaderText}>YTD Amount</Text>
        </View>
        {slip.deductions.map((item: any, index: number) => (
          <View key={index} style={styles.item}>
            <Text style={styles.itemText}>{item.salary_component}</Text>
            <Text style={styles.itemAmount}>₹ {item.amount.toLocaleString()}</Text>
            <Text style={styles.itemAmount}>₹ {(ytdDeductions[item.salary_component] || 0).toLocaleString()}</Text>
          </View>
        ))}

        <View style={styles.totalsContainer}>
          <View style={styles.totalItem}>
            <Text style={styles.totalText}>Gross Pay</Text>
            <Text style={styles.totalAmount}>₹ {slip.gross_pay.toLocaleString()}</Text>
          </View>
          <View style={styles.totalItem}>
            <Text style={styles.totalText}>Net Pay</Text>
            <Text style={styles.totalAmount}>₹ {slip.net_pay.toLocaleString()}</Text>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.downloadButton}>
        <Text style={styles.downloadButtonText}>Download PDF</Text>
      </TouchableOpacity>
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
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submittedText: {
    backgroundColor: '#D1FAE5',
    color: '#065F46',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    fontSize: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    color: 'gray',
  },
  activeTabText: {
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F3F4F6',
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4A5568',
  },
  itemText: {
    fontSize: 14,
    color: '#4A5568',
  },
  itemAmount: {
    fontSize: 14,
  },
  totalsContainer: {
    backgroundColor: 'white',
    padding: 16,
    marginTop: 8,
  },
  totalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  totalText: {
    fontSize: 14,
    color: 'gray',
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  downloadButton: {
    backgroundColor: '#1F2937',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  downloadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
