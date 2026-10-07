// src/lib/policy.ts
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const POLICY_VERSION = '1.0';
const KEY = 'policyAcceptance';

export interface PolicyAcceptance {
  version: string;
  date: string;
}

export async function getPolicyAcceptance(): Promise<PolicyAcceptance | null> {
  try {
    if (Platform.OS === 'web') {
      const json = await AsyncStorage.getItem(KEY);
      return json ? JSON.parse(json) : null;
    }
    const json = await SecureStore.getItemAsync(KEY);
    return json ? JSON.parse(json) : null;
  } catch (e) {
    console.error('Error reading policy acceptance', e);
    return null;
  }
}

export async function setPolicyAcceptance(version: string, date: string): Promise<void> {
  const obj: PolicyAcceptance = { version, date };
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(KEY, JSON.stringify(obj));
  } else {
    await SecureStore.setItemAsync(KEY, JSON.stringify(obj));
  }
}
