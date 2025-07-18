import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const SECURE_STORE_THRESHOLD = 2048; // bytes

export const setCache = async (key: string, value: any) => {
  try {
    const jsonValue = JSON.stringify(value);
    if (jsonValue.length > SECURE_STORE_THRESHOLD) {
      await AsyncStorage.setItem(key, jsonValue);
    } else {
      await SecureStore.setItemAsync(key, jsonValue);
    }
  } catch (e) {
    console.error('Failed to save data to cache', e);
  }
};

export const getCache = async (key: string) => {
  try {
    let jsonValue = await SecureStore.getItemAsync(key);
    if (jsonValue === null) {
      jsonValue = await AsyncStorage.getItem(key);
    }
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error('Failed to fetch data from cache', e);
  }
};
