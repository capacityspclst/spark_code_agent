import React from 'react';
import { EmptyState, Screen } from '../components/ui';

/** Placeholder home: replace with the app's dashboard. Shows the empty state pattern. */
export default function HomeScreen() {
  return (
    <Screen title="Home" wide>
      <EmptyState icon="inbox-outline" title="No activity yet" body="Everything you add will show up here." />
    </Screen>
  );
}
