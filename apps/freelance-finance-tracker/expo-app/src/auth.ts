import { Platform } from 'react-native';
// Use Expo SecureStore for all platforms to avoid insecure AsyncStorage on web.
const SecureStore = require('expo-secure-store');
const TOKEN_KEY = 'jwt';

export async function saveToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

export async function deleteToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
