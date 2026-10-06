import React from 'react';
import { Text, View } from 'react-native';
import Img from './Img';
import { C, rs, FONT } from '../theme';

export default function OrderItem({ item: i }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
      <Img fit="contain" uri={i.image} style={{ width: 50, height: 50, borderRadius: 8 }} />
      <View style={{ flex: 1, marginHorizontal: 10 }}>
        <Text numberOfLines={1} style={{ fontFamily: FONT.heading, color: C.text }}>{i.name}</Text>
        <Text style={{ color: C.muted, fontSize: 12 }}>{i.unit}  •  {i.quantity} × {rs(i.price)}</Text>
      </View>
      <Text style={{ fontFamily: FONT.headingBold, color: C.text }}>{rs(i.subtotal)}</Text>
    </View>
  );
}
