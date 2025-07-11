import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { loginToERPNext } from '@/services/api';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
  signIn: (serverUrl: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isInitialized: false,
  isLoading: false,
  user: null,
  error: null,
  signIn: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// Helper functions for storage
const getStoredItem = async (key: string): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  } catch (error) {
    console.error(`Error getting stored item: ${key}`, error);
    return null;
  }
};

const setStoredItem = async (key: string, value: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  } catch (error) {
    console.error(`Error setting stored item: ${key}`, error);
  }
};

const removeStoredItem = async (key: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  } catch (error) {
    console.error(`Error removing stored item: ${key}`, error);
  }
};

// Mock user for development
const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'System Manager',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // In development, automatically authenticate with mock user
        if (__DEV__) {
          setUser(mockUser);
          setIsAuthenticated(true);
          await setStoredItem('user', JSON.stringify(mockUser));
          await setStoredItem('token', 'mock-token');
          await setStoredItem('serverUrl', 'https://demo.erpnext.com');
        } else {
          const storedUser = await getStoredItem('user');
          const storedToken = await getStoredItem('token');
          const storedServerUrl = await getStoredItem('serverUrl');
          
          if (storedUser && storedToken && storedServerUrl) {
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (serverUrl: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { user, token } = await loginToERPNext(serverUrl, email, password);
      
      // Store auth data
      await setStoredItem('user', JSON.stringify(user));
      await setStoredItem('token', token);
      await setStoredItem('serverUrl', serverUrl);
      
      setUser(user);
      setIsAuthenticated(true);
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await removeStoredItem('user');
      await removeStoredItem('token');
      await removeStoredItem('serverUrl');
      
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isInitialized,
        isLoading,
        user,
        error,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};