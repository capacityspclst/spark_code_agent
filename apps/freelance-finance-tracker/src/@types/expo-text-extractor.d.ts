declare module 'expo-text-extractor' {
  export interface TextExtractorResult {
    text: string;
    // other fields omitted
  }
  export function extract(uri: string): Promise<TextExtractorResult>;
}
