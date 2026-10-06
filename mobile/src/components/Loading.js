import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { C } from '../theme';

export default function Loading() {
  return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg }}><ActivityIndicator size="large" color={C.green} /></View>;
}
