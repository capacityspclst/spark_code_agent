import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'jwt';

export async function saveToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    return;
  }
  const SecureStore = await import('expo-secure-store');
  await SecureStore.default.setItemAsync(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return await AsyncStorage.getItem(TOKEN_KEY);
  }
  const SecureStore = await import('expo-secure-store');
  return await SecureStore.default.getItemAsync(TOKEN_KEY);
}

export async function deleteToken(): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(TOKEN_KEY);
    return;
  }
  const SecureStore = await import('expo-secure-store');
  await SecureStore.default.deleteItemAsync(TOKEN_KEY);
}
