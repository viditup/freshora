import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Platform, useWindowDimensions } from 'react-native';
import * as SystemUI from 'expo-system-ui';
import * as NavigationBar from 'expo-navigation-bar';
import { Ionicons } from '@expo/vector-icons';
import { FONT } from '../theme';

// Handwriting font for the note. Caveat's "d" looks like an "a" ("Gooa"), Kalam Light has a clear "d".
const SCRIPT_FONT = 'Kalam_300Light';

// CHUNK 1 (screens 2-4 of the design PDF): exact onboarding layout.
// Every number below was measured from the design bitmaps (850x1850 px each). They are stored in
// "design units" = a 429 x 925 canvas, then scaled to the phone, so the layout keeps the design's proportions.
// The photo, curved shapes and the pale script bubble are baked into assets/onboard_bg{1,2,3}.jpg (all text and
// buttons were removed from those images); text, chips, dots and buttons are drawn here in code.
const DW = 429, DH = 925;
const BG = [require('../../assets/onboard_bg1.jpg'), require('../../assets/onboard_bg2.jpg'), require('../../assets/onboard_bg3.jpg')];

const INK = '#06301F', LIME = '#6CAD2F', GREEN = '#1B7F3B', GRAY = '#5F6360', SUBGRAY = '#7A7D7B';
const BTN = '#1B8633', DOT_OFF = '#C9CAC6';
// bottom-edge colour of each background image: used for the phone's navigation-bar strip so no white band shows
const EDGE = ['#FCF8ED', '#FDFBF4', '#F4F8E9'];

const SLIDES = [
  { tag: 'FRESH GROCERIES', tagTop: 134.2, skipTop: 61.7,
    head: ['Delivered to', 'your doorstep'], accent: 'in minutes.', headSize: 40, headLh: 41, headTop: 156.3,
    sub: ['From fresh fruits & vegetables to', 'daily essentials — get everything', 'you need, super fast.'], subTop: 296.9,
    kind: 'row',
    items: [['leaf', '#EBF6E8', GREEN, 'Fresh\nProducts'], ['flash', '#FFF6D7', '#C9A400', 'Fast\nDelivery'], ['heart-outline', '#FCE6E2', '#C2182B', 'Happier\nYou']],
    script: { lines: ['Good', 'Food', 'Brighter', 'Days'], cx: 377.8, cy: 222.5, ulW: 44, ulL: 14 }, dotsY: 826 },
  { tag: 'SAVE TIME', tagTop: 117.5, skipTop: 61.7,
    head: ['More time', 'for what'], accent: 'matters.', headSize: 40, headLh: 40.4, headTop: 137.1,
    sub: ['We take care of your groceries,', 'so you can focus on the', 'things you love.'], subTop: 273.7,
    kind: 'list', listTop: 348.8, listX: 30.3, dia: 48,
    items: [['cart-outline', '#E9F5E7', '#0B4F2A', 'Wide Range', 'Everything you need\nin one place'], ['time-outline', '#FEF2CC', '#0B4F2A', 'Ultra Fast', 'Essentials in\nminutes'], ['heart-outline', '#FBE2DE', '#C2182B', 'Fresh & Quality', 'Handpicked\nfor you']],
    script: { lines: ['Less', 'Hassle', 'More', 'You'], cx: 365.4, cy: 201.1, ulW: 38, ulL: 18 }, dotsY: 826 },
  { tag: "YOU'RE ALL SET", tagTop: 107.4, skipTop: 61.2,
    head: ['Good food', 'brighter days'], accent: 'ahead.', headSize: 38, headLh: 39.5, headTop: 126.7,
    sub: ['Groceries, daily essentials and', 'more — delivered with care,', 'so you can live better, everyday.'], subTop: 260.5,
    kind: 'list', listTop: 333.6, listX: 31.3, dia: 47,
    items: [['leaf', '#ECF8EA', GREEN, 'Fresh &\nHigh Quality', 'Handpicked with care'], ['flash', '#FEF7DA', '#C9A400', 'Super Fast', 'Delivered in minutes'], ['heart-outline', '#FFE7E5', '#C2182B', 'Everything\nYou Need', 'All in one place']],
    script: { lines: ['A', 'Fresher', 'Happier', 'You', 'Awaits'], cx: 377.8, cy: 207.9, ulW: 46, ulL: 12 }, dotsY: 812.5 },
];

export default function Onboarding({ onDone }) {
  const win = useWindowDimensions();
  const [box, setBox] = useState(null);
  const W = box ? box.w : win.width, H = box ? box.h : win.height;
  const [i, setI] = useState(0);
  const s = SLIDES[i];
  const last = i === SLIDES.length - 1;

  // paint the area under the app (phone navigation bar strip) with the image's bottom colour -> no white band
  useEffect(() => {
    const c = EDGE[i];
    try { SystemUI.setBackgroundColorAsync(c); } catch (e) {}
    if (Platform.OS === 'android') { try { NavigationBar.setBackgroundColorAsync(c); } catch (e) {} }
  }, [i]);
  useEffect(() => () => {
    try { SystemUI.setBackgroundColorAsync('#FFFFFF'); } catch (e) {}
    if (Platform.OS === 'android') { try { NavigationBar.setBackgroundColorAsync('#FFFFFF'); } catch (e) {} }
  }, []);

  // Art is scaled by screen WIDTH so all text/margins keep the design's proportions. On taller phones the extra height at the
  // bottom is filled by the image itself (assets are 200 px taller: the bottom rows are mirrored), so no blank band shows.
  const a = W / DW;
  const ox = 0, oy = Math.min(0, (H - DH * a) / 2);
  const u = (n) => n * a, X = (x) => ox + x * a, Y = (y) => oy + y * a;
  const IMG_K = 429 / 850;           // asset px -> design units
  const IMG_H = 2050 * IMG_K * a;    // extended asset height on screen
  const IMG_TOP = oy - 4.35 * a;     // same vertical calibration as the measured layout
  const T = { allowFontScaling: false };
  const rightPad = Math.max(16, W - X(402));

  const Dots = () => (
    <View pointerEvents="none" style={{ position: 'absolute', left: X(214.6) - u(30), top: Y(s.dotsY) - u(4.8), width: u(60), flexDirection: 'row', justifyContent: 'space-between' }}>
      {SLIDES.map((_, k) => <View key={k} style={{ width: u(9.6), height: u(9.6), borderRadius: u(4.8), backgroundColor: k === i ? BTN : DOT_OFF }} />)}
    </View>
  );

  const Circle = ({ icon, bg, color, size }) => (
    <View style={{ width: u(size), height: u(size), borderRadius: u(size / 2), backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name={icon} size={u(size * 0.46)} color={color} />
    </View>
  );

  // handwritten note in the pale bubble (top-right)
  const sc = s.script, nLines = sc.lines.length, SLH = 25.5, boxH = SLH * nLines + 30;
  // curved, tapered underline (like the swoosh in the design): quadratic curve drawn from small rotated segments (no extra package)
  const Underline = () => {
    const N = 18, W0 = sc.ulW, rise = 0.21 * W0, m = 0.172 * W0;
    const pt = (t) => ({ x: 2 * (1 - t) * t * (W0 / 2) + t * t * W0, y: 2 * (1 - t) * t * (-m) + t * t * (-rise) });
    const x0 = sc.ulL, y0 = 10 + SLH * nLines + 7;
    const segs = [];
    for (let k = 0; k < N; k++) {
      const p = pt(k / N), q = pt((k + 1) / N);
      const cx = x0 + (p.x + q.x) / 2, cy = y0 + (p.y + q.y) / 2;
      const len = Math.hypot(q.x - p.x, q.y - p.y) + 0.7;
      const ang = Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI;
      const th = 1.0 + 1.5 * Math.pow(Math.sin(Math.PI * (k + 0.5) / N), 0.6);
      segs.push(<View key={k} style={{ position: 'absolute', left: u(cx - len / 2), top: u(cy - th / 2), width: u(len), height: u(th), borderRadius: u(th / 2), backgroundColor: '#0F3F26', transform: [{ rotate: ang + 'deg' }] }} />);
    }
    return <>{segs}</>;
  };
  const Script = () => (
    <View pointerEvents="none" style={{ position: 'absolute', left: X(sc.cx) - u(60), top: Y(sc.cy) - u(boxH / 2), width: u(120), height: u(boxH), paddingLeft: u(8), paddingTop: u(10), transform: [{ rotate: '-11deg' }] }}>
      {sc.lines.map((t, k) => (
        <View key={k} style={{ flexDirection: 'row', alignItems: 'center', height: u(SLH) }}>
          <Text {...T} style={{ fontFamily: SCRIPT_FONT, fontSize: u(21), lineHeight: u(SLH), color: '#0F3F26' }}>{t}</Text>
          {k === nLines - 1 && <Ionicons name="heart" size={u(15)} color="#2E7D3E" style={{ marginLeft: u(5), transform: [{ translateY: -u(5) }, { rotate: '10deg' }] }} />}
        </View>
      ))}
      <Underline />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: EDGE[i] }} onLayout={(e) => { const { width, height } = e.nativeEvent.layout; if (!box || Math.abs(box.w - width) > 0.5 || Math.abs(box.h - height) > 0.5) setBox({ w: width, h: height }); }}>
      <Image source={BG[i]} resizeMode="stretch" style={{ position: 'absolute', left: ox, top: IMG_TOP, width: DW * a, height: IMG_H }} />
      <Script />

      <TouchableOpacity onPress={onDone} hitSlop={{ top: 14, bottom: 14, left: 18, right: 18 }}
          style={{ position: 'absolute', right: rightPad, top: Y(s.skipTop), zIndex: 10 }}>
          <Text {...T} style={{ fontFamily: FONT.bodyMedium, fontSize: u(14.3), lineHeight: u(18), color: '#0A2F20' }}>Skip</Text>
        </TouchableOpacity>

      <Text {...T} style={{ position: 'absolute', left: X(32.3), top: Y(s.tagTop), fontFamily: FONT.heading, fontSize: u(11), lineHeight: u(14), letterSpacing: u(2), color: GREEN }}>{s.tag}</Text>

      <Text {...T} style={{ position: 'absolute', left: X(32), top: Y(s.headTop), width: u(390), fontFamily: FONT.headingBold, fontSize: u(s.headSize), lineHeight: u(s.headLh), color: INK }}>
        {s.head.join('\n')}{'\n'}<Text style={{ color: LIME }}>{s.accent}</Text>
      </Text>

      <Text {...T} style={{ position: 'absolute', left: X(32), top: Y(s.subTop), width: u(300), fontFamily: FONT.body, fontSize: u(12.75), lineHeight: u(19.2), color: GRAY }}>{s.sub.join('\n')}</Text>

      {s.kind === 'row' && s.items.map(([icon, bg, color, label], k) => (
        <View key={label} style={{ position: 'absolute', left: X(32.3 + k * 69.2 - 11), top: Y(379.5), width: u(69), alignItems: 'center' }}>
          <Circle icon={icon} bg={bg} color={color} size={47} />
          <Text {...T} style={{ marginTop: u(431.3 - 426.5), fontFamily: FONT.bodyMedium, fontSize: u(10), lineHeight: u(11.7), textAlign: 'center', color: k === 2 ? '#9DB87C' : '#293D34' }}>{label}</Text>
        </View>
      ))}

      {s.kind === 'list' && (
        <View style={{ position: 'absolute', left: X(s.listX), top: Y(s.listTop) }}>
          {s.items.map(([icon, bg, color, title, sub], k) => (
            <View key={title} style={{ flexDirection: 'row', alignItems: 'center', minHeight: u(s.dia), marginBottom: u(14.3) }}>
              <Circle icon={icon} bg={bg} color={color} size={s.dia} />
              <View style={{ marginLeft: u(13.6) }}>
                <Text {...T} style={{ fontFamily: FONT.heading, fontSize: u(12.1), lineHeight: u(14.5), color: INK }}>{title}</Text>
                <Text {...T} style={{ marginTop: u(1), fontFamily: FONT.body, fontSize: u(10), lineHeight: u(14.3), color: SUBGRAY }}>{sub}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <Dots />

      {last ? (
        <TouchableOpacity onPress={onDone} activeOpacity={0.88}
          style={{ position: 'absolute', left: X(71), top: Y(833), width: u(292), height: u(47.5), borderRadius: u(24), backgroundColor: '#177D36', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <Text {...T} style={{ fontFamily: FONT.bodySemi, fontSize: u(16), color: '#fff', marginRight: u(7) }}>{'Let’s Get Started'}</Text>
          <Ionicons name="arrow-forward" size={u(19)} color="#fff" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={() => setI(i + 1)} activeOpacity={0.88} accessibilityLabel="Next"
          style={{ position: 'absolute', right: rightPad, top: Y(798.5), width: u(64), height: u(64), borderRadius: u(32), backgroundColor: BTN, alignItems: 'center', justifyContent: 'center',
            shadowColor: '#0B3D2A', shadowOpacity: 0.28, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 7 }}>
          <Ionicons name="arrow-forward" size={u(28)} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}
