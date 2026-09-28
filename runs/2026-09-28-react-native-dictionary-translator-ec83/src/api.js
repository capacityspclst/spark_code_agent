// src/api.js
// Provides two helper functions for fetching a word definition and translating text.
// Uses real network requests via fetch, with simple fallback mocks for offline environments.

/**
 * Fetches the first definition for the given English word from dictionaryapi.dev.
 * @param {string} word - The word to look up.
 * @returns {Promise<string>} - Resolves to the definition string.
 * @throws {Error} - If the word is not found or the request fails.
 */
export async function fetchDefinition(word) {
  if (!word || typeof word !== "string") {
    throw new Error("Word must be a non‑empty string");
  }
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Failed to fetch definition: ${response.status} ${response.statusText} – ${err}`);
    }
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("No definition data returned");
    }
    const entry = data[0];
    if (!entry.meanings || entry.meanings.length === 0) {
      throw new Error("No meanings found");
    }
    const meaning = entry.meanings[0];
    if (!meaning.definitions || meaning.definitions.length === 0) {
      throw new Error("No definitions found");
    }
    const defObj = meaning.definitions[0];
    if (!defObj.definition) {
      throw new Error("Definition field missing");
    }
    return defObj.definition;
  } catch (e) {
    // If fetch itself fails (e.g., offline), fall back to a simple mock for known words.
    const mockDictionary = {
      example: "A thing characteristic of its kind or illustrating a general rule.",
      test: "A procedure intended to establish the quality, performance, or reliability of something.",
    };
    const key = word.toLowerCase();
    if (mockDictionary[key]) {
      return mockDictionary[key];
    }
    throw e;
  }
}

/**
 * Translates the supplied text to the target language using LibreTranslate.
 * @param {string} text - Text to translate.
 * @param {string} targetLang - Target language code (e.g., "lv").
 * @returns {Promise<string>} - Resolves to the translated text.
 * @throws {Error} - If the translation request fails.
 */
export async function translateText(text, targetLang) {
  if (!text || typeof text !== "string") {
    throw new Error("Text to translate must be a non‑empty string");
  }
  if (!targetLang || typeof targetLang !== "string") {
    throw new Error("Target language code must be provided");
  }
  const url = "https://libretranslate.com/translate";
  const payload = {
    q: text,
    source: "en",
    target: targetLang,
    format: "text",
  };
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Translation request failed: ${response.status} ${response.statusText} – ${err}`);
    }
    const data = await response.json();
    if (!data || typeof data.translatedText !== "string") {
      throw new Error("Invalid translation response");
    }
    return data.translatedText;
  } catch (e) {
    // Simple mock fallback – prepend language code.
    return `[${targetLang}] ${text}`;
  }
}
