import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ActivityIndicator, Alert, StyleSheet, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { getToken } from '../auth';
import { API_URL } from '../config';
import { theme } from '../theme';
import PrimaryButton from '../components/PrimaryButton';
import { Picker } from '@react-native-picker/picker';

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

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  useEffect(() => {
    setHasPermission(null);
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    // ImagePicker returns 'canceled' flag
    if (!result.canceled) {
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
      // Append image as required by React Native FormData
      (form as any).append('image', {
        uri: image.assets[0].uri,
        name: 'receipt.jpg',
        type: 'image/jpeg',
      } as any);
      await axios.post(`${API_URL}/receipts`, form, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setMessage('Receipt saved.');
      navigation.navigate('Dashboard');
    } catch (e) {
      setMessage('Upload failed. Check your connection and try again.');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (hasPermission === false) {
    return (
      <ScrollView contentContainerStyle={styles.container} accessibilityRole="none">
        <Text style={styles.text}>Camera access denied. You can select a photo from the library.</Text>
        <PrimaryButton title="Choose from library" onPress={pickImage} accessibilityLabel="Choose from library" />
        {renderForm()}
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </ScrollView>
    );
  }

  if (hasPermission === null) {
    return (
      <View style={styles.container} accessibilityRole="none">
        <Text style={styles.text}>FinanceMate needs camera access to photograph receipts.</Text>
        <PrimaryButton title="Allow" onPress={requestPermission} accessibilityLabel="Allow" />
        <PrimaryButton title="Deny" onPress={() => setHasPermission(false)} accessibilityLabel="Deny" />
      </View>
    );
  }

  function renderForm() {
    return (
      <View style={styles.form}>
        {image && <Image source={{ uri: image.assets[0].uri }} style={styles.image} />}
        <PrimaryButton title="Tap to take a photo or choose from library" onPress={pickImage} accessibilityLabel="Tap to take a photo or choose from library" />
        <TextInput placeholder="Amount (USD)" value={amount} onChangeText={setAmount} style={styles.input} accessibilityLabel="Amount (USD)" />
        <TextInput placeholder="Date" value={date} onChangeText={setDate} style={styles.input} accessibilityLabel="Date" />
        <Picker
          selectedValue={category}
          onValueChange={(itemValue) => setCategory(itemValue)}
          style={styles.picker}
          accessibilityLabel="Category"
        >
          <Picker.Item label="Select category" value="" />
          <Picker.Item label="Office supplies" value="Office supplies" />
          <Picker.Item label="Travel" value="Travel" />
          <Picker.Item label="Meals" value="Meals" />
        </Picker>
        <TextInput placeholder="Notes (optional)" value={notes} onChangeText={setNotes} style={styles.input} accessibilityLabel="Notes (optional)" />
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        ) : (
          <PrimaryButton title="Save receipt" onPress={handleSave} accessibilityLabel="Save receipt" />
        )}
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} accessibilityRole="none">
      {renderForm()}
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: theme.spacing.lg, backgroundColor: theme.colors.background },
  text: { ...theme.typography.body, marginBottom: theme.spacing.md },
  form: { marginTop: theme.spacing.md },
  input: { backgroundColor: theme.colors.surface, padding: theme.spacing.sm, borderRadius: theme.radii.sm, borderWidth: 1, borderColor: theme.colors.secondary, marginBottom: theme.spacing.sm },
  picker: { backgroundColor: theme.colors.surface, marginBottom: theme.spacing.sm },
  image: { width: 200, height: 200, marginBottom: theme.spacing.sm },
  message: { marginTop: theme.spacing.md, color: theme.colors.success, ...theme.typography.body },
});