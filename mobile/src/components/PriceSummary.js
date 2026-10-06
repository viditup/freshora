import React from 'react';
import { Text, View } from 'react-native';
import { C, R, rs, shadow, FONT } from '../theme';

// PART 8B: `design` = Checkout look (flat border card, 'Order Summary', Total MRP / Delivery Charge / Total Amount).
// Without it the card is unchanged (Order Details still uses it).

const Line = ({ k, v, bold, green }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
    <Text style={{ color: bold ? C.text : C.muted, fontFamily: bold ? FONT.headingBold : FONT.body, fontSize: bold ? 16 : 14 }}>{k}</Text>
    <Text style={{ color: green ? C.green : C.text, fontFamily: bold ? FONT.headingBold : FONT.bodySemi, fontSize: bold ? 16 : 14 }}>{v}</Text>
  </View>
);

// Shows values exactly as returned by the backend (cart summary or order).
// PART 8: the delivery line names the chosen option (standard / express) when the backend sends it.
export default function PriceSummary({ data, design }) {
  const optLabel = data.delivery_option ? (data.delivery_option === 'express' ? 'Express' : 'Standard') : null;
  return (
    <View style={design ? { backgroundColor: C.card, borderRadius: R, padding: 14, borderWidth: 1, borderColor: C.border } : { backgroundColor: C.card, borderRadius: R, padding: 14, ...shadow }}>
      <Text style={{ fontFamily: FONT.headingBold, color: C.text, marginBottom: 2, fontSize: design ? 16 : undefined }}>{design ? 'Order Summary' : 'Price Details'}</Text>
      <Line k={design ? 'Total MRP' : 'Subtotal'} v={rs(data.subtotal)} />
      <Line k="Discount" v={`- ${rs(data.discount)}`} green />
      <Line k={`${design ? 'Delivery Charge' : 'Delivery Fee'}${optLabel ? ` (${optLabel})` : ''}`} v={data.delivery_fee ? rs(data.delivery_fee) : 'FREE'} green={!data.delivery_fee} />
      <View style={{ height: 1, backgroundColor: C.border, marginTop: 10 }} />
      <Line k={design ? 'Total Amount' : 'Total'} v={rs(data.total)} bold />
    </View>
  );
}
