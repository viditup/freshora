import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONT } from '../theme';
import { useDesign } from '../scale';

// PART 30: ONE handwritten-note component for all banners + Stay Updated.
// Why the last letter was cut ("Good" -> "Gooa"): Caveat's last glyph sticks out a little past its advance width, and Android clips
// text exactly at the Text view's width. Fix = extra paddingRight inside every line (the glyph then draws inside the view),
// no numberOfLines (nothing is truncated) and an explicitly sized block (so the line can never wrap or shrink).
// A trailing ♥ in `text` is drawn as a real Ionicons heart (the character itself becomes a red emoji on Android).
//
// The note lives in a "free strip" (absolute, right edge of the card, width = stripUnits design units). It is centred inside that
// strip, so it can never sit over the photo that is placed to the left of the strip.
export const noteWidth = (lines, fs, heart) =>
  Math.ceil(Math.max(...lines.map((l) => l.length)) * fs * 0.5 + fs * 0.6 + (heart ? fs * 0.95 : 0));

export const NoteBlock = ({ text, color, stripUnits, top = 16, fs: fsU = 26, lh: lhU = 28, rot = -7 }) => {
  const { u, f } = useDesign();
  if (!text) return null;
  const heart = /♥\s*$/.test(text);
  const lines = text.replace(/\s*♥\s*$/, '').split('\n');
  const fs = f(fsU, 10.5);
  const lh = f(lhU, 12);
  const bw = noteWidth(lines, fs, heart);
  const left = Math.max(2, (u(stripUnits) - bw) / 2);
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: u(stripUnits) }}>
      <View style={{ position: 'absolute', top: u(top), left, width: bw, transform: [{ rotate: `${rot}deg` }] }}>
        {lines.map((l, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text maxFontSizeMultiplier={1} style={{ fontFamily: FONT.script, fontSize: fs, lineHeight: lh, color, paddingRight: Math.ceil(fs * 0.3), paddingLeft: 1 }}>{l}</Text>
            {heart && i === lines.length - 1 && <Ionicons name="heart" size={Math.round(fs * 0.8)} color={color} />}
          </View>
        ))}
      </View>
    </View>
  );
};
