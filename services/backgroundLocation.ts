import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { formatToMySQLDatetime } from './datetime';
import { postLocationData } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCATION_TASK_NAME = 'background-location-task';

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Background location task error:', error);
    return;
  }
  if (data) {
    const { locations } = data as any;
    const location = locations[0];
    if (location) {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          const { latitude, longitude } = location.coords;
          const timestamp = formatToMySQLDatetime(new Date(location.timestamp));

          console.log('Sending background location update:', { user: user.id, latitude, longitude, timestamp });

          await postLocationData({
            user: user.id,
            latitude,
            longitude,
            timestamp,
          });

          console.log('Background location update sent successfully.');
        } else {
          console.log('No user found, skipping location update.');
        }
      } catch (e) {
        console.error('Failed to send background location update:', e);
      }
    }
  }
});

export const startBackgroundLocation = async () => {
  const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
  if (foregroundStatus === 'granted') {
    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus === 'granted') {
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 300000, // 5 minutes
        distanceInterval: 10, // 10 meters
      });
    }
  }
};

export const stopBackgroundLocation = async () => {
  await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
};
