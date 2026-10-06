import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { api } from '../api';
import Btn from '../components/Btn';
import { ARTICLES, readMinutes } from '../content/articles';
import { findCategory } from '../homeSections';
import { C, FONT } from '../theme';

export default function Article({ route, navigation }) {
  const a = ARTICLES.find((x) => x.id === route.params?.id);
  if (!a) return <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: C.muted }}>Article not found</Text></View>;

  const shop = async () => {
    try {
      const cat = findCategory((await api.get('/categories')).data.data, a.cat);
      if (cat) return navigation.navigate('Products', { categoryId: cat.id, title: cat.name });
    } catch (e) { /* fall through */ }
    navigation.navigate('Products', { title: 'All Products' });
  };
  return (
    <ScrollView style={{ backgroundColor: C.bg }} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={{ height: 150, backgroundColor: a.bg, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 72 }}>{a.emoji}</Text></View>
      <View style={{ padding: 16 }}>
        <Text style={{ color: C.green, fontSize: 12, fontFamily: FONT.headingBold, letterSpacing: 0.6 }}>{a.tag.toUpperCase()}  •  {readMinutes(a)} MIN READ</Text>
        <Text style={{ fontSize: 24, fontFamily: FONT.headingBold, color: C.text, marginTop: 6, lineHeight: 30 }}>{a.title}</Text>
        {a.body.map((p, i) => <Text key={i} style={{ color: C.text, fontSize: 15, lineHeight: 24, marginTop: 14 }}>{p}</Text>)}
        <Btn title="Shop related products" onPress={shop} style={{ marginTop: 28 }} />
      </View>
    </ScrollView>
  );
}
