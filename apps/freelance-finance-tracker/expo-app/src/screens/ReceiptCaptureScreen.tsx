import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, ActivityIndicator, Alert, StyleSheet, Image, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getToken } from '../auth';
import { API_URL } from '../config';
import { theme } from '../theme';

export default function ReceiptCaptureScreen() {
  const navigation = useNavigation<any>();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [image, setImage] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Show permission modal on first render
  useEffect(() => {
    setHasPermission(false);
  }, []);

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
    if (status !== 'granted') {
      // fallback to library later
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.cancelled) {
      setImage(result);
    }
  };

  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.cancelled) {
      setImage(result);
    }
  };

  const handleSave = async () => {
    if (!amount || !date || !category) {
      Alert.alert('Error', 'Please fill all required fields.');
      return;
    }
    if (!image) {
      Alert.alert('Error', 'Please select a photo.');
      return;
    }
    setLoading(true);
    try {
      const token = await getToken();
      const form = new FormData();
      form.append('amount', amount);
      form.append('date', date);
      form.append('category', category);
      form.append('notes', notes);
      // @ts-ignore
      form.append('image', {
        uri: image.uri,
        name: 'receipt.jpg',
        type: 'image/jpeg',
      });
      const resp = await axios.post(`${API_URL}/receipts`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage('Receipt saved.');
      // navigation back to dashboard maybe
    } catch (e) {
      setMessage('Upload failed. Check your connection and try again.');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (hasPermission === false) {
    // permission denied state
    return (
      <View style={styles.container} accessibilityRole="main">
        <Text style={styles.text}>Camera access denied. You can select a photo from your library.</Text>
        <Button title="Choose from library" onPress={pickImage} />
        {renderForm()}
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>
    );
  }

  if (hasPermission === null) {
    // show modal
    return (
      <View style={styles.container} accessibilityRole="dialog">
        <Text style={styles.text}>FinanceMate needs camera access to photograph receipts.</Text>
        <Button title="Allow" onPress={requestPermission} />
        <Button title="Deny" onPress={() => setHasPermission(false)} />
      </View>
    );
  }

  function renderForm() {
    return (
      <View style={styles.form}>
        {image && <Image source={{ uri: image.uri }} style={styles.image} />}
        <Button title="Tap to take a photo or choose from library" onPress={pickImage} />
        <TextInput placeholder="Amount (USD)" value={amount} onChangeText={setAmount} style={styles.input} accessibilityLabel="Amount (USD)" />
        <TextInput placeholder="Date" value={date} onChangeText={setDate} style={styles.input} accessibilityLabel="Date" />
        <TextInput placeholder="Category" value={category} onChangeText={setCategory} style={styles.input} accessibilityLabel="Category" />
        <TextInput placeholder="Notes (optional)" value={notes} onChangeText={setNotes} style={styles.input} accessibilityLabel="Notes (optional)" />
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        ) : (
          <Button title="Save receipt" onPress={handleSave} />
        )}
      </View>
    );
  }

  return (
    <View style={styles.container} accessibilityRole="main">
      {renderForm()}
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.lg, backgroundColor: theme.colors.background },
  text: { ...theme.typography.body, marginBottom: theme.spacing.md },
  form: { marginTop: theme.spacing.md },
  input: { backgroundColor: theme.colors.surface, padding: theme.spacing.sm, borderRadius: theme.radii.sm, borderWidth: 1, borderColor: theme.colors.secondary, marginBottom: theme.spacing.sm },
  image: { width: 200, height: 200, marginBottom: theme.spacing.sm },
  message: { marginTop: theme.spacing.md, color: theme.colors.success, ...theme.typography.body },
});