import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { fetchDocTypeData } from '@/services/api';

interface LeaveApplication {
  name: string;
  leave_type: string;
  status: string;
  from_date: string;
  to_date: string;
}

const LeaveApplicationDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const [leave, setLeave] = useState<LeaveApplication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getLeave = async () => {
      try {
        const data = await fetchDocTypeData('Leave Application', ['name', 'leave_type', 'status', 'from_date', 'to_date'], [['name', '=', id]]);
        if (data.length > 0) {
          setLeave(data[0]);
        }
      } catch (error) {
        console.error('Error fetching leave:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      getLeave();
    }
  }, [id]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!leave) {
    return (
      <View style={styles.container}>
        <Text>Leave application not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{leave.leave_type}</Text>
      <Text>From: {leave.from_date} To: {leave.to_date}</Text>
      <Text>Status: {leave.status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

export default LeaveApplicationDetailScreen;
