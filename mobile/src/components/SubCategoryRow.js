import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LOCAL_PRODUCTS from '../../assets/products';
import CAT_ICONS from '../../assets/category-icons';
import { useDesign } from '../scale';
import { C, FONT } from '../theme';

// Category chip row of the product-listing screen (3rd reference screen).
// All sizes are design units measured on the reference at the app's 1048-unit scale (see src/scale.js),
// so the row keeps the reference proportions on every phone width; a few minimums keep text readable.
//
// Reference measurements (design units):
//   chip: 140 x 155 (the selected "All" chip is 121 wide), gap 20, radius 26
//   icon disc: 78, 20 below the chip top;  label: 10 below the disc, top aligned, up to 2 lines, centred
//   selected chip: light-green fill + green border + small green pointer under it
const CHIP_W = 140, ALL_W = 121, CHIP_H = 155, GAP = 20, RADIUS = 26, DISC = 78, PAD_TOP = 20, LABEL_GAP = 10;
// LABEL_MIN: smallest label size in dp. 7 matches the reference wrapping (one line for "Fresh Fruits"); raise it if you want bigger text.
const LABEL_MIN = 7;
const SIDE = 34, TOP = 30, POINTER_W = 20, POINTER_H = 10;

// Label -> bundled photo (assets/products). First match wins, specific names before generic ones.
const ICONS = [
  [/exotic/i, 'dragon-fruit'], [/leaf/i, 'spinach'], [/herb|season/i, 'fresh-mint'],
  [/sweeten/i, 'organic-jaggery'], [/pantry/i, 'organic-turmeric-powder'], [/honey/i, 'organic-honey'],
  [/root|tuber/i, 'potato-agra'], [/cabbage|cauli/i, 'cauliflower'], [/gourd/i, 'cucumber'], [/bean|pea/i, 'green-chilli'],
  [/fruit/i, 'fresh-apples-shimla'], [/veg/i, 'broccoli'],
  [/milk/i, 'full-cream-milk'], [/curd|yogh?urt/i, 'fresh-curd'], [/cheese|paneer/i, 'paneer'], [/butter|ghee/i, 'salted-butter'], [/egg/i, 'farm-eggs'],
  [/bread|bun|bakery/i, 'brown-bread'], [/cake|muffin/i, 'chocolate-muffin'], [/cereal|oats/i, 'corn-flakes'],
  [/chip|namkeen|snack/i, 'potato-chips'], [/nut/i, 'mixed-nuts'], [/makhana/i, 'roasted-makhana'], [/cookie|biscuit/i, 'dark-cookies'],
  [/juice|drink|bever/i, 'orange-juice'], [/tea/i, 'green-tea'], [/coffee/i, 'instant-coffee'],
  [/rice/i, 'basmati-rice'], [/atta|flour/i, 'whole-wheat-atta'], [/dal|pulse/i, 'toor-dal'], [/oil/i, 'sunflower-oil'], [/salt/i, 'iodised-salt'], [/sugar/i, 'sugar'],
  [/floor|clean/i, 'floor-cleaner'], [/dish/i, 'dishwash-liquid'], [/laundry|detergent/i, 'laundry-detergent'], [/hand/i, 'hand-wash'], [/bath|soap/i, 'bath-soap'],
  [/shampoo|hair/i, 'shampoo'], [/tooth|oral/i, 'toothpaste'],
  [/diaper/i, 'baby-diapers'], [/wipe/i, 'baby-wipes'], [/baby/i, 'baby-lotion'], [/dog/i, 'dog-food'], [/cat/i, 'cat-food'], [/pet|groom/i, 'pet-shampoo'],
];
const EMOJI = [[/organic/i, '🌱'], [/pantry|grocer/i, '🌾']];

// Glossy cut-out icons that match the reference (drawn on the disc itself, no white backing). First match wins.
const ART = [[/exotic/i, 'mango'], [/leaf/i, 'leaf'], [/herb|season/i, 'herbs'], [/fruit/i, 'apple'], [/veg/i, 'broccoli'], [/organic/i, 'organic']];
const ART_SCALE = 0.72; // icon box as a share of the disc (reference icons fill ~0.65-0.75 of it)
export const subArt = (label) => { const hit = ART.find(([rx]) => rx.test(label)); return hit ? CAT_ICONS[hit[1]] : null; };

export const subIcon = (label) => {
  const hit = ICONS.find(([rx, key]) => rx.test(label) && LOCAL_PRODUCTS[key]);
  return hit ? LOCAL_PRODUCTS[hit[1]] : null;
};

function Chip({ label, all, active, onPress, d }) {
  const { u, f } = d;
  const w = Math.max(u(all ? ALL_W : CHIP_W), all ? 46 : 50);
  const disc = u(DISC);
  const lh = f(21, LABEL_MIN + 1);
  const h = Math.max(u(CHIP_H), u(PAD_TOP) + disc + u(LABEL_GAP) + lh * 2 + 2);
  const art = all ? null : subArt(label);
  const src = all || art ? null : subIcon(label);
  const fallback = EMOJI.find(([rx]) => rx.test(label));
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: !!active }} accessibilityLabel={label}
      style={{ width: w, marginRight: u(GAP), alignItems: 'center' }}>
      <View style={{ width: w, height: h, alignItems: 'center', paddingTop: u(PAD_TOP), borderRadius: u(RADIUS),
        backgroundColor: active ? '#E6F4E4' : 'rgba(255,255,255,0.7)', borderWidth: active ? 1.5 : 1, borderColor: active ? '#7CC48F' : '#ECF1E8',
        ...(active ? { shadowColor: C.green, shadowOpacity: 0.12, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 } : null) }}>
        <View style={{ width: disc, height: disc, borderRadius: disc / 2, backgroundColor: active ? '#D3EBD3' : '#E7F3E2', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {all ? <Ionicons name="grid" size={f(38, 15)} color={C.green} />
            : art ? <Image source={art} resizeMode="contain" style={{ width: disc * ART_SCALE, height: disc * ART_SCALE }} />
            : src ? (
              // product photos sit on white: crop in tight so the product fills the disc like the reference icons
              <View style={{ width: disc * 0.84, height: disc * 0.84, borderRadius: disc * 0.42, overflow: 'hidden', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
                <Image source={src} resizeMode="cover" style={{ width: disc * 1.2, height: disc * 1.2 }} />
              </View>
            ) : <Text style={{ fontSize: disc * 0.55 }}>{fallback ? fallback[1] : '🛒'}</Text>}
        </View>
        <Text numberOfLines={2} style={{ width: w - 2, marginTop: u(LABEL_GAP), textAlign: 'center', fontSize: f(18, LABEL_MIN), lineHeight: lh, fontFamily: FONT.bodySemi, color: C.dark2 }}>{label}</Text>
      </View>
      {/* pointer under the selected chip (every chip reserves the space so the row stays aligned) */}
      <View style={{ height: u(POINTER_H), marginTop: 1, alignItems: 'center', justifyContent: 'flex-start' }}>
        {active && <View style={{ width: 0, height: 0, borderLeftWidth: u(POINTER_W) / 2, borderRightWidth: u(POINTER_W) / 2, borderTopWidth: u(POINTER_H), borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: C.green }} />}
      </View>
    </TouchableOpacity>
  );
}

// chips = [{ value, label }]; sub = selected value or null ("All").
export default function SubCategoryRow({ chips, sub, onAll, onChip }) {
  const d = useDesign();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} decelerationRate="fast"
      contentContainerStyle={{ paddingLeft: d.u(SIDE), paddingRight: d.u(SIDE) - d.u(GAP), paddingTop: d.u(TOP), paddingBottom: d.u(14) }}>
      <Chip d={d} all label="All" active={!sub} onPress={onAll} />
      {chips.map((c) => {
        const label = c.label || c.value;
        return <Chip key={c.value} d={d} label={label} active={sub === c.value} onPress={() => onChip(c)} />;
      })}
    </ScrollView>
  );
}
