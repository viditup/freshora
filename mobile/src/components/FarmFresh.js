import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, FS, RAD, S, FONT } from '../theme';

const FRESH = ['fruits-vegetables', 'dairy-breakfast', 'organic-products', 'fresh-fruits', 'fresh-vegetables', 'dairy', 'organic'];

// "100% Farm Fresh" trust badge from the design; only for fresh-produce style categories.
export default function FarmFresh({ categorySlug, style }) {
  if (!FRESH.includes(categorySlug)) return null;
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.light, borderRadius: RAD.md, padding: S.md, marginTop: S.md }, style]}>
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="leaf" size={20} color="#fff" />
      </View>
      <View style={{ flex: 1, marginLeft: S.md }}>
        <Text style={{ fontFamily: FONT.headingBold, color: C.green, fontSize: FS.md }}>100% Farm Fresh</Text>
        <Text style={{ color: C.muted, fontSize: FS.sm }}>Sourced from trusted farms and quality checked.</Text>
      </View>
    </View>
  );
}
