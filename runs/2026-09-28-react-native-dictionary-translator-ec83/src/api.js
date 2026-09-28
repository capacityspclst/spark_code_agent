// src/api.js
// Provides two helper functions for fetching a word definition and translating text.
// In this offline environment, we mock external API calls with static data.

/**
 * Mock dictionary data for a few known words.
 */
const mockDictionary = {
  example: "A thing characteristic of its kind or illustrating a general rule.",
  test: "A procedure intended to establish the quality, performance, or reliability of something.",
};

/**
 * Fetches the first definition for the given English word.
 * In the offline test environment, returns a mocked definition for known words
 * and throws an error for unknown words.
 *
 * @param {string} word - The word to look up.
 * @returns {Promise<string>} - Resolves to the definition string.
 * @throws {Error} - If the word is unknown or input is invalid.
 */
export async function fetchDefinition(word) {
  if (!word || typeof word !== "string") {
    throw new Error("Word must be a non‑empty string");
  }
  const lowered = word.toLowerCase();
  if (mockDictionary.hasOwnProperty(lowered)) {
    return mockDictionary[lowered];
  }
  // Simulate API error for unknown words
  throw new Error(`Definition not found for word: ${word}`);
}

/**
 * Mock translation data.
 * For the purpose of tests, we simply return the original text prefixed with
 * a language tag to indicate translation.
 *
 * @param {string} text - Text to translate.
 * @param {string} targetLang - Target language code (e.g., "lv").
 * @returns {Promise<string>} - Resolves to the "translated" text.
 * @throws {Error} - If input validation fails.
 */
export async function translateText(text, targetLang) {
  if (!text || typeof text !== "string") {
    throw new Error("Text to translate must be a non‑empty string");
  }
  if (!targetLang || typeof targetLang !== "string") {
    throw new Error("Target language code must be provided");
  }
  // Simple mock translation: prepend language code in brackets
  return `[${targetLang}] ${text}`;
}
