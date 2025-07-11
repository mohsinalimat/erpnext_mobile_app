import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { theme } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import DashboardCard from '@/components/dashboard/DashboardCard';
import DashboardChart from '@/components/dashboard/DashboardChart';
import AlertCard from '@/components/dashboard/AlertCard';
import { fetchDashboardData } from '@/services/api';
import { Clock, DollarSign, ShoppingCart, Users } from 'lucide-react-native';

export default function DashboardScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    salesTotal: 0,
    newCustomers: 0,
    openOrders: 0,
    pendingTasks: 0,
    alerts: [],
    recentSales: []
  });

  async function loadDashboardData() {
    try {
      const data = await fetchDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard data', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.headerSection}>
        <Text style={styles.welcomeText}>Good morning, {user?.name || 'User'}</Text>
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </View>

      <View style={styles.cardsContainer}>
        <View style={styles.cardRow}>
          <DashboardCard
            title="Sales"
            value={`$${dashboardData.salesTotal.toLocaleString()}`}
            icon={<DollarSign color={theme.colors.primary[500]} size={24} />}
            color={theme.colors.primary[500]}
            containerStyle={{ flex: 1, marginRight: 8 }}
          />
          <DashboardCard
            title="New Customers"
            value={dashboardData.newCustomers.toString()}
            icon={<Users color={theme.colors.secondary[500]} size={24} />}
            color={theme.colors.secondary[500]}
            containerStyle={{ flex: 1, marginLeft: 8 }}
          />
        </View>

        <View style={styles.cardRow}>
          <DashboardCard
            title="Open Orders"
            value={dashboardData.openOrders.toString()}
            icon={<ShoppingCart color={theme.colors.tertiary[500]} size={24} />}
            color={theme.colors.tertiary[500]}
            containerStyle={{ flex: 1, marginRight: 8 }}
          />
          <DashboardCard
            title="Pending Tasks"
            value={dashboardData.pendingTasks.toString()}
            icon={<Clock color={theme.colors.error[500]} size={24} />}
            color={theme.colors.error[500]}
            containerStyle={{ flex: 1, marginLeft: 8 }}
          />
        </View>
      </View>

      {dashboardData.alerts.length > 0 && (
        <View style={styles.alertsSection}>
          <Text style={styles.sectionTitle}>Alerts</Text>
          {dashboardData.alerts.map((alert, index) => (
            <AlertCard key={index} title={alert.title} message={alert.message} type={alert.type} />
          ))}
        </View>
      )}

      <View style={styles.chartsSection}>
        <Text style={styles.sectionTitle}>Sales Overview</Text>
        <DashboardChart />
      </View>

      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {dashboardData.recentSales.length === 0 ? (
          <Text style={styles.emptyText}>No recent activities</Text>
        ) : (
          dashboardData.recentSales.map((sale, index) => (
            <View key={index} style={styles.recentItem}>
              <View style={styles.recentItemIcon}>
                <DollarSign size={16} color={theme.colors.white} />
              </View>
              <View style={styles.recentItemContent}>
                <Text style={styles.recentItemTitle}>{sale.customer}</Text>
                <Text style={styles.recentItemSubtitle}>{sale.description}</Text>
              </View>
              <Text style={styles.recentItemAmount}>${sale.amount.toLocaleString()}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  headerSection: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text.secondary,
  },
  cardsContainer: {
    marginBottom: 24,
  },
  cardRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  alertsSection: {
    marginBottom: 24,
  },
  chartsSection: {
    marginBottom: 24,
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  recentSection: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[100],
  },
  recentItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recentItemContent: {
    flex: 1,
  },
  recentItemTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.text.primary,
  },
  recentItemSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text.secondary,
  },
  recentItemAmount: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.primary[500],
  },
  emptyText: {
    textAlign: 'center',
    padding: 16,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text.secondary,
  },
});