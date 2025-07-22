import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { fetchDocTypeData } from '@/services/api';
import { theme } from '@/constants/theme';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function ContactScreen() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const params = useLocalSearchParams();
  const fromNewCustomer = params.from === '/(app)/new-customer';

  const fetchContacts = async () => {
    try {
      const data = await fetchDocTypeData('Contact', [
        'name',
        'first_name',
        'last_name',
        'designation',
        'gender',
        'company_name',
        'email_id',
        'mobile_no',
      ]);
      setContacts(data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchContacts();
    }, [])
  );

  const handleSelectContact = (contact: any) => {
    if (fromNewCustomer) {
      router.push({
        pathname: '/(app)/new-customer',
        params: { selectedContact: contact.name },
      });
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => handleSelectContact(item)} disabled={!fromNewCustomer}>
      <View style={styles.itemContainer}>
        <Text style={styles.itemTitle}>{item.first_name} {item.last_name}</Text>
        <Text style={styles.itemSubtitle}>{item.designation}</Text>
        <Text style={styles.itemSubtitle}>{item.gender}</Text>
        <Text style={styles.itemSubtitle}>{item.company_name}</Text>
        <Text style={styles.itemSubtitle}>{item.email_id}</Text>
        <Text style={styles.itemSubtitle}>{item.mobile_no}</Text>
      </View>
    </TouchableOpacity>
  );

  const filteredContacts = useMemo(() => {
    return contacts.filter(contact =>
      `${contact.first_name} ${contact.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [contacts, searchQuery]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search Contacts..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={filteredContacts}
        renderItem={renderItem}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.listContainer}
      />
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => router.push('/(app)/new-contact')}
      >
        <Feather name="plus" size={24} color={theme.colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchInput: {
    height: 40,
    borderColor: theme.colors.gray[300],
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    margin: 16,
    backgroundColor: theme.colors.white,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  itemContainer: {
    backgroundColor: theme.colors.white,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  itemSubtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  createButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: theme.colors.primary[500],
    borderRadius: 50,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
