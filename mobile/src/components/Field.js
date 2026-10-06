import React from 'react';
import { Text, TextInput, View } from 'react-native';
import { C, R, FONT } from '../theme';

export default function Field({ label, error, style, ...props }) {
  return (
    <View style={{ marginBottom: 12 }}>
      {!!label && <Text style={{ fontFamily: FONT.bodySemi, color: C.text, marginBottom: 4 }}>{label}</Text>}
      <TextInput placeholderTextColor={C.muted} {...props} style={[{ backgroundColor: '#fff', borderWidth: 1, borderColor: error ? C.red : C.border, borderRadius: R, padding: 12 }, style]} />
      {!!error && <Text style={{ color: C.red, fontSize: 12, marginTop: 3 }}>{error}</Text>}
    </View>
  );
}
