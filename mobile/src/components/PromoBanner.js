import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, FS, RAD, S, FONT } from '../theme';

// Green promo card used on product listings (design: "Fresh from Local Farms", "Go Organic, Go Healthy").
export default function PromoBanner({ title, subtitle, cta, icon = 'leaf', onPress, style }) {
  return (
    <View style={[{ backgroundColor: C.dark, borderRadius: RAD.lg, padding: S.lg, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' }, style]}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#fff', fontFamily: FONT.headingBold, fontSize: FS.xl }}>{title}</Text>
        {!!subtitle && <Text style={{ color: '#CFE8D6', fontSize: FS.sm, marginTop: S.xs }}>{subtitle}</Text>}
        {!!cta && (
          <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={{ alignSelf: 'flex-start', marginTop: S.md, backgroundColor: '#fff', borderRadius: RAD.pill, paddingHorizontal: S.lg, paddingVertical: S.sm }}>
            <Text style={{ color: C.green, fontFamily: FONT.headingBold, fontSize: FS.sm }}>{cta} →</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center', marginLeft: S.md }}>
        <Ionicons name={icon} size={32} color="#fff" />
      </View>
    </View>
  );
}
