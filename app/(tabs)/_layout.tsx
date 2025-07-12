import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Chrome as Home, ChartBar as BarChart3, Layers, Settings, Search } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import CustomTabBar from '@/components/navigation/CustomTabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
          borderBottomColor: theme.colors.gray[200],
          borderBottomWidth: 1,
        },
        headerTitleStyle: {
          fontFamily: 'Inter-SemiBold',
          fontSize: 18,
          color: theme.colors.text.primary,
        },
        headerTintColor: theme.colors.text.primary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="modules"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Profile',
          headerShown: true,
        }}
      />
    </Tabs>
  );
}
