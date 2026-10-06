import React from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Img from './Img';
import { C, FS, R, RAD, S, rs, FONT } from '../theme';

// PART 8A: building blocks for the Cart screen (design: flat white cards, 1px border, green accents).
const box = { backgroundColor: C.card, borderRadius: R, borderWidth: 1, borderColor: C.border };

// Reusable quantity stepper (used inline on every cart line and on upsell cards).
export function QtyStepper({ value, onDec, onInc, min = 1, busy, light, decIcon = 'remove' }) {
  const bg = light ? C.light : C.green;
  const fg = light ? C.green : '#fff';
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: bg, borderRadius: RAD.md, height: 34 }}>
      <TouchableOpacity disabled={value <= min || !!busy} onPress={onDec} accessibilityLabel="Decrease quantity"
        hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }} style={{ paddingHorizontal: 9, opacity: value <= min || busy ? 0.4 : 1 }}>
        <Ionicons name={decIcon} size={16} color={fg} />
      </TouchableOpacity>
      <Text style={{ color: fg, fontFamily: FONT.headingBold, minWidth: 20, textAlign: 'center' }}>{busy ? '·' : value}</Text>
      <TouchableOpacity disabled={!!busy} onPress={onInc} accessibilityLabel="Increase quantity"
        hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }} style={{ paddingHorizontal: 9, opacity: busy ? 0.4 : 1 }}>
        <Ionicons name="add" size={16} color={fg} />
      </TouchableOpacity>
    </View>
  );
}

// Free-delivery progress card: text + bar + 'Free Delivery' chip. `summary` carries amount_for_free_delivery + free_delivery_above.
export function FreeDeliveryBar({ summary }) {
  const above = Number(summary?.free_delivery_above) || 0;
  const left = Number(summary?.amount_for_free_delivery) || 0;
  const unlocked = above > 0 && left <= 0;
  const pct = above > 0 ? Math.min(1, Math.max(0, (above - left) / above)) : 0;
  return (
    <View style={{ ...box, backgroundColor: C.tile, padding: S.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: FONT.heading, color: C.dark2, fontSize: FS.md }}>
            {unlocked ? "You've unlocked FREE delivery!" : `Add ${rs(left)} more for FREE delivery`}
          </Text>
          <Text style={{ fontFamily: FONT.body, color: C.muted, fontSize: FS.xs, marginTop: 2 }}>
            {unlocked ? `Free delivery on orders above ${rs(above)}` : `Free delivery on orders above ${rs(above)}`}
          </Text>
        </View>
        <View style={{ alignItems: 'center', marginLeft: S.md }}>
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="bicycle" size={20} color="#fff" />
          </View>
          <Text style={{ fontFamily: FONT.bodySemi, color: C.green, fontSize: 10, marginTop: 2 }}>Free Delivery</Text>
        </View>
      </View>
      <View style={{ height: 8, borderRadius: 4, backgroundColor: '#fff', marginTop: S.md, overflow: 'hidden' }}>
        <View style={{ width: `${pct * 100}%`, height: 8, borderRadius: 4, backgroundColor: C.green }} />
      </View>
    </View>
  );
}

// One cart line: photo, name, unit, price + strike MRP + OFF pill, stepper, line total, trash.
export function CartLine({ item: i, busy, onChange, onRemove }) {
  const orig = Number(i.original_price) || i.price;
  const off = orig > i.price ? Math.round(((orig - i.price) / orig) * 100) : 0;
  return (
    <View style={{ ...box, borderWidth: 0, flexDirection: 'row', padding: 10, alignItems: 'center' }}>
      <View style={{ width: 72, height: 72, borderRadius: 12, backgroundColor: C.tile, overflow: 'hidden' }}>
        <Img fit="contain" uri={i.image} style={{ width: 72, height: 72 }} />
      </View>
      <View style={{ flex: 1, marginLeft: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={{ fontFamily: FONT.heading, color: C.text, fontSize: FS.md }}>{i.name}</Text>
            <Text style={{ fontFamily: FONT.body, color: C.muted, fontSize: FS.sm }}>{i.unit}</Text>
          </View>
          <TouchableOpacity onPress={onRemove} accessibilityLabel={`Remove ${i.name}`} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="trash-outline" size={19} color={C.muted} />
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, flexWrap: 'wrap' }}>
          <Text style={{ fontFamily: FONT.headingBold, color: C.text }}>{rs(i.price)}</Text>
          {off > 0 && <Text style={{ fontFamily: FONT.body, color: C.muted, textDecorationLine: 'line-through', fontSize: FS.sm, marginLeft: 6 }}>{rs(orig)}</Text>}
          {off > 0 && (
            <View style={{ backgroundColor: C.tint, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginLeft: 6 }}>
              <Text style={{ fontFamily: FONT.bodySemi, color: C.green, fontSize: 10 }}>{off}% OFF</Text>
            </View>
          )}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          <QtyStepper value={i.quantity} busy={busy} onDec={() => onChange(i.quantity - 1)} onInc={() => onChange(i.quantity + 1)} />
          <Text style={{ marginLeft: 'auto', fontFamily: FONT.headingBold, color: C.text }}>{rs(i.subtotal)}</Text>
        </View>
      </View>
    </View>
  );
}

// Horizontal 'You might also need' strip: add-ons from the same categories (backend excludes cart items).
export function UpsellRow({ items, adding, onAdd, onPress }) {
  if (!items?.length) return null;
  return (
    <View style={{ marginTop: S.xl }}>
      <Text style={{ fontFamily: FONT.headingBold, color: C.text, fontSize: FS.lg, marginBottom: S.md }}>You might also need</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: S.lg }}>
        {items.map((p) => (
          <TouchableOpacity key={p.id} activeOpacity={0.9} onPress={() => onPress(p)}
            style={{ ...box, width: 132, padding: S.sm, marginRight: S.md }}>
            <View style={{ backgroundColor: C.tile, borderRadius: RAD.sm, overflow: 'hidden' }}>
              <Img fit="contain" uri={p.images?.[0]} style={{ width: '100%', aspectRatio: 1 }} />
            </View>
            <Text numberOfLines={2} style={{ fontFamily: FONT.heading, color: C.text, marginTop: 6, minHeight: 34, fontSize: FS.sm }}>{p.name}</Text>
            <Text style={{ fontFamily: FONT.body, color: C.muted, fontSize: FS.xs }}>{p.unit}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
              <Text style={{ fontFamily: FONT.headingBold, color: C.text }}>{rs(p.price)}</Text>
              <TouchableOpacity disabled={adding === p.id} onPress={() => onAdd(p)} accessibilityLabel={`Add ${p.name}`}
                style={{ backgroundColor: C.green, borderRadius: RAD.sm, width: 30, height: 30, alignItems: 'center', justifyContent: 'center' }}>
                {adding === p.id ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="add" size={20} color="#fff" />}
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// Bill details card: Total MRP / Discount / Delivery Charge / Total Amount (+ savings line).
export function BillDetails({ summary, feeLabel }) {
  const Line = ({ k, v, bold, green }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
      <Text style={{ color: bold ? C.text : C.muted, fontFamily: bold ? FONT.headingBold : FONT.body, fontSize: bold ? 16 : 14 }}>{k}</Text>
      <Text style={{ color: green ? C.green : C.text, fontFamily: bold ? FONT.headingBold : FONT.bodySemi, fontSize: bold ? 16 : 14 }}>{v}</Text>
    </View>
  );
  const saved = Number(summary.discount) || 0;
  return (
    <View style={{ marginTop: S.xl }}>
      <View style={{ ...box, padding: 14 }}>
        <Text style={{ fontFamily: FONT.headingBold, color: C.text, fontSize: FS.lg, marginBottom: 2 }}>Bill Details</Text>
        <Line k="Total MRP" v={rs(summary.subtotal)} />
        <Line k="Discount" v={`- ${rs(summary.discount)}`} green />
        <Line k={feeLabel ? `Delivery Charge (${feeLabel})` : 'Delivery Charge'} v={summary.delivery_fee ? rs(summary.delivery_fee) : 'FREE'} green={!summary.delivery_fee} />
        <View style={{ height: 1, backgroundColor: C.border, marginTop: 12 }} />
        <Line k="Total Amount" v={rs(summary.total)} bold />
      </View>
      {saved > 0 && (
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.tint, borderRadius: R, padding: S.md, marginTop: S.md }}>
          <Ionicons name="pricetag" size={16} color={C.green} />
          <Text style={{ fontFamily: FONT.bodySemi, color: C.green, fontSize: FS.md, marginLeft: 8 }}>You are saving {rs(saved)} on this order!</Text>
        </View>
      )}
    </View>
  );
}
