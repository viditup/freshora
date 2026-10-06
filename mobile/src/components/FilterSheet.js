import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, FS, RAD, S, rs, FONT } from '../theme';

// PART 6: shared bottom-sheet building blocks for the listing filter bar.
// Everything here is UI only - the actual filtering happens through the
// existing /products query params (sort, min_price, max_price, brand, organic,
// min_rating, in_stock, subcategory).

export const SORTS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top rated' },
  { value: 'popular', label: 'Most popular' },
];

export const PRICES = [
  { value: 'any', label: 'Any price', min: null, max: null },
  { value: 'lt50', label: 'Under ₹50', min: null, max: 49 },
  { value: '50-100', label: '₹50 - ₹100', min: 50, max: 100 },
  { value: '100-200', label: '₹100 - ₹200', min: 100, max: 200 },
  { value: 'gt200', label: 'Above ₹200', min: 200, max: null },
];

export const RATINGS = [
  { value: null, label: 'Any rating' },
  { value: 4, label: '4 stars & above' },
  { value: 4.5, label: '4.5 stars & above' },
];

export const EMPTY_FILTERS = { sort: 'newest', price: PRICES[0], brands: [], organic: false, minRating: null, inStock: false };

export const sortLabel = (v) => (SORTS.find((o) => o.value === v) || SORTS[0]).label;
export const priceActive = (f) => f.price.min !== null || f.price.max !== null;
// Number shown on the "Filters" chip: how many facets are narrowing the list.
export const activeCount = (f) => (priceActive(f) ? 1 : 0) + (f.brands.length ? 1 : 0) + (f.organic ? 1 : 0) + (f.minRating ? 1 : 0) + (f.inStock ? 1 : 0);

export function Sheet({ visible, title, onClose, children, footer }) {
  return (
    <Modal visible={!!visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity activeOpacity={1} onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(20,40,26,0.45)', justifyContent: 'flex-end' }}>
        <TouchableOpacity activeOpacity={1} onPress={() => {}} style={{ backgroundColor: '#fff', borderTopLeftRadius: RAD.lg + 4, borderTopRightRadius: RAD.lg + 4, maxHeight: '88%' }}>
          <View style={{ width: 44, height: 5, borderRadius: 3, backgroundColor: C.border, alignSelf: 'center', marginTop: S.sm }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: S.lg, paddingTop: S.md, paddingBottom: S.sm }}>
            <Text style={{ fontSize: FS.lg, fontFamily: FONT.headingBold, color: C.text }}>{title}</Text>
            <TouchableOpacity onPress={onClose} accessibilityLabel="Close" hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={22} color={C.muted} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ paddingHorizontal: S.lg, paddingBottom: S.lg }} keyboardShouldPersistTaps="handled">{children}</ScrollView>
          {!!footer && <View style={{ flexDirection: 'row', padding: S.lg, borderTopWidth: 1, borderTopColor: C.border }}>{footer}</View>}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const Btn = ({ title, onPress, primary, flex }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.85}
    style={{ flex, height: 48, borderRadius: RAD.md, alignItems: 'center', justifyContent: 'center', marginLeft: primary ? S.md : 0,
      backgroundColor: primary ? C.green : 'transparent', borderWidth: primary ? 0 : 1.5, borderColor: C.border }}>
    <Text style={{ color: primary ? '#fff' : C.text, fontFamily: FONT.headingBold }}>{title}</Text>
  </TouchableOpacity>
);

export const SheetRow = ({ label, sub, active, onPress }) => (
  <TouchableOpacity onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#F0F4EC' }}>
    <View style={{ flex: 1, marginRight: 10 }}>
      <Text style={{ fontSize: FS.md, color: active ? C.green : C.text, fontFamily: active ? FONT.headingBold : FONT.bodyMedium }}>{label}</Text>
      {!!sub && <Text style={{ fontSize: FS.sm, color: C.muted, marginTop: 1 }}>{sub}</Text>}
    </View>
    {active && <Ionicons name="checkmark-circle" size={20} color={C.green} />}
  </TouchableOpacity>
);

// Single-select list (Sort / Price / Rating).
export function OptionSheet({ visible, title, options, value, onSelect, onClose }) {
  return (
    <Sheet visible={visible} title={title} onClose={onClose}>
      {options.map((o) => (
        <SheetRow key={String(o.value ?? o.label)} label={o.label} sub={o.sub} active={(o.value ?? null) === (value ?? null)}
          onPress={() => { onSelect(o); onClose(); }} />
      ))}
    </Sheet>
  );
}

// Multi-select list with counts (Brand).
export function MultiSheet({ visible, title, options, values, onToggle, onClear, onClose }) {
  return (
    <Sheet visible={visible} title={title} onClose={onClose}
      footer={<>
        <Btn title="Clear" flex={1} onPress={onClear} />
        <Btn title="Show results" flex={2} primary onPress={onClose} />
      </>}>
      {options.length === 0 && <Text style={{ color: C.muted, paddingVertical: S.md }}>Nothing to choose here yet.</Text>}
      {options.map((o) => {
        const active = values.includes(o.value);
        return (
          <TouchableOpacity key={String(o.value)} onPress={() => onToggle(o.value)} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#F0F4EC' }}>
            <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: active ? C.green : C.border, backgroundColor: active ? C.green : '#fff', alignItems: 'center', justifyContent: 'center', marginRight: S.md }}>
              {active && <Ionicons name="checkmark" size={14} color="#fff" />}
            </View>
            <Text style={{ flex: 1, color: C.text, fontSize: FS.md }}>{o.label}</Text>
            {!!o.count && <Text style={{ color: C.muted, fontSize: FS.sm }}>{o.count}</Text>}
          </TouchableOpacity>
        );
      })}
    </Sheet>
  );
}

const Group = ({ title, children }) => (
  <View style={{ marginTop: S.lg }}>
    <Text style={{ fontFamily: FONT.headingBold, color: C.text, marginBottom: S.sm }}>{title}</Text>
    {children}
  </View>
);

const Pill = ({ label, active, onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.85}
    style={{ paddingHorizontal: S.lg, paddingVertical: S.sm, borderRadius: RAD.pill, borderWidth: 1, marginRight: S.sm, marginBottom: S.sm,
      backgroundColor: active ? C.green : '#fff', borderColor: active ? C.green : C.border }}>
    <Text style={{ fontSize: FS.sm, fontFamily: FONT.heading, color: active ? '#fff' : C.text }}>{label}</Text>
  </TouchableOpacity>
);

const Toggle = ({ label, value, onChange }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 }}>
    <Text style={{ color: C.text, fontSize: FS.md, flex: 1, marginRight: S.md }}>{label}</Text>
    <Switch value={!!value} onValueChange={onChange} trackColor={{ true: C.green, false: '#D8E2D2' }} thumbColor="#fff" />
  </View>
);

// Full filter sheet: Sort, Price, Brand, Organic, Rating, Availability.
export function FilterSheet({ visible, onClose, value, onApply, facets }) {
  const [d, setD] = useState(value);
  useEffect(() => { if (visible) setD(value); }, [visible, value]);
  const set = (patch) => setD((p) => ({ ...p, ...patch }));
  const brands = facets?.brands || [];
  const range = facets?.price && facets.price.max ? `Available: ${rs(facets.price.min)} - ${rs(facets.price.max)}` : null;

  return (
    <Sheet visible={visible} title="Filters" onClose={onClose}
      footer={<>
        <Btn title="Clear all" flex={1} onPress={() => setD({ ...EMPTY_FILTERS, sort: d.sort })} />
        <Btn title="Apply" flex={2} primary onPress={() => { onApply(d); onClose(); }} />
      </>}>
      <Group title="Sort by">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {SORTS.map((o) => <Pill key={o.value} label={o.label} active={d.sort === o.value} onPress={() => set({ sort: o.value })} />)}
        </View>
      </Group>

      <Group title="Price">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {PRICES.map((o) => <Pill key={o.value} label={o.label} active={d.price.value === o.value} onPress={() => set({ price: o })} />)}
        </View>
        {!!range && <Text style={{ color: C.muted, fontSize: FS.sm }}>{range}</Text>}
      </Group>

      <Group title="Brand">
        {brands.length ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {brands.map((b) => (
              <Pill key={b.value} label={`${b.value} (${b.count})`} active={d.brands.includes(b.value)}
                onPress={() => set({ brands: d.brands.includes(b.value) ? d.brands.filter((x) => x !== b.value) : [...d.brands, b.value] })} />
            ))}
          </View>
        ) : <Text style={{ color: C.muted, fontSize: FS.sm }}>No brands in this category yet.</Text>}
      </Group>

      <Group title="Organic">
        <Toggle label="Show only organic products" value={d.organic} onChange={(v) => set({ organic: v })} />
      </Group>

      <Group title="Rating">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {RATINGS.map((o) => <Pill key={o.label} label={o.label} active={(d.minRating ?? null) === (o.value ?? null)} onPress={() => set({ minRating: o.value })} />)}
        </View>
      </Group>

      <Group title="Availability">
        <Toggle label="In stock only" value={d.inStock} onChange={(v) => set({ inStock: v })} />
      </Group>
    </Sheet>
  );
}
