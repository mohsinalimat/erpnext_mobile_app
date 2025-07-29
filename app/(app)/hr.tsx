import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type MenuItem = {
  title: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  route: string;
};

const menuItems: MenuItem[] = [
  {
    title: 'Claim an Expense',
    icon: 'dollar-sign',
    route: '/(app)/expense-claim',
  },
  {
    title: 'Request an Advance',
    icon: 'briefcase',
    route: '/(app)/new-employee-advance',
  },
  {
    title: 'View Salary Slips',
    icon: 'file-text',
    route: '/salary',
  },
  {
    title: 'Attendance',
    icon: 'calendar',
    route: '/(app)/attendance',
  },
];

const leaveRequests = [
  {
    type: 'Earned Leave',
    date: '22 Sep - 1d',
    employee: 'Mohan Rai',
    status: 'Open',
  },
  {
    type: 'Annual Leave',
    date: '1 Aug - 1d',
    employee: 'Kevin Edward',
    status: 'Open',
  },
  {
    type: 'Annual Leave',
    date: '21 Aug - 1d',
    employee: 'Kevin Edward',
    status: 'Open',
  },
  {
    type: 'Medical & 1 more',
    date: '4,900 - 7 Sep',
    employee: 'Kristin Watson',
    status: 'Draft',
  },
];

export default function HomeScreen() {
  const router = useRouter();

  const handleMenuPress = (route: string) => {
    if (route) {
      router.push(route as any);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Frappe HR</Text>
        <View style={styles.headerIcons}>
          <Feather name="bell" size={24} color="black" />
          <View style={styles.avatar} />
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem} onPress={() => handleMenuPress(item.route)}>
              <View style={styles.menuIconContainer}>
                <Feather name={item.icon} size={24} color="#4A5568" />
              </View>
              <Text style={styles.menuItemText}>{item.title}</Text>
              <Feather name="chevron-right" size={20} color="gray" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity style={[styles.tab, styles.activeTab]}>
            <Text style={[styles.tabText, styles.activeTabText]}>My Requests</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Text style={styles.tabText}>Team Requests</Text>
          </TouchableOpacity>
        </View>

        {leaveRequests.map((request, index) => (
          <TouchableOpacity key={index} style={styles.leaveItem} onPress={() => router.push('/(app)/leave-application' as any)}>
            <View style={styles.leaveIconContainer}>
              <Feather name="clipboard" size={24} color="#4A5568" />
            </View>
            <View style={styles.leaveInfo}>
              <Text style={styles.leaveType}>{request.type}</Text>
              <Text style={styles.leaveDate}>{request.date}</Text>
              <Text style={styles.leaveEmployee}>{request.employee}</Text>
            </View>
            <View style={styles.leaveStatusContainer}>
              <Text style={[styles.leaveStatus, request.status === 'Open' ? styles.openStatus : styles.draftStatus]}>
                {request.status}
              </Text>
              <Feather name="chevron-right" size={20} color="gray" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D1D5DB',
    marginLeft: 16,
  },
  scrollView: {
    flex: 1,
  },
  menuContainer: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuIconContainer: {
    marginRight: 16,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
  },
  tab: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: 'white',
    borderRadius: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'gray',
  },
  activeTabText: {
    color: 'black',
  },
  leaveItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  leaveIconContainer: {
    marginRight: 12,
  },
  leaveInfo: {
    flex: 1,
  },
  leaveType: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  leaveDate: {
    fontSize: 14,
    color: 'gray',
  },
  leaveEmployee: {
    fontSize: 14,
    color: 'gray',
  },
  leaveStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leaveStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 8,
  },
  openStatus: {
    color: '#10B981',
  },
  draftStatus: {
    color: '#F59E0B',
  },
});
