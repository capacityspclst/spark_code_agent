// App.js
// React Native entry component implemented without JSX, using React.createElement.

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { fetchDefinition, translateText } from "./src/api.js";

export default function App() {
  const [word, setWord] = useState("");
  const [definition, setDefinition] = useState(null);
  const [translation, setTranslation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const lookup = async () => {
    const trimmed = word.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setDefinition(null);
    setTranslation(null);
    try {
      const def = await fetchDefinition(trimmed);
      setDefinition(def);
      const trans = await translateText(def, "lv");
      setTranslation(trans);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return React.createElement(
    View,
    { style: styles.container },
    React.createElement(TextInput, {
      style: styles.input,
      placeholder: "Enter a word",
      value: word,
      onChangeText: setWord,
    }),
    React.createElement(Button, { title: "Lookup", onPress: lookup }),
    loading && React.createElement(ActivityIndicator, { style: styles.spinner }),
    error && React.createElement(Text, { style: styles.error }, error),
    definition &&
      React.createElement(Text, { style: styles.definition }, `Definition: ${definition}`),
    translation &&
      React.createElement(Text, { style: styles.translation }, `Latvian: ${translation}`)
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
  },
  spinner: {
    marginVertical: 20,
  },
  error: {
    color: "red",
    marginTop: 10,
  },
  definition: {
    marginTop: 10,
  },
  translation: {
    marginTop: 10,
    fontStyle: "italic",
  },
});
