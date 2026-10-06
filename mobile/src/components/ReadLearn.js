import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ARTICLES } from '../content/articles';
import Img from './Img';
import B, { RATIO } from '../bannerImages';
import { C, FONT } from '../theme';
import { useDesign } from '../scale';

// PART 25: "Read & Learn" like the design: heading + See All, then TWO side-by-side coloured cards (title, dark "Read More" pill, photo right).
// Card = 476 x 175 design units (see ../scale.js), gap 16, left 40. "See All" shows the remaining articles under the first two (no new screen needed).
const ART = { 'eat-healthier': { src: B.learn_eat, ratio: RATIO.learn_eat }, 'read-labels': { src: B.learn_labels, ratio: RATIO.learn_labels } };
const PILL = '#0B5A3A';
const HOME_FIRST = ['eat-healthier', 'read-labels'];

function LearnCard({ a, w, onOpen }) {
  const { u, f } = useDesign();
  const bg = a.card || a.bg || '#E3F1DA';
  const pillH = Math.max(22, u(40));
  const art = ART[a.id];
  // The two home cards ("5 Easy Ways", "Understanding Food Labels") are ready-made pictures at their own shape. The whole card is the button.
  if (art) {
    return (
      <TouchableOpacity activeOpacity={0.92} onPress={() => onOpen(a)} accessibilityLabel={a.title} style={{ width: w, aspectRatio: art.ratio }}>
        <Img source={art.src} fit="cover" style={{ width: '100%', height: '100%' }} />
      </TouchableOpacity>
    );
  }
  // other articles (shown after "See All") keep the live card with an emoji
  return (
    <TouchableOpacity activeOpacity={0.92} onPress={() => onOpen(a)} accessibilityLabel={a.title}
      style={{ width: w, minHeight: u(172), borderRadius: u(26), backgroundColor: bg, overflow: 'hidden', justifyContent: 'center' }}>
      <View pointerEvents="none" style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '44%', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: Math.max(26, u(80)) }}>{a.emoji}</Text>
      </View>
      <View style={{ paddingLeft: u(26), paddingVertical: u(20), width: '60%' }}>
        <Text maxFontSizeMultiplier={1} adjustsFontSizeToFit minimumFontScale={0.8} numberOfLines={3} style={{ color: '#0B4D33', fontSize: f(21, 9.5), lineHeight: f(26, 12), fontFamily: FONT.headingBold }}>{a.home || a.title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', height: pillH, paddingHorizontal: u(24), borderRadius: pillH / 2, backgroundColor: PILL, marginTop: u(14) }}>
          <Text maxFontSizeMultiplier={1} style={{ color: '#fff', fontFamily: FONT.heading, fontSize: f(17, 9) }}>Read More</Text>
          <Ionicons name="arrow-forward" size={f(18, 10)} color="#fff" style={{ marginLeft: u(8) }} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ReadLearn({ onOpen }) {
  const { u, f } = useDesign();
  const [all, setAll] = useState(false);
  const w = Math.floor(u(476));
  const gap = Math.round(u(16));
  // PART 30 (= Part 29 intent): design order on Home is "5 Easy Ways" first, then the blue "Understanding Food Labels", then the rest.
  const ordered = [...HOME_FIRST.map((id) => ARTICLES.find((a) => a.id === id)).filter(Boolean), ...ARTICLES.filter((a) => !HOME_FIRST.includes(a.id))];
  const shown = all ? ordered : ordered.slice(0, 2);
  const rows = [];
  for (let i = 0; i < shown.length; i += 2) rows.push(shown.slice(i, i + 2));
  return (
    <View style={{ marginTop: u(36) }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: u(42), marginBottom: u(22) }}>
        <Text maxFontSizeMultiplier={1.1} style={{ fontSize: f(32, 14), fontFamily: FONT.headingBold, color: C.text }}>Read & Learn</Text>
        {ARTICLES.length > 2 && (
          <TouchableOpacity onPress={() => setAll((v) => !v)} accessibilityLabel={all ? 'Show fewer articles' : 'See all articles'} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text maxFontSizeMultiplier={1.1} style={{ color: C.green, fontFamily: FONT.heading, fontSize: f(28, 12) }}>{all ? 'Show Less' : 'See All'}</Text>
            {!all && <Ionicons name="arrow-forward" size={f(30, 13)} color={C.green} style={{ marginLeft: 3 }} />}
          </TouchableOpacity>
        )}
      </View>
      {rows.map((r, i) => (
        <View key={i} style={{ flexDirection: 'row', paddingLeft: u(40), marginTop: i ? gap : 0 }}>
          {r.map((a, j) => <View key={a.id} style={{ marginLeft: j ? gap : 0 }}><LearnCard a={a} w={w} onOpen={onOpen} /></View>)}
        </View>
      ))}
    </View>
  );
}
