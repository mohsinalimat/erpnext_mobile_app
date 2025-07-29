import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { getCheckIns } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

type CheckIn = {
  name: string;
  log_type: 'IN' | 'OUT';
  creation: string;
};

type GroupedCheckIns = {
  [key: string]: CheckIn[];
};

export default function AttendanceScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCheckIns = useCallback(() => {
    if (user?.email) {
      setLoading(true);
      getCheckIns(user.email)
        .then(setCheckIns)
        .catch(error => {
          console.error(error);
          Alert.alert('Error', 'Failed to fetch attendance records.');
        })
        .finally(() => {
          setLoading(false);
          setRefreshing(false);
        });
    }
  }, [user]);

  useEffect(() => {
    fetchCheckIns();
  }, [fetchCheckIns]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCheckIns();
  }, [fetchCheckIns]);

  const groupedCheckIns = checkIns.reduce((acc: GroupedCheckIns, item) => {
    const date = format(new Date(item.creation), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {});

  const renderItem = ({ item }: { item: CheckIn }) => (
    <View style={styles.itemContainer}>
      <Text>{item.log_type}</Text>
      <Text>{format(new Date(item.creation), 'hh:mm a')}</Text>
    </View>
  );

  const renderGroup = ({ item: date }: { item: string }) => (
    <View>
      <Text style={styles.groupTitle}>{format(new Date(date), 'MMMM dd, yyyy')}</Text>
      <FlatList
        data={groupedCheckIns[date]}
        renderItem={renderItem}
        keyExtractor={(item) => item.name}
      />
    </View>
  );

  if (loading && !refreshing) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Attendance</Text>
        <TouchableOpacity
          style={styles.checkInButton}
          onPress={() => router.push('/check-in-out')}
        >
          <Text style={styles.checkInButtonText}>Check In</Text>
        </TouchableOpacity>
      </View>
      {Object.keys(groupedCheckIns).length > 0 ? (
        <FlatList
          data={Object.keys(groupedCheckIns).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())}
          renderItem={renderGroup}
          keyExtractor={(item) => item}
          style={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text>No attendance records found.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  checkInButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  checkInButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#fff',
    marginLeft: 16,
    marginRight: 16,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
