import { useEffect, useState } from 'react';
import { Alert, View, Text, StyleSheet, Button } from 'react-native';
import * as Updates from 'expo-updates';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '@/context/ThemeContext';
import { NetworkProvider, useNetwork } from '../context/NetworkContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { Slot, Redirect, Stack, useRouter } from 'expo-router';
import { startBackgroundLocation, stopBackgroundLocation } from '@/services/backgroundLocation';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function AuthStatusChecker() {
  const { isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized) {
      if (isAuthenticated) {
        router.replace('/(app)/mainmenu' as any);
      } else {
        router.replace('/(auth)/login' as any);
      }
    }
  }, [isAuthenticated, isInitialized, router]);

  return null; // This component doesn't render anything, it just handles redirection
}

function AppInitializer({ children }: { children: React.ReactNode }) {
  const { isConnected } = useNetwork();
  const [mediaLibraryStatus, requestMediaLibraryPermission] = ImagePicker.useMediaLibraryPermissions();
  const [locationStatus, requestLocationPermission] = Location.useForegroundPermissions();

  const handleRequestMediaLibraryPermission = () => {
    requestMediaLibraryPermission();
  };

  const handleRequestLocationPermission = () => {
    requestLocationPermission();
  };

  if (isConnected === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No Internet Connection</Text>
        <Text style={styles.subText}>
          Please check your network settings and restart the app.
        </Text>
      </View>
    );
  }

  if (isConnected === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Connecting...</Text>
      </View>
    )
  }

  if (mediaLibraryStatus && !mediaLibraryStatus.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Storage Permission Required</Text>
        <Text style={styles.subText}>
          This app needs access to your storage to function properly.
        </Text>
        <Button title="Grant Permission" onPress={handleRequestMediaLibraryPermission} />
      </View>
    );
  }

  if (locationStatus && !locationStatus.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Location Permission Required</Text>
        <Text style={styles.subText}>
          This app needs access to your location to function properly.
        </Text>
        <Button title="Grant Permission" onPress={handleRequestLocationPermission} />
      </View>
    );
  }

  return <>{children}</>;
}


export default function RootLayout() {
  useFrameworkReady();

  useEffect(() => {
    async function checkForUpdates() {
      if (!__DEV__) {
        try {
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable) {
            await Updates.fetchUpdateAsync();
            Alert.alert(
              'Update Available',
              'A new version of the app is available. Restart to apply the update.',
              [
                {
                  text: 'Restart',
                  onPress: () => Updates.reloadAsync(),
                },
              ]
            );
          }
        } catch (error) {
          console.error('Error checking for updates:', error);
        }
      }
    }

    checkForUpdates();

    // Start background location updates when the app is ready
    startBackgroundLocation();

    // Optional: Stop background location updates when the component unmounts
    return () => {
      stopBackgroundLocation();
    };
  }, []);

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
        <LanguageProvider>
          <AuthProvider>
            <NetworkProvider>
              <AppInitializer>
                <AuthStatusChecker />
                <Stack>
                  <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                  <Stack.Screen name="(app)" options={{ headerShown: false }} />
                  <Stack.Screen name="+not-found" options={{ headerShown: false }} />
                </Stack>
                <StatusBar style="auto" />
              </AppInitializer>
            </NetworkProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold'
  },
  subText: {
    fontSize: 16,
    color: 'gray',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
    fontFamily: 'Inter-Regular'
  },
});
