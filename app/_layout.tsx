import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '@/context/ThemeContext';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    const inTabsGroup = segments[0] === '(tabs)';

    if (isAuthenticated && !inTabsGroup) {
      router.replace('/(tabs)');
    } else if (!isAuthenticated && inTabsGroup) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, isInitialized, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide splash screen once fonts are loaded
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Return null until fonts are loaded
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AuthProvider>
          <RootLayoutNav />
          <StatusBar style="auto" />
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
