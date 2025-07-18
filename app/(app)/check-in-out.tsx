import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { theme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { getCheckIns, createCheckIn } from '@/services/api';

interface CheckInData {
  name: string;
  log_type: 'IN' | 'OUT';
  creation: string;
}

const CheckInOutScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [checkInData, setCheckInData] = useState<CheckInData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCheckInData = useCallback(async () => {
    if (!user?.email) return;
    try {
      setLoading(true);
      const data = await getCheckIns(user.email);
      setCheckInData(data);
    } catch (error) {
      console.error('Failed to fetch check-in data:', error);
      Alert.alert('Error', 'Failed to load check-in data.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchCheckInData();
    }, [fetchCheckInData])
  );

  const handleCheckIn = async (logType: 'IN' | 'OUT') => {
    if (!user?.email) {
      Alert.alert('Error', 'You must be logged in to perform this action.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await createCheckIn({
        employee: user.email,
        log_type: logType,
        // In a real app, you might get location data
        // device_id: 'some-device-id', 
      });
      Alert.alert('Success', `Successfully checked ${logType.toLowerCase()}.`);
      fetchCheckInData(); // Refresh data
    } catch (error) {
      console.error(`Failed to check ${logType.toLowerCase()}:`, error);
      Alert.alert('Error', `Failed to submit check-${logType.toLowerCase()} record.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderItem = ({ item }: { item: CheckInData }) => (
    <View style={styles.logItem}>
      <Ionicons 
        name={item.log_type === 'IN' ? 'arrow-down-circle' : 'arrow-up-circle'}
        size={24} 
        color={item.log_type === 'IN' ? theme.colors.success[500] : theme.colors.error[500]} 
      />
      <View style={styles.logDetails}>
        <Text style={styles.logType}>Checked {item.log_type}</Text>
        <Text style={styles.logTime}>{new Date(item.creation).toLocaleString()}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Check In / Out</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.checkInButton]} 
          onPress={() => handleCheckIn('IN')}
          disabled={isSubmitting}
        >
          {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Check In</Text>}
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.checkOutButton]} 
          onPress={() => handleCheckIn('OUT')}
          disabled={isSubmitting}
        >
          {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Check Out</Text>}
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} size="large" color={theme.colors.primary[500]} />
      ) : (
        <FlatList
          data={checkInData}
          renderItem={renderItem}
          keyExtractor={(item) => item.name}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<Text style={styles.emptyText}>No check-in records found.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.gray[50],
  },
  header: {
    backgroundColor: theme.colors.primary[500],
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: theme.colors.white,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 10,
  },
  checkInButton: {
    backgroundColor: theme.colors.success[500],
  },
  checkOutButton: {
    backgroundColor: theme.colors.error[500],
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  listContainer: {
    padding: 20,
  },
  logItem: {
    backgroundColor: theme.colors.white,
    padding: 15,
    borderRadius: theme.radius.md,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  logDetails: {
    marginLeft: 15,
  },
  logType: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text.primary,
  },
  logTime: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
});

export default CheckInOutScreen;
