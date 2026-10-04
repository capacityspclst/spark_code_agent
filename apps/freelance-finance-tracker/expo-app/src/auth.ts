import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'jwt';

export async function saveToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  return await AsyncStorage.getItem(TOKEN_KEY);
}

export async function deleteToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}
