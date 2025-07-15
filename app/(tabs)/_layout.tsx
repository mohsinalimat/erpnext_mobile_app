import { Tabs, useRouter } from 'expo-router';
import { getTheme } from '@/constants/theme';
import { useTheme, ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider, useLanguage } from '@/context/LanguageContext';
import CustomTabBar from '@/components/navigation/CustomTabBar';
import { TouchableOpacity } from 'react-native';
import { Settings } from 'lucide-react-native';

function TabLayoutContent() {
  const router = useRouter();
  const { darkMode } = useTheme();
  const { translations } = useLanguage();
  const theme = getTheme(darkMode);

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.white,
          borderBottomColor: theme.colors.gray[200],
          borderBottomWidth: 1,
        },
        headerTitleStyle: {
          fontFamily: 'Inter-SemiBold',
          fontSize: 18,
          color: theme.colors.text.primary,
        },
        headerTintColor: theme.colors.text.primary,
        headerRight: () => (
          <TouchableOpacity onPress={() => router.push('/(tabs)/settings')} style={{ marginRight: 15 }}>
            <Settings size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: translations.home,
          headerShown: true,
        }}
      />
        <Tabs.Screen
            name="customers"
            options={{
                title: translations.customers,
                headerShown: true,
            }}
        />
        <Tabs.Screen
            name="items"
            options={{
                title: translations.items,
                headerShown: true,
            }}
        />
        <Tabs.Screen
            name="quotation"
            options={{
                title: translations.quotation,
                headerShown: true,
            }}
        />
        <Tabs.Screen
            name="sales-order"
            options={{
                title: translations.sales_order,
                headerShown: true,
            }}
        />
        <Tabs.Screen
            name="tasks"
            options={{
                title: translations.tasks,
                headerShown: true,
            }}
        />
      <Tabs.Screen
        name="profile"
        options={{
          title: translations.profile,
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: translations.settings,
          headerShown: true,
          href: null,
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <TabLayoutContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}
