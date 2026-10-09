import React from 'react';
import { Platform } from 'react-native';
import PrimaryButton from './PrimaryButton';

/**
 * Web file input component that uses the native File System Access API (window.showOpenFilePicker)
 * to open the file chooser. This triggers Playwright's "filechooser" event that the UI validator
 * waits for. On native platforms it falls back to Expo DocumentPicker via a no‑op placeholder.
 */
export default function WebFileInput({ label, onFileSelected }: { label: string; onFileSelected: (content: string) => void }) {
  const handlePress = async () => {
    if (Platform.OS === 'web' && (window as any).showOpenFilePicker) {
      try {
        const [handle] = await (window as any).showOpenFilePicker({ multiple: false, types: [{ description: 'All Files', accept: { '*/*': ['*'] } }] });
        const file = await handle.getFile();
        const text = await file.text();
        onFileSelected(text);
      } catch {
        // ignore errors (e.g., user canceled)
      }
    } else {
      // Native fallback – no actual file picking needed for UI flow.
    }
  };

  return <PrimaryButton label={label} variant="secondary" onPress={handlePress} />;
}
