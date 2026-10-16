import React, { useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { TextInput } from 'react-native-paper';
import { Screen, PrimaryButton } from '../components/ui';
import { verifyExportCode } from '../lib/exportVerification';
import { getStore } from '../lib/storage';

export default function VerifyExportScreen() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const check = async () => {
    setLoading(true);
    const res = await verifyExportCode(code, getStore());
    setResult(res);
    setLoading(false);
  };

  return (
    <Screen title="Verify export">
      <TextInput label="Verification code" value={code} onChangeText={setCode} />
      <PrimaryButton label="Check" onPress={check} disabled={loading} />
      {loading && <ActivityIndicator />}
      {result && (
        <View style={{ marginTop: 12 }}>
          <View><Text>{result.known ? 'Code known' : 'Code not found'}</Text></View>
          {result.laterChanges && <View><Text>Later changes detected</Text></View>}
        </View>
      )}
    </Screen>
  );
}
