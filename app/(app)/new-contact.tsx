import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { Checkbox } from 'react-native-paper';
import { theme } from '@/constants/theme';
import { router } from 'expo-router';
import { createDoc } from '@/services/api';

interface Email {
  email_id: string;
  is_primary: boolean;
}

interface Mobile {
  mobile_no: string;
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

  const handleAddEmail = () => {
    const newEmail: Email = { email_id: '', is_primary: emails.length === 0 };
    setEmails([...emails, newEmail]);
  };

  const handleAddMobile = () => {
    const newMobile: Mobile = {
      mobile_no: '',
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

    const primaryEmail = emails.find((email) => email.is_primary);
    const primaryMobile = mobileNumbers.find((mobile) => mobile.is_primary_mobile);

    setLoading(true);
    try {
      await createDoc('Contact', {
        first_name: firstName,
        last_name: lastName,
        designation: designation,
        gender: gender,
        company_name: companyName,
        email_id: primaryEmail ? primaryEmail.email_id : '',
        mobile_no: primaryMobile ? primaryMobile.mobile_no : '',
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
      <Text style={styles.label}>First Name</Text>
      <TextInput
        style={styles.input}
        value={firstName}
        onChangeText={setFirstName}
        placeholder="Enter first name"
        placeholderTextColor={theme.colors.text.secondary}
      />
      <Text style={styles.label}>Last Name</Text>
      <TextInput
        style={styles.input}
        value={lastName}
        onChangeText={setLastName}
        placeholder="Enter last name"
        placeholderTextColor={theme.colors.text.secondary}
      />
      <Text style={styles.label}>Designation</Text>
      <TextInput
        style={styles.input}
        value={designation}
        onChangeText={setDesignation}
        placeholder="Enter designation"
        placeholderTextColor={theme.colors.text.secondary}
      />
      <Text style={styles.label}>Gender</Text>
      <TextInput
        style={styles.input}
        value={gender}
        onChangeText={setGender}
        placeholder="Enter gender"
        placeholderTextColor={theme.colors.text.secondary}
      />
      <Text style={styles.label}>Company Name</Text>
      <TextInput
        style={styles.input}
        value={companyName}
        onChangeText={setCompanyName}
        placeholder="Enter company name"
        placeholderTextColor={theme.colors.text.secondary}
      />

      <Text style={styles.label}>Email IDs</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.headerCell}>No.</Text>
          <Text style={styles.headerCell}>Email ID</Text>
          <Text style={styles.headerCell}>Is Primary</Text>
        </View>
        {emails.map((item, index) => (
          <View style={styles.tableRow} key={index}>
            <Text style={styles.tableCell}>{index + 1}</Text>
            <TextInput
              style={styles.tableInput}
              value={item.email_id}
              onChangeText={(text) => {
                const updatedEmails = [...emails];
                updatedEmails[index].email_id = text;
                setEmails(updatedEmails);
              }}
            />
            <Checkbox
              status={item.is_primary ? 'checked' : 'unchecked'}
              onPress={() => setPrimaryEmail(index)}
            />
          </View>
        ))}
      </View>
      <TouchableOpacity style={styles.addRowButton} onPress={handleAddEmail}>
        <Text style={styles.addRowButtonText}>Add Row</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Contact Numbers</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.headerCell}>No.</Text>
          <Text style={styles.headerCell}>Number</Text>
          <Text style={styles.headerCell}>Is Primary Phone</Text>
          <Text style={styles.headerCell}>Is Primary Mobile</Text>
        </View>
        {mobileNumbers.map((item, index) => (
          <View style={styles.tableRow} key={index}>
            <Text style={styles.tableCell}>{index + 1}</Text>
            <TextInput
              style={styles.tableInput}
              value={item.mobile_no}
              onChangeText={(text) => {
                const updatedMobiles = [...mobileNumbers];
                updatedMobiles[index].mobile_no = text;
                setMobileNumbers(updatedMobiles);
              }}
            />
            <Checkbox
              status={item.is_primary_phone ? 'checked' : 'unchecked'}
              onPress={() => setPrimaryMobile(index, 'phone')}
            />
            <Checkbox
              status={item.is_primary_mobile ? 'checked' : 'unchecked'}
              onPress={() => setPrimaryMobile(index, 'mobile')}
            />
          </View>
        ))}
      </View>
      <TouchableOpacity style={styles.addRowButton} onPress={handleAddMobile}>
        <Text style={styles.addRowButtonText}>Add Row</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSaveContact}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Save'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 40,
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
  saveButton: {
    backgroundColor: theme.colors.primary[500],
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: 'bold',
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
    flex: 1,
    fontWeight: 'bold',
    fontSize: 14,
    color: theme.colors.text.primary,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  tableCell: {
    flex: 0.2,
    fontSize: 14,
    color: theme.colors.text.primary,
  },
  tableInput: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text.primary,
    padding: 4,
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: 4,
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
});
