declare module 'expo-text-extractor' {
  export interface TextExtractorResult {
    text: string;
  }
  export function extractAsync(uri: string): Promise<TextExtractorResult>;
}
