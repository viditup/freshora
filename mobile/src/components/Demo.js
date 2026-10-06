import React from 'react';
import { Text, View } from 'react-native';
import { C, R, FONT } from '../theme';

// Small shared bits for the PART 10 screens.
export const DemoNote = ({ children }) => (
  <View style={{ backgroundColor: C.amber + '22', borderRadius: R, padding: 10, marginBottom: 14 }}>
    <Text style={{ color: C.text, fontSize: 12 }}>ℹ️ {children}</Text>
  </View>
);
export const Section = ({ title, children }) => (
  <View style={{ marginBottom: 16 }}>
    {!!title && <Text style={{ fontFamily: FONT.headingBold, color: C.text, marginBottom: 8, fontSize: 16 }}>{title}</Text>}
    {children}
  </View>
);
