import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { getTheme } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  LogOut,
  Mail,
  Briefcase,
  Phone,
  Calendar,
  Hash,
  PersonStanding,
} from 'lucide-react-native';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { darkMode } = useTheme();
  const { translations } = useLanguage();
  const theme = getTheme(darkMode);
  const styles = getStyles(theme);

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>No user data available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: `https://i.pravatar.cc/150?u=${user.email}` }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.role}>{user.role}</Text>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Mail size={20} color={theme.colors.text.secondary} />
          <Text style={styles.infoText}>{user.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Briefcase size={20} color={theme.colors.text.secondary} />
          <Text style={styles.infoText}>{user.role}</Text>
        </View>
        <View style={styles.infoRow}>
          <PersonStanding size={20} color={theme.colors.text.secondary} />
          <Text style={styles.infoText}>{user.gender}</Text>
        </View>
        <View style={styles.infoRow}>
          <Phone size={20} color={theme.colors.text.secondary} />
          <Text style={styles.infoText}>{user.mobile}</Text>
        </View>
        <View style={styles.infoRow}>
          <Hash size={20} color={theme.colors.text.secondary} />
          <Text style={styles.infoText}>{user.passport_nid}</Text>
        </View>
        <View style={styles.infoRow}>
          <Calendar size={20} color={theme.colors.text.secondary} />
          <Text style={styles.infoText}>{user.date_of_joining}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
        <LogOut size={20} color={theme.colors.white} />
        <Text style={styles.logoutButtonText}>{translations.logout}</Text>
      </TouchableOpacity>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
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
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: theme.colors.text.primary,
  },
  role: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
  infoContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text.primary,
    marginLeft: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.red[500],
    borderRadius: 8,
    paddingVertical: 16,
  },
  logoutButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.white,
    marginLeft: 8,
  },
});
