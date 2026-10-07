import { Platform } from 'react-native';

const TOKEN_KEY = 'jwt_token';

// Lazy load SecureStore only on native platforms to avoid web errors
async function getSecureStore() {
  if (Platform.OS === 'web') return null;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const SecureStore = require('expo-secure-store');
  return SecureStore;
}

export async function saveToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    const SecureStore = await getSecureStore();
    await SecureStore?.setItemAsync(TOKEN_KEY, token);
  }
}

export async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(TOKEN_KEY);
  }
  const SecureStore = await getSecureStore();
  return await SecureStore?.getItemAsync(TOKEN_KEY);
}

export async function deleteToken(): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(TOKEN_KEY);
  } else {
    const SecureStore = await getSecureStore();
    await SecureStore?.deleteItemAsync(TOKEN_KEY);
  }
}
