import { router } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import CustomDrawer from '../../components/navigation/NavigationDrawer';
import MainLayout from '../../components/layout/MainLayout';
import DashboardScreen from './dashboard';
import LeavesScreen from './leaves';
import ExpensesScreen from './expenses';
import SalaryScreen from './salary';
import CustomersScreen from './customers';
import ContactScreen from './contact';
import QuotationScreen from './quotation';
import SalesOrderScreen from './sales-order';
import ItemsScreen from './items';
import AttendanceScreen from './attendance';
import NewCustomerScreen from './new-customer';
import NewQuotationScreen from './new-quotation';
import NewSalesOrderScreen from './new-sales-order';
import NewContactScreen from './new-contact';
import NewAddressScreen from './new-address';
import AddressScreen from './address';
import HrScreen from './hr';
import NewItemScreen from './new-item';
import TasksScreen from './tasks';
import NewTaskScreen from './new-task';

const Drawer = createDrawerNavigator();

export default function AppLayout() {
  useKeepAwake();
  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

  useEffect(() => {
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const { doctype, docname } = response.notification.request.content.data;
      if (doctype === 'Leave Application') {
        router.push(`/leave-application-detail/${docname}` as any);
      }
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current!);
      Notifications.removeNotificationSubscription(responseListener.current!);
    };
  }, []);

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={({ navigation }) => ({
        headerLeft: () => (
          <TouchableOpacity
            style={{ marginLeft: 15 }}
            onPress={() => navigation.toggleDrawer()}
          >
            <Ionicons name="menu" size={24} color="black" />
          </TouchableOpacity>
        ),
      })}
    >
      <Drawer.Screen name="dashboard" options={{ title: 'Dashboard' }}>
        {(props) => <MainLayout><DashboardScreen {...props} /></MainLayout>}
      </Drawer.Screen>
      <Drawer.Screen name="leaves" options={{ title: 'Leaves' }}>
        {() => <MainLayout><LeavesScreen /></MainLayout>}
      </Drawer.Screen>
      <Drawer.Screen name="expenses" options={{ title: 'Expenses' }}>
        {() => <MainLayout><ExpensesScreen /></MainLayout>}
      </Drawer.Screen>
      <Drawer.Screen name="salary" options={{ title: 'Salary Slips' }}>
        {() => <MainLayout><SalaryScreen /></MainLayout>}
      </Drawer.Screen>
      <Drawer.Screen name="attendance" options={{ title: 'Attendance' }}>
        {() => <MainLayout><AttendanceScreen /></MainLayout>}
      </Drawer.Screen>
      <Drawer.Screen name="customers" options={{ title: 'Customers' }}>
        {() => <MainLayout><CustomersScreen /></MainLayout>}
      </Drawer.Screen>
      <Drawer.Screen name="contact" options={{ title: 'Contacts' }}>
        {() => <MainLayout><ContactScreen /></MainLayout>}
      </Drawer.Screen>
      <Drawer.Screen name="quotation" options={{ title: 'Quotations' }}>
        {() => <MainLayout><QuotationScreen /></MainLayout>}
      </Drawer.Screen>
      <Drawer.Screen name="items" options={{ title: 'Items' }}>
        {() => <MainLayout><ItemsScreen /></MainLayout>}
      </Drawer.Screen>
      <Drawer.Screen name="sales-order" options={{ title: 'Sales Orders' }}>
        {() => <MainLayout><SalesOrderScreen /></MainLayout>}
      </Drawer.Screen>
      <Drawer.Screen name="new-customer" options={{ title: 'New Customer' }}>
        {() => <MainLayout><NewCustomerScreen /></MainLayout>}
      </Drawer.Screen>
      <Drawer.Screen name="new-quotation" options={{ title: 'New Quotation' }}>
        {() => <MainLayout><NewQuotationScreen /></MainLayout>}
      </Drawer.Screen>
      <Drawer.Screen name="new-sales-order" options={{ title: 'New Sales Order' }}>
        {() => <MainLayout><NewSalesOrderScreen /></MainLayout>}
      </Drawer.Screen>
      <Drawer.Screen name="new-contact" options={{ title: 'New Contact' }}>
        {() => <MainLayout><NewContactScreen /></MainLayout>}
      </Drawer.Screen>
      <Drawer.Screen name="new-address" options={{ title: 'New Address' }}>
        {() => <MainLayout><NewAddressScreen /></MainLayout>}
      </Drawer.Screen>
      <Drawer.Screen name="address" options={{ title: 'Address' }}>
        {() => <MainLayout><AddressScreen /></MainLayout>}
      </Drawer.Screen>
      <Drawer.Screen name="new-item" options={{ title: 'New Item' }}>
        {() => <MainLayout><NewItemScreen /></MainLayout>}
      </Drawer.Screen>
      <Drawer.Screen name="tasks" options={{ title: 'Task' }}>
        {() => <MainLayout><TasksScreen /></MainLayout>}
      </Drawer.Screen>
      <Drawer.Screen name="new-task" options={{ title: 'New Task' }}>
        {() => <MainLayout><NewTaskScreen /></MainLayout>}
      </Drawer.Screen>
      <Drawer.Screen name="hr" options={{ title: 'HR Dashboard' }}>
        {() => <MainLayout><HrScreen /></MainLayout>}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
}
