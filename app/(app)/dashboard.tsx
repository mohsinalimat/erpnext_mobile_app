import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { fetchDashboardData } from '@/services/api';
import { theme } from '@/constants/theme';
import DashboardCard from '@/components/dashboard/DashboardCard';
import DashboardChart from '@/components/dashboard/DashboardChart';
import AlertCard from '@/components/dashboard/AlertCard';

export default function DashboardScreen() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    if (user) {
      try {
        const dashboardData = await fetchDashboardData(user.id);
        setData(dashboardData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {data.alerts?.map((alert: any, index: number) => (
        <AlertCard key={index} title={alert.title} message={alert.message} type={alert.type} />
      ))}

      <View style={styles.cardContainer}>
        <DashboardCard
          title="Sales This Month"
          value={`$${(data.salesTotal || 0).toLocaleString()}`}
          icon="dollar-sign"
          color={theme.colors.primary[500]}
        />
      </View>
      <View style={styles.cardContainer}>
        <DashboardCard
          title="New Customers"
          value={data.totalCustomers || 0}
          icon="users"
          color={theme.colors.success[500]}
        />
      </View>
      <View style={styles.cardContainer}>
        <DashboardCard
          title="Open Orders"
          value={data.openOrders || 0}
          icon="shopping-cart"
          color={theme.colors.warning[500]}
        />
      </View>
      <View style={styles.cardContainer}>
        <DashboardCard
          title="Total Items"
          value={data.totalItems || 0}
          icon="package"
          color={theme.colors.info[500]}
        />
      </View>

      <View style={styles.cardContainer}>
        <DashboardChart data={data.monthlySales || []} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  cardContainer: {
    marginVertical: 8,
    marginHorizontal: 16,
  },
});
