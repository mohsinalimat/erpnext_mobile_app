import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const INSTALLATION_DATE_KEY = 'installation_date';
const LICENSE_KEY = 'license_key';
const SERVER_URL = 'https://lic.primetechbd.xyz';

export const setInstallationDate = async () => {
  try {
    const date = await AsyncStorage.getItem(INSTALLATION_DATE_KEY);
    if (!date) {
      await AsyncStorage.setItem(INSTALLATION_DATE_KEY, new Date().toISOString());
    }
  } catch (error) {
    console.error('Error setting installation date:', error);
  }
};

export const isTrialActive = async () => {
  try {
    const installationDateStr = await AsyncStorage.getItem(INSTALLATION_DATE_KEY);
    if (!installationDateStr) {
      await setInstallationDate();
      return true;
    }

    const installationDate = new Date(installationDateStr);
    const thirtyDaysInMillis = 30 * 24 * 60 * 60 * 1000;
    const trialEndDate = new Date(installationDate.getTime() + thirtyDaysInMillis);
    const now = new Date();

    return now < trialEndDate;
  } catch (error) {
    console.error('Error checking trial status:', error);
    return false;
  }
};

export const verifyLicense = async (licenseKey: string) => {
  try {
    const response = await axios.post(`${SERVER_URL}/verify`, { licenseKey });
    if (response.data.valid) {
      await AsyncStorage.setItem(LICENSE_KEY, licenseKey);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error verifying license:', error);
    return false;
  }
};

export const hasValidLicense = async () => {
  try {
    const licenseKey = await AsyncStorage.getItem(LICENSE_KEY);
    return !!licenseKey;
  } catch (error) {
    console.error('Error checking for valid license:', error);
    return false;
  }
};
