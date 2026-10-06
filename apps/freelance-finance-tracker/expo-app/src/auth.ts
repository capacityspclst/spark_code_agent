import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// Token storage abstraction. On native platforms we use SecureStore which stores data
// encrypted on the device. For the web platform we fall back to AsyncStorage which is
// the only available storage mechanism in the Expo SDK. This is not ideal for production
// but satisfies the functional requirements of the demo and avoids the runtime error
// (`getValueWithKeyAsync is not a function`) that occurs when using SecureStore on web.
const TOKEN_KEY = 'jwt';

export async function saveToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
}

export async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return await AsyncStorage.getItem(TOKEN_KEY);
  }
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

export async function deleteToken(): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}
