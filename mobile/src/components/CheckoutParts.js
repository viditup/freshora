import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PAYMENT_METHODS } from '../payments';
import { C, FS, R, RAD, S, rs, FONT } from '../theme';

// PART 8B: building blocks for the Checkout. The working 3-step wizard (Address -> Payment -> Review)
// is kept; it is DRAWN as the design's 4-step stepper: Cart > Checkout > Payment > Order Placed.

export const STEP_LABELS = ['Cart', 'Checkout', 'Payment', 'Order Placed'];
// wizard step -> highlighted stepper index (Cart is always done; Review still counts as the Payment stage)
const ACTIVE_FOR = { 1: 1, 2: 2, 3: 2 };

// In-page title block + 'Secure Checkout' badge (the native header title is blank on this screen).
export function CheckoutHeader() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: S.lg, paddingBottom: S.md }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FONT.headingBold, color: C.dark2, fontSize: FS.xxl }}>Checkout</Text>
        <Text style={{ fontFamily: FONT.body, color: C.muted, fontSize: FS.sm }}>Review your order and complete the payment</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.tint, borderRadius: RAD.md, paddingHorizontal: S.md, paddingVertical: 6, marginLeft: S.sm }}>
        <Ionicons name="shield-checkmark" size={20} color={C.green} />
        <View style={{ marginLeft: 6 }}>
          <Text style={{ fontFamily: FONT.heading, color: C.green, fontSize: 11 }}>Secure Checkout</Text>
          <Text style={{ fontFamily: FONT.body, color: C.muted, fontSize: 9 }}>100% Safe & Secure</Text>
        </View>
      </View>
    </View>
  );
}

export function StepIndicator({ step }) {
  const active = ACTIVE_FOR[step] ?? 1;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: S.lg, paddingVertical: S.md, backgroundColor: C.card, borderTopWidth: 1, borderBottomWidth: 1, borderColor: C.border }}>
      {STEP_LABELS.map((label, i) => {
        const done = i < active;
        const on = i === active;
        return (
          <React.Fragment key={label}>
            <View style={{ alignItems: 'center', width: 62 }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
                backgroundColor: done || on ? C.green : C.tint }}>
                {done ? <Ionicons name="checkmark" size={16} color="#fff" /> : <Text style={{ color: on ? '#fff' : C.muted, fontFamily: FONT.headingBold, fontSize: FS.sm }}>{i + 1}</Text>}
              </View>
              <Text numberOfLines={1} style={{ fontSize: 10, marginTop: 4, fontFamily: on ? FONT.headingBold : FONT.bodySemi, color: on || done ? C.green : C.muted }}>{label}</Text>
            </View>
            {i < STEP_LABELS.length - 1 && <View style={{ flex: 1, height: 2, marginTop: 13, backgroundColor: i < active ? C.green : C.border }} />}
          </React.Fragment>
        );
      })}
    </View>
  );
}

// 'You are saving Rs X on this order!' strip (only when there is a saving).
export const SavingsStrip = ({ amount }) => (Number(amount) > 0 ? (
  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.tint, borderRadius: R, padding: S.md, marginTop: S.md }}>
    <Ionicons name="pricetag" size={16} color={C.green} />
    <Text style={{ fontFamily: FONT.bodySemi, color: C.green, fontSize: FS.md, marginLeft: 8 }}>You are saving {rs(amount)} on this order!</Text>
  </View>
) : null);

export const StepCard = ({ title, action, onAction, children }) => (
  <View style={{ backgroundColor: C.card, borderRadius: R, borderWidth: 1, borderColor: C.border, padding: S.lg, marginBottom: S.lg }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: S.sm }}>
      <Text style={{ fontFamily: FONT.headingBold, color: C.text, fontSize: FS.lg }}>{title}</Text>
      {!!action && <TouchableOpacity onPress={onAction} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}><Text style={{ color: C.green, fontFamily: FONT.heading }}>{action}</Text></TouchableOpacity>}
    </View>
    {children}
  </View>
);

const Radio = ({ on }) => (
  <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: on ? C.green : C.border, alignItems: 'center', justifyContent: 'center' }}>
    {on && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: C.green }} />}
  </View>
);

// Delivery options as side-by-side tiles: Standard (free above the threshold) vs Express (flat priority fee).
export function DeliveryOptions({ info, payable, value, onChange }) {
  const options = info?.options || [];
  return (
    <View style={{ flexDirection: 'row', marginTop: S.xs }}>
      {options.map((o, idx) => {
        const on = value === o.key;
        const free = o.key === 'standard' && o.free_above != null && payable >= o.free_above;
        const feeText = free ? 'FREE' : rs(o.fee);
        return (
          <TouchableOpacity key={o.key} onPress={() => onChange(o.key)} activeOpacity={0.85}
            style={{ flex: 1, borderWidth: 1.5, borderRadius: RAD.md, padding: S.md, marginLeft: idx ? S.sm : 0,
              borderColor: on ? C.green : C.border, backgroundColor: on ? C.tile : '#fff' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Radio on={on} />
              <Text style={{ fontFamily: FONT.headingBold, color: free ? C.green : C.text }}>{feeText}</Text>
            </View>
            <Text style={{ fontFamily: FONT.heading, color: C.text, marginTop: S.sm }}>{o.label}</Text>
            <Text style={{ fontFamily: FONT.body, color: C.muted, fontSize: FS.sm }}>
              {o.key === 'express' ? `Within ~${o.eta_minutes} min` : `~${o.eta_minutes} min`}
            </Text>
            {o.key !== 'express' && o.free_above != null && <Text style={{ fontFamily: FONT.body, color: C.muted, fontSize: 10, marginTop: 2 }}>Free above {rs(o.free_above)}</Text>}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// Payment list: UPI / Card / Wallet / COD - DEMO only, no gateway.
export function PaymentOptions({ value, onChange }) {
  return (
    <View>
      {PAYMENT_METHODS.map((m) => {
        const on = value === m.key;
        return (
          <TouchableOpacity key={m.key} onPress={() => onChange(m.key)} activeOpacity={0.85}
            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: S.md, borderTopWidth: 1, borderTopColor: '#F0F4EC' }}>
            <Radio on={on} />
            <Ionicons name={m.icon} size={20} color={on ? C.green : C.muted} style={{ marginLeft: S.sm }} />
            <View style={{ flex: 1, marginLeft: S.sm }}>
              <Text style={{ fontFamily: FONT.heading, color: C.text }}>{m.label}</Text>
              <Text style={{ color: C.muted, fontSize: FS.sm }}>{m.sub}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export const DemoNote = () => (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: S.md, backgroundColor: C.pink, borderRadius: RAD.md, padding: S.md }}>
    <Ionicons name="information-circle-outline" size={16} color={C.red} />
    <Text style={{ color: C.red, fontSize: FS.sm, marginLeft: S.sm, flex: 1 }}>Demo checkout - no payment gateway is used and no real money is charged.</Text>
  </View>
);
