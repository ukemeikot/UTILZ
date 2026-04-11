import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getStoredItem<T>(key: string, fallback: T): Promise<T> {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function setStoredItem<T>(key: string, value: T) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}
