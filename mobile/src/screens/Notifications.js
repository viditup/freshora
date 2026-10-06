import React from 'react';
import { View } from 'react-native';
import { Empty } from '../components/ErrorState';
import { C } from '../theme';

// No notifications backend exists yet; the bell opens this placeholder so the icon is never a dead end.
export default function Notifications() {
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Empty icon="🔔" title="You're all caught up" sub="Order updates and offers will show up here." />
    </View>
  );
}
