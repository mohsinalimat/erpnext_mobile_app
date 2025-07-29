import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView, Modal, FlatList, TouchableWithoutFeedback, TextInput } from 'react-native';
import { Checkbox } from 'react-native-paper';
import { theme } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { createDoc, fetchDocTypeData, searchDoctype } from '@/services/api';
import { useDebounce } from '@/hooks/useDebounce';
import Card from '@/components/common/Card';
import FormField from '@/components/common/FormField';
import Button from '@/components/common/Button';

interface LinkNameData {
  id: string;
  title: string;
}

interface Email {
  email_id: string;
  is_primary: boolean;
}

interface Mobile {
  phone: string;
  is_primary_phone: boolean;
  is_primary_mobile: boolean;
}

export default function NewContactScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [designation, setDesignation] = useState('');
  const [gender, setGender] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [emails, setEmails] = useState<Email[]>([]);
  const [mobileNumbers, setMobileNumbers] = useState<Mobile[]>([]);
  const [loading, setLoading] = useState(false);
  const [links, setLinks] = useState([{ id: 1, link_doctype: '', link_name: '', link_title: '' }]);
  const [docTypes, setDocTypes] = useState<string[]>([]);
  const [isDocTypeModalVisible, setIsDocTypeModalVisible] = useState(false);
  const [isLinkNameModalVisible, setIsLinkNameModalVisible] = useState(false);
  const [linkNameData, setLinkNameData] = useState<LinkNameData[]>([]);
  const [docTypeSearchQuery, setDocTypeSearchQuery] = useState('');
  const [linkNameSearchQuery, setLinkNameSearchQuery] = useState('');
  const [currentRowId, setCurrentRowId] = useState<number | null>(null);
  const [currentLink, setCurrentLink] = useState<any>(null);

  const debouncedLinkNameSearchQuery = useDebounce(linkNameSearchQuery, 500);

  useEffect(() => {
    const loadDocTypes = async () => {
      try {
        const data = await fetchDocTypeData('DocType', ['name'], [['issingle', '=', 0]]);
        setDocTypes(data.map((d: any) => d.name));
      } catch (error) {
        console.error('Error fetching doctypes:', error);
      }
    };
    loadDocTypes();
  }, []);

  useEffect(() => {
    const searchLinkNames = async () => {
      if (debouncedLinkNameSearchQuery.length > 0) {
        const currentLink = links.find(l => l.id === currentRowId);
        if (currentLink) {
          const data = await searchDoctype(currentLink.link_doctype, debouncedLinkNameSearchQuery);
          setLinkNameData(data);
        }
      } else {
        setLinkNameData([]);
      }
    };
    searchLinkNames();
  }, [debouncedLinkNameSearchQuery, currentRowId]);

  const handleAddLinkRow = () => {
    setLinks([...links, { id: links.length + 1, link_doctype: '', link_name: '', link_title: '' }]);
  };

  const handleRemoveLinkRow = (id: number) => {
    setLinks(links.filter(row => row.id !== id));
  };

  const handleAddEmail = () => {
    const newEmail: Email = { email_id: '', is_primary: emails.length === 0 };
    setEmails([...emails, newEmail]);
  };

  const handleAddMobile = () => {
    const newMobile: Mobile = {
      phone: '',
      is_primary_phone: mobileNumbers.length === 0,
      is_primary_mobile: mobileNumbers.length === 0,
    };
    setMobileNumbers([...mobileNumbers, newMobile]);
  };

  const setPrimaryEmail = (index: number) => {
    const updatedEmails = emails.map((email, i) => ({
      ...email,
      is_primary: i === index,
    }));
    setEmails(updatedEmails);
  };

  const setPrimaryMobile = (index: number, type: 'phone' | 'mobile') => {
    const updatedMobiles = mobileNumbers.map((mobile, i) => ({
      ...mobile,
      is_primary_phone: type === 'phone' ? i === index : false,
      is_primary_mobile: type === 'mobile' ? i === index : false,
    }));
    setMobileNumbers(updatedMobiles);
  };

  const handleSaveContact = async () => {
    if (!firstName) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      await createDoc('Contact', {
        first_name: firstName,
        last_name: lastName,
        designation: designation,
        gender: gender,
        company_name: companyName,
        email_ids: emails,
        phone_nos: mobileNumbers,
        links: links.map(({ id, ...rest }) => rest),
      });
      Alert.alert('Success', 'Contact saved successfully.');
      router.back();
    } catch (error) {
      console.error('Error saving contact:', error);
      Alert.alert('Error', 'Failed to save contact.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card>
        <FormField
          label="First Name"
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Enter first name"
          placeholderTextColor={theme.colors.text.secondary}
        />
        <FormField
          label="Last Name"
          value={lastName}
          onChangeText={setLastName}
          placeholder="Enter last name"
          placeholderTextColor={theme.colors.text.secondary}
        />
        <FormField
          label="Designation"
          value={designation}
          onChangeText={setDesignation}
          placeholder="Enter designation"
          placeholderTextColor={theme.colors.text.secondary}
        />
        <FormField
          label="Gender"
          value={gender}
          onChangeText={setGender}
          placeholder="Enter gender"
          placeholderTextColor={theme.colors.text.secondary}
        />
        <FormField
          label="Company Name"
          value={companyName}
          onChangeText={setCompanyName}
          placeholder="Enter company name"
          placeholderTextColor={theme.colors.text.secondary}
        />
      </Card>

      <Card>
        <Text style={styles.label}>Email IDs</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, { flex: 0.15, textAlign: 'center' }]}>No.</Text>
            <Text style={[styles.headerCell, { flex: 0.55 }]}>Email ID</Text>
            <Text style={[styles.headerCell, { flex: 0.3, textAlign: 'center' }]}>Is Primary</Text>
          </View>
          {emails.map((item, index) => (
            <View style={styles.tableRow} key={index}>
              <Text style={[styles.tableCell, { flex: 0.15, textAlign: 'center' }]}>{index + 1}</Text>
              <View style={{ flex: 0.55 }}>
                <FormField
                  value={item.email_id}
                  onChangeText={(text) => {
                    const updatedEmails = [...emails];
                    updatedEmails[index].email_id = text;
                    setEmails(updatedEmails);
                  }}
                />
              </View>
              <View style={{ flex: 0.3, alignItems: 'center' }}>
                <Checkbox
                  status={item.is_primary ? 'checked' : 'unchecked'}
                  onPress={() => setPrimaryEmail(index)}
                />
              </View>
            </View>
          ))}
        </View>
        <TouchableOpacity style={styles.addRowButton} onPress={handleAddEmail}>
          <Text style={styles.addRowButtonText}>Add Row</Text>
        </TouchableOpacity>
      </Card>

      <Card>
        <Text style={styles.label}>Contact Numbers</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, { flex: 0.1, textAlign: 'center' }]}>No.</Text>
            <Text style={[styles.headerCell, { flex: 0.4 }]}>Number</Text>
            <Text style={[styles.headerCell, { flex: 0.25, textAlign: 'center' }]}>Is Primary Phone</Text>
            <Text style={[styles.headerCell, { flex: 0.25, textAlign: 'center' }]}>Is Primary Mobile</Text>
          </View>
          {mobileNumbers.map((item, index) => (
            <View style={styles.tableRow} key={index}>
              <Text style={[styles.tableCell, { flex: 0.1, textAlign: 'center' }]}>{index + 1}</Text>
              <View style={{ flex: 0.4 }}>
                <FormField
                  value={item.phone}
                  onChangeText={(text) => {
                    const updatedMobiles = [...mobileNumbers];
                    updatedMobiles[index].phone = text;
                    setMobileNumbers(updatedMobiles);
                  }}
                />
              </View>
              <View style={{ flex: 0.25, alignItems: 'center' }}>
                <Checkbox
                  status={item.is_primary_phone ? 'checked' : 'unchecked'}
                  onPress={() => setPrimaryMobile(index, 'phone')}
                />
              </View>
              <View style={{ flex: 0.25, alignItems: 'center' }}>
                <Checkbox
                  status={item.is_primary_mobile ? 'checked' : 'unchecked'}
                  onPress={() => setPrimaryMobile(index, 'mobile')}
                />
              </View>
            </View>
          ))}
        </View>
        <TouchableOpacity style={styles.addRowButton} onPress={handleAddMobile}>
          <Text style={styles.addRowButtonText}>Add Row</Text>
        </TouchableOpacity>
      </Card>

      <Card>
        <Text style={styles.label}>Links</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 0.1, textAlign: 'center' }]}>No.</Text>
            <Text style={[styles.tableHeaderText, { flex: 0.25 }]}>Link Document Type</Text>
            <Text style={[styles.tableHeaderText, { flex: 0.25 }]}>Link Name</Text>
            <Text style={[styles.tableHeaderText, { flex: 0.25 }]}>Link Title</Text>
            <Text style={[styles.tableHeaderText, { flex: 0.15 }]}></Text>
          </View>
          {links.map((row, index) => (
            <View key={`${row.id}-${row.link_doctype}-${row.link_name}`} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 0.1, textAlign: 'center' }]}>{index + 1}</Text>
              <TouchableOpacity
                style={[styles.tableInput, { flex: 0.25 }]}
                onPress={() => {
                  setCurrentRowId(row.id);
                  setCurrentLink(row);
                  setIsDocTypeModalVisible(true);
                }}
              >
                <Text numberOfLines={1}>{row.link_doctype || 'Select Document Type'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tableInput, { flex: 0.25 }]}
                onPress={() => {
                  if (row.link_doctype) {
                    setCurrentRowId(row.id);
                    setCurrentLink(row);
                    setIsLinkNameModalVisible(true);
                  } else {
                    Alert.alert('Error', 'Please select a Link Document Type first.');
                  }
                }}
              >
                <Text numberOfLines={1}>{row.link_name || 'Select Link Name'}</Text>
              </TouchableOpacity>
              <TextInput
                style={[styles.tableInput, { flex: 0.25, backgroundColor: theme.colors.gray[100] }]}
                value={row.link_title}
                editable={false}
                placeholder="Link Title"
                numberOfLines={1}
              />
              <TouchableOpacity onPress={() => handleRemoveLinkRow(row.id)} style={{ flex: 0.15, alignItems: 'center' }}>
                <Feather name="trash-2" size={20} color={theme.colors.error[500]} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
        <TouchableOpacity onPress={handleAddLinkRow} style={styles.addRowButton}>
          <Text style={styles.addRowButtonText}>Add Row</Text>
        </TouchableOpacity>
      </Card>

      <View style={{ marginBottom: 16 }}>
        <Button
          title={loading ? 'Saving...' : 'Save'}
          onPress={handleSaveContact}
          disabled={loading}
        />
      </View>

      <Modal
        transparent={true}
        visible={isDocTypeModalVisible}
        onRequestClose={() => setIsDocTypeModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsDocTypeModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TextInput
                style={styles.input}
                placeholder="Search DocType..."
                value={docTypeSearchQuery}
                onChangeText={setDocTypeSearchQuery}
              />
              <FlatList
                data={docTypes.filter(d => d.toLowerCase().includes(docTypeSearchQuery.toLowerCase()))}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      if (currentLink) {
                        const newLink = { ...currentLink, link_doctype: item, link_name: '', link_title: '' };
                        const newLinks = links.map(l => (l.id === currentLink.id ? newLink : l));
                        setLinks(newLinks);
                      }
                      setIsDocTypeModalVisible(false);
                      setDocTypeSearchQuery('');
                    }}
                  >
                    <Text>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        transparent={true}
        visible={isLinkNameModalVisible}
        onRequestClose={() => setIsLinkNameModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsLinkNameModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TextInput
                style={styles.input}
                placeholder="Search..."
                value={linkNameSearchQuery}
                onChangeText={setLinkNameSearchQuery}
              />
              <FlatList
                data={linkNameData}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      if (currentLink) {
                        const newLink = { ...currentLink, link_name: item.id, link_title: item.title };
                        const newLinks = links.map(l => (l.id === currentLink.id ? newLink : l));
                        setLinks(newLinks);
                      }
                      setIsLinkNameModalVisible(false);
                      setLinkNameSearchQuery('');
                      setLinkNameData([]);
                    }}
                  >
                    <Text>{item.title}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: theme.colors.background,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: theme.colors.text.primary,
  },
  input: {
    backgroundColor: theme.colors.white,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  table: {
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: 8,
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: theme.colors.gray[100],
    padding: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  headerCell: {
    fontWeight: 'bold',
    fontSize: 14,
    color: theme.colors.text.primary,
    paddingHorizontal: 4,
  },
  tableHeaderText: {
    flex: 1,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
    justifyContent: 'center',
  },
  tableCell: {
    fontSize: 14,
    color: theme.colors.text.primary,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  tableInput: {
    fontSize: 14,
    color: theme.colors.text.primary,
    padding: 4,
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: 4,
    backgroundColor: theme.colors.white,
    marginHorizontal: 4,
  },
  addRowButton: {
    backgroundColor: theme.colors.primary[500],
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  addRowButtonText: {
    color: theme.colors.white,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    padding: 16,
    width: '80%',
    maxHeight: '60%',
  },
  modalItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
});
