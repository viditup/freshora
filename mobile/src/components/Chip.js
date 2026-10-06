import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { C, FS, RAD, S, FONT } from '../theme';

// Small pill used for filters / quick actions.
export default function Chip({ label, active, onPress, style }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}
      style={[{ paddingHorizontal: S.lg, paddingVertical: S.sm, borderRadius: RAD.pill, borderWidth: 1, marginRight: S.sm,
        backgroundColor: active ? C.green : '#fff', borderColor: active ? C.green : C.border }, style]}>
      <Text style={{ fontSize: FS.sm, fontFamily: FONT.heading, color: active ? '#fff' : C.text }}>{label}</Text>
    </TouchableOpacity>
  );
}
