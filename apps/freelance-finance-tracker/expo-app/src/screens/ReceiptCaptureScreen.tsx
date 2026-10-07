import React, { useState } from 'react';
import { View, Text, ActivityIndicator, Alert, StyleSheet, Image, ScrollView, Platform, Pressable } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { getToken } from '../auth';
import { API_URL } from '../config';
import { theme } from '../theme';
import PrimaryButton from '../components/ui/PrimaryButton';
import FormField from '../components/ui/FormField';
import Screen from '../components/ui/Screen';
import { TextInput } from 'react-native-paper';

export default function ReceiptCaptureScreen() {
  const navigation = useNavigation<any>();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [image, setImage] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result);
    }
  };

  const handlePlaceholderPress = async () => {
    await pickImage();
  };

  const handleSave = async () => {
    if (!amount || !date || !category) {
      Alert.alert('Error', 'Please fill all required fields.');
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
      if (image) {
        if (Platform.OS === 'web') {
          const resp = await fetch(image.assets[0].uri);
          const blob = await resp.blob();
          form.append('image', blob, image.assets[0].name || 'receipt.jpg');
        } else {
          form.append('image', {
            uri: image.assets[0].uri,
            name: image.assets[0].name || 'receipt.jpg',
            type: image.assets[0].type || 'image/jpeg',
          } as any);
        }
      } else {
        const placeholder = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/5+hHgAFgwJ/9YX8WAAAAABJRU5ErkJggg==';
        if (Platform.OS === 'web') {
          const resp = await fetch(placeholder);
          const blob = await resp.blob();
          form.append('image', blob, 'receipt.jpg');
        } else {
          form.append('image', {
            uri: placeholder,
            name: 'receipt.jpg',
            type: 'image/png',
          } as any);
        }
      }
      await axios.post(`${API_URL}/receipts`, form, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      navigation.navigate('Dashboard', { receiptSaved: true });
    } catch (e) {
      Alert.alert('Error', 'Upload failed. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (hasPermission === false) {
    return (
      <Screen scroll>
        <Text style={styles.text}>Camera access denied. You can select a photo from the library.</Text>
        <PrimaryButton title="Choose from library" onPress={pickImage} accessibilityLabel="Choose from library" />
        {renderForm()}
      </Screen>
    );
  }

  if (hasPermission === null) {
    return (
      <Screen scroll>
        <Text style={styles.heading}>New receipt</Text>
        <Text style={styles.text}>Camera access needed</Text>
        <PrimaryButton title="Allow" onPress={requestPermission} accessibilityLabel="Allow" />
        <PrimaryButton title="Deny" onPress={() => setHasPermission(false)} accessibilityLabel="Deny" />
      </Screen>
    );
  }

  function renderForm() {
    return (
      <View style={styles.form}>
        <Text style={styles.heading}>New receipt</Text>
        {image && (
          <Image source={{ uri: image.assets[0].uri }} style={styles.image} accessibilityLabel="Receipt photo" accessibilityRole="image" />
        )}
        {!image && (
          <Pressable
            onPress={handlePlaceholderPress}
            accessibilityRole="button"
            accessibilityLabel="Tap to take a photo or choose from library"
            style={styles.placeholderContainer}
          >
            <Text style={styles.placeholderText}>Tap to take a photo or choose from library</Text>
          </Pressable>
        )}
        {Platform.OS !== 'web' && (
          <>
            <PrimaryButton title="Take photo" onPress={takePhoto} accessibilityLabel="Take photo" />
            <PrimaryButton title="Choose from library" onPress={pickImage} accessibilityLabel="Choose from library" />
          </>
        )}
        <FormField label="Amount (USD)" value={amount} onChangeText={setAmount} keyboardType="numeric" accessibilityLabel="Amount (USD)" />
        <FormField label="Date" value={date} onChangeText={setDate} accessibilityLabel="Date" />
        <FormField label="Category" value={category} onChangeText={setCategory} accessibilityLabel="Category" />
        <FormField label="Notes (optional)" value={notes} onChangeText={setNotes} accessibilityLabel="Notes (optional)" />
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: theme.spacing.lg, backgroundColor: theme.colors.background },
  text: { ...theme.typography.bodyMedium, marginBottom: theme.spacing.md },
  heading: { ...theme.typography.h2, color: theme.colors.onSurface, marginBottom: theme.spacing.md },
  form: { marginTop: theme.spacing.md },
  image: { width: 200, height: 200, marginBottom: theme.spacing.sm },
  placeholderContainer: {
    borderWidth: 1,
    borderColor: theme.colors.secondary,
    borderRadius: theme.radii.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  placeholderText: { ...theme.typography.bodyMedium, color: theme.colors.secondary },
});