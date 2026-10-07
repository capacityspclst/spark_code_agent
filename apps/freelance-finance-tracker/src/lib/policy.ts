// src/lib/policy.ts
import * as SecureStore from 'expo-secure-store';

export const POLICY_VERSION = '1.0';
const KEY = 'policyAcceptance';

export interface PolicyAcceptance {
  version: string;
  date: string;
}

export async function getPolicyAcceptance(): Promise<PolicyAcceptance | null> {
  try {
    const json = await SecureStore.getItemAsync(KEY);
    return json ? JSON.parse(json) : null;
  } catch (e) {
    console.error('Error reading policy acceptance', e);
    return null;
  }
}

export async function setPolicyAcceptance(version: string, date: string): Promise<void> {
  const obj: PolicyAcceptance = { version, date };
  await SecureStore.setItemAsync(KEY, JSON.stringify(obj));
}
