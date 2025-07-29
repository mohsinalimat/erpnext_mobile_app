import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { fetchDocTypeData } from '../../services/api';
import { Feather } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { router } from 'expo-router';

interface LeaveApplication {
  name: string;
  leave_type: string;
  status: string;
  from_date: string;
  to_date: string;
}

const LeavesScreen = () => {
  const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getLeaves = async () => {
      try {
        const data = await fetchDocTypeData('Leave Application', ['name', 'leave_type', 'status', 'from_date', 'to_date']);
        setLeaves(data);
      } catch (error) {
        console.error('Error fetching leaves:', error);
      } finally {
        setLoading(false);
      }
    };

    getLeaves();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return theme.colors.success[500];
      case 'Rejected':
        return theme.colors.error[500];
      default:
        return theme.colors.warning[500];
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leave Applications</Text>
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        data={leaves}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.leave_type}</Text>
              <Text style={[styles.status, { backgroundColor: getStatusColor(item.status) }]}>{item.status}</Text>
            </View>
            <View style={styles.cardBody}>
              <View style={styles.dateContainer}>
                <Feather name="calendar" size={16} color={theme.colors.gray[500]} />
                <Text style={styles.dateText}>{item.from_date} to {item.to_date}</Text>
              </View>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContainer}
      />
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/leave-application' as any)}>
        <Feather name="plus" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  status: {
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardBody: {
    // Add styles for the card body if needed
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    marginLeft: 8,
    fontSize: 14,
    color: theme.colors.gray[600],
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: theme.colors.primary[500],
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
});

export default LeavesScreen;
