import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

type LanguageContextType = {
  language: string;
  setLanguage: (language: string) => void;
  translations: any;
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  translations: {},
});

export const useLanguage = () => useContext(LanguageContext);

const translations: { [key: string]: { [key: string]: string } } = {
  en: {
    home: 'Home',
    profile: 'Profile',
    settings: 'Settings',
    customers: 'Customers',
    items: 'Items',
    quotation: 'Quotation',
    sales_order: 'Sales Order',
    tasks: 'Tasks',
    check_in_out: 'Check In/Out',
    edit: 'Edit',
    app_preferences: 'App Preferences',
    push_notifications: 'Push Notifications',
    dark_mode: 'Dark Mode',
    sync_interval: 'Sync Interval',
    offline_mode: 'Offline Mode',
    account_security: 'Account & Security',
    account_information: 'Account Information',
    security: 'Security',
    language: 'Language',
    help_support: 'Help & Support',
    documentation: 'Documentation',
    help_center: 'Help Center',
    terms_privacy: 'Terms & Privacy',
    version: 'Version',
    gender: 'Gender',
    mobile: 'Mobile',
    passport_nid: 'Passport/NID',
    date_of_joining: 'Date of Joining',
    logout: 'Logout',
  },
  bn: {
    home: 'হোম',
    profile: 'প্রোফাইল',
    settings: 'সেটিংস',
    customers: 'গ্রাহক',
    items: 'আইটেম',
    quotation: 'দর',
    sales_order: 'বিক্রয় আদেশ',
    tasks: 'কাজ',
    check_in_out: 'চেক ইন/আউট',
    edit: 'সম্পাদনা',
    app_preferences: 'অ্যাপ পছন্দ',
    push_notifications: 'পুশ বিজ্ঞপ্তি',
    dark_mode: 'ডার্ক মোড',
    sync_interval: 'সিঙ্ক ব্যবধান',
    offline_mode: 'অফলাইন মোড',
    account_security: 'অ্যাকাউন্ট এবং নিরাপত্তা',
    account_information: 'অ্যাকাউন্টের তথ্য',
    security: 'নিরাপত্তা',
    language: 'ভাষা',
    help_support: 'সাহায্য ও поддержка',
    documentation: 'ডকুমেন্টেশন',
    help_center: 'সহায়তা কেন্দ্র',
    terms_privacy: 'শর্তাবলী এবং গোপনীয়তা',
    version: 'সংস্করণ',
    gender: 'লিঙ্গ',
    mobile: 'মোবাইল',
    passport_nid: 'পাসপোর্ট/এনআইডি',
    date_of_joining: 'যোগদানের তারিখ',
    logout: 'লগআউট',
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState('en');

  useEffect(() => {
    const loadLanguagePreference = async () => {
      const storedPreference = await getLanguagePreference();
      if (storedPreference) {
        setLanguageState(storedPreference);
      }
    };

    loadLanguagePreference();
  }, []);

  const setLanguage = async (lang: string) => {
    setLanguageState(lang);
    await storeLanguagePreference(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translations: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

const storeLanguagePreference = async (value: string) => {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem('language', value);
    } else {
      await SecureStore.setItemAsync('language', value);
    }
  } catch (error) {
    console.error('Failed to save language preference', error);
  }
};

const getLanguagePreference = async (): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem('language');
    } else {
      return await SecureStore.getItemAsync('language');
    }
  } catch (error) {
    console.error('Failed to load language preference', error);
    return null;
  }
};
