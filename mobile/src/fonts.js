// PART 2A: global font handling.
// Every Text in the app is styled with fontWeight only (no fontFamily). With custom fonts on
// Android that would fall back to Roboto. applyGlobalFont() wraps RN <Text> once so that any
// Text WITHOUT an explicit fontFamily gets the right Plus Jakarta Sans / Inter file chosen from
// its fontWeight. Text that already sets fontFamily (T presets, script text) is left alone.
import React from 'react';
import { Text, TextInput, StyleSheet } from 'react-native';
import { FONT } from './theme';

export const MAX_FONT_SCALE = 1.1;

export function familyForWeight(w) {
  const n = w === 'bold' ? 700 : w === 'normal' || w == null ? 400 : parseInt(w, 10) || 400;
  if (n >= 800) return FONT.headingBold;
  if (n >= 700) return FONT.heading;
  if (n >= 600) return FONT.bodySemi;
  if (n >= 500) return FONT.bodyMedium;
  return FONT.body;
}

function patch(Comp) {
  if (!Comp || Comp.__freshoraPatched || typeof Comp.render !== 'function') return false;
  const orig = Comp.render;
  Comp.render = function (props, ref) {
    const flat = StyleSheet.flatten(props.style) || {};
    // PART 15: a phone set to "Large font" made headings 30-40% bigger and clipped the hero banner / cards.
    // Text may still grow a little (10%) for readability, but layouts keep the design proportions.
    const cap = props.maxFontSizeMultiplier == null ? MAX_FONT_SCALE : props.maxFontSizeMultiplier;
    if (flat.fontFamily) return orig.call(this, { ...props, maxFontSizeMultiplier: cap }, ref);
    const style = [props.style, { fontFamily: familyForWeight(flat.fontWeight), fontWeight: 'normal' }];
    return orig.call(this, { ...props, style, maxFontSizeMultiplier: cap }, ref);
  };
  Comp.__freshoraPatched = true;
  return true;
}

let done = false;
export function applyGlobalFont() {
  if (done) return;
  done = true;
  try { patch(Text); patch(TextInput); } catch (e) { /* if RN internals change, app still works with system font */ }
}

// Explicit alternative for new code: <AppText variant="h2">..</AppText>
import { T } from './theme';
export function AppText({ variant = 'body', style, ...rest }) {
  return <Text {...rest} style={[T[variant] || T.body, style]} />;
}
