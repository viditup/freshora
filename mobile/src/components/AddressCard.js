import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { C, R, shadow, FONT } from '../theme';

const Act = ({ t, onPress, color = C.green }) => <TouchableOpacity onPress={onPress}><Text style={{ color, fontFamily: FONT.heading }}>{t}</Text></TouchableOpacity>;

export default function AddressCard({ a, selected, onSelect, onEdit, onDelete, onDefault }) {
  return (
    <TouchableOpacity activeOpacity={onSelect ? 0.8 : 1} onPress={onSelect}
      style={{ backgroundColor: C.card, borderRadius: R, padding: 14, borderWidth: selected ? 2 : 1, borderColor: selected ? C.green : C.border, ...shadow }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <View style={{ backgroundColor: C.light, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 2 }}><Text style={{ color: C.green, fontFamily: FONT.headingBold, fontSize: 12 }}>{a.type}</Text></View>
        {a.is_default && <Text style={{ color: C.green, fontFamily: FONT.headingBold, fontSize: 11 }}>✓ DEFAULT</Text>}
      </View>
      <Text style={{ fontFamily: FONT.heading, color: C.text }}>{a.name}  •  {a.phone}</Text>
      <Text style={{ color: C.muted, marginTop: 2 }}>{a.address_line}{a.landmark ? `, ${a.landmark}` : ''}</Text>
      <Text style={{ color: C.muted }}>{a.city}, {a.state} - {a.pincode}</Text>
      {(onEdit || onDelete || onDefault) && (
        <View style={{ flexDirection: 'row', gap: 18, marginTop: 10 }}>
          {onEdit && <Act t="Edit" onPress={onEdit} />}
          {onDelete && <Act t="Delete" onPress={onDelete} color={C.red} />}
          {onDefault && !a.is_default && <Act t="Set as Default" onPress={onDefault} />}
        </View>
      )}
    </TouchableOpacity>
  );
}
