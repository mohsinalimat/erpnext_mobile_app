import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import InfoModal from '@/components/profile/InfoModal';
import { useAuth } from '@/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '@/constants/theme';
import { useLanguage } from '@/context/LanguageContext';
import { getCompanyInfo, getSalarySlips } from '@/services/api';
import {
  LogOut,
  User,
  Building,
  Phone,
  CreditCard,
  Settings,
  ChevronRight,
} from 'lucide-react-native';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { translations } = useLanguage();
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalData, setModalData] = useState<{ label: string; value: string }[]>([]);
  const [companyInfo, setCompanyInfo] = useState<any>({});
  const [salaryInfo, setSalaryInfo] = useState<any>({});

  useEffect(() => {
    const fetchServerUrl = async () => {
      const url = await AsyncStorage.getItem('serverUrl');
      setServerUrl(url);
    };
    const fetchCompanyInfo = async () => {
      if (user) {
        const info = await getCompanyInfo(user.email);
        setCompanyInfo(info);
      }
    };
    const fetchSalaryInfo = async () => {
      if (user) {
        const info = await getSalarySlips(user.id);
        if (info.length > 0) {
          setSalaryInfo(info[0]);
        }
      }
    };
    fetchServerUrl();
    fetchCompanyInfo();
    fetchSalaryInfo();
  }, [user]);

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>No user data available.</Text>
      </View>
    );
  }

  const menuItems = [
    {
      title: 'Employee Details',
      icon: <User size={20} color={theme.colors.text.secondary} />,
      onPress: () => {
        setModalTitle('Employee Details');
        setModalData([
          { label: 'Gender', value: user.gender },
          { label: 'Passport/NID', value: user.passport_nid },
          { label: 'Date of Joining', value: user.date_of_joining },
        ]);
        setModalVisible(true);
      },
    },
    {
      title: 'Company Information',
      icon: <Building size={20} color={theme.colors.text.secondary} />,
      onPress: () => {
        setModalTitle('Company Information');
        setModalData([
          { label: 'Company', value: companyInfo.company || '-' },
          { label: 'Department', value: companyInfo.department || '-' },
          { label: 'Designation', value: companyInfo.designation || '-' },
          { label: 'Branch', value: companyInfo.branch || '-' },
          { label: 'Grade', value: companyInfo.grade || '-' },
          { label: 'Reports to', value: companyInfo.reports_to || '-' },
          { label: 'Employment Type', value: companyInfo.employment_type || '-' },
        ]);
        setModalVisible(true);
      },
    },
    {
      title: 'Contact Information',
      icon: <Phone size={20} color={theme.colors.text.secondary} />,
      onPress: () => {
        setModalTitle('Contact Information');
        setModalData([
          { label: 'Email', value: user.email },
          { label: 'Mobile', value: user.mobile },
        ]);
        setModalVisible(true);
      },
    },
    {
      title: 'Salary Information',
      icon: <CreditCard size={20} color={theme.colors.text.secondary} />,
      onPress: () => {
        setModalTitle('Salary Information');
        setModalData([
          { label: 'Last Posting Date', value: salaryInfo.posting_date || '-' },
          { label: 'Gross Pay', value: salaryInfo.gross_pay || '-' },
          { label: 'Net Pay', value: salaryInfo.net_pay || '-' },
        ]);
        setModalVisible(true);
      },
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{
            uri: user.user_image
              ? `${serverUrl}${user.user_image}`
              : `https://i.pravatar.cc/150?u=${user.email}`,
          }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.role}>{user.role}</Text>
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress}>
            <View style={styles.menuItemIcon}>{item.icon}</View>
            <Text style={styles.menuItemText}>{item.title}</Text>
            <ChevronRight size={20} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
          <View style={styles.menuItemIcon}>
            <Settings size={20} color={theme.colors.text.secondary} />
          </View>
          <Text style={styles.menuItemText}>Settings</Text>
          <ChevronRight size={20} color={theme.colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
        <LogOut size={20} color={theme.colors.red[500]} />
        <Text style={styles.logoutButtonText}>{translations.logout}</Text>
      </TouchableOpacity>

      <InfoModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalTitle}
        data={modalData}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: theme.colors.text.primary,
  },
  role: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
  menuContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  menuItemIcon: {
    marginRight: 16,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text.primary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: theme.colors.red[500],
  },
  logoutButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.red[500],
    marginLeft: 8,
  },
});
