import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { theme } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { User, Bell, Globe, Shield, Moon, RefreshCw, Smartphone, LogOut, ChevronRight, CircleHelp as HelpCircle, FileText, BookOpen } from 'lucide-react-native';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [syncInterval, setSyncInterval] = useState('15 minutes');
  const [offlineMode, setOfflineMode] = useState(false);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          onPress: signOut,
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const handleSyncIntervalPress = () => {
    const intervals = ['5 minutes', '15 minutes', '30 minutes', '1 hour', 'Manual only'];
    
    if (Platform.OS === 'web') {
      const newInterval = prompt('Select sync interval', syncInterval);
      if (newInterval && intervals.includes(newInterval)) {
        setSyncInterval(newInterval);
      }
    } else {
      Alert.alert(
        'Sync Interval',
        'Select how often the app should sync with ERPNext',
        intervals.map(interval => ({
          text: interval,
          onPress: () => setSyncInterval(interval),
          style: interval === syncInterval ? 'default' : 'default',
        }))
      );
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.userInfoContainer}>
        <View style={styles.userInfoContent}>
          <View style={styles.userAvatar}>
            <Text style={styles.userInitials}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <View>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.editProfileButton}>
          <Text style={styles.editProfileText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Preferences</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingItemLeft}>
            <Bell size={20} color={theme.colors.text.secondary} style={styles.settingIcon} />
            <Text style={styles.settingText}>Push Notifications</Text>
          </View>
          <Switch
            value={pushNotifications}
            onValueChange={setPushNotifications}
            trackColor={{
              false: theme.colors.gray[300],
              true: theme.colors.primary[400],
            }}
            thumbColor={theme.colors.white}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingItemLeft}>
            <Moon size={20} color={theme.colors.text.secondary} style={styles.settingIcon} />
            <Text style={styles.settingText}>Dark Mode</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={toggleDarkMode}
            trackColor={{
              false: theme.colors.gray[300],
              true: theme.colors.primary[400],
            }}
            thumbColor={theme.colors.white}
          />
        </View>

        <TouchableOpacity style={styles.settingItem} onPress={handleSyncIntervalPress}>
          <View style={styles.settingItemLeft}>
            <RefreshCw size={20} color={theme.colors.text.secondary} style={styles.settingIcon} />
            <Text style={styles.settingText}>Sync Interval</Text>
          </View>
          <View style={styles.settingItemRight}>
            <Text style={styles.settingValueText}>{syncInterval}</Text>
            <ChevronRight size={18} color={theme.colors.gray[400]} />
          </View>
        </TouchableOpacity>

        <View style={styles.settingItem}>
          <View style={styles.settingItemLeft}>
            <Smartphone size={20} color={theme.colors.text.secondary} style={styles.settingIcon} />
            <Text style={styles.settingText}>Offline Mode</Text>
          </View>
          <Switch
            value={offlineMode}
            onValueChange={setOfflineMode}
            trackColor={{
              false: theme.colors.gray[300],
              true: theme.colors.primary[400],
            }}
            thumbColor={theme.colors.white}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account & Security</Text>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingItemLeft}>
            <User size={20} color={theme.colors.text.secondary} style={styles.settingIcon} />
            <Text style={styles.settingText}>Account Information</Text>
          </View>
          <ChevronRight size={18} color={theme.colors.gray[400]} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingItemLeft}>
            <Shield size={20} color={theme.colors.text.secondary} style={styles.settingIcon} />
            <Text style={styles.settingText}>Security</Text>
          </View>
          <ChevronRight size={18} color={theme.colors.gray[400]} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingItemLeft}>
            <Globe size={20} color={theme.colors.text.secondary} style={styles.settingIcon} />
            <Text style={styles.settingText}>Language</Text>
          </View>
          <View style={styles.settingItemRight}>
            <Text style={styles.settingValueText}>English</Text>
            <ChevronRight size={18} color={theme.colors.gray[400]} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Help & Support</Text>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingItemLeft}>
            <BookOpen size={20} color={theme.colors.text.secondary} style={styles.settingIcon} />
            <Text style={styles.settingText}>Documentation</Text>
          </View>
          <ChevronRight size={18} color={theme.colors.gray[400]} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingItemLeft}>
            <HelpCircle size={20} color={theme.colors.text.secondary} style={styles.settingIcon} />
            <Text style={styles.settingText}>Help Center</Text>
          </View>
          <ChevronRight size={18} color={theme.colors.gray[400]} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingItemLeft}>
            <FileText size={20} color={theme.colors.text.secondary} style={styles.settingIcon} />
            <Text style={styles.settingText}>Terms & Privacy</Text>
          </View>
          <ChevronRight size={18} color={theme.colors.gray[400]} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <LogOut size={20} color={theme.colors.error[500]} />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
      
      <Text style={styles.versionText}>Version 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  userInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInitials: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.white,
  },
  userName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text.secondary,
  },
  editProfileButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.primary[500],
  },
  editProfileText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary[500],
  },
  section: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text.primary,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[100],
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[100],
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text.primary,
  },
  settingItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValueText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text.secondary,
    marginRight: 8,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.error[100],
  },
  signOutText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: theme.colors.error[500],
    marginLeft: 12,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text.secondary,
  },
});