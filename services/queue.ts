import * as SecureStore from 'expo-secure-store';

const QUEUE_KEY = 'offline_queue';

export const getQueue = async () => {
  try {
    const jsonValue = await SecureStore.getItemAsync(QUEUE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Failed to fetch queue from storage', e);
    return [];
  }
};

export const addToQueue = async (item: any) => {
  try {
    const queue = await getQueue();
    queue.push(item);
    await SecureStore.setItemAsync(QUEUE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.error('Failed to add item to queue', e);
  }
};

export const clearQueue = async () => {
  try {
    await SecureStore.deleteItemAsync(QUEUE_KEY);
  } catch (e) {
    console.error('Failed to clear queue', e);
  }
};
