import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { C, R, FONT } from '../theme';

const Btn = ({ title, onPress }) => (
  <TouchableOpacity onPress={onPress} style={{ backgroundColor: C.green, paddingHorizontal: 24, paddingVertical: 12, borderRadius: R, marginTop: 16 }}>
    <Text style={{ color: '#fff', fontFamily: FONT.heading }}>{title}</Text>
  </TouchableOpacity>
);

export default function ErrorState({ message, onRetry }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: C.bg }}>
      <Text style={{ fontSize: 44 }}>📡</Text>
      <Text style={{ fontSize: 18, fontFamily: FONT.headingBold, color: C.text, marginTop: 8 }}>Oops!</Text>
      <Text style={{ color: C.muted, textAlign: 'center', marginTop: 6 }}>{message || 'Something went wrong.'}</Text>
      <Btn title="Retry" onPress={onRetry} />
    </View>
  );
}

export function Empty({ icon = '🛒', title, sub, action, onAction }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', padding: 32, marginTop: 40 }}>
      <Text style={{ fontSize: 52 }}>{icon}</Text>
      <Text style={{ fontSize: 18, fontFamily: FONT.headingBold, color: C.text, marginTop: 8 }}>{title}</Text>
      {!!sub && <Text style={{ color: C.muted, textAlign: 'center', marginTop: 6 }}>{sub}</Text>}
      {!!action && <Btn title={action} onPress={onAction} />}
    </View>
  );
}
