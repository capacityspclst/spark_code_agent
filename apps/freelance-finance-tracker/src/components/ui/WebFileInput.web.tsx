import React from 'react';

/** Web-only file input component used for backup restore. */
export default function WebFileInput({
  onFileSelected,
}: {
  /** Called with the file text content when a file is chosen. */
  onFileSelected: (text: string) => void;
}) {
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const text = await file.text();
        onFileSelected(text);
      } catch {
        // ignore errors – caller will handle via snack.
      }
    }
  };

  return (
    <input
      type="file"
      accept="*/*"
      aria-label="Select backup file"
      style={{ display: 'block', marginBottom: 12 }}
      onChange={handleChange}
    />
  );
}
