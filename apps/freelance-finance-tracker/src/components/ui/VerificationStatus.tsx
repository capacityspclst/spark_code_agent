import React from 'react';
import { Card, Text } from 'react-native-paper';
import { View } from 'react-native';
import { theme } from '../../theme';

interface Props {
  ok: boolean;
  entryCount: number;
  firstBadSeq?: number;
  reason?: string;
}

export default function VerificationStatus({ ok, entryCount, firstBadSeq, reason }: Props) {
  return (
    <Card mode="outlined" style={{ backgroundColor: theme.colors.surface, marginBottom: 12, padding: 12 }}>
      {ok ? (
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
          Verified \u2022 {entryCount} entries \u2022 intact
        </Text>
      ) : (
        <Text variant="bodyMedium" style={{ color: theme.colors.error }}>
          ⚠ Ledger corrupted at entry {firstBadSeq}: {reason}
        </Text>
      )}
    </Card>
  );
}
