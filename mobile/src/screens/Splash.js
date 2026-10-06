import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, Easing, Image, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, FONT } from '../theme';
import D from '../designImages';

// SCREEN 1 (Splash) - matches design screen 1.
// Responsive: the screen measures the space it really gets (onLayout) and places everything from that
// (percent of height / "u" = width/393, the design's phone width), so nothing is cut or overflows on any phone.
// The small hand-drawn extras (underline, hearts, arrow) are anchored to their note, in "u" units, so they keep
// the same distance from the text on short, normal and tall phones.
const NOTE = '#4F7358'; // "Your Daily Happiness Delivered" text colour (unchanged)
const NOTE_TOP = '#677861'; // "Good Things Arrive Faster" text colour - lighter muted sage, sampled from the design
const FEATS = [['leaf', C.green, 'FRESH\nPRODUCTS'], ['flash', C.green, 'FAST\nDELIVERY'], ['heart-outline', C.dark, 'HAPPIER\nYOU']];

// Design reference frame (the splash screen in freshora.pdf is 850 x 1850 px). Horizontal decoration positions are
// taken from that frame as fractions of the width.
const DW = 850;

// Distance of each extra below the top of its note, in "u" units (u = screen width / 393). Tune here if ever needed.
const UL_DY = 60;     // underline + heart under "Faster"
const ARROW_DY = 60;  // curved arrow under "Delivered"
const HEART_DY = 63.5; // small heart under "Delivered" (raise this number to push the heart further down)

function LoadingBar({ w, h }) {
  const p = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    // Starts as an empty light-grey track; the green fill grows from the left until full, holds a moment, then restarts.
    const a = Animated.loop(Animated.sequence([
      Animated.timing(p, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
      Animated.delay(250),
      Animated.timing(p, { toValue: 0, duration: 0, useNativeDriver: false }),
    ]));
    a.start();
    return () => a.stop();
  }, [p]);
  const fill = p.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  return (
    <View style={{ width: w, height: h, borderRadius: h / 2, backgroundColor: '#E1E5DD', overflow: 'hidden' }}>
      <Animated.View style={{ width: fill, height: h, borderRadius: h / 2, backgroundColor: C.green }} />
    </View>
  );
}

// Small handwritten note (Caveat), slightly rotated. Hearts / underline / arrow are separate images (see Splash below).
function Note({ text, size, rotate, style, color = NOTE }) {
  return (
    <View pointerEvents="none" style={[{ position: 'absolute', transform: [{ rotate }] }, style]}>
      <Text allowFontScaling={false} style={{ fontFamily: FONT.script, fontSize: size, lineHeight: Math.round(size * 1.08), color }}>{text}</Text>
    </View>
  );
}

export default function Splash() {
  const { width } = useWindowDimensions();
  // Real height of this screen, measured after the first layout. Nothing is drawn until we know it, so there is no jump.
  const [height, setHeight] = useState(0);
  const u = width / 393;
  // Short / wide phones: shrink the logo a little so it never runs into the bag.
  const k = height ? Math.min(1, height / (width * 2.188)) : 1;
  const logoW = Math.round(Math.min(width * 0.62 * k, 340));
  const logoH = Math.round(logoW * 205 / 540);
  // splash_bag.jpg is now cut from the design at full size (770x830) and includes the whole left leaf.
  const bagW = Math.round(Math.min(width * 0.905, height * 0.448 * 770 / 830, 400));
  const bagH = Math.round(bagW * 830 / 770);
  const barW = Math.max(96, Math.round(104 * u));

  // Underline + heart under "Faster" (design px x 689-817; image 512x192).
  const ulW = (128 / DW) * width;
  const ulH = ulW * 192 / 512;
  // Curved arrow under "Delivered" (design px x 85-160; image 300x372).
  const arW = (75 / DW) * width;
  const arH = arW * 372 / 300;
  // Small heart under "Delivered" (design px x 106-132; image 104x128).
  const htW = (26 / DW) * width;
  const htH = htW * 128 / 104;

  const topNoteY = height * 0.075;
  const leftNoteY = height * 0.583;

  return (
    <View style={{ flex: 1, backgroundColor: '#FEFBF2' }} onLayout={(e) => setHeight(Math.round(e.nativeEvent.layout.height))}>
      {height > 0 && (
        <>
          <Note text={'Good\nThings\nArrive\nFaster'} size={Math.round(17 * u)} rotate="-7deg" color={NOTE_TOP} style={{ top: topNoteY, left: width * 0.81 }} />
          <Image source={require('../../assets/design/splash_note_underline.png')} resizeMode="contain" pointerEvents="none"
            style={{ position: 'absolute', top: topNoteY + UL_DY * u, left: (689 / DW) * width, width: ulW, height: ulH }} />

          <Image source={D.splash_logo} resizeMode="contain"
            style={{ position: 'absolute', top: height * 0.19, alignSelf: 'center', width: logoW, height: logoH }} />

          <Image source={D.splash_bag} resizeMode="contain"
            style={{ position: 'absolute', top: height * 0.345 - bagH * 0.036, left: width * 0.563 - bagW / 2, width: bagW, height: bagH }} />

          <Note text={'Your\nDaily\nHappiness\nDelivered'} size={Math.round(15 * u)} rotate="-12deg" style={{ top: leftNoteY, left: width * 0.035 }} />
          <Image source={require('../../assets/design/splash_note_arrow.png')} resizeMode="contain" pointerEvents="none"
            style={{ position: 'absolute', top: leftNoteY + ARROW_DY * u, left: (85 / DW) * width, width: arW, height: arH }} />
          <Image source={require('../../assets/design/splash_note_heart.png')} resizeMode="contain" pointerEvents="none"
            style={{ position: 'absolute', top: leftNoteY + HEART_DY * u, left: (106 / DW) * width, width: htW, height: htH }} />

          <View style={{ position: 'absolute', top: height * 0.806, left: 0, right: 0, alignItems: 'center' }}>
            <LoadingBar w={barW} h={Math.max(4, Math.round(5 * u))} />
            <Text allowFontScaling={false} style={{ color: C.dark2, fontFamily: FONT.bodyMedium, fontSize: Math.round(12.5 * u), marginTop: Math.round(14 * u) }}>Loading a fresher tomorrow...</Text>
          </View>

          <View style={{ position: 'absolute', top: height * 0.885, left: 0, right: 0, flexDirection: 'row', alignItems: 'center' }}>
            {FEATS.map(([icon, color, t], i) => (
              <View key={t} style={{ flex: 1, height: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderLeftWidth: i ? 1 : 0, borderLeftColor: '#E3E6DF' }}>
                <Ionicons name={icon} size={Math.round(21 * u)} color={color} />
                <Text allowFontScaling={false} style={{ fontSize: Math.max(8, Math.round(8.5 * u)), lineHeight: Math.round(12 * u), letterSpacing: 1.2, color: '#4B5A50', fontFamily: FONT.bodySemi, marginLeft: 7 }}>{t}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
}
