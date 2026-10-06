import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { C, R, FONT } from '../theme';

export default function Btn({ title, onPress, loading, disabled, color = C.green, outline, style }) {
  const off = loading || disabled;
  return (
    <TouchableOpacity onPress={onPress} disabled={off} activeOpacity={0.85}
      style={[{ height: 50, borderRadius: R, alignItems: 'center', justifyContent: 'center', backgroundColor: outline ? 'transparent' : color, borderWidth: outline ? 1.5 : 0, borderColor: color, opacity: off ? 0.55 : 1 }, style]}>
      {loading ? <ActivityIndicator color={outline ? color : '#fff'} /> : <Text style={{ color: outline ? color : '#fff', fontFamily: FONT.headingBold }}>{title}</Text>}
    </TouchableOpacity>
  );
}
