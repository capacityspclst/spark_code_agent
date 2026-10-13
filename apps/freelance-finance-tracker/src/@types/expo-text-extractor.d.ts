declare module 'expo-text-extractor' {
  export const isSupported: boolean;
  export function extractTextFromImage(uri: string): Promise<string[]>;
}