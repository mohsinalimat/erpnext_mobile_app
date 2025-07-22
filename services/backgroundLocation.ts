import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setCache } from './cache';
import { postLocationData } from './api';
import { addToQueue } from './queue';

const LOCATION_TASK_NAME = 'background-location-task';

// Helper function to format date to YYYY-MM-DD HH:MM:SS
const formatToMySQLDatetime = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
};

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Background location task error:', error.message);
    return;
  }
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    console.log('Background locations:', locations);

    // Retrieve userId from AsyncStorage
    const userId = await AsyncStorage.getItem('user_id'); // Assuming 'user_id' is stored here on login

    if (locations.length > 0 && userId) {
      const lastLocation = locations[locations.length - 1];

      const locationPayload = {
        user: userId,
        latitude: lastLocation.coords.latitude,
        longitude: lastLocation.coords.longitude,
        timestamp: formatToMySQLDatetime(new Date(lastLocation.timestamp)),
      };

      try {
        await postLocationData(locationPayload);
        await setCache('last_posted_location', locationPayload); // Cache the last posted location
        console.log('Location data posted and cached:', locationPayload);
      } catch (apiError) {
        console.error('Failed to post location data:', apiError);
        await addToQueue({ type: 'location', payload: locationPayload });
      }
    } else if (!userId) {
      console.warn('User ID not found in AsyncStorage. Cannot post location data.');
    }
  }
});

export const startBackgroundLocationUpdates = async () => {
  const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
  if (foregroundStatus === 'granted') {
    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus === 'granted') {
      const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
      if (!isTaskRegistered) {
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 10000, // Update every 10 seconds
          distanceInterval: 100, // Update every 100 meters (adjust as needed)
          deferredUpdatesInterval: 5000, // Defer updates for 5 seconds to batch them
          showsBackgroundLocationIndicator: true, // Show indicator on iOS
          foregroundService: { // For Android
            notificationTitle: 'Location Tracking',
            notificationBody: 'Tracking your location in the background',
            notificationColor: '#007bff',
          },
        });
        console.log('Background location updates started.');
      } else {
        console.log('Background location task already registered.');
      }
    } else {
      console.warn('Background location permission not granted.');
    }
  } else {
    console.warn('Foreground location permission not granted.');
  }
};

export const stopBackgroundLocationUpdates = async () => {
  const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
  if (isTaskRegistered) {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    console.log('Background location updates stopped.');
  } else {
    console.log('Background location task not registered.');
  }
};
