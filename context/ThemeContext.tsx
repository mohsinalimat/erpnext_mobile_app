import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

type ThemeContextType = {
  darkMode: boolean;
  toggleDarkMode: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  darkMode: false,
  toggleDarkMode: () => {},
});

export const useTheme = () => useContext(ThemeContext);

// Helper functions for theme storage
const storeThemePreference = async (value: boolean) => {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem('darkMode', value.toString());
    } else {
      await SecureStore.setItemAsync('darkMode', value.toString());
    }
  } catch (error) {
    console.error('Failed to save theme preference', error);
  }
};

const getThemePreference = async (): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem('darkMode');
    } else {
      return await SecureStore.getItemAsync('darkMode');
    }
  } catch (error) {
    console.error('Failed to load theme preference', error);
    return null;
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [darkMode, setDarkMode] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    const loadThemePreference = async () => {
      const storedPreference = await getThemePreference();
      if (storedPreference !== null) {
        setDarkMode(storedPreference === 'true');
      } else {
        // Use system preference if no stored preference
        setDarkMode(systemColorScheme === 'dark');
      }
    };

    loadThemePreference();
  }, [systemColorScheme]);

  const toggleDarkMode = async () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    await storeThemePreference(newMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};