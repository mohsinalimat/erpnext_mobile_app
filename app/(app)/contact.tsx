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
        <View style={styles.itemHeader}>
          <Feather name="user" size={24} color={theme.colors.primary[500]} />
          <Text style={styles.itemTitle}>{item.first_name} {item.last_name}</Text>
        </View>
        <View style={styles.itemRow}>
          <Feather name="briefcase" size={16} color={theme.colors.text.secondary} />
          <Text style={styles.itemSubtitle}>{item.designation}</Text>
        </View>
        <View style={styles.itemRow}>
          <Feather name="info" size={16} color={theme.colors.text.secondary} />
          <Text style={styles.itemSubtitle}>{item.gender}</Text>
        </View>
        <View style={styles.itemRow}>
          <Feather name="grid" size={16} color={theme.colors.text.secondary} />
          <Text style={styles.itemSubtitle}>{item.company_name}</Text>
        </View>
        <View style={styles.itemRow}>
          <Feather name="mail" size={16} color={theme.colors.text.secondary} />
          <Text style={styles.itemSubtitle}>{item.email_id}</Text>
        </View>
        <View style={styles.itemRow}>
          <Feather name="phone" size={16} color={theme.colors.text.secondary} />
          <Text style={styles.itemSubtitle}>{item.mobile_no}</Text>
        </View>
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
      {filteredContacts.length > 0 ? (
        <FlatList
          data={filteredContacts}
          renderItem={renderItem}
          keyExtractor={(item) => item.name}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.center}>
          <Text>No contacts found.</Text>
        </View>
      )}
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginLeft: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginLeft: 8,
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
