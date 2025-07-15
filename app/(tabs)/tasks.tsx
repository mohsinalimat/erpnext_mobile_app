import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Button } from 'react-native';
import { getTasks } from '@/services/erpnext';
import { theme } from '@/constants/theme';
import { router } from 'expo-router';

export default function TasksScreen() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const data = await getTasks();
        setTasks(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load tasks');
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (tasks.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No tasks found.</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemTitle}>{item.subject}</Text>
      <Text>Status: {item.status}</Text>
      <Text>Start Date: {item.exp_start_date}</Text>
      <Text>End Date: {item.exp_end_date}</Text>
    </View>
  );

  return (
    <View style={{flex: 1}}>
      <View style={{ padding: 10 }}>
        <Button title="New Task" onPress={() => router.push('/new-task')} />
      </View>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.name}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  errorText: {
    color: theme.colors.error[500],
  },
  listContainer: {
    padding: 16,
    backgroundColor: theme.colors.background,
  },
  itemContainer: {
    backgroundColor: theme.colors.white,
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 16,
  },
});
